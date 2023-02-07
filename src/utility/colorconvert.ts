import MathHelper from "./mathhelper";
import { Color } from "./types/units";

const h2rgb = function hue2rgb(p: number, q: number, t: number) {
   if (t < 0) t += 1;
   if (t > 1) t -= 1;
   if (t < 1 / 6) return p + (q - p) * 6 * t;
   if (t < 1 / 2) return q;
   if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
   return p;
};

// hue, chroma, greyness
export const rgb2Color = (r: number, g: number, b: number, a: number): Color => {
   return { r: r / 255, g: g / 255, b: b / 255, a: a / 100 };
};

//hue, saturation, lightness
export const hsl2Color = (h: number, s: number, l: number, a: number): Color => {
   h /= 360;
   s /= 100;
   l /= 100;
   a /= 100;

   if (s === 0) {
      return { r: l, g: l, b: l, a };
   }
   const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
   const p = 2 * l - q;

   return {
      r: h2rgb(p, q, h + 1 / 3),
      g: h2rgb(p, q, h),
      b: h2rgb(p, q, h - 1 / 3),
      a,
   };
};

export const hsv2Color = (h: number, s: number, v: number, a: number): Color => {
   h /= 360;
   s /= 100;
   v /= 100;
   a /= 100;
   const hi = Math.floor(h * 6);

   const f = h - Math.floor(h);
   const p = v * (1 - s);
   const q = v * (1 - s * f);
   const t = v * (1 - s * (1 - f));

   switch (hi) {
      case 0:
         return { r: v, g: t, b: p, a };
      case 1:
         return { r: q, g: v, b: p, a };
      case 2:
         return { r: p, g: v, b: t, a };
      case 3:
         return { r: p, g: q, b: v, a };
      case 4:
         return { r: t, g: p, b: v, a };
      case 5:
         return { r: v, g: p, b: q, a };
   }
};

//cyan, magenta, yellow, key
export const cmyk2Color = (c: number, m: number, y: number, k: number, a: number): Color => {
   c /= 100;
   m /= 100;
   y /= 100;
   k /= 100;
   a /= 100;

   return {
      r: 1 - Math.min(1, c * (1 - k) + k),
      g: 1 - Math.min(1, m * (1 - k) + k),
      b: 1 - Math.min(1, y * (1 - k) + k),
      a,
   };
};

//cyan, magenta, yellow
export const cmy2Color = (c: number, m: number, y: number, a: number): Color => {
   c /= 100;
   m /= 100;
   y /= 100;
   a /= 100;

   return {
      r: 1 - c,
      g: 1 - m,
      b: 1 - y,
      a,
   };
};

// hue, whiteness, blackness
export const hwb2Color = (h: number, w: number, b: number, a: number): Color => {
   h /= 360;
   w /= 100;
   b /= 100;
   a /= 100;

   const rt = w + b;
   if (rt > 1) {
      w /= rt;
      b /= rt;
   }

   const hi = Math.floor(h * 6);
   const v = 1 - b;
   const f = (6 * h - hi) % 1 === 0 ? 6 * h - hi : 1 - (6 * h - hi);
   const n = w + f * (v - w);

   switch (hi) {
      case 0:
         return { r: v, g: n, b: w, a };
      case 1:
         return { r: n, g: v, b: w, a };
      case 2:
         return { r: w, g: v, b: n, a };
      case 3:
         return { r: w, g: n, b: v, a };
      case 4:
         return { r: n, g: w, b: v, a };
      case 5:
         return { r: v, g: w, b: n, a };
   }
};
