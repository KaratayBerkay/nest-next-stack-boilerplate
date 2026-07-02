import { Reflector } from '@nestjs/core';

// Strongly-typed metadata decorator via the modern Reflector#createDecorator API. `Roles` is a
// function taking a single string[] argument; the guard/interceptor reads it back type-safely.
export const Roles = Reflector.createDecorator<string[]>();
