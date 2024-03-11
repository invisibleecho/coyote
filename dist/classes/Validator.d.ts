import type { AbstractSyntaxTree } from './../types/coyote.types';
/**
 * Validator class of the coyote schema language.
 */
export declare class Validator {
    private errors;
    /**
     * Validates the provided data against the provided schema.
     * @param data
     * @param schema
     * @throws RequestValidationError
     */
    validate(data: any, schema: AbstractSyntaxTree): void;
    /**
     * Walks through every field within the provided schema and validates it.
     * @param data
     * @param schema
     * @param path
     */
    private walk;
    /**
     * Asserts a single field against the provided schema.
     * @param fullName Fully-qualified field name
     * @param field Field object
     * @param value Passed value
     * @throws Error
     */
    private assert;
    /**
     * Asserts a single field against each defined decorator.
     * @param fullName Fully-qualified field name
     * @param field Field object
     * @param value Passed value
     * @throws Error
     */
    private decorated;
}
