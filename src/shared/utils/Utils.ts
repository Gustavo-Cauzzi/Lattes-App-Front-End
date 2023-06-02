type Truthy<T> = T extends false | "" | 0 | null | undefined ? never : T;
export const isTruthy = <T>(value: T): value is Truthy<T> => !!value;

export type IfPresent<T> = T extends undefined ? never : T; // Usar com sabedoria!
