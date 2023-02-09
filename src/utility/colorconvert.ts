import { Color } from "./types/units";

const SRGB = {
   r: 0.2126,
   g: 0.7152,
   b: 0.0722,
};

const CHANNELS = {
   RGB: ["r", "g", "b", "a"],
   CMYK: ["c", "m", "y", "k", "a"],
   HSL: ["h", "s", "l", "a"],
   HSV: ["h", "s", "v", "a"],
   HWK: ["h", "w", "k", "a"],
   HSI: ["h", "s", "i", "a"],
   HCY: ["h", "c", "y", "a"],
};

// prettier-ignore
export type ColorFields = {
   RGB:  { r: number; g: number; b: number; a: number };
   CMYK: { c: number; m: number; y: number; k: number; a: number };
   HSV:  { h: number; s: number; v: number; a: number };
   HSL:  { h: number; s: number; l: number; a: number };
   HWK:  { h: number; w: number; k: number; a: number };
   HSI:  { h: number; s: number; i: number; a: number };
   HCY:  { h: number; c: number; y: number; a: number };
};

export const mod = (a: number, n: number) => {
   return ((a % n) + n) % n;
};

export const wrap = (value: number, min: number, max: number) => {
   const end = Math.max(min, max);
   const start = Math.min(min, max);
   const range = end - start;
   return mod(value - start, range) + start;
};

const getHue = (r: number, g: number, b: number) => {
   const min = Math.min(r, g, b);
   const max = Math.max(r, g, b);
   if (max !== min) {
      if (max === r) {
         return wrap((g - b) / (max - min), 0, 6) / 6.0;
      }
      if (max === g) {
         return wrap((b - r) / (max - min) + 2, 0, 6) / 6.0;
      }
      if (max === b) {
         return wrap((r - g) / (max - min) + 4, 0, 6) / 6.0;
      }
   }
   return 0;
};

export const RGB2color = ({ r, g, b, a }: ColorFields["RGB"]): Color => {
   return { r, g, b, a };
};

export const color2RGB = (color: Color): ColorFields["RGB"] => {
   if (!color) {
      return { r: 0, g: 0, b: 0, a: 0 };
   }
   return color;
};

export const CMYK2color = ({ c, m, y, k, a }: ColorFields["CMYK"]): Color => {
   return {
      r: (1 - c) * (1 - k),
      g: (1 - m) * (1 - k),
      b: (1 - y) * (1 - k),
      a,
   };
};

export const color2CMYK = (color: Color): ColorFields["CMYK"] => {
   if (!color) {
      return { c: 0, m: 0, y: 0, k: 0, a: 0 };
   }
   const { r, g, b, a } = color;
   const max = Math.max(r, g, b);
   return {
      c: max === 0 ? 0 : (max - r) / max,
      m: max === 0 ? 0 : (max - g) / max,
      y: max === 0 ? 0 : (max - b) / max,
      k: 1 - max,
      a: a,
   };
};

export const color2HSL = (color: Color): ColorFields["HSL"] => {
   if (!color) {
      return { h: 0, s: 0, l: 0, a: 0 };
   }
   const { r, g, b, a } = color;

   const min = Math.min(r, g, b);
   const max = Math.max(r, g, b);
   const h = getHue(r, g, b);
   const s = max === min ? 0 : (max - min) / (1 - Math.abs(min + max - 1));
   const l = (max + min) / 2;

   return { h: h * 360, s, l, a };
};

export const HSL2color = ({ h, s, l, a }: ColorFields["HSL"]): Color => {
   h /= 360;

   const tC = (1 - Math.abs(2 * l - 1)) * s;
   const tX = tC / 2 + l;
   const tY = tC * (1 - Math.abs(((h * 6) % 2) - 1)) + (l - tC / 2);
   const tZ = l - tC / 2;
   let res = { r: 0, g: 0, b: 0 };

   // prettier-ignore
   switch (Math.floor(h * 6) % 6) {
      case 0: res = { r: tX, g: tY, b: tZ }; break;
      case 1: res = { r: tY, g: tX, b: tZ }; break;
      case 2: res = { r: tZ, g: tX, b: tY }; break;
      case 3: res = { r: tZ, g: tY, b: tX }; break;
      case 4: res = { r: tY, g: tZ, b: tX }; break;
      case 5: res = { r: tX, g: tZ, b: tY }; break;
   }
   return {
      ...res,
      a,
   };
};

export const color2HSV = (color: Color): ColorFields["HSV"] => {
   if (!color) {
      return { h: 0, s: 0, v: 0, a: 0 };
   }
   const { r, g, b, a } = color;

   const min = Math.min(r, g, b);
   const max = Math.max(r, g, b);
   const h = getHue(r, g, b);
   const s = max === 0 ? 0 : (max - min) / max;
   const v = max;
   return { h: h * 360, s, v, a };
};

export const HSV2color = ({ h, s, v, a }: ColorFields["HSV"]): Color => {
   h /= 360;

   const tC = v * s;
   const tX = tC * (1 - Math.abs(((h * 6) % 2) - 1));

   let res = { r: 0, b: 0, g: 0 };

   // prettier-ignore
   switch (Math.floor(h * 6) % 6) {
      case 0: res = { r : tC, g : tX, b :  0}; break;
      case 1: res = { r : tX, g : tC, b :  0}; break;
      case 2: res = { r :  0, g : tC, b : tX}; break;
      case 3: res = { r :  0, g : tX, b : tC}; break;
      case 4: res = { r : tX, g :  0, b : tC}; break;
      case 5: res = { r : tC, g :  0, b : tX}; break;
  }

   return {
      r: res.r + (v - tC),
      g: res.g + (v - tC),
      b: res.b + (v - tC),
      a,
   };
};

export const color2HWK = (color: Color): ColorFields["HWK"] => {
   if (!color) {
      return { h: 0, w: 0, k: 0, a: 0 };
   }
   const { r, g, b, a } = color;
   const h = getHue(r, g, b);
   const w = Math.min(r, g, b);
   const k = 1 - Math.max(r, g, b);

   return { h: h * 360, w, k, a };
};

export const HWK2color = ({ h, w, k, a }: ColorFields["HWK"]): Color => {
   h /= 360;

   const tZ = w + k;
   if (k === 1) {
      return { r: 0, g: 0, b: 0, a };
   }
   const tS = 1 - (tZ > 1 ? w / tZ : w) / (1 - (tZ > 1 ? k / tZ : k));
   const tV = 1 - (tZ > 1 ? k / tZ : k);
   const tC = tV * tS;
   const tX = tC * (1 - Math.abs(((h * 6) % 2) - 1));
   let res = { r: 0, b: 0, g: 0 };

   // prettier-ignore
   switch (Math.floor(h * 6) % 6) {
      case 0: res = { r : tC, g : tX, b :  0 }; break;
      case 1: res = { r : tX, g : tC, b :  0 }; break;
      case 2: res = { r :  0, g : tC, b : tX }; break;
      case 3: res = { r :  0, g : tX, b : tC }; break;
      case 4: res = { r : tX, g :  0, b : tC }; break;
      case 5: res = { r : tC, g :  0, b : tX }; break;
  }
   return {
      r: res.r + (tV - tC),
      g: res.g + (tV - tC),
      b: res.b + (tV - tC),
      a,
   };
};

export const color2HSI = (color: Color): ColorFields["HSI"] => {
   if (!color) {
      return { h: 0, s: 0, i: 0, a: 0 };
   }
   const { r, g, b, a } = color;
   const h = getHue(r, g, b);
   const i = (r + g + b) / 3.0;
   const min = Math.min(r, g, b);
   const s = i === 0 ? 0 : 1 - min / i;

   return { h: h * 360, s, i, a };
};

export const HSI2color = ({ h, s, i, a }: ColorFields["HSI"]): Color => {
   h /= 360;

   const tZ = 1 - Math.abs(((h * 6) % 2) - 1);
   const tC = (3 * i * s) / (1 + tZ);
   const tX = tC * tZ;
   let res = { r: 0, b: 0, g: 0 };

   // prettier-ignore
   switch (Math.floor(h * 6) % 6) {
      case 0: res = { r : tC, g : tX, b :  0 }; break;
      case 1: res = { r : tX, g : tC, b :  0 }; break;
      case 2: res = { r :  0, g : tC, b : tX }; break;
      case 3: res = { r :  0, g : tX, b : tC }; break;
      case 4: res = { r : tX, g :  0, b : tC }; break;
      case 5: res = { r : tC, g :  0, b : tX }; break;
  }
   return {
      r: Math.max(0, Math.min(1, res.r + i * (1 - s))),
      g: Math.max(0, Math.min(1, res.g + i * (1 - s))),
      b: Math.max(0, Math.min(1, res.b + i * (1 - s))),
      a,
   };
};

export const color2HCY = (color: Color): ColorFields["HCY"] => {
   if (!color) {
      return { h: 0, c: 0, y: 0, a: 0 };
   }
   const { r, g, b, a } = color;
   const h = getHue(r, g, b);
   const c = Math.max(r, g, b) - Math.min(r, g, b);
   const y = r * SRGB.r + g * SRGB.g + b * SRGB.b;
   return { h: h * 360, c, y, a };
};

export const HCY2color = ({ h, c, y, a }: ColorFields["HCY"]): Color => {
   h /= 360;

   const tX = c * (1 - Math.abs(((h * 6) % 2) - 1));

   let res = { r: 0, b: 0, g: 0 };

   // prettier-ignore
   switch (Math.floor(h * 6) % 6) {
      case 0: res = { r :  c, g : tX, b :  0 }; break;
      case 1: res = { r : tX, g :  c, b :  0 }; break;
      case 2: res = { r :  0, g :  c, b : tX }; break;
      case 3: res = { r :  0, g : tX, b :  c }; break;
      case 4: res = { r : tX, g :  0, b :  c }; break;
      case 5: res = { r :  c, g :  0, b : tX }; break;
  }
   const tM = y - (SRGB.r * res.r + SRGB.g * res.g + SRGB.b * res.b);
   return {
      r: Math.max(0, Math.min(1, res.r + tM)),
      g: Math.max(0, Math.min(1, res.g + tM)),
      b: Math.max(0, Math.min(1, res.b + tM)),
      a,
   };
};

export const colorComponents = (color: Color) => {
   if (!color) {
      return {
         red: 0,
         green: 0,
         blue: 0,
         cyan: 0,
         magenta: 0,
         yellow: 0,
         hue: 0,
         white: 0,
         black: 0,
         saturationV: 0,
         saturationI: 0,
         saturationL: 0,
         lightness: 0,
         value: 0,
         intensity: 0,
         chroma: 0,
         luminance: 0,
         alpha: 0,
      };
   }
   const min = Math.min(color.r, color.g, color.b);
   const max = Math.max(color.r, color.g, color.b);

   const hue = getHue(color.r, color.g, color.b);
   const white = min;
   const black = 1 - max;
   const intensity = (color.r + color.g + color.b) / 3.0;
   const saturationV = max === min ? 0 : (max - min) / max;
   const saturationI = intensity === 0 ? 0 : 1 - min / intensity;
   const saturationL = max === min ? 0 : (max - min) / (1 - Math.abs(min + max - 1));
   const lightness = (max + min) / 2;
   const value = max;
   const chroma = max - min;
   const luminance = color.r * SRGB.r + color.g * SRGB.g + color.b * SRGB.b;

   const cyan = max === 0 ? 0 : (max - color.r) / max;
   const magenta = max === 0 ? 0 : (max - color.g) / max;
   const yellow = max === 0 ? 0 : (max - color.b) / max;

   return {
      red: color.r,
      green: color.g,
      blue: color.b,
      cyan,
      magenta,
      yellow,
      hue: hue * 360,
      white,
      black,
      saturationV,
      saturationI,
      saturationL,
      lightness,
      value,
      intensity,
      chroma,
      luminance,
      alpha: color.a,
   };
};

const ColorConvert = {
   CHANNELS,
   colorComponents,
   RGB2color,
   color2RGB,
   CMYK2color,
   color2CMYK,
   HSL2color,
   color2HSL,
   HSV2color,
   color2HSV,
   HWK2color,
   color2HWK,
   HSI2color,
   color2HSI,
   HCY2color,
   color2HCY,
};

export default ColorConvert;
