export type NullableToken = Token | null;
export type AbstractSyntaxTree = Property[];
export declare enum TYPE {
    LEFT_BRACE = 0,
    RIGHT_BRACE = 1,
    COLON = 2,
    QMARK = 3,
    IDENTIFIER = 4,
    NUMBER_LITERAL = 5,
    STRING = 6,
    NUMBER = 7,
    BOOLEAN = 8,
    TRUE = 9,
    FALSE = 10,
    EOF = 11
}
export interface Token {
    type: TYPE;
    lexeme: string;
    position: number;
    length: number;
}
export interface Property {
    name: string;
    type: string;
    optional: boolean;
    decorators: Decorator[];
    children: Property[];
}
export interface Decorator {
    name: string;
    arguments: Array<String | Number | Boolean>;
}
export interface ValidationError {
    name: string;
    message: string;
}
export interface Reportable {
    errors: ValidationError[];
}
