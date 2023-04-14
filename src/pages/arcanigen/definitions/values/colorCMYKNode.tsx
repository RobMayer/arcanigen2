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
import { MetaPrefab } from "../../nodeView/prefabs";

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

const nodeHooks = ArcaneGraph.nodeHooks<IColorCMYKNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [c, setC] = nodeHooks.useValueState(nodeId, "c");
   const [m, setM] = nodeHooks.useValueState(nodeId, "m");
   const [y, setY] = nodeHooks.useValueState(nodeId, "y");
   const [k, setK] = nodeHooks.useValueState(nodeId, "k");
   const [a, setA] = nodeHooks.useValueState(nodeId, "a");

   const hasCIn = nodeHooks.useHasLink(nodeId, "cIn");
   const hasMIn = nodeHooks.useHasLink(nodeId, "mIn");
   const hasYIn = nodeHooks.useHasLink(nodeId, "yIn");
   const hasKIn = nodeHooks.useHasLink(nodeId, "kIn");
   const hasAIn = nodeHooks.useHasLink(nodeId, "aIn");

   const actualC = nodeHooks.useCoalesce(nodeId, "cIn", "c", globals);
   const actualM = nodeHooks.useCoalesce(nodeId, "mIn", "m", globals);
   const actualY = nodeHooks.useCoalesce(nodeId, "yIn", "y", globals);
   const actualK = nodeHooks.useCoalesce(nodeId, "kIn", "k", globals);
   const actualA = nodeHooks.useCoalesce(nodeId, "aIn", "a", globals);

   const res = useMemo(() => {
      return MathHelper.colorToHTML(
         CMYK2color({
            c: MathHelper.clamp(actualC, 0, 1),
            m: MathHelper.clamp(actualM, 0, 1),
            y: MathHelper.clamp(actualY, 0, 1),
            k: MathHelper.clamp(actualK, 0, 1),
            a: MathHelper.clamp(actualA, 0, 1),
         })
      );
   }, [actualA, actualC, actualK, actualM, actualY]);

   return (
      <BaseNode<IColorCMYKNode> nodeId={nodeId} helper={ColorCMYKNodeHelper} hooks={nodeHooks}>
         <SocketOut<IColorCMYKNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
            <Swatch value={res} />
         </SocketOut>
         <hr />
         <SocketIn<IColorCMYKNode> nodeId={nodeId} socketId={"cIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Cyan"}>
               <SliderInput min={0} max={1} value={c} onValidValue={setC} disabled={hasCIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorCMYKNode> nodeId={nodeId} socketId={"mIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Magenta"}>
               <SliderInput min={0} max={1} value={m} onValidValue={setM} disabled={hasMIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorCMYKNode> nodeId={nodeId} socketId={"yIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Yellow"}>
               <SliderInput min={0} max={1} value={y} onValidValue={setY} disabled={hasYIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorCMYKNode> nodeId={nodeId} socketId={"kIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Black (key)"}>
               <SliderInput min={0} max={1} value={k} onValidValue={setK} disabled={hasKIn} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorCMYKNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Alpha"}>
               <SliderInput min={0} max={1} value={a} onValidValue={setA} disabled={hasAIn} />
            </BaseNode.Input>
         </SocketIn>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorCMYKNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorCMYKNode["outputs"], globals: Globals) => {
   const c = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "cIn", "c", globals)));
   const m = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "mIn", "m", globals)));
   const y = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "yIn", "y", globals)));
   const k = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "kIn", "k", globals)));
   const a = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals)));
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
      c: 1,
      m: 1,
      y: 1,
      k: 1,
      a: 1,
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
