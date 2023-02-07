import { HTMLAttributes, memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { hwb2Color } from "!/utility/colorconvert";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInput from "!/components/inputs/SliderInput";
import MathHelper from "!/utility/mathhelper";
import styled from "styled-components";
import AngleInput from "!/components/inputs/AngleInput";

interface IColorHWBNode extends INodeDefinition {
   inputs: {
      hIn: number;
      wIn: number;
      bIn: number;
      aIn: number;
   };
   outputs: {
      value: Color;
   };
   values: {
      h: number;
      w: number;
      b: number;
      a: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IColorHWBNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [h, setH] = nodeHelper.useValueState(nodeId, "h");
   const [w, setW] = nodeHelper.useValueState(nodeId, "w");
   const [b, setB] = nodeHelper.useValueState(nodeId, "b");
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");

   const hasHIn = nodeHelper.useHasLink(nodeId, "hIn");
   const hasWIn = nodeHelper.useHasLink(nodeId, "wIn");
   const hasBIn = nodeHelper.useHasLink(nodeId, "bIn");
   const hasAIn = nodeHelper.useHasLink(nodeId, "aIn");

   const actualH = nodeHelper.useCoalesce(nodeId, "hIn", "h", globals);
   const actualW = nodeHelper.useCoalesce(nodeId, "wIn", "w", globals);
   const actualB = nodeHelper.useCoalesce(nodeId, "bIn", "b", globals);
   const actualA = nodeHelper.useCoalesce(nodeId, "aIn", "a", globals);

   const res = useMemo(() => {
      return MathHelper.colorToHex(
         hwb2Color(MathHelper.mod(actualH, 360), MathHelper.clamp(actualW, 0, 100), MathHelper.clamp(actualB, 0, 100), MathHelper.clamp(actualA, 0, 100))
      );
   }, [actualH, actualW, actualB, actualA]);

   return (
      <BaseNode<IColorHWBNode> nodeId={nodeId} helper={ColorHWBNodeHelper}>
         <SocketOut<IColorHWBNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
            <Swatch value={res} />
         </SocketOut>
         <hr />
         <SocketIn<IColorHWBNode> nodeId={nodeId} socketId={"hIn"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Hue"}>
               <AngleInput value={h} onValidValue={setH} disabled={hasHIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHWBNode> nodeId={nodeId} socketId={"wIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Whiteness"}>
               <SliderInput min={0} max={100} value={w} onValidValue={setW} disabled={hasWIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHWBNode> nodeId={nodeId} socketId={"bIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Blackness"}>
               <SliderInput min={0} max={100} value={b} onValidValue={setB} disabled={hasBIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHWBNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Alpha"}>
               <SliderInput min={0} max={100} value={a} onValidValue={setA} disabled={hasAIn} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorHWBNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorHWBNode["outputs"], globals: Globals) => {
   const h = MathHelper.mod(nodeMethods.coalesce(graph, nodeId, "hIn", "h", globals), 360);
   const w = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "wIn", "w", globals)));
   const b = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "bIn", "b", globals)));
   const a = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals)));
   return hwb2Color(h, w, b, a);
};

const ColorHWBNodeHelper: INodeHelper<IColorHWBNode> = {
   name: "Color (hwb)",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.COLOR_HWB,
   getOutput,
   initialize: () => ({
      h: 0,
      w: 100,
      b: 100,
      a: 100,
   }),
   controls: Controls,
};

export default ColorHWBNodeHelper;

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
