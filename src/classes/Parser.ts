import { TYPE, type Token, type NullableToken, type Decorator, type Property, type AbstractSyntaxTree } from './../types/coyote.types';

/**
 * Parser class of the coyote schema language.
 */
export class Parser {
  private tokens: Token[] = [];
  private current: number = 0;

  /**
   * Parses the provided input tokens into an AST.
   * @returns AbstractSyntaxTree
   */
  public parse(tokens: Token[]): AbstractSyntaxTree {
    this.tokens = tokens;
    this.current = 0;
    return this.object();
  }

  /**
   * Checks whether all available tokens are consumed.
   * @returns boolean
   */
  private finished(): boolean {
    return this.peek().type === TYPE.EOF;
  }

  /**
   * Returns the current token we have yet to consume.
   * @param index Optional index based on the current position.
   * @returns Token
   */
  private peek(index: number = 0): Token {
    return this.tokens[this.current + index];
  }

  /**
   * Returns the most recently consumed token.
   * @returns Token
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  /**
   * Consumes the current token and returns it.
   * @returns Token
   */
  private advance(): Token {
    if (!this.finished()) this.current++;
    return this.previous();
  }

  /**
   * Consumes the current token based on possible types to expect.
   */
  private expect<T>(types: TYPE[], callback: (token: NullableToken) => T): T {
    const token = types.some(type => this.peek().type === type);
    return callback(token ? this.advance() : null);
  }

  /**
   * Returns a boolean value based on if the provided type matches the current token.
   * Unlike expect(), it never consumes the token, it only looks at it.
   * @param type Token type
   * @returns boolean
   */
  private check(type: TYPE): boolean {
    if (this.finished()) return false;
    return this.peek().type === type;
  }

  /**
   * @rule object
   */
  public object(): Property[] {
    let properties: Property[] = [];
    this.expect<void>([TYPE.LEFT_BRACE], (token: NullableToken) => {
      if (!token) throw new Error(`Parser Error: Expecting object literal '{'.`);
      while (!this.finished() && !this.check(TYPE.RIGHT_BRACE)) properties.push(this.property());
      this.expect<void>([TYPE.RIGHT_BRACE], (token: NullableToken) => {
        if (!token) throw new Error(`Parser Error: Expecting '}' after object properties.`);
      });
    });
    return properties;
  }

  /**
   * @rule property
   */
  public property(): Property {
    const name = this.identifier();
    const optional = this.optional();
    const type = this.type();
    const decorators = this.decorators();
    const children = (type === 'object') ? this.object() : [];
    return { name, optional, type, children, decorators };
  }

  /**
   * @rule identifier
   */
  public identifier(): string {
    return this.expect<string>([TYPE.IDENTIFIER], (token: NullableToken) => {
      if (!token) throw new Error(`Parser Error: Expecting identifier.`);
      return token.lexeme;
    });
  }

  /**
   * @rule optional
   */
  public optional(): boolean {
    return this.expect<boolean>([TYPE.QMARK], (token: NullableToken) => (token) ? true : false);
  }

  /**
   * @rule type
   */
  public type(): string {
    const colon = this.expect<boolean>([TYPE.COLON], (token: NullableToken) => (token) ? true : false);
    let type = this.expect<string>([TYPE.STRING, TYPE.NUMBER, TYPE.BOOLEAN], (token: NullableToken) => token?.lexeme || '');
    if (!type) {
      if (this.peek().type === TYPE.LEFT_BRACE) {
        type = 'object';
      }
      else {
        throw new Error('Parser Error: Unknown datatype provided.');
      }
    }
    if (type !== 'object' && !colon) {
      throw new Error('Parser Error: A scalar datatype has to be preceded by a colon.');
    }
    return type;
  }

  /**
   * @rule decorators
   */
  public decorators(): Decorator[] {
    const decorators: Decorator[] = [];
    const isDecorator = () => this.peek(0)?.lexeme[0] === '@';
    const isProperty = () => [TYPE.QMARK, TYPE.COLON, TYPE.LEFT_BRACE].includes(this.peek(1)?.type);
    while (isDecorator() && this.expect<boolean>([TYPE.IDENTIFIER], (token: NullableToken) => !!token)) {
      let decorator: Decorator = { name: this.previous().lexeme.substring(1), arguments: [] };
      while (!isProperty() && !isDecorator() && this.expect<boolean>([TYPE.IDENTIFIER, TYPE.NUMBER_LITERAL, TYPE.TRUE, TYPE.FALSE], (token: NullableToken) => !!token)) {
        switch (this.previous().type) {
          case TYPE.TRUE:
          case TYPE.FALSE:
            decorator.arguments.push(this.previous().lexeme === 'true');
            break;
          case TYPE.NUMBER_LITERAL:
            decorator.arguments.push(+this.previous().lexeme);
            break;
          case TYPE.IDENTIFIER:
            decorator.arguments.push(this.previous().lexeme);
            break;
        }
      }
      decorators.push(decorator);
    }
    return decorators;
  }
}