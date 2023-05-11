import { HTMLAttributes, memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { RGB2color } from "!/utility/colorconvert";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInput from "!/components/inputs/SliderInput";
import styled from "styled-components";
import MathHelper from "!/utility/mathhelper";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";

interface IColorRGBNode extends INodeDefinition {
   inputs: {
      rIn: number;
      gIn: number;
      bIn: number;
      aIn: number;
   };
   outputs: {
      value: Color;
   };
   values: {
      r: number;
      g: number;
      b: number;
      a: number;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IColorRGBNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [r, setR] = nodeHooks.useValueState(nodeId, "r");
   const [g, setG] = nodeHooks.useValueState(nodeId, "g");
   const [b, setB] = nodeHooks.useValueState(nodeId, "b");
   const [a, setA] = nodeHooks.useValueState(nodeId, "a");

   const hasRIn = nodeHooks.useHasLink(nodeId, "rIn");
   const hasGIn = nodeHooks.useHasLink(nodeId, "gIn");
   const hasBIn = nodeHooks.useHasLink(nodeId, "bIn");
   const hasAIn = nodeHooks.useHasLink(nodeId, "aIn");

   const actualR = nodeHooks.useCoalesce(nodeId, "rIn", "r", globals);
   const actualG = nodeHooks.useCoalesce(nodeId, "gIn", "g", globals);
   const actualB = nodeHooks.useCoalesce(nodeId, "bIn", "b", globals);
   const actualA = nodeHooks.useCoalesce(nodeId, "aIn", "a", globals);

   const res = useMemo(() => {
      return MathHelper.colorToHTML(
         RGB2color({
            r: MathHelper.clamp(actualR, 0, 1),
            g: MathHelper.clamp(actualG, 0, 1),
            b: MathHelper.clamp(actualB, 0, 1),
            a: MathHelper.clamp(actualA, 0, 1),
         })
      );
   }, [actualR, actualG, actualB, actualA]);

   return (
      <BaseNode<IColorRGBNode> nodeId={nodeId} helper={ColorRGBNodeHelper} hooks={nodeHooks}>
         <SocketOut<IColorRGBNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
            <Swatch value={res} />
         </SocketOut>
         <hr />
         <SocketIn<IColorRGBNode> nodeId={nodeId} socketId={"rIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Red"}>
               <SliderInput min={0} max={1} value={r} onValidValue={setR} disabled={hasRIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorRGBNode> nodeId={nodeId} socketId={"gIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Green"}>
               <SliderInput min={0} max={1} value={g} onValidValue={setG} disabled={hasGIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorRGBNode> nodeId={nodeId} socketId={"bIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Blue"}>
               <SliderInput min={0} max={1} value={b} onValidValue={setB} disabled={hasBIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorRGBNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Alpha"}>
               <SliderInput min={0} max={1} value={a} onValidValue={setA} disabled={hasAIn} />
            </BaseNode.Input>
         </SocketIn>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorRGBNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorRGBNode["outputs"], globals: GraphGlobals) => {
   const r = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "rIn", "r", globals)));
   const g = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "gIn", "g", globals)));
   const b = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "bIn", "b", globals)));
   const a = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals)));
   return RGB2color({ r, g, b, a });
};

const ColorRGBNodeHelper: INodeHelper<IColorRGBNode> = {
   name: "Color (rgb)",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.COLOR_RGB,
   getOutput,
   initialize: () => ({
      r: 1,
      g: 1,
      b: 1,
      a: 1,
   }),
   controls: Controls,
};

export default ColorRGBNodeHelper;

const Swatch = styled(({ value, ...props }: { value: string } & HTMLAttributes<HTMLDivElement>) => {
   const style = useMemo(() => {
      return { color: value };
   }, [value]);

   return <div {...props} style={style} />;
})`
   outline: 1px solid var(--effect-border-highlight);
   aspect-ratio: 1;
   width: 50%;
   background: currentColor;
   display: flex;
   justify-self: center;
   align-self: center;
   text-align: center;
   margin: 0.25em auto;
`;
