import { Flavour } from "!/components";
import { LinkType, NodeType, SocketType } from "!/utility/enums";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { ComponentType } from "react";

export type InSocket = string | null;
export type OutSocket = string[];

export type ILinkInstance = {
   fromNode: string;
   linkId: string;
   toNode: string;
   fromSocket: string;
   toSocket: string;
   type: LinkType;
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
   type: NodeType;
   nodeId: string;
   in: {
      [keys in keyof T["inputs"]]: string | null;
   };
   out: {
      [keys in keyof T["outputs"]]: string[];
   };
} & T["values"];

export type NodeRendererProps = { nodeId: string; depth: string; globals: GraphGlobals; overrides?: { [key: string]: any } };
export type NodeRenderer = ComponentType<NodeRendererProps>;
export type ControlRendererProps = { nodeId: string; globals: GraphGlobals };
export type ControlRenderer = ComponentType<ControlRendererProps>;
export type NodePatherProps = { nodeId: string; depth: string; globals: GraphGlobals; pathId: string; pathLength: number };
export type NodePather = ComponentType<NodePatherProps>;

export type Path = string;

export type GraphGlobals = {
   sequenceData: { [key: string]: number };
   portalData: { [key: string]: number };
   filterData?: { discriminator: () => number; threshold: number };
};

export type Sequence = {
   senderId: string;
   min: number;
   max: number;
};

export type PortalBus = {
   senderId: string;
   renderer: NodeRenderer;
};

export type Interpolator = (n: number) => number;

export type OutSocketsOf<T extends INodeDefinition> = keyof T["outputs"];

export interface INodeHelper<T extends INodeDefinition> {
   readonly buttonIcon: IconProp | null;
   readonly nodeIcon: IconProp;
   readonly flavour: Flavour;
   readonly name: string;
   readonly type: NodeType;
   initialize: () => T["values"];
   controls: ControlRenderer;
   getOutput: (
      graph: IArcaneGraph,
      nodeId: string,
      socket: keyof T["outputs"],
      globals: GraphGlobals
   ) => T["outputs"][typeof socket] extends never ? void : T["outputs"][typeof socket];
}

export type IArcaneGraph = {
   nodes: { [key: string]: INodeInstance<INodeDefinition> };
   links: {
      [key: string]: ILinkInstance;
   };
};

export type IArcanePos = { [key: string]: { x: number; y: number } };

export type IArcaneToggle = {
   [key: string]: {
      node: boolean;
      [key: string]: boolean;
   };
};

/* EVENTS */

export type NodeMoveEvent = { nodeId: string; x: number; y: number };
export type LinkEvent = { nodeId: string; socketId: string; mode: "in" | "out"; type: SocketType };
export type ConnectionEvent = Omit<ILinkInstance, "linkId">;
