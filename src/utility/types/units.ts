export type Length = {
   value: number;
   unit: "px" | "pt" | "in" | "cm" | "mm";
};

export type Color = { r: number; g: number; b: number; a: number } | null | undefined;

export type Vector2N = { x: number; y: number };
