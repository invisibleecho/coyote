import { type Token } from './../types/coyote.types';
/**
 * Tokenizer class of the coyote schema language.
 */
export declare class Tokenizer {
    private source;
    private start;
    private current;
    private tokens;
    /**
     * Scans the provided input string and returns an array of tokens.
     * @returns Token[]
     */
    tokenize(source: string): Token[];
    /**
     * Checks whether all available characters are consumed.
     * @returns boolean
     */
    private finished;
    /**
     * Consumes the next character.
     * An optional condition can be provided to consume as many characters as long as the condition remains true.
     * @param condition
     * @returns string
     */
    private consume;
    /**
     * Looks at the next character without consuming it.
     * @param index
     * @returns string
     */
    private peek;
    /**
     * Returns the currently evaluated lexeme.
     * @returns string
     */
    private lexeme;
    /**
     * Checks whether the provided input string is of a given type.
     * @param type numeric | alpha | alphanumeric
     * @returns boolean
     */
    private is;
    /**
     * Creates a new token based on the given type and appends it to the token list.
     * @param type
     * @returns boolean
     */
    private token;
    /**
     * Scans a descriptor.
     */
    private descriptor;
    /**
     * Scans a literal.
     * @param c
     */
    private literal;
}
