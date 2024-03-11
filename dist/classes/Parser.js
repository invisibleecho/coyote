"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
var coyote_types_1 = require("./../types/coyote.types");
/**
 * Parser class of the coyote schema language.
 */
var Parser = /** @class */ (function () {
    function Parser() {
        this.tokens = [];
        this.current = 0;
    }
    /**
     * Parses the provided input tokens into an AST.
     * @returns AbstractSyntaxTree
     */
    Parser.prototype.parse = function (tokens) {
        this.tokens = tokens;
        this.current = 0;
        return this.object();
    };
    /**
     * Checks whether all available tokens are consumed.
     * @returns boolean
     */
    Parser.prototype.finished = function () {
        return this.peek().type === coyote_types_1.TYPE.EOF;
    };
    /**
     * Returns the current token we have yet to consume.
     * @param index Optional index based on the current position.
     * @returns Token
     */
    Parser.prototype.peek = function (index) {
        if (index === void 0) { index = 0; }
        return this.tokens[this.current + index];
    };
    /**
     * Returns the most recently consumed token.
     * @returns Token
     */
    Parser.prototype.previous = function () {
        return this.tokens[this.current - 1];
    };
    /**
     * Consumes the current token and returns it.
     * @returns Token
     */
    Parser.prototype.advance = function () {
        if (!this.finished())
            this.current++;
        return this.previous();
    };
    /**
     * Consumes the current token based on possible types to expect.
     */
    Parser.prototype.expect = function (types, callback) {
        var _this = this;
        var token = types.some(function (type) { return _this.peek().type === type; });
        return callback(token ? this.advance() : null);
    };
    /**
     * Returns a boolean value based on if the provided type matches the current token.
     * Unlike expect(), it never consumes the token, it only looks at it.
     * @param type Token type
     * @returns boolean
     */
    Parser.prototype.check = function (type) {
        if (this.finished())
            return false;
        return this.peek().type === type;
    };
    /**
     * @rule object
     */
    Parser.prototype.object = function () {
        var _this = this;
        var properties = [];
        this.expect([coyote_types_1.TYPE.LEFT_BRACE], function (token) {
            if (!token)
                throw new Error("Parser Error: Expecting object literal '{'.");
            while (!_this.finished() && !_this.check(coyote_types_1.TYPE.RIGHT_BRACE))
                properties.push(_this.property());
            _this.expect([coyote_types_1.TYPE.RIGHT_BRACE], function (token) {
                if (!token)
                    throw new Error("Parser Error: Expecting '}' after object properties.");
            });
        });
        return properties;
    };
    /**
     * @rule property
     */
    Parser.prototype.property = function () {
        var name = this.identifier();
        var optional = this.optional();
        var type = this.type();
        var decorators = this.decorators();
        var children = (type === 'object') ? this.object() : [];
        return { name: name, optional: optional, type: type, children: children, decorators: decorators };
    };
    /**
     * @rule identifier
     */
    Parser.prototype.identifier = function () {
        return this.expect([coyote_types_1.TYPE.IDENTIFIER], function (token) {
            if (!token)
                throw new Error("Parser Error: Expecting identifier.");
            return token.lexeme;
        });
    };
    /**
     * @rule optional
     */
    Parser.prototype.optional = function () {
        return this.expect([coyote_types_1.TYPE.QMARK], function (token) { return (token) ? true : false; });
    };
    /**
     * @rule type
     */
    Parser.prototype.type = function () {
        var colon = this.expect([coyote_types_1.TYPE.COLON], function (token) { return (token) ? true : false; });
        var type = this.expect([coyote_types_1.TYPE.STRING, coyote_types_1.TYPE.NUMBER, coyote_types_1.TYPE.BOOLEAN], function (token) { return (token === null || token === void 0 ? void 0 : token.lexeme) || ''; });
        if (!type) {
            if (this.peek().type === coyote_types_1.TYPE.LEFT_BRACE) {
                type = 'object';
            }
            else {
                throw new Error('Parser Error: Unknown datatype provided.');
            }
        }
        if (type !== 'object' && !colon) {
            throw new Error('Parser Error: A scalar datatype has to be preceded by a colon.');
        }
        return type;
    };
    /**
     * @rule decorators
     */
    Parser.prototype.decorators = function () {
        var _this = this;
        var decorators = [];
        var isDecorator = function () { var _a; return ((_a = _this.peek(0)) === null || _a === void 0 ? void 0 : _a.lexeme[0]) === '@'; };
        var isProperty = function () { var _a; return [coyote_types_1.TYPE.QMARK, coyote_types_1.TYPE.COLON, coyote_types_1.TYPE.LEFT_BRACE].includes((_a = _this.peek(1)) === null || _a === void 0 ? void 0 : _a.type); };
        while (isDecorator() && this.expect([coyote_types_1.TYPE.IDENTIFIER], function (token) { return !!token; })) {
            var decorator = { name: this.previous().lexeme.substring(1), arguments: [] };
            while (!isProperty() && !isDecorator() && this.expect([coyote_types_1.TYPE.IDENTIFIER, coyote_types_1.TYPE.NUMBER_LITERAL, coyote_types_1.TYPE.TRUE, coyote_types_1.TYPE.FALSE], function (token) { return !!token; })) {
                switch (this.previous().type) {
                    case coyote_types_1.TYPE.TRUE:
                    case coyote_types_1.TYPE.FALSE:
                        decorator.arguments.push(this.previous().lexeme === 'true');
                        break;
                    case coyote_types_1.TYPE.NUMBER_LITERAL:
                        decorator.arguments.push(+this.previous().lexeme);
                        break;
                    case coyote_types_1.TYPE.IDENTIFIER:
                        decorator.arguments.push(this.previous().lexeme);
                        break;
                }
            }
            decorators.push(decorator);
        }
        return decorators;
    };
    return Parser;
}());
exports.Parser = Parser;
