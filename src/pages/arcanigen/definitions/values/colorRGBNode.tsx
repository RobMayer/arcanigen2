import { HTMLAttributes, memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { rgb2Color } from "!/utility/colorconvert";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInput from "!/components/inputs/SliderInput";
import styled from "styled-components";
import MathHelper from "!/utility/mathhelper";

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

const nodeHelper = ArcaneGraph.nodeHooks<IColorRGBNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [r, setR] = nodeHelper.useValueState(nodeId, "r");
   const [g, setG] = nodeHelper.useValueState(nodeId, "g");
   const [b, setB] = nodeHelper.useValueState(nodeId, "b");
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");

   const hasRIn = nodeHelper.useHasLink(nodeId, "rIn");
   const hasGIn = nodeHelper.useHasLink(nodeId, "gIn");
   const hasBIn = nodeHelper.useHasLink(nodeId, "bIn");
   const hasAIn = nodeHelper.useHasLink(nodeId, "aIn");

   const actualR = nodeHelper.useCoalesce(nodeId, "rIn", "r");
   const actualG = nodeHelper.useCoalesce(nodeId, "gIn", "g");
   const actualB = nodeHelper.useCoalesce(nodeId, "bIn", "b");
   const actualA = nodeHelper.useCoalesce(nodeId, "aIn", "a");

   const res = useMemo(() => {
      return MathHelper.colorToHex(
         rgb2Color(MathHelper.clamp(actualR, 0, 255), MathHelper.clamp(actualG, 0, 255), MathHelper.clamp(actualB, 0, 255), MathHelper.clamp(actualA, 0, 100))
      );
   }, [actualR, actualG, actualB, actualA]);

   return (
      <BaseNode<IColorRGBNode> nodeId={nodeId} helper={ColorRGBNodeHelper}>
         <SocketOut<IColorRGBNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
            <Swatch value={res} />
         </SocketOut>
         <hr />
         <SocketIn<IColorRGBNode> nodeId={nodeId} socketId={"rIn"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Red"}>
               <SliderInput min={0} max={255} step={1} value={r} onValidValue={setR} disabled={hasRIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorRGBNode> nodeId={nodeId} socketId={"gIn"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Green"}>
               <SliderInput min={0} max={255} step={1} value={g} onValidValue={setG} disabled={hasGIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorRGBNode> nodeId={nodeId} socketId={"bIn"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Blue"}>
               <SliderInput min={0} max={255} step={1} value={b} onValidValue={setB} disabled={hasBIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorRGBNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Alpha"}>
               <SliderInput min={0} max={100} value={a} onValidValue={setA} disabled={hasAIn} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorRGBNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorRGBNode["outputs"]) => {
   const r = Math.max(0, Math.min(255, nodeMethods.coalesce(graph, nodeId, "rIn", "r")));
   const g = Math.max(0, Math.min(255, nodeMethods.coalesce(graph, nodeId, "gIn", "g")));
   const b = Math.max(0, Math.min(255, nodeMethods.coalesce(graph, nodeId, "bIn", "b")));
   const a = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "aIn", "a")));
   return rgb2Color(r, g, b, a);
};

const ColorRGBNodeHelper: INodeHelper<IColorRGBNode> = {
   name: "Color (rgb)",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.COLOR_RGB,
   getOutput,
   initialize: () => ({
      r: 255,
      g: 255,
      b: 255,
      a: 100,
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
