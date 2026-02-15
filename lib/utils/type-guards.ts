/**
 * Module for type-guards
 *
 * Runtime type validation utilities and type guard functions for enhanced type safety
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

// Base type guard interface
export interface TypeGuard<T> {
  (value: unknown): value is T;
  typeName: string;
}

// Generic type guard factory
export function createTypeGuard<T>(
  validator: (value: unknown) => value is T,
  typeName: string,
): TypeGuard<T> {
  const guard = ((value: unknown): value is T =>
    validator(value)) as TypeGuard<T>;
  (guard as any).typeName = typeName;
  return guard;
}

// Primitive type guards
export const isString = createTypeGuard(
  (value: unknown): value is string => typeof value === "string",
  "string",
);

export const isNumber = createTypeGuard(
  (value: unknown): value is number =>
    typeof value === "number" && !isNaN(value),
  "number",
);

export const isBoolean = createTypeGuard(
  (value: unknown): value is boolean => typeof value === "boolean",
  "boolean",
);

export const isUndefined = createTypeGuard(
  (value: unknown): value is undefined => value === undefined,
  "undefined",
);

export const isNull = createTypeGuard(
  (value: unknown): value is null => value === null,
  "null",
);

export const isSymbol = createTypeGuard(
  (value: unknown): value is symbol => typeof value === "symbol",
  "symbol",
);

export const isBigInt = createTypeGuard(
  (value: unknown): value is bigint => typeof value === "bigint",
  "bigint",
);

// Object type guards
export const isObject = createTypeGuard(
  (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value),
  "object",
);

export const isArray = createTypeGuard(
  (value: unknown): value is unknown[] => Array.isArray(value),
  "array",
);

export const isFunction = createTypeGuard(
  (value: unknown): value is (...args: unknown[]) => unknown =>
    typeof value === "function",
  "function",
);

export const isDate = createTypeGuard(
  (value: unknown): value is Date =>
    value instanceof Date && !isNaN(value.getTime()),
  "Date",
);

// Complex type guards
export function isArrayOf<T>(itemGuard: TypeGuard<T>): TypeGuard<T[]> {
  return createTypeGuard(
    (value: unknown): value is T[] =>
      isArray(value) && value.every((item) => itemGuard(item)),
    `Array<${itemGuard.typeName}>`,
  );
}

export function isOptional<T>(guard: TypeGuard<T>): TypeGuard<T | undefined> {
  return createTypeGuard(
    (value: unknown): value is T | undefined =>
      isUndefined(value) || guard(value),
    `${guard.typeName} | undefined`,
  );
}

export function isNullable<T>(guard: TypeGuard<T>): TypeGuard<T | null> {
  return createTypeGuard(
    (value: unknown): value is T | null => isNull(value) || guard(value),
    `${guard.typeName} | null`,
  );
}

// Union type guards
export function isUnion<T, U>(
  guard1: TypeGuard<T>,
  guard2: TypeGuard<U>,
): TypeGuard<T | U> {
  return createTypeGuard(
    (value: unknown): value is T | U => guard1(value) || guard2(value),
    `${guard1.typeName} | ${guard2.typeName}`,
  );
}

// Literal type guards
export function isLiteral<T extends string | number | boolean>(
  expectedValue: T,
): TypeGuard<T> {
  return createTypeGuard(
    (value: unknown): value is T => value === expectedValue,
    JSON.stringify(expectedValue),
  );
}

export function isOneOf<T extends string | number | boolean>(
  ...values: T[]
): TypeGuard<T> {
  return createTypeGuard(
    (value: unknown): value is T => values.includes(value as T),
    `(${values.map((v) => JSON.stringify(v)).join(" | ")})`,
  );
}

// Record type guards
export function isRecord<K extends string | number | symbol, V>(
  keyGuard: TypeGuard<K>,
  valueGuard: TypeGuard<V>,
): TypeGuard<Record<K, V>> {
  return createTypeGuard((value: unknown): value is Record<K, V> => {
    if (!isObject(value)) return false;

    return Object.entries(value).every(
      ([key, val]) => keyGuard(key as unknown) && valueGuard(val),
    );
  }, `Record<${keyGuard.typeName}, ${valueGuard.typeName}>`);
}

// Tuple type guards
export function isTuple<T extends readonly unknown[]>(
  ...guards: { [K in keyof T]: TypeGuard<T[K]> }
): TypeGuard<T> {
  return createTypeGuard(
    (value: unknown): value is T => {
      if (!isArray(value) || value.length !== guards.length) return false;

      return guards.every((guard, index) => guard(value[index]));
    },
    `[${guards.map((g) => g.typeName).join(", ")}]`,
  );
}

// Domain-specific type guards
export const isEmail = createTypeGuard((value: unknown): value is string => {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}, "email");

export const isUUID = createTypeGuard((value: unknown): value is string => {
  if (!isString(value)) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}, "UUID");

export const isURL = createTypeGuard((value: unknown): value is string => {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}, "URL");

export const isPositiveInteger = createTypeGuard(
  (value: unknown): value is number =>
    isNumber(value) && Number.isInteger(value) && value > 0,
  "positive integer",
);

export const isNonNegativeInteger = createTypeGuard(
  (value: unknown): value is number =>
    isNumber(value) && Number.isInteger(value) && value >= 0,
  "non-negative integer",
);

// API response type guards
export function isApiResponse<T>(
  dataGuard: TypeGuard<T>,
): TypeGuard<{ success: boolean; data?: T; error?: string; message?: string }> {
  return createTypeGuard(
    (
      value: unknown,
    ): value is {
      success: boolean;
      data?: T;
      error?: string;
      message?: string;
    } => {
      if (!isObject(value)) return false;

      const obj = value as Record<string, unknown>;
      if (!isBoolean(obj.success)) return false;

      if (obj.success) {
        return "data" in obj ? dataGuard(obj.data) : true;
      } else {
        return (
          isOptional(isString)(obj.error) && isOptional(isString)(obj.message)
        );
      }
    },
    `ApiResponse<${dataGuard.typeName}>`,
  );
}

// Validation utilities
export class TypeValidator {
  private errors: string[] = [];

  constructor(
    private value: unknown,
    private path: string = "",
  ) {}

  check<T>(guard: TypeGuard<T>, fieldName?: string): TypeValidator {
    const field = fieldName || this.path;
    if (!guard(this.value)) {
      this.errors.push(
        `Expected ${guard.typeName} at ${field}, got ${typeof this.value}`,
      );
    }
    return this;
  }

  nested<T>(key: string, validator: (v: TypeValidator) => T): TypeValidator {
    if (isObject(this.value) && key in this.value) {
      const nestedValue = (this.value as Record<string, unknown>)[key];
      const nestedValidator = new TypeValidator(
        nestedValue,
        `${this.path}.${key}`,
      );
      validator(nestedValidator);
      this.errors.push(...nestedValidator.errors);
    } else {
      this.errors.push(`Missing nested property ${key} at ${this.path}`);
    }
    return this;
  }

  optional<T>(guard: TypeGuard<T>, fieldName?: string): TypeValidator {
    if (this.value !== undefined) {
      this.check(guard, fieldName);
    }
    return this;
  }

  getErrors(): string[] {
    return [...this.errors];
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }

  getValue<T>(): T {
    if (!this.isValid()) {
      throw new Error(`Validation failed: ${this.errors.join(", ")}`);
    }
    return this.value as T;
  }
}

// Safe type assertion with runtime validation
export function assertType<T>(
  value: unknown,
  guard: TypeGuard<T>,
  errorMessage?: string,
): T {
  if (!guard(value)) {
    throw new Error(
      errorMessage ||
        `Type assertion failed: expected ${guard.typeName}, got ${typeof value}`,
    );
  }
  return value;
}

// Safe property access with type guards
export function safeGet<T>(
  obj: unknown,
  key: string,
  guard: TypeGuard<T>,
): T | undefined {
  if (!isObject(obj)) return undefined;
  const value = (obj as Record<string, unknown>)[key];
  return guard(value) ? value : undefined;
}

// Deep equality check for type validation
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, index) => deepEqual(val, b[index]));
  }

  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b as object);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(
      (key) =>
        keysB.includes(key) &&
        deepEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key],
        ),
    );
  }

  return false;
}

// Schema validation (similar to Zod but with runtime type guards)
export interface Schema<T> {
  parse(value: unknown): T;
  safeParse(
    value: unknown,
  ): { success: true; data: T } | { success: false; error: string };
  guard: TypeGuard<T>;
}

export function createSchema<T>(guard: TypeGuard<T>): Schema<T> {
  return {
    parse(value: unknown): T {
      if (!guard(value)) {
        throw new Error(`Schema validation failed: expected ${guard.typeName}`);
      }
      return value;
    },

    safeParse(
      value: unknown,
    ): { success: true; data: T } | { success: false; error: string } {
      if (guard(value)) {
        return { success: true, data: value };
      } else {
        return {
          success: false,
          error: `Expected ${guard.typeName}, got ${typeof value}`,
        };
      }
    },

    guard,
  };
}

// Common schemas
export const stringSchema = createSchema(isString);
export const numberSchema = createSchema(isNumber);
export const booleanSchema = createSchema(isBoolean);
export const emailSchema = createSchema(isEmail);
export const uuidSchema = createSchema(isUUID);
export const urlSchema = createSchema(isURL);

// Array schema factory
export function arraySchema<T>(itemGuard: TypeGuard<T>) {
  return createSchema(isArrayOf(itemGuard));
}

// Object schema factory
export function objectSchema<T extends Record<string, TypeGuard<unknown>>>(
  shape: T,
): Schema<{ [K in keyof T]: T[K] extends TypeGuard<infer U> ? U : never }> {
  const guard = createTypeGuard(
    (
      value: unknown,
    ): value is {
      [K in keyof T]: T[K] extends TypeGuard<infer U> ? U : never;
    } => {
      if (!isObject(value)) return false;

      return Object.entries(shape).every(([key, fieldGuard]) => {
        return fieldGuard((value as Record<string, unknown>)[key]);
      });
    },
    `object with shape { ${Object.keys(shape).join(", ")} }`,
  );

  return createSchema(guard);
}

// Export utility functions
export const TypeGuards = {
  isString,
  isNumber,
  isBoolean,
  isUndefined,
  isNull,
  isSymbol,
  isBigInt,
  isObject,
  isArray,
  isFunction,
  isDate,
  isEmail,
  isUUID,
  isURL,
  isPositiveInteger,
  isNonNegativeInteger,

  // Factories
  isArrayOf,
  isOptional,
  isNullable,
  isUnion,
  isLiteral,
  isOneOf,
  isRecord,
  isTuple,

  // API helpers
  isApiResponse,

  // Utilities
  assertType,
  safeGet,
  deepEqual,
} as const;
