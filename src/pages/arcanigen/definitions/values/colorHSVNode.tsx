import { HTMLAttributes, memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { HSV2color } from "!/utility/colorconvert";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInput from "!/components/inputs/SliderInput";
import styled from "styled-components";
import MathHelper from "!/utility/mathhelper";
import AngleInput from "!/components/inputs/AngleInput";
import TextInput from "!/components/inputs/TextInput";

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
      name: string;
      h: number;
      s: number;
      v: number;
      a: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IColorHSVNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [h, setH] = nodeHelper.useValueState(nodeId, "h");
   const [s, setS] = nodeHelper.useValueState(nodeId, "s");
   const [v, setV] = nodeHelper.useValueState(nodeId, "v");
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");

   const hasHIn = nodeHelper.useHasLink(nodeId, "hIn");
   const hasSIn = nodeHelper.useHasLink(nodeId, "sIn");
   const hasVIn = nodeHelper.useHasLink(nodeId, "vIn");
   const hasAIn = nodeHelper.useHasLink(nodeId, "aIn");

   const actualH = nodeHelper.useCoalesce(nodeId, "hIn", "h", globals);
   const actualS = nodeHelper.useCoalesce(nodeId, "sIn", "s", globals);
   const actualV = nodeHelper.useCoalesce(nodeId, "vIn", "v", globals);
   const actualA = nodeHelper.useCoalesce(nodeId, "aIn", "a", globals);

   const res = useMemo(() => {
      return MathHelper.colorToHTML(
         HSV2color({
            h: MathHelper.mod(actualH, 360),
            s: MathHelper.clamp(actualS, 0, 1),
            v: MathHelper.clamp(actualV, 0, 1),
            a: MathHelper.clamp(actualA, 0, 1),
         })
      );
   }, [actualH, actualS, actualV, actualA]);

   return (
      <BaseNode<IColorHSVNode> nodeId={nodeId} helper={ColorHSVNodeHelper} name={name}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
         <SocketOut<IColorHSVNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
            <Swatch value={res} />
         </SocketOut>
         <hr />
         <SocketIn<IColorHSVNode> nodeId={nodeId} socketId={"hIn"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Hue"}>
               <AngleInput value={h} onValidValue={setH} disabled={hasHIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSVNode> nodeId={nodeId} socketId={"sIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Saturation"}>
               <SliderInput min={0} max={1} value={s} onValidValue={setS} disabled={hasSIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSVNode> nodeId={nodeId} socketId={"vIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Value"}>
               <SliderInput min={0} max={1} value={v} onValidValue={setV} disabled={hasVIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHSVNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Alpha"}>
               <SliderInput min={0} max={1} value={a} onValidValue={setA} disabled={hasAIn} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorHSVNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorHSVNode["outputs"], globals: Globals) => {
   const h = MathHelper.mod(nodeMethods.coalesce(graph, nodeId, "hIn", "h", globals), 360);
   const s = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "sIn", "s", globals)));
   const v = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "vIn", "v", globals)));
   const a = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals)));
   return HSV2color({ h, s, v, a });
};

const ColorHSVNodeHelper: INodeHelper<IColorHSVNode> = {
   name: "Color (hsv)",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.COLOR_HSV,
   getOutput,
   initialize: () => ({
      name: "",
      h: 0,
      s: 1,
      v: 1,
      a: 1,
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
