"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
var index_1 = require("./../index");
/**
 * Validator class of the coyote schema language.
 */
var Validator = /** @class */ (function () {
    function Validator() {
        this.errors = [];
    }
    /**
     * Validates the provided data against the provided schema.
     * @param data
     * @param schema
     * @throws RequestValidationError
     */
    Validator.prototype.validate = function (data, schema) {
        this.errors = [];
        this.walk(data, schema);
        if (this.errors.length > 0) {
            throw new index_1.RequestValidationError("Validation failed with ".concat(this.errors.length, " errors."), { errors: this.errors });
        }
    };
    /**
     * Walks through every property within the provided schema and validates it.
     * @param data
     * @param schema
     * @param path
     */
    Validator.prototype.walk = function (data, schema, path) {
        var _this = this;
        if (path === void 0) { path = ''; }
        var unknownKeys = Object.keys(data);
        schema.forEach(function (property) {
            var name = property.name;
            var fullName = path + name;
            try {
                _this.assert(fullName, property, data[name]);
                if (property.type === 'object' && property.children.length > 0) {
                    _this.walk(data[property.name] || {}, property.children, fullName + '.');
                }
            }
            catch (error) {
                if (error instanceof Error)
                    _this.errors.push({ name: fullName, message: error.message });
            }
            unknownKeys = unknownKeys.filter(function (k) { return k !== name; });
        });
        // Unknown keys which are not defined within the schema are forbidden
        unknownKeys.forEach(function (key) { return _this.errors.push({ name: path + key, message: "Property '".concat(path + key, "' is not defined within the provided schema.") }); });
    };
    /**
     * Asserts a single property against the provided schema.
     * @param fullName Fully-qualified property name
     * @param property Property object
     * @param value Passed value
     * @throws Error
     */
    Validator.prototype.assert = function (fullName, property, value) {
        var _a;
        var type = property.type;
        var passedType = (_a = value === null || value === void 0 ? void 0 : value.constructor) === null || _a === void 0 ? void 0 : _a.name;
        var isOfValidType = false;
        switch (type) {
            case 'string':
            case 'number':
            case 'boolean':
            case 'object':
                isOfValidType = type === (passedType === null || passedType === void 0 ? void 0 : passedType.toLowerCase());
                if (isOfValidType && type !== 'object')
                    this.decorated(fullName, property, value);
                break;
            case 'string[]':
            case 'number[]':
            case 'boolean[]':
                var scalarType_1 = type.replace(/\[|\]/g, '');
                isOfValidType = passedType === 'Array' && value.every(function (element) { return (element.constructor.name.toLowerCase() === scalarType_1); });
                break;
        }
        if (typeof passedType === 'undefined' && !property.optional) {
            throw new Error("Property ".concat(fullName, " (optional: ").concat(property.optional, ") was not passed. Consider marking it optional."));
        }
        if (!isOfValidType && (!property.optional || typeof passedType !== 'undefined')) {
            throw new Error("Property ".concat(fullName, " (optional: ").concat(property.optional, ", type: ").concat(passedType.toLowerCase(), ") does not match the defined type ").concat(type, "."));
        }
    };
    /**
     * Asserts a single property against each defined decorator.
     * @param fullName Fully-qualified property name
     * @param property Property object
     * @param value Passed value
     * @throws Error
     */
    Validator.prototype.decorated = function (fullName, property, value) {
        property.decorators.forEach(function (decorator) {
            var asserted = false;
            try {
                asserted = Decorators[decorator.name].apply(Decorators, __spreadArray([value], decorator.arguments, false));
            }
            catch (error) {
                throw new Error("Decorator '".concat(decorator.name, "' could not be invoked."));
            }
            if (!asserted) {
                throw new Error("Property ".concat(fullName, " (optional: ").concat(property.optional, ", decorator: ").concat(decorator.name, ") could not be validated."));
            }
        });
    };
    return Validator;
}());
exports.Validator = Validator;
/**
 * All available decorator methods are defined here.
 */
var Decorators = {
    /**
     * Decorator :: format
     * @param value Input value
     * @param type Format type to be checked upon
     */
    format: function (value, type) {
        switch (type) {
            case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            default: throw new Error("Decorator 'format' could not be invoked. Invalid arguments provided.");
        }
    },
    /**
     * Decorator :: length
     * @param value Input value
     * @param len Excact length
     */
    length: function (value, len) {
        if (typeof value !== 'string' || typeof len !== 'number') {
            throw new Error("Decorator 'length' could not be invoked. Invalid arguments provided.");
        }
        return value.length === len;
    },
    /**
     * Decorator :: min
     * @param value Input value
     * @param n Lower bound
     */
    min: function (value, n) {
        if (typeof value !== 'number' || typeof n !== 'number') {
            throw new Error("Decorator 'min' could not be invoked. Invalid arguments provided.");
        }
        return value >= n;
    },
    /**
     * Decorator :: max
     * @param value Input value
     * @param n Upper bound
     */
    max: function (value, n) {
        if (typeof value !== 'number' || typeof n !== 'number') {
            throw new Error("Decorator 'max' could not be invoked. Invalid arguments provided.");
        }
        return value <= n;
    },
};
