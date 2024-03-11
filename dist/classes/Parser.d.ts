import { type Token, type Decorator, type Property, type AbstractSyntaxTree } from './../types/coyote.types';
/**
 * Parser class of the coyote schema language.
 */
export declare class Parser {
    private tokens;
    private current;
    /**
     * Parses the provided input tokens into an AST.
     * @returns AbstractSyntaxTree
     */
    parse(tokens: Token[]): AbstractSyntaxTree;
    /**
     * Checks whether all available tokens are consumed.
     * @returns boolean
     */
    private finished;
    /**
     * Returns the current token we have yet to consume.
     * @param index Optional index based on the current position.
     * @returns Token
     */
    private peek;
    /**
     * Returns the most recently consumed token.
     * @returns Token
     */
    private previous;
    /**
     * Consumes the current token and returns it.
     * @returns Token
     */
    private advance;
    /**
     * Consumes the current token based on possible types to expect.
     */
    private expect;
    /**
     * Returns a boolean value based on if the provided type matches the current token.
     * Unlike expect(), it never consumes the token, it only looks at it.
     * @param type Token type
     * @returns boolean
     */
    private check;
    /**
     * @rule object
     */
    object(): Property[];
    /**
     * @rule property
     */
    property(): Property;
    /**
     * @rule identifier
     */
    identifier(): string;
    /**
     * @rule optional
     */
    optional(): boolean;
    /**
     * @rule type
     */
    type(): string;
    /**
     * @rule decorators
     */
    decorators(): Decorator[];
}
