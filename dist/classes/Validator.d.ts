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
     * Walks through every property within the provided schema and validates it.
     * @param data
     * @param schema
     * @param path
     */
    private walk;
    /**
     * Asserts a single property against the provided schema.
     * @param fullName Fully-qualified property name
     * @param property Property object
     * @param value Passed value
     * @throws Error
     */
    private assert;
    /**
     * Asserts a single property against each defined decorator.
     * @param fullName Fully-qualified property name
     * @param property Property object
     * @param value Passed value
     * @throws Error
     */
    private decorated;
}
