import { AngleLerpMode } from "!/pages/arcanigen/definitions/types";
import ColorConvert, { ColorFields } from "./colorconvert";
import { Length, Color } from "./types/units";

export const deg2rad = (deg: number) => deg * (Math.PI / 180);

export const lerp = (t: number, a: number, b: number) => {
   // if (!(curve in CURVES)) { curve = "linear"; }
   // t = CURVES[curve](t);
   return a + t * (b - a);
};

export const delerp = (d: number, start: number, end: number) => {
   return end - start === 0 ? 0 : (d - start) / (end - start);
};

export const mod = (a: number, n: number) => {
   return ((a % n) + n) % n;
};

export const lengthToPx = (length: Length): number => {
   switch (length.unit) {
      case "px":
         return length.value;
      case "pt":
         return (length.value / 72) * 96;
      case "in":
         return length.value * 96;
      case "mm":
         return (length.value * 96) / 25.4;
      case "cm":
         return (length.value * 96) / 2.54;
   }
};

export const angleLerp = (t: number, a: number, b: number, mode: AngleLerpMode) => {
   const cw = mod(lerp(t, a, b + (a > b ? 1 : 0)), 1);
   const ccw = mod(lerp(t, a + (a < b ? 1 : 0), b), 1);
   switch (mode) {
      case "closestCW":
         return Math.abs(b - a) >= 0.5 ? ccw : cw;
      case "closestCCW":
         return Math.abs(b - a) > 0.5 ? ccw : cw;
      case "farthestCCW":
         return Math.abs(b - a) >= 0.5 ? cw : ccw;
      case "farthestCW":
         return Math.abs(b - a) > 0.5 ? cw : ccw;
      case "clockwise":
         return cw;
      case "counter":
         return ccw;
   }
};

export const pxToLength = (value: number, unit: Length["unit"] = "px"): Length => {
   switch (unit) {
      case "px":
         return { value, unit };
      case "pt":
         return { value: (value * 72) / 96, unit };
      case "in":
         return { value: value / 96, unit };
      case "mm":
         return { value: (value / 96) * 25.4, unit };
      case "cm":
         return { value: (value / 96) * 2.54, unit };
   }
};

export const convertLength = (value: Length, unit: Length["unit"]): Length => {
   return pxToLength(lengthToPx(value), unit);
};

export const hexToColor = (h: string) => {
   if (h === "") {
      return undefined;
   }
   if (h === "transparent") {
      return null;
   }

   h = h.slice(1);
   if (h.length === 3) {
      h = h + "f";
   }
   if (h.length === 4) {
      h = `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
   }
   if (h.length === 6) {
      h = h + "ff";
   }
   return {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4, 6), 16) / 255,
      a: parseInt(h.slice(6, 8), 16) / 255,
   };
};

export const colorToHex = (color: Color, fallback: string = "") => {
   if (color === undefined) {
      return fallback;
   }
   if (color === null) {
      return "transparent";
   }
   return `#${Math.round(color.r * 255)
      .toString(16)
      .padStart(2, "0")}${Math.round(color.g * 255)
      .toString(16)
      .padStart(2, "0")}${Math.round(color.b * 255)
      .toString(16)
      .padStart(2, "0")}${Math.round(color.a * 255)
      .toString(16)
      .padStart(2, "0")}`.toUpperCase();
};

export const WHITE = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };
export const BLACK = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };

const getPosition = (mode: "cartesian" | "polar", x: Length, y: Length, theta: number, r: Length) => {
   if (mode === "polar") {
      const nX = lengthToPx(r) * Math.cos(((theta - 90) * Math.PI) / 180);
      const nY = lengthToPx(r) * Math.sin(((theta - 90) * Math.PI) / 180);

      return `translate(${nX}px, ${nY}px)`;
   }
   return `translate(${lengthToPx(x)}px, ${lengthToPx(y) * -1}px)`;
};

export const shortestArc = (start: number, stop: number) => {
   const modDiff = mod(stop - start, 360);
   let dist = 180 - Math.abs(Math.abs(modDiff) - 180);
   return (modDiff + 360) % 360 < 180 ? dist : dist * -1;
};

export const shortestQuadrent = (start: number, stop: number) => {
   const modDiff = mod(stop - start, 4);
   let dist = 2 - Math.abs(Math.abs(modDiff) - 2);
   return (modDiff + 4) % 4 < 2 ? dist : dist * -1;
};

export const distance = (x1: number, y1: number, x2: number, y2: number) => {
   return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};

export const clamp = (n: number, a: number, b: number) => {
   return Math.max(a, Math.min(b, n));
};

export const colorLerp = <T extends keyof ColorFields>(
   step: number,
   from: Color,
   to: Color,
   colorSpace: T = "RGB" as T,
   hueMode: AngleLerpMode = "closestCW"
) => {
   const a = ColorConvert[`color2${colorSpace}`](from) as ColorFields[T];
   const b = ColorConvert[`color2${colorSpace}`](to) as ColorFields[T];

   const channels = ColorConvert.CHANNELS[colorSpace] as (keyof ColorFields[T])[];

   const color = channels.reduce((acc, channel: keyof ColorFields[T]) => {
      if (channel === "h") {
         const v = angleLerp(step, (a[channel] as number) / 360, (b[channel] as number) / 360, hueMode);
         acc[channel] = v * 360;
         return acc;
      } else {
         const v = lerp(step, a[channel] as number, b[channel] as number);
         acc[channel] = v;
         return acc;
      }
   }, {} as { [key in keyof ColorFields[T]]: number });

   return (ColorConvert[`${colorSpace}2color`] as (c: typeof color) => Color)(color);
};

const MathHelper = {
   deg2rad,
   mod,
   lerp,
   delerp,
   lengthToPx,
   pxToLength,
   colorToHex,
   hexToColor,
   convertLength,
   getPosition,
   shortestArc,
   shortestQuadrent,
   distance,
   clamp,
   angleLerp,
   colorLerp,
   WHITE,
   BLACK,
};

export default MathHelper;
