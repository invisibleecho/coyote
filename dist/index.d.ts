import type { Reportable } from './types/coyote.types';
/**
 * Base class of the coyote schema language.
 */
export declare class Coyote {
    private static instance;
    private tokenizer;
    private parser;
    private validator;
    private constructor();
    /**
     * Validates a request object against the provided schema.
     * @param data Plain request object
     * @param schema Schema
     * @throws RequestValidationError
     */
    static validate(request: Request | Object, schema: string): Promise<any>;
    /**
     * Compiles the provided schema into an abstract syntax tree.
     * @param source
     * @returns AbstractSyntaxTree
     */
    private compile;
    /**
     * Attempts to collect the input data.
     * @param request Request object or POJO
     * @returns Promise<any>
     */
    private input;
}
/**
 * Coyote specific error class to distinguish between normal and coyote related errors.
 */
export declare class RequestValidationError extends Error {
    coyote?: Reportable;
    constructor(msg: string, props?: Reportable);
}
