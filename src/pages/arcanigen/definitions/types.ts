import { Flavour } from "!/components";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { ComponentType } from "react";

export enum NodeTypes {
   RESULT = "result",

   SHAPE_CIRCLE = "shapeCircle",
   SHAPE_RING = "shapeRing",
   SHAPE_POLYGON = "shapePolygon",
   SHAPE_POLYGRAM = "shapePolygram",
   SHAPE_STAR = "shapeStar",
   SHAPE_BURST = "shapeBurst",
   SHAPE_ARC = "shapeArc",
   SHAPE_FLOODFILL = "shapeFloodFill",

   COL_LAYERS = "collectionLayers",
   COL_MASK = "collectionMask",

   ARRAY_VERTEX = "arrayVertex",
   ARRAY_SPIRAL = "arraySpiral",

   VALUE_COLOR_HEX = "valueColorHex",
   VALUE_LENGTH = "valueLength",
   VALUE_RANDOM = "valueRandom",

   EFFECT_BRUSH = "effectBrush",
   EFFECT_PENCIL = "effectPencil",
   EFFECT_PEN = "effectPen",

   MATH_ADD = "mathAdd",
   MATH_SUB = "mathSub",
   MATH_MUL = "mathMul",
   MATH_DIV = "mathDiv",
   MATH_MOD = "mathMod",
   MATH_ABS = "mathAbs",

   CONVERT_LENGTH = "convertToLength",
}

export enum SocketTypes {
   NONE = 0,
   SHAPE = 1,
   FLOAT = 2,
   INTEGER = 4,
   INTERVAL = 8,
   LENGTH = 16,
   ANGLE = 32,
   COLOR = 64,

   ANY = 1 | 2 | 4 | 8 | 16 | 32 | 64,
   NUMBER = 2 | 4 | 8 | 32,
}

export enum LinkTypes {
   OTHER,
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

export type NodeRendererProps = { nodeId: string; layer: string };
export type NodeRenderer = ComponentType<NodeRendererProps>;

export type OutSocketsOf<T extends INodeDefinition> = keyof T["outputs"];

export interface INodeHelper<T extends INodeDefinition> {
   readonly buttonIcon: IconProp | null;
   readonly nodeIcon: IconProp;
   readonly flavour: Flavour;
   readonly name: string;
   readonly type: NodeTypes;
   initialize: () => T["values"];
   controls: ComponentType<{ nodeId: string }>;
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof T["outputs"]) => T["outputs"][typeof socket];
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
};
export type BlendMode = keyof typeof BLEND_MODES;
