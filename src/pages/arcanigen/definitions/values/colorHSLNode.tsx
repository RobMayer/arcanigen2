import { HTMLAttributes, memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { HSL2color } from "!/utility/colorconvert";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInput from "!/components/inputs/SliderInput";
import MathHelper from "!/utility/mathhelper";
import styled from "styled-components";
import AngleInput from "!/components/inputs/AngleInput";
import { MetaPrefab } from "../../nodeView/prefabs";

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

const nodeHooks = ArcaneGraph.nodeHooks<IColorHSLNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [h, setH] = nodeHooks.useValueState(nodeId, "h");
   const [s, setS] = nodeHooks.useValueState(nodeId, "s");
   const [l, setL] = nodeHooks.useValueState(nodeId, "l");
   const [a, setA] = nodeHooks.useValueState(nodeId, "a");

   const hasHIn = nodeHooks.useHasLink(nodeId, "hIn");
   const hasSIn = nodeHooks.useHasLink(nodeId, "sIn");
   const hasLIn = nodeHooks.useHasLink(nodeId, "lIn");
   const hasAIn = nodeHooks.useHasLink(nodeId, "aIn");

   const actualH = nodeHooks.useCoalesce(nodeId, "hIn", "h", globals);
   const actualS = nodeHooks.useCoalesce(nodeId, "sIn", "s", globals);
   const actualL = nodeHooks.useCoalesce(nodeId, "lIn", "l", globals);
   const actualA = nodeHooks.useCoalesce(nodeId, "aIn", "a", globals);

   const res = useMemo(() => {
      return MathHelper.colorToHTML(
         HSL2color({
            h: MathHelper.mod(actualH, 360),
            s: MathHelper.clamp(actualS, 0, 1),
            l: MathHelper.clamp(actualL, 0, 1),
            a: MathHelper.clamp(actualA, 0, 1),
         })
      );
   }, [actualH, actualS, actualL, actualA]);

   return (
      <BaseNode<IColorHSLNode> nodeId={nodeId} helper={ColorHSLNodeHelper} hooks={nodeHooks}>
         <SocketOut<IColorHSLNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
            <Swatch value={res} />
         </SocketOut>
         <hr />
         <SocketIn<IColorHSLNode> nodeId={nodeId} socketId={"hIn"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Hue"}>
               <AngleInput value={h} onValidValue={setH} disabled={hasHIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSLNode> nodeId={nodeId} socketId={"sIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Saturation"}>
               <SliderInput min={0} max={1} value={s} onValidValue={setS} disabled={hasSIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSLNode> nodeId={nodeId} socketId={"lIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Lightness"}>
               <SliderInput min={0} max={1} value={l} onValidValue={setL} disabled={hasLIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSLNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Alpha"}>
               <SliderInput min={0} max={1} value={a} onValidValue={setA} disabled={hasAIn} />
            </BaseNode.Input>
         </SocketIn>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorHSLNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorHSLNode["outputs"], globals: Globals) => {
   const h = MathHelper.mod(nodeMethods.coalesce(graph, nodeId, "hIn", "h", globals), 360);
   const s = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "sIn", "s", globals)));
   const l = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "lIn", "l", globals)));
   const a = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals)));
   return HSL2color({ h, s, l, a });
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
      s: 1,
      l: 1,
      a: 1,
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
