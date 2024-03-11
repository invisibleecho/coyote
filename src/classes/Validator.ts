import type { AbstractSyntaxTree, Field, ValidationError } from './../types/coyote.types';
import { RequestValidationError } from './../index';

/**
 * Validator class of the coyote schema language.
 */
export class Validator {
  private errors: ValidationError[] = [];

  /**
   * Validates the provided data against the provided schema.
   * @param data 
   * @param schema 
   * @throws RequestValidationError
   */
  public validate(data: any, schema: AbstractSyntaxTree): void {
    this.errors = [];
    this.walk(data, schema);
    if (this.errors.length > 0) {
      throw new RequestValidationError(`Validation failed with ${this.errors.length} errors.`, { errors: this.errors });
    }
  }

  /**
   * Walks through every field within the provided schema and validates it.
   * @param data 
   * @param schema 
   * @param path 
   */
  private walk(data: any, schema: AbstractSyntaxTree, path: string = ''): void {
    let unknownKeys = Object.keys(data);
    schema.forEach(field => {
      const name = field.name;
      const fullName = path + name;
      try {
        this.assert(fullName, field, data[name]);
        if (field.type === 'object' && field.children.length > 0) {
          this.walk(data[field.name] || {}, field.children, fullName + '.');
        }
      } catch (error) {
        if (error instanceof Error) this.errors.push({ name: fullName, message: error.message });
      }
      unknownKeys = unknownKeys.filter(k => k !== name);
    });
    // Unknown keys which are not defined within the schema are forbidden
    unknownKeys.forEach(key => this.errors.push({ name: path + key, message: `Field '${path + key}' is not defined within the provided schema.` }));
  }

  /**
   * Asserts a single field against the provided schema.
   * @param fullName Fully-qualified field name
   * @param field Field object
   * @param value Passed value
   * @throws Error
   */
  private assert(fullName: string, field: Field, value: any): void {
    const type = field.type;
    const passedType = (value as Object)?.constructor?.name;
    let isOfValidType = false;
    switch (type) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'object':
        isOfValidType = type === passedType?.toLowerCase();
        if (isOfValidType && type !== 'object') this.decorated(fullName, field, value);
        break;
      case 'string[]':
      case 'number[]':
      case 'boolean[]':
        const scalarType = type.replace(/\[|\]/g, '');
        isOfValidType = passedType === 'Array' && (value as Array<any>).every((element: Object) => (element.constructor.name.toLowerCase() === scalarType));
        break;
    }
    if (typeof passedType === 'undefined' && !field.optional) {
      throw new Error(`Field ${fullName} (optional: ${field.optional}) was not passed. Consider marking it optional.`)
    }
    if (!isOfValidType && (!field.optional || typeof passedType !== 'undefined')) {
      throw new Error(`Field ${fullName} (optional: ${field.optional}, type: ${passedType.toLowerCase()}) does not match the defined type ${type}.`);
    }
  }

  /**
   * Asserts a single field against each defined decorator.
   * @param fullName Fully-qualified field name
   * @param field Field object
   * @param value Passed value
   * @throws Error
   */
  private decorated(fullName: string, field: Field, value: any) {
    field.decorators.forEach(decorator => {
      let asserted = false;
      try {
        asserted = Decorators[decorator.name](value, ...decorator.arguments);
      } catch (error) {
        throw new Error(`Decorator '${decorator.name}' could not be invoked.`);
      }
      if (!asserted) {
        throw new Error(`Field ${fullName} (optional: ${field.optional}, decorator: ${decorator.name}) could not be validated.`);
      }
    });
  }
}

/**
 * All available decorator methods are defined here.
 */
const Decorators: { [key: string]: (value: any, ...args: any[]) => boolean } = {
  /**
   * Decorator :: format
   * @param value Input value
   * @param type Format type to be checked upon
   */
  format: (value: string, type: string): boolean => {
    switch (type) {
      case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      default: throw new Error(`Decorator 'format' could not be invoked. Invalid arguments provided.`);
    }
  },
  /**
   * Decorator :: length
   * @param value Input value
   * @param len Excact length
   */
  length: (value: string, len: number): boolean => {
    if (typeof value !== 'string' || typeof len !== 'number') {
      throw new Error(`Decorator 'length' could not be invoked. Invalid arguments provided.`);
    }
    return value.length === len;
  },
  /**
   * Decorator :: min
   * @param value Input value
   * @param n Lower bound
   */
  min: (value: number, n: number): boolean => {
    if (typeof value !== 'number' || typeof n !== 'number') {
      throw new Error(`Decorator 'min' could not be invoked. Invalid arguments provided.`);
    }
    return value >= n;
  },
  /**
   * Decorator :: max
   * @param value Input value
   * @param n Upper bound
   */
  max: (value: number, n: number): boolean => {
    if (typeof value !== 'number' || typeof n !== 'number') {
      throw new Error(`Decorator 'max' could not be invoked. Invalid arguments provided.`);
    }
    return value <= n;
  },
};