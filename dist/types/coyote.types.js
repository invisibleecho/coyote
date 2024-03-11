"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPE = void 0;
var TYPE;
(function (TYPE) {
    TYPE[TYPE["LEFT_BRACE"] = 0] = "LEFT_BRACE";
    TYPE[TYPE["RIGHT_BRACE"] = 1] = "RIGHT_BRACE";
    TYPE[TYPE["COLON"] = 2] = "COLON";
    TYPE[TYPE["QMARK"] = 3] = "QMARK";
    TYPE[TYPE["IDENTIFIER"] = 4] = "IDENTIFIER";
    TYPE[TYPE["NUMBER_LITERAL"] = 5] = "NUMBER_LITERAL";
    TYPE[TYPE["STRING"] = 6] = "STRING";
    TYPE[TYPE["NUMBER"] = 7] = "NUMBER";
    TYPE[TYPE["BOOLEAN"] = 8] = "BOOLEAN";
    TYPE[TYPE["TRUE"] = 9] = "TRUE";
    TYPE[TYPE["FALSE"] = 10] = "FALSE";
    TYPE[TYPE["EOF"] = 11] = "EOF";
})(TYPE || (exports.TYPE = TYPE = {}));
