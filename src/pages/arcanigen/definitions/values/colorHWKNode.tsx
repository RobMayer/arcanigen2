import { HTMLAttributes, memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { HWK2color } from "!/utility/colorconvert";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInput from "!/components/inputs/SliderInput";
import MathHelper from "!/utility/mathhelper";
import styled from "styled-components";
import AngleInput from "!/components/inputs/AngleInput";
import TextInput from "!/components/inputs/TextInput";

interface IColorHWKNode extends INodeDefinition {
   inputs: {
      hIn: number;
      wIn: number;
      kIn: number;
      aIn: number;
   };
   outputs: {
      value: Color;
   };
   values: {
      name: string;
      h: number;
      w: number;
      k: number;
      a: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IColorHWKNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [h, setH] = nodeHelper.useValueState(nodeId, "h");
   const [w, setW] = nodeHelper.useValueState(nodeId, "w");
   const [k, setK] = nodeHelper.useValueState(nodeId, "k");
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");

   const hasHIn = nodeHelper.useHasLink(nodeId, "hIn");
   const hasWIn = nodeHelper.useHasLink(nodeId, "wIn");
   const hasKIn = nodeHelper.useHasLink(nodeId, "kIn");
   const hasAIn = nodeHelper.useHasLink(nodeId, "aIn");

   const actualH = nodeHelper.useCoalesce(nodeId, "hIn", "h", globals);
   const actualW = nodeHelper.useCoalesce(nodeId, "wIn", "w", globals);
   const actualK = nodeHelper.useCoalesce(nodeId, "kIn", "k", globals);
   const actualA = nodeHelper.useCoalesce(nodeId, "aIn", "a", globals);

   const res = useMemo(() => {
      return MathHelper.colorToHTML(
         HWK2color({
            h: MathHelper.mod(actualH, 360),
            w: MathHelper.clamp(actualW, 0, 1),
            k: MathHelper.clamp(actualK, 0, 1),
            a: MathHelper.clamp(actualA, 0, 1),
         })
      );
   }, [actualH, actualW, actualK, actualA]);

   return (
      <BaseNode<IColorHWKNode> nodeId={nodeId} helper={ColorHWKNodeHelper} name={name}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
         <SocketOut<IColorHWKNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
            <Swatch value={res} />
         </SocketOut>
         <hr />
         <SocketIn<IColorHWKNode> nodeId={nodeId} socketId={"hIn"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Hue"}>
               <AngleInput value={h} onValidValue={setH} disabled={hasHIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHWKNode> nodeId={nodeId} socketId={"wIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Whiteness"}>
               <SliderInput min={0} max={1} value={w} onValidValue={setW} disabled={hasWIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHWKNode> nodeId={nodeId} socketId={"kIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Blackness"}>
               <SliderInput min={0} max={1} value={k} onValidValue={setK} disabled={hasKIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorHWKNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Alpha"}>
               <SliderInput min={0} max={1} value={a} onValidValue={setA} disabled={hasAIn} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorHWKNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorHWKNode["outputs"], globals: Globals) => {
   const h = MathHelper.mod(nodeMethods.coalesce(graph, nodeId, "hIn", "h", globals), 360);
   const w = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "wIn", "w", globals)));
   const k = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "kIn", "k", globals)));
   const a = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals)));
   return HWK2color({ h, w, k, a });
};

const ColorHWKNodeHelper: INodeHelper<IColorHWKNode> = {
   name: "Color (hwk)",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.COLOR_HWK,
   getOutput,
   initialize: () => ({
      name: "",
      h: 0,
      w: 1,
      k: 1,
      a: 1,
   }),
   controls: Controls,
};

export default ColorHWKNodeHelper;

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
