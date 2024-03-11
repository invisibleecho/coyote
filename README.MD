# Coyote

A micro schema language & validator intended for request validation.
Coyote is purely written in typescript and uses a hand-written parser for parsing schemas.

## The idea behind coyote
When writing backend code in NodeJS you often see code like this:
```ts
export const get = async(request: Request) => {
  const body = await request.json();

  // 1) Check for empty input parameters
  if (!body.title || !body.content || !body.author) {
    return new Response("Missing data ...", { status: 422 })
  }

  // 2) Check type and maybe other stuff
  if (typeof body.title !== 'string' || body.length > 32) {
    return new Response("Invalid data ...", { status: 422 })
  }

  // 3) ... 99)
}
```
When writing a REST API you should be focusing on writing the logic itself and not that much about validation.
However, since validation is important for pretty much every API we can make things a little bit easier by defining easy-to-read schemas.

And that's why I wrote coyote.

## The gist
We define a schema which describes the shape of the data within the request body.
When dealing with large request bodies it's cumbersome to validate each possible field, required or not. 

Also it's good practise to only allow fields you actually want, which means that you should discard the request if unknown data is being sent.
```ts
import { Coyote, RequestValidationError } from "coyote";
export const get = async(request: Request) => {
  const schema = `{
    name: string
    age?: number @min 18 @max 99
    options {
      secret: string @length 64
      luckynumbers?: number[]
    }
  }`;
  try {
    const payload = await Coyote.validate(request, schema);
    // Do something with payload
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return new Response('Invalid request data passed.', { status: 422 })
    }
}
```
Pretty straightforward.

It's important to note that the schema will act as a guard which means that coyote will only validate the payload against the schema if and only if the same fields exist in request and schema.

The only exception are fields which are marked as optional with a question mark `?`.

## Decorators
Decorators can be used to further define the actual shape of a field within an request.

The following decorators are currently implemented:
1) @format [ type ]
2) @length [, x, [ y ] ]
3) @min [ n ]
4) @max [ n ]