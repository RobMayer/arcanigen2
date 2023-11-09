export const NodeTypes = {
   META_RESULT: "result",
   SHAPE_CIRCLE: "shapeCircle",
   SHAPE_RECTANGLE: "shapeRectangle",
   SHAPE_RING: "shapeRing",
   SHAPE_POLYGON: "shapePolygon",
   SHAPE_POLYGRAM: "shapePolygram",
   SHAPE_KNOT: "shapeKnot",
   SHAPE_POLYRING: "shapePolyring",
   SHAPE_STAR: "shapeStar",
   SHAPE_BURST: "shapeBurst",
   SHAPE_ARC: "shapeArc",
   SHAPE_SPIRAL: "shapeSpiral",
   SHAPE_SEGMENT: "shapeSegment",
   SHAPE_FLOODFILL: "shapeFloodFill",
   SHAPE_GLYPH: "shapeGlyph",
   SHAPE_TEXTPATH: "shapeTextPath",
   SHAPE_THATROBSHAPE: "shapeThatRobShape",
   COL_LAYERS: "collectionLayers",
   COL_MASK: "collectionMask",
   COL_SEQUENCE: "collectionSequence",
   COL_PORTAL_IN: "collectionPortalIn",
   COL_PORTAL_OUT: "collectionPortalOut",
   ARRAY_VERTEX: "arrayVertex",
   ARRAY_SPIRAL: "arraySpiral",
   ARRAY_REPEAT: "arrayRepeat",
   ARRAY_CLUSTER: "arrayCluster",
   VALUE_NUMBER: "valueNumber",
   VALUE_COLOR: "valueColor",
   VALUE_LENGTH: "valueLength",
   VALUE_ANGLE: "valueAngle",
   VALUE_PERCENT: "valuePercent",
   LERP_NUMBER: "lerpNumber",
   LERP_COLOR: "lerpColor",
   LERP_LENGTH: "lerpLength",
   LERP_ANGLE: "lerpAngle",
   VALUE_CURVE: "valueCurve",
   COL_TRANSFORM: "collectionTransform",
   COL_RESTYLE: "collectionOverrideStyles",
   COL_RANDOM_FILTER: "collectionRandomFilter",
   EFFECT_BRUSH: "effectBrush",
   EFFECT_PENCIL: "effectPencil",
   EFFECT_PEN: "effectPen",
   SPLIT_COLOR: "splitColor",
   CONVERT_VALUE: "convertValue",
   MATH_ADD: "mathAdd",
   MATH_SUB: "mathSub",
   MATH_MUL: "mathMul",
   MATH_DIV: "mathDiv",
   MATH_MOD: "mathMod",
   MATH_ABS: "mathAbs",
   MATH_RND: "mathRnd",
   MATH_SPD: "mathSpd",
   MATH_SIN: "mathSin",
   MATH_COS: "mathCos",
   MATH_TAN: "mathTan",
   MATH_ASIN: "mathASin",
   MATH_ACOS: "mathACos",
   MATH_ATAN: "mathATan",
   VALUE_RANDOM: "valueRandom",
   COLOR_RGB: "colorRGB",
   COLOR_HSV: "colorHSV",
   COLOR_HSL: "colorHSL",
   COLOR_HWK: "colorHWK",
   COLOR_HCY: "colorHCY",
   COLOR_HSI: "colorHSI",
   COLOR_CMYK: "colorCMYK",
   META_NOTES: "metaNotes",
} as const;
export type NodeType = (typeof NodeTypes)[keyof typeof NodeTypes];

export const SocketTypes = {
   NONE: 0,
   SHAPE: 1,
   FLOAT: 2,
   INTEGER: 4,
   PERCENT: 8,
   ANGLE: 16,
   LENGTH: 32,
   COLOR: 64,
   SEQUENCE: 128,
   CURVE: 256,
   PATH: 512,
   PORTAL: 1024,
   ANY: 2047, // 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024
   NUMBER: 6, // 2 | 4
} as const;
export type SocketType = number;

export const SOCKET_TYPE_NAMES: { [key in (typeof SocketTypes)[keyof typeof SocketTypes]]: string } = {
   [SocketTypes.NONE]: "None",
   [SocketTypes.SHAPE]: "Shape",
   [SocketTypes.FLOAT]: "Float",
   [SocketTypes.INTEGER]: "Integer",
   [SocketTypes.PERCENT]: "Percent",
   [SocketTypes.ANGLE]: "Angle",
   [SocketTypes.LENGTH]: "Length",
   [SocketTypes.COLOR]: "Color",
   [SocketTypes.SEQUENCE]: "Sequence",
   [SocketTypes.CURVE]: "Curve",
   [SocketTypes.PATH]: "Path",
   [SocketTypes.PORTAL]: "Portal",
   [SocketTypes.ANY]: "Any",
   [SocketTypes.NUMBER]: "Number",
};

// export enum SocketTypes {
//    NONE = 0,
//    SHAPE = 1,
//    FLOAT = 2,
//    INTEGER = 4,
//    PERCENT = 8,
//    ANGLE = 16,
//    LENGTH = 32,
//    COLOR = 64,
//    SEQUENCE = 128,
//    CURVE = 256,
//    PATH = 512,
//    PORTAL = 1024,

//    ANY = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024,
//    NUMBER = 2 | 4,
// }

export const LinkTypes = {
   OTHER: "other",
   SEQUENCE: "sequence",
   SHAPE: "shape",
   PORTAL: "portal",
   PATH: "path",
} as const;
export type LinkType = (typeof LinkTypes)[keyof typeof LinkTypes];

// export enum LinkTypes {
//    OTHER,
//    SEQUENCE,
//    SHAPE,
//    PORTAL,
//    PATH,
// }

/* PARAMETRIC */

export const ScribeModes = {
   INSCRIBE: "inscribe",
   CIRCUMSCRIBE: "circumscribe",
   MIDDLE: "middle",
} as const;
export type ScribeMode = (typeof ScribeModes)[keyof typeof ScribeModes];
export const SCRIBE_MODE_OPTIONS: {
   [key in ScribeMode]: string;
} = {
   inscribe: "Inscribe",
   circumscribe: "Circumscribe",
   middle: "Middle",
};

export const CrossScribeModes = {
   TANGENTS: "tangents",
   POINTS: "points",
   MIDDLE: "middle",
} as const;
export type CrossScribeMode = (typeof CrossScribeModes)[keyof typeof CrossScribeModes];
export const CROSS_SCRIBE_MODE_OPTIONS: {
   [key in CrossScribeMode]: string;
} = {
   tangents: "Tangents",
   points: "Points",
   middle: "Middle",
};

export const SpanModes = {
   INOUT: "inout",
   SPREAD: "spread",
} as const;
export type SpanMode = (typeof SpanModes)[keyof typeof SpanModes];
export const SPAN_MODE_OPTIONS: {
   [key in SpanMode]: string;
} = {
   inout: "Inner/Outer",
   spread: "Spread",
};

export const RadialModes = {
   MAJORMINOR: "majorminor",
   DEVIATION: "deviation",
} as const;
export type RadialMode = (typeof RadialModes)[keyof typeof RadialModes];
export const RADIAL_MODE_OPTIONS: {
   [key in RadialMode]: string;
} = {
   majorminor: "Major/Minor",
   deviation: "Deviation",
};

export const SpreadAlignModes = {
   CENTER: "center",
   INWARD: "inward",
   OUTWARD: "outward",
} as const;
export type SpreadAlignMode = (typeof SpreadAlignModes)[keyof typeof SpreadAlignModes];
export const SPREAD_ALIGN_MODE_OPTIONS: {
   [key in SpreadAlignMode]: string;
} = {
   center: "Center",
   inward: "Inward",
   outward: "Outward",
};

export const ExpandModes = {
   POINT: "point",
   EDGE: "edge",
} as const;
export type ExpandMode = (typeof ExpandModes)[keyof typeof ExpandModes];
export const EXPAND_MODE_OPTIONS: {
   [key in ExpandMode]: string;
} = {
   point: "by Point",
   edge: "by Edge",
};

export const ThetaModes = {
   INCREMENTAL: "incremental",
   STARTSTOP: "startstop",
} as const;
export type ThetaMode = (typeof ThetaModes)[keyof typeof ThetaModes];
export const THETA_MODE_OPTIONS: {
   [key in ThetaMode]: string;
} = {
   incremental: "Incremental",
   startstop: "Start/Stop",
};

export const StrokeCapModes = {
   BUTT: "butt",
   SQUARE: "square",
   ROUND: "round",
} as const;
export type StrokeCapMode = (typeof StrokeCapModes)[keyof typeof StrokeCapModes];
export const STROKECAP_MODE_OPTIONS: {
   [key in StrokeCapMode]: string;
} = {
   butt: "Butt",
   square: "Square",
   round: "Round",
};

export const StrokeJoinModes = {
   MITER: "miter",
   ROUND: "round",
   BEVEL: "bevel",
} as const;
export type StrokeJoinMode = (typeof StrokeJoinModes)[keyof typeof StrokeJoinModes];
export const STROKEJOIN_MODE_OPTIONS: {
   [key in StrokeJoinMode]: string;
} = {
   miter: "Miter",
   round: "Round",
   bevel: "Bevel",
};

export const BlendModes = {
   NORMAL: "normal",
   MULTIPLY: "multiply",
   COLOR: "color",
   COLOR_BURN: "color-burn",
   COLOR_DODGE: "color-dodge",
   DARKEN: "darken",
   DIFFERENCE: "difference",
   EXCLUSION: "exclusion",
   HARD_LIGHT: "hard-light",
   HUE: "hue",
   LIGHTEN: "lighten",
   LUMINOSITY: "luminosity",
   OVERLAY: "overlay",
   SATURATION: "saturation",
   SCREN: "screen",
   SOFT_LIGHT: "soft-light",
} as const;
export type BlendMode = (typeof BlendModes)[keyof typeof BlendModes];
export const BLEND_MODE_OPTIONS: {
   [key in BlendMode]: string;
} = {
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

export const SequenceModes = {
   WRAP: "wrap",
   CLAMP: "clamp",
   BOUNCE: "bounce",
   TRUNCATE: "truncate",
} as const;
export type SequenceMode = (typeof SequenceModes)[keyof typeof SequenceModes];
export const SEQUENCE_MODE_OPTIONS: {
   [key in SequenceMode]: string;
} = {
   wrap: "Wrap",
   clamp: "Clamp",
   bounce: "Bounce",
   truncate: "Truncate",
};

export const PositionModes = {
   CARTESIAN: "cartesian",
   POLAR: "polar",
} as const;
export type PositionMode = (typeof PositionModes)[keyof typeof PositionModes];
export const POSITION_MODE_OPTIONS = {
   cartesian: "Cartesian",
   polar: "Polar",
};

export const ColorSpaces = {
   RGB: "RGB",
   CMYK: "CMYK",
   HSL: "HSL",
   HSV: "HSV",
   HWK: "HWK",
   HSI: "HSI",
   HCY: "HCY",
} as const;
export type ColorSpace = (typeof ColorSpaces)[keyof typeof ColorSpaces];
export const COLOR_SPACE_OPTIONS: {
   [keys in ColorSpace]: string;
} = {
   RGB: "Red, Green, Blue",
   CMYK: "Cyan, Magenta, Yellow, Black",
   HSL: "Hue, Saturation, Lightness",
   HSV: "Hue, Saturation, Value",
   HWK: "Hue, White, Black",
   HSI: "Hue, Saturation, Intensity",
   HCY: "Hue, Chroma, Luminance",
};

export const AngleLerpModes = {
   CLOSEST_CW: "closestCW",
   CLOSEST_CCW: "closestCCW",
   FARTHEST_CW: "farthestCW",
   FARTHEST_CCW: "farthestCCW",
   CLOCKWISE: "clockwise",
   COUNTER: "counter",
} as const;

export type AngleLerpMode = (typeof AngleLerpModes)[keyof typeof AngleLerpModes];
export const ANGLE_LERP_MODE_OPTIONS: {
   [key in AngleLerpMode]: string;
} = {
   closestCW: "Closest (favors CW)",
   closestCCW: "Closest (favors CCW)",
   farthestCW: "Farthest (favors CW)",
   farthestCCW: "Farthest (favors CCW)",
   clockwise: "Clockwise",
   counter: "Counter-Clockwise",
};

export const CurvePresets = {
   LINEAR: "linear",
   SEMIQUADRATIC: "semiquadratic",
   QUADRATIC: "quadratic",
   CUBIC: "cubic",
   EXPONENTIAL: "exponential",
   SINUSOIDAL: "sinusoidal",
   ROOTIC: "rootic",
   CIRCULAR: "circular",
} as const;
export type CurvePreset = (typeof CurvePresets)[keyof typeof CurvePresets];
export const CURVE_PRESET_OPTIONS: {
   [key in CurvePreset]: string;
} = {
   linear: "Linear",
   semiquadratic: "Semi-Quadratic ( n^1.5 )",
   quadratic: "Quadratic ( n^2 )",
   cubic: "Cubic ( n^3 )",
   exponential: "Exponential ( 2^n )",
   sinusoidal: "Sinusoidal ( sin(t) )",
   rootic: "Rootic ( sqrt(t) )",
   circular: "Circular ( 1-sqrt(1-t^2) )",
};

export const EasingModes = {
   IN: "in",
   OUT: "out",
   INOUT: "inout",
   OUTIN: "outin",
} as const;
export type EasingMode = (typeof EasingModes)[keyof typeof EasingModes];
export const EASING_MODE_OPTIONS: {
   [key in EasingMode]: string;
} = {
   in: "In",
   out: "Out",
   inout: "In/Out",
   outin: "Out/In",
};

export const RoundingModes = {
   NEAREST_UP: "nearestUp",
   NEAREST_DOWN: "nearestDown",
   CEILING: "ceiling",
   FLOOR: "floor",
   NEAREST_TOWARDS: "nearestTowards",
   NEAREST_AWAY: "nearestAway",
   TOWARDS: "towards",
   AWAY: "away",
} as const;
export type RoundingMode = (typeof RoundingModes)[keyof typeof RoundingModes];
export const ROUNDING_MODE_OPTIONS: {
   [key in RoundingMode]: string;
} = {
   nearestUp: "Nearest (1/2 Up)",
   nearestDown: "Nearest (1/2 Down)",
   ceiling: "Ceiling",
   floor: "Floor",
   nearestTowards: "Nearest (1/2 Towards 0)",
   nearestAway: "Nearest (1/2 Away from 0)",
   towards: "Towards Zero",
   away: "Away from Zero",
};

export const TextAlignModes = {
   START: "start",
   MIDDLE: "middle",
   END: "end",
} as const;
export type TextAlignMode = (typeof TextAlignModes)[keyof typeof TextAlignModes];
export const TEXT_ALIGN_MODE_OPTIONS: {
   [key in TextAlignMode]: string;
} = {
   start: "Start",
   middle: "Middle",
   end: "End",
};

export const TextAnchorModes = {
   BOTTOM: "auto",
   MIDDLE: "middle",
   TOP: "hanging",
} as const;
export type TextAnchorMode = (typeof TextAnchorModes)[keyof typeof TextAnchorModes];
export const TEXT_ANCHOR_MODE_OPTIONS: {
   [key in TextAnchorMode]: string;
} = {
   auto: "Bottom",
   middle: "Middle",
   hanging: "Top",
};
