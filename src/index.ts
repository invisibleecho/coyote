import type { AbstractSyntaxTree, Reportable } from './types/coyote.types';
import { Tokenizer } from './classes/Tokenizer';
import { Parser } from './classes/Parser';
import { Validator } from './classes/Validator';

/**
 * Base class of the coyote schema language.
 */
export class Coyote {
  private static instance: Coyote;
  private tokenizer: Tokenizer;
  private parser: Parser;
  private validator: Validator;

  private constructor() {
    this.tokenizer = new Tokenizer();
    this.parser = new Parser();
    this.validator = new Validator();
  }

  /**
   * Validates a request object against the provided schema.
   * @param data Plain request object
   * @param schema Schema
   * @throws RequestValidationError
   */
  public static async validate(request: Request | Object, schema: string): Promise<any> {
    if (!Coyote.instance) Coyote.instance = new Coyote();
    Coyote.instance.validator.validate(await Coyote.instance.input(request), Coyote.instance.compile(schema));
  }

  /**
   * Compiles the provided schema into an abstract syntax tree.
   * @param source
   * @returns AbstractSyntaxTree
   */
  private compile(source: string): AbstractSyntaxTree {
    try {
      return this.parser.parse(this.tokenizer.tokenize(source));
    } catch (error) {
      throw new RequestValidationError('Error compiling schema: ' + (error as Error).message);
    }
  }

  /**
   * Attempts to collect the input data.
   * @param request Request object or POJO
   * @returns Promise<any>
   */
  private async input(request: Request | Object): Promise<any> {
    let data = request;
    if ((request as Object).constructor.name === 'Request') {
      try {
        data = await (request as Request).json();
      } catch (error) {
        throw new RequestValidationError('Input error: ' + (error as Error).message);
      }
    }
    return data;
  }
}

/**
 * Coyote specific error class to distinguish between normal and coyote related errors.
 */
export class RequestValidationError extends Error {
  public coyote?: Reportable;
  constructor(msg: string, props?: Reportable) {
    super(msg);
    Object.setPrototypeOf(this, RequestValidationError.prototype);
    this.coyote = props;
  }
}