import { Flavour } from "!/components";
import { ColorFields } from "!/utility/colorconvert";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { ComponentType } from "react";

export enum NodeTypes {
   RESULT = "result",

   SHAPE_CIRCLE = "shapeCircle",
   SHAPE_RING = "shapeRing",
   SHAPE_POLYGON = "shapePolygon",
   SHAPE_POLYGRAM = "shapePolygram",
   SHAPE_POLYRING = "shapePolyring",
   SHAPE_STAR = "shapeStar",
   SHAPE_BURST = "shapeBurst",
   SHAPE_ARC = "shapeArc",
   SHAPE_SPIRAL = "shapeSpiral",
   SHAPE_SEGMENT = "shapeSegment",
   SHAPE_FLOODFILL = "shapeFloodFill",
   SHAPE_GLYPH = "shapeGlyph",

   COL_LAYERS = "collectionLayers",
   COL_MASK = "collectionMask",
   COL_SEQUENCE = "collectionSequence",

   ARRAY_VERTEX = "arrayVertex",
   ARRAY_SPIRAL = "arraySpiral",
   ARRAY_REPEAT = "arrayRepeat",

   VALUE_NUMBER = "valueNumber",
   VALUE_COLOR = "valueColor",
   VALUE_LENGTH = "valueLength",
   VALUE_ANGLE = "valueAngle",
   VALUE_PERCENT = "valuePercent",
   LERP_NUMBER = "lerpNumber",
   LERP_COLOR = "lerpColor",
   LERP_LENGTH = "lerpLength",
   LERP_ANGLE = "lerpAngle",
   VALUE_CURVE = "valueCurve",

   COL_TRANSFORM = "collectionTransform",

   EFFECT_BRUSH = "effectBrush",
   EFFECT_PENCIL = "effectPencil",
   EFFECT_PEN = "effectPen",

   SPLIT_COLOR = "splitColor",
   CONVERT_VALUE = "convertValue",
   MATH_ADD = "mathAdd",
   MATH_SUB = "mathSub",
   MATH_MUL = "mathMul",
   MATH_DIV = "mathDiv",
   MATH_MOD = "mathMod",
   MATH_ABS = "mathAbs",
   MATH_RND = "mathRnd",
   MATH_SPD = "mathSpd",
   VALUE_RANDOM = "valueRandom",

   COLOR_RGB = "colorRGB",
   COLOR_HSV = "colorHSV",
   COLOR_HSL = "colorHSL",
   COLOR_HWK = "colorHWK",
   COLOR_HCY = "colorHCY",
   COLOR_HSI = "colorHSI",
   COLOR_CMYK = "colorCMYK",
}

export enum SocketTypes {
   NONE = 0,
   SHAPE = 1,
   FLOAT = 2,
   INTEGER = 4,
   PERCENT = 8,
   ANGLE = 16,
   LENGTH = 32,
   COLOR = 64,
   SEQUENCE = 128,
   CURVE = 256,

   ANY = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256,
   NUMBER = 2 | 4,
}

export enum LinkTypes {
   OTHER,
   SEQUENCE,
   SHAPE,
}

export type InSocket = string | null;
export type OutSocket = string[];

export type ILinkInstance = {
   fromNode: string;
   linkId: string;
   toNode: string;
   fromSocket: string;
   toSocket: string;
   type: LinkTypes;
};

export interface INodeDefinition {
   inputs: {
      [key: string]: any;
   };
   outputs: {
      [key: string]: any;
   };
   values: {
      [key: string]: any;
   };
}

export type INodeInstance<T extends INodeDefinition> = {
   type: NodeTypes;
   nodeId: string;
   in: {
      [keys in keyof T["inputs"]]: string | null;
   };
   out: {
      [keys in keyof T["outputs"]]: string[];
   };
} & T["values"];

export type NodeRendererProps = { nodeId: string; depth: string; globals: Globals };
export type NodeRenderer = ComponentType<NodeRendererProps>;
export type ControlRendererProps = { nodeId: string; globals: Globals };
export type ControlRenderer = ComponentType<ControlRendererProps>;

export type Globals = {
   sequenceData: { [key: string]: number };
};

export type Sequence = {
   senderId: string;
   min: number;
   max: number;
};

export type Position = {
   mode: "cartesian" | "polar";
   x: number;
   y: number;
   a: number;
   r: number;
};

export type Curve = {
   curveFn: CurveFunction;
   easing: EasingMode;
   intensity: number;
};

export type OutSocketsOf<T extends INodeDefinition> = keyof T["outputs"];

export interface INodeHelper<T extends INodeDefinition> {
   readonly buttonIcon: IconProp | null;
   readonly nodeIcon: IconProp;
   readonly flavour: Flavour;
   readonly name: string;
   readonly type: NodeTypes;
   initialize: () => T["values"];
   controls: ControlRenderer;
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof T["outputs"], globals: Globals) => T["outputs"][typeof socket];
}

export type IArcaneGraph = {
   nodes: { [key: string]: INodeInstance<INodeDefinition> };
   links: {
      [key: string]: ILinkInstance;
   };
};

/* EVENTS */

export type NodeMoveEvent = { nodeId: string; x: number; y: number };
export type LinkEvent = { nodeId: string; socketId: string; mode: "in" | "out"; type: SocketTypes };
export type ConnectionEvent = Omit<ILinkInstance, "linkId">;

/* PARAMETRIC */

export const SCRIBE_MODES = {
   inscribe: "Inscribe",
   circumscribe: "Circumscribe",
   middle: "Middle",
};
export type ScribeMode = keyof typeof SCRIBE_MODES;

export const RADIAL_MODES = {
   inout: "Inner/Outer",
   spread: "Spread",
};
export type RadialMode = keyof typeof RADIAL_MODES;

export const SPREAD_ALIGN_MODES = {
   center: "Center",
   inward: "Inward",
   outward: "Outward",
};
export type SpreadAlignMode = keyof typeof SPREAD_ALIGN_MODES;

export const EXPAND_MODES = {
   point: "by Point",
   edge: "by Edge",
};
export type ExpandMode = keyof typeof EXPAND_MODES;

export const THETA_MODES = {
   incremental: "Incremental",
   startstop: "Start/Stop",
};
export type ThetaMode = keyof typeof THETA_MODES;

export const STROKECAP_MODES = {
   butt: "Butt",
   square: "Square",
   round: "Round",
};
export type StrokeCapMode = keyof typeof STROKECAP_MODES;

export const STROKEJOIN_MODES = {
   miter: "Miter",
   round: "Round",
   bevel: "Bevel",
};
export type StrokeJoinMode = keyof typeof STROKEJOIN_MODES;

export const BLEND_MODES = {
   normal: "Normal",
   multiply: "Multiply",
   color: "Color",
   "color-burn": "Color Burn",
   "color-dodge": "Color Dodge",
   darken: "Darken",
   difference: "Difference",
   exclusion: "Exclusion",
   "hard-light": "Hard Light",
   hue: "Hue",
   lighten: "Lighten",
   luminosity: "Luminosity",
   overlay: "Overlay",
   saturation: "Saturation",
   screen: "Screen",
   "soft-light": "Soft Light",
};
export type BlendMode = keyof typeof BLEND_MODES;

export const SEQUENCE_MODES = {
   wrap: "Wrap",
   clamp: "Clamp",
   bounce: "Bounce",
};

export type SequenceMode = keyof typeof SEQUENCE_MODES;

export const POSITION_MODES = {
   cartesian: "Cartesian",
   polar: "Polar",
};

export type PositionMode = keyof typeof POSITION_MODES;

export const COLOR_SPACES: { [keys in keyof ColorFields]: string } = {
   RGB: "Red, Green, Blue",
   CMYK: "Cyan, Magenta, Yellow, Black",
   HSL: "Hue, Saturation, Lightness",
   HSV: "Hue, Saturation, Value",
   HWK: "Hue, White, Black",
   HSI: "Hue, Saturation, Intensity",
   HCY: "Hue, Chroma, Luminance",
};

export type ColorSpace = keyof ColorFields;

export const ANGLE_LERP_MODES = {
   closestCW: "Closest (favors CW)",
   closestCCW: "Closest (favors CCW)",
   farthestCW: "Farthest (favors CW)",
   farthestCCW: "Farthest (favors CCW)",
   clockwise: "Clockwise",
   counter: "Counter-Clockwise",
};

export type AngleLerpMode = keyof typeof ANGLE_LERP_MODES;

export const CURVE_FUNCTIONS = {
   linear: "Linear",
   semiquadratic: "Semi-Quadratic ( n^1.5 )",
   quadratic: "Quadratic ( n^2 )",
   cubic: "Cubic ( n^3 )",
   exponential: "Exponential ( 2^n )",
   sinusoidal: "Sinusoidal ( sin(t) )",
   rootic: "Rootic ( sqrt(t) )",
   circular: "Circular ( 1-sqrt(1-t^2) )",
};

export type CurveFunction = keyof typeof CURVE_FUNCTIONS;

export const EASING_MODES = {
   in: "In",
   out: "Out",
   inout: "In/Out",
   outin: "Out/In",
};

export type EasingMode = keyof typeof EASING_MODES;

export const ROUNDING_MODES = {
   nearestUp: "Nearest (1/2 Up)",
   nearestDown: "Nearest (1/2 Down)",
   ceiling: "Ceiling",
   floor: "Floor",
   nearestTowards: "Nearest (1/2 Towards 0)",
   nearestAway: "Nearest (1/2 Away from 0)",
   towards: "Towards Zero",
   away: "Away from Zero",
};

export type RoundingMode = keyof typeof ROUNDING_MODES;
