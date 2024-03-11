import { TYPE, type Token } from './../types/coyote.types';

/**
 * Tokenizer class of the coyote schema language.
 */
export class Tokenizer {
  private source: string = '';
  private start: number = 0;
  private current: number = 0;
  private tokens: Array<Token> = [];

  /**
   * Scans the provided input string and returns an array of tokens.
   * @returns Token[]
   */
  public tokenize(source: string): Token[] {
    this.source = source;
    this.start = 0;
    this.current = 0;
    this.tokens = [];

    while (!this.finished()) {
      // We are at the beginning of the next lexeme.
      this.start = this.current;
      const c = this.consume();
      switch (c) {
        case '{': this.token(TYPE.LEFT_BRACE); break;
        case '}': this.token(TYPE.RIGHT_BRACE); break;
        case ':': this.token(TYPE.COLON); break;
        case '?': this.token(TYPE.QMARK); break;
        case '@': this.descriptor(); break;
        default: this.literal(c);
      }
    }

    this.current = this.source.length;
    this.start = this.current;
    this.token(TYPE.EOF);
    return this.tokens;
  }

  /**
   * Checks whether all available characters are consumed.
   * @returns boolean
   */
  private finished(): boolean {
    return this.current >= this.source.length;
  }

  /**
   * Consumes the next character.
   * An optional condition can be provided to consume as many characters as long as the condition remains true.
   * @param condition 
   * @returns string
   */
  private consume(condition: Function | null = null): string {
    if (!condition) return this.source[this.current++];
    let consumed = '';
    while (condition(this.peek(0))) {
      consumed += this.consume();
    }
    return consumed;
  }

  /**
   * Looks at the next character without consuming it.
   * @param index 
   * @returns string
   */
  private peek(index: number = 0): string {
    if (this.finished()) return '\0';
    return this.source[this.current + index];
  }

  /**
   * Returns the currently evaluated lexeme.
   * @returns string
   */
  private lexeme(): string {
    return this.source.substring(this.start, this.current);
  }

  /**
   * Checks whether the provided input string is of a given type.
   * @param type numeric | alpha | alphanumeric
   * @returns boolean
   */
  private is(type: string, str: string): boolean {
    const numeric = (c: string) => c >= '0' && c <= '9';
    const alpha = (c: string) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_';
    const alphanumeric = (c: string) => alpha(c) || numeric(c);
    switch (type) {
      case 'numeric': return numeric(str);
      case 'alpha': return alpha(str);
      case 'alphanumeric': return alphanumeric(str);
    }
    return false;
  }

  /**
   * Creates a new token based on the given type and appends it to the token list.
   * @param type
   * @returns boolean
   */
  private token(type: TYPE): void {
    this.tokens.push({ type, lexeme: this.lexeme(), position: this.start, length: this.lexeme().length });
  }

  /**
   * Scans a descriptor.
   */
  private descriptor(): void {
    this.consume((c: string) => this.is('alpha', c));
    this.token(TYPE.IDENTIFIER);
  }

  /**
   * Scans a literal.
   * @param c 
   */
  private literal(c: string): void {
    const keywords = ['true', 'false', 'string', 'number', 'boolean'];
    if (this.is('numeric', c)) {
      this.consume((c: string) => this.is('numeric', c));
      this.token(TYPE.NUMBER_LITERAL);
    } else if (this.is('alpha', c)) {
      this.consume((c: string) => this.is('alphanumeric', c) || c === '[' || c === ']');
      this.token(keywords.includes(this.lexeme().replace(/\[|\]/g, '').toLocaleLowerCase())
        ? TYPE[this.lexeme().replace(/\[|\]/g, '').toUpperCase() as keyof typeof TYPE]
        : TYPE.IDENTIFIER
      );
    }
  }
}