import { HTMLAttributes, memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { HSI2color } from "!/utility/colorconvert";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInput from "!/components/inputs/SliderInput";
import styled from "styled-components";
import MathHelper from "!/utility/mathhelper";
import AngleInput from "!/components/inputs/AngleInput";

interface IColorHSINode extends INodeDefinition {
   inputs: {
      hIn: number;
      sIn: number;
      iIn: number;
      aIn: number;
   };
   outputs: {
      value: Color;
   };
   values: {
      h: number;
      s: number;
      i: number;
      a: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IColorHSINode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [h, setH] = nodeHelper.useValueState(nodeId, "h");
   const [s, setS] = nodeHelper.useValueState(nodeId, "s");
   const [i, setI] = nodeHelper.useValueState(nodeId, "i");
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");

   const hasHIn = nodeHelper.useHasLink(nodeId, "hIn");
   const hasSIn = nodeHelper.useHasLink(nodeId, "sIn");
   const hasIIn = nodeHelper.useHasLink(nodeId, "iIn");
   const hasAIn = nodeHelper.useHasLink(nodeId, "aIn");

   const actualH = nodeHelper.useCoalesce(nodeId, "hIn", "h", globals);
   const actualS = nodeHelper.useCoalesce(nodeId, "sIn", "s", globals);
   const actualI = nodeHelper.useCoalesce(nodeId, "iIn", "i", globals);
   const actualA = nodeHelper.useCoalesce(nodeId, "aIn", "a", globals);

   const res = useMemo(() => {
      return MathHelper.colorToHTML(
         HSI2color({
            h: MathHelper.mod(actualH, 360),
            s: MathHelper.clamp(actualS, 0, 1),
            i: MathHelper.clamp(actualI, 0, 1),
            a: MathHelper.clamp(actualA, 0, 1),
         })
      );
   }, [actualH, actualS, actualI, actualA]);

   return (
      <BaseNode<IColorHSINode> nodeId={nodeId} helper={ColorHSINodeHelper}>
         <SocketOut<IColorHSINode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
            <Swatch value={res} />
         </SocketOut>
         <hr />
         <SocketIn<IColorHSINode> nodeId={nodeId} socketId={"hIn"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Hue"}>
               <AngleInput value={h} onValidValue={setH} disabled={hasHIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSINode> nodeId={nodeId} socketId={"sIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Saturation"}>
               <SliderInput min={0} max={1} value={s} onValidValue={setS} disabled={hasSIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSINode> nodeId={nodeId} socketId={"iIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Intensity"}>
               <SliderInput min={0} max={1} value={i} onValidValue={setI} disabled={hasIIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSINode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Alpha"}>
               <SliderInput min={0} max={1} value={a} onValidValue={setA} disabled={hasAIn} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorHSINode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorHSINode["outputs"], globals: Globals) => {
   const h = MathHelper.mod(nodeMethods.coalesce(graph, nodeId, "hIn", "h", globals), 360);
   const s = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "sIn", "s", globals)));
   const i = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "iIn", "i", globals)));
   const a = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals)));
   return HSI2color({ h, s, i, a });
};

const ColorHSINodeHelper: INodeHelper<IColorHSINode> = {
   name: "Color (hsi)",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.COLOR_HSV,
   getOutput,
   initialize: () => ({
      h: 0,
      s: 1,
      i: 1,
      a: 1,
   }),
   controls: Controls,
};

export default ColorHSINodeHelper;

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
