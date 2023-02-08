import { HTMLAttributes, memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { CMYK2color } from "!/utility/colorconvert";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInput from "!/components/inputs/SliderInput";
import MathHelper from "!/utility/mathhelper";
import styled from "styled-components";

interface IColorCMYKNode extends INodeDefinition {
   inputs: {
      cIn: number;
      mIn: number;
      yIn: number;
      kIn: number;
      aIn: number;
   };
   outputs: {
      value: Color;
   };
   values: {
      c: number;
      m: number;
      y: number;
      k: number;
      a: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IColorCMYKNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [c, setC] = nodeHelper.useValueState(nodeId, "c");
   const [m, setM] = nodeHelper.useValueState(nodeId, "m");
   const [y, setY] = nodeHelper.useValueState(nodeId, "y");
   const [k, setK] = nodeHelper.useValueState(nodeId, "k");
   const [a, setA] = nodeHelper.useValueState(nodeId, "a");

   const hasCIn = nodeHelper.useHasLink(nodeId, "cIn");
   const hasMIn = nodeHelper.useHasLink(nodeId, "mIn");
   const hasYIn = nodeHelper.useHasLink(nodeId, "yIn");
   const hasKIn = nodeHelper.useHasLink(nodeId, "kIn");
   const hasAIn = nodeHelper.useHasLink(nodeId, "aIn");

   const actualC = nodeHelper.useCoalesce(nodeId, "cIn", "c", globals);
   const actualM = nodeHelper.useCoalesce(nodeId, "mIn", "m", globals);
   const actualY = nodeHelper.useCoalesce(nodeId, "yIn", "y", globals);
   const actualK = nodeHelper.useCoalesce(nodeId, "kIn", "k", globals);
   const actualA = nodeHelper.useCoalesce(nodeId, "aIn", "a", globals);

   const res = useMemo(() => {
      return MathHelper.colorToHex(
         CMYK2color({
            c: MathHelper.clamp(actualC, 0, 100),
            m: MathHelper.clamp(actualM, 0, 100),
            y: MathHelper.clamp(actualY, 0, 100),
            k: MathHelper.clamp(actualK, 0, 100),
            a: MathHelper.clamp(actualA, 0, 100),
         })
      );
   }, [actualA, actualC, actualK, actualM, actualY]);

   return (
      <BaseNode<IColorCMYKNode> nodeId={nodeId} helper={ColorCMYKNodeHelper}>
         <SocketOut<IColorCMYKNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
            <Swatch value={res} />
         </SocketOut>
         <hr />
         <SocketIn<IColorCMYKNode> nodeId={nodeId} socketId={"cIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Cyan"}>
               <SliderInput min={0} max={100} value={c} onValidValue={setC} disabled={hasCIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorCMYKNode> nodeId={nodeId} socketId={"mIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Magenta"}>
               <SliderInput min={0} max={100} value={m} onValidValue={setM} disabled={hasMIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorCMYKNode> nodeId={nodeId} socketId={"yIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Yellow"}>
               <SliderInput min={0} max={100} value={y} onValidValue={setY} disabled={hasYIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorCMYKNode> nodeId={nodeId} socketId={"kIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Black (key)"}>
               <SliderInput min={0} max={100} value={k} onValidValue={setK} disabled={hasKIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorCMYKNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Alpha"}>
               <SliderInput min={0} max={100} value={a} onValidValue={setA} disabled={hasAIn} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorCMYKNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorCMYKNode["outputs"], globals: Globals) => {
   const c = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "cIn", "c", globals)));
   const m = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "mIn", "m", globals)));
   const y = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "yIn", "y", globals)));
   const k = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "kIn", "k", globals)));
   const a = Math.max(0, Math.min(100, nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals)));
   return CMYK2color({
      c,
      m,
      y,
      k,
      a,
   });
};

const ColorCMYKNodeHelper: INodeHelper<IColorCMYKNode> = {
   name: "Color (cmyk)",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.COLOR_CMYK,
   getOutput,
   initialize: () => ({
      c: 100,
      m: 100,
      y: 100,
      k: 100,
      a: 100,
   }),
   controls: Controls,
};

export default ColorCMYKNodeHelper;

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
