export type Choose<T extends Record<string, any>, K extends string> = K extends `${infer U}.${infer Rest}` ? Choose<T[U], Rest> : T[K];

type PathImpl<T, K extends keyof T> = K extends string
   ? T[K] extends Record<string, any>
      ? T[K] extends ArrayLike<any>
         ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}`
         : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
      : K
   : never;

export type ObjectPath<T> = PathImpl<T, keyof T> | keyof T;

export type ArrayOr<T> = T | T[];

export type Setter<T> = T | ((v: T) => T);
