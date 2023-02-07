import { HTMLAttributes, memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { hsv2Color } from "!/utility/colorconvert";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInput from "!/components/inputs/SliderInput";
import styled from "styled-components";
import MathHelper from "!/utility/mathhelper";
import AngleInput from "!/components/inputs/AngleInput";

interface IColorHSVNode extends INodeDefinition {
   inputs: {
      hIn: number;
      sIn: number;
      vIn: number;
      aIn: number;
   };
   outputs: {
      value: Color;
   };
   values: {
      h: number;
      s: number;
      v: number;
      a: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IColorHSVNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [h, setH] = nodeHelper.useValueState(nodeId, "h");
   const [s, setS] = nodeHelper.useValueState(nodeId, "s");
   const [v, setV] = nodeHelper.useValueState(nodeId, "v");
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");

   const hasHIn = nodeHelper.useHasLink(nodeId, "hIn");
   const hasSIn = nodeHelper.useHasLink(nodeId, "sIn");
   const hasVIn = nodeHelper.useHasLink(nodeId, "vIn");
   const hasAIn = nodeHelper.useHasLink(nodeId, "aIn");

   const actualH = nodeHelper.useCoalesce(nodeId, "hIn", "h");
   const actualS = nodeHelper.useCoalesce(nodeId, "sIn", "s");
   const actualV = nodeHelper.useCoalesce(nodeId, "vIn", "v");
   const actualA = nodeHelper.useCoalesce(nodeId, "aIn", "a");

   const res = useMemo(() => {
      return MathHelper.colorToHex(
         hsv2Color(MathHelper.mod(actualH, 360), MathHelper.clamp(actualS, 0, 100), MathHelper.clamp(actualV, 0, 100), MathHelper.clamp(actualA, 0, 100))
      );
   }, [actualH, actualS, actualV, actualA]);

   return (
      <BaseNode<IColorHSVNode> nodeId={nodeId} helper={ColorHSVNodeHelper}>
         <SocketOut<IColorHSVNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
            <Swatch value={res} />
         </SocketOut>
         <hr />
         <SocketIn<IColorHSVNode> nodeId={nodeId} socketId={"hIn"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Hue"}>
               <AngleInput value={h} onValidValue={setH} disabled={hasHIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSVNode> nodeId={nodeId} socketId={"sIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Saturation"}>
               <SliderInput min={0} max={100} value={s} onValidValue={setS} disabled={hasSIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSVNode> nodeId={nodeId} socketId={"vIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Value"}>
               <SliderInput min={0} max={100} value={v} onValidValue={setV} disabled={hasVIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSVNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Alpha"}>
               <SliderInput min={0} max={100} value={a} onValidValue={setA} disabled={hasAIn} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorHSVNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorHSVNode["outputs"]) => {
   const h = MathHelper.mod(nodeMethods.coalesce(graph, nodeId, "hIn", "h"), 360);
   const s = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "sIn", "s")));
   const v = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "vIn", "v")));
   const a = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "aIn", "a")));
   return hsv2Color(h, s, v, a);
};

const ColorHSVNodeHelper: INodeHelper<IColorHSVNode> = {
   name: "Color (hsv)",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.COLOR_HSV,
   getOutput,
   initialize: () => ({
      h: 0,
      s: 100,
      v: 100,
      a: 100,
   }),
   controls: Controls,
};

export default ColorHSVNodeHelper;

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
