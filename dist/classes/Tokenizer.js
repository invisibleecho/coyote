"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
var coyote_types_1 = require("./../types/coyote.types");
/**
 * Tokenizer class of the coyote schema language.
 */
var Tokenizer = /** @class */ (function () {
    function Tokenizer() {
        this.source = '';
        this.start = 0;
        this.current = 0;
        this.tokens = [];
    }
    /**
     * Scans the provided input string and returns an array of tokens.
     * @returns Token[]
     */
    Tokenizer.prototype.tokenize = function (source) {
        this.source = source;
        this.start = 0;
        this.current = 0;
        this.tokens = [];
        while (!this.finished()) {
            // We are at the beginning of the next lexeme.
            this.start = this.current;
            var c = this.consume();
            switch (c) {
                case '{':
                    this.token(coyote_types_1.TYPE.LEFT_BRACE);
                    break;
                case '}':
                    this.token(coyote_types_1.TYPE.RIGHT_BRACE);
                    break;
                case ':':
                    this.token(coyote_types_1.TYPE.COLON);
                    break;
                case '?':
                    this.token(coyote_types_1.TYPE.QMARK);
                    break;
                case '@':
                    this.descriptor();
                    break;
                default: this.literal(c);
            }
        }
        this.current = this.source.length;
        this.start = this.current;
        this.token(coyote_types_1.TYPE.EOF);
        return this.tokens;
    };
    /**
     * Checks whether all available characters are consumed.
     * @returns boolean
     */
    Tokenizer.prototype.finished = function () {
        return this.current >= this.source.length;
    };
    /**
     * Consumes the next character.
     * An optional condition can be provided to consume as many characters as long as the condition remains true.
     * @param condition
     * @returns string
     */
    Tokenizer.prototype.consume = function (condition) {
        if (condition === void 0) { condition = null; }
        if (!condition)
            return this.source[this.current++];
        var consumed = '';
        while (condition(this.peek(0))) {
            consumed += this.consume();
        }
        return consumed;
    };
    /**
     * Looks at the next character without consuming it.
     * @param index
     * @returns string
     */
    Tokenizer.prototype.peek = function (index) {
        if (index === void 0) { index = 0; }
        if (this.finished())
            return '\0';
        return this.source[this.current + index];
    };
    /**
     * Returns the currently evaluated lexeme.
     * @returns string
     */
    Tokenizer.prototype.lexeme = function () {
        return this.source.substring(this.start, this.current);
    };
    /**
     * Checks whether the provided input string is of a given type.
     * @param type numeric | alpha | alphanumeric
     * @returns boolean
     */
    Tokenizer.prototype.is = function (type, str) {
        var numeric = function (c) { return c >= '0' && c <= '9'; };
        var alpha = function (c) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'; };
        var alphanumeric = function (c) { return alpha(c) || numeric(c); };
        switch (type) {
            case 'numeric': return numeric(str);
            case 'alpha': return alpha(str);
            case 'alphanumeric': return alphanumeric(str);
        }
        return false;
    };
    /**
     * Creates a new token based on the given type and appends it to the token list.
     * @param type
     * @returns boolean
     */
    Tokenizer.prototype.token = function (type) {
        this.tokens.push({ type: type, lexeme: this.lexeme(), position: this.start, length: this.lexeme().length });
    };
    /**
     * Scans a descriptor.
     */
    Tokenizer.prototype.descriptor = function () {
        var _this = this;
        this.consume(function (c) { return _this.is('alpha', c); });
        this.token(coyote_types_1.TYPE.IDENTIFIER);
    };
    /**
     * Scans a literal.
     * @param c
     */
    Tokenizer.prototype.literal = function (c) {
        var _this = this;
        var keywords = ['true', 'false', 'string', 'number', 'boolean'];
        if (this.is('numeric', c)) {
            this.consume(function (c) { return _this.is('numeric', c); });
            this.token(coyote_types_1.TYPE.NUMBER_LITERAL);
        }
        else if (this.is('alpha', c)) {
            this.consume(function (c) { return _this.is('alphanumeric', c) || c === '[' || c === ']'; });
            this.token(keywords.includes(this.lexeme().replace(/\[|\]/g, '').toLocaleLowerCase())
                ? coyote_types_1.TYPE[this.lexeme().replace(/\[|\]/g, '').toUpperCase()]
                : coyote_types_1.TYPE.IDENTIFIER);
        }
    };
    return Tokenizer;
}());
exports.Tokenizer = Tokenizer;
