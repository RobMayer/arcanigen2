import { HTMLAttributes, memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { hsl2Color } from "!/utility/colorconvert";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInput from "!/components/inputs/SliderInput";
import MathHelper from "!/utility/mathhelper";
import styled from "styled-components";
import AngleInput from "!/components/inputs/AngleInput";

interface IColorHSLNode extends INodeDefinition {
   inputs: {
      hIn: number;
      sIn: number;
      lIn: number;
      aIn: number;
   };
   outputs: {
      value: Color;
   };
   values: {
      h: number;
      s: number;
      l: number;
      a: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IColorHSLNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [h, setH] = nodeHelper.useValueState(nodeId, "h");
   const [s, setS] = nodeHelper.useValueState(nodeId, "s");
   const [l, setL] = nodeHelper.useValueState(nodeId, "l");
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");

   const hasHIn = nodeHelper.useHasLink(nodeId, "hIn");
   const hasSIn = nodeHelper.useHasLink(nodeId, "sIn");
   const hasLIn = nodeHelper.useHasLink(nodeId, "lIn");
   const hasAIn = nodeHelper.useHasLink(nodeId, "aIn");

   const actualH = nodeHelper.useCoalesce(nodeId, "hIn", "h");
   const actualS = nodeHelper.useCoalesce(nodeId, "sIn", "s");
   const actualL = nodeHelper.useCoalesce(nodeId, "lIn", "l");
   const actualA = nodeHelper.useCoalesce(nodeId, "aIn", "a");

   const res = useMemo(() => {
      return MathHelper.colorToHex(
         hsl2Color(MathHelper.mod(actualH, 360), MathHelper.clamp(actualS, 0, 100), MathHelper.clamp(actualL, 0, 100), MathHelper.clamp(actualA, 0, 100))
      );
   }, [actualH, actualS, actualL, actualA]);

   return (
      <BaseNode<IColorHSLNode> nodeId={nodeId} helper={ColorHSLNodeHelper}>
         <SocketOut<IColorHSLNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
            <Swatch value={res} />
         </SocketOut>
         <hr />
         <SocketIn<IColorHSLNode> nodeId={nodeId} socketId={"hIn"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Hue"}>
               <AngleInput value={h} onValidValue={setH} disabled={hasHIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSLNode> nodeId={nodeId} socketId={"sIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Saturation"}>
               <SliderInput min={0} max={100} value={s} onValidValue={setS} disabled={hasSIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSLNode> nodeId={nodeId} socketId={"lIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Lightness"}>
               <SliderInput min={0} max={100} value={l} onValidValue={setL} disabled={hasLIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSLNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Alpha"}>
               <SliderInput min={0} max={100} value={a} onValidValue={setA} disabled={hasAIn} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorHSLNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorHSLNode["outputs"]) => {
   const h = MathHelper.mod(nodeMethods.coalesce(graph, nodeId, "hIn", "h"), 360);
   const s = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "sIn", "s")));
   const l = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "lIn", "l")));
   const a = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "aIn", "a")));
   return hsl2Color(h, s, l, a);
};

const ColorHSLNodeHelper: INodeHelper<IColorHSLNode> = {
   name: "Color (hsl)",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.COLOR_HSL,
   getOutput,
   initialize: () => ({
      h: 0,
      s: 100,
      l: 100,
      a: 100,
   }),
   controls: Controls,
};

export default ColorHSLNodeHelper;

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
