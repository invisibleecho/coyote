export type NullableToken = Token | null;
export type AbstractSyntaxTree = Field[];

export enum TYPE {
  LEFT_BRACE, RIGHT_BRACE, COLON, QMARK,
  IDENTIFIER, NUMBER_LITERAL,
  STRING, NUMBER, BOOLEAN, TRUE, FALSE,
  EOF
}

export interface Token {
  type: TYPE;
  lexeme: string;
  position: number;
  length: number;
}

export interface Field {
  name: string;
  type: string;
  optional: boolean;
  decorators: Decorator[];
  children: Field[];
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