import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
   ControlRendererProps,
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeRendererProps,
   NodeTypes,
   STROKECAP_MODES,
   STROKEJOIN_MODES,
   SocketTypes,
   StrokeCapMode,
   StrokeJoinMode,
} from "../types";

import { faPencilPaintbrush as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPencilPaintbrush as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import LengthInput from "!/components/inputs/LengthInput";
import { Color, Length } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import HexColorInput from "!/components/inputs/colorHexInput";
import ToggleList from "!/components/selectors/ToggleList";
import Checkbox from "!/components/buttons/Checkbox";
import styled from "styled-components";
import { MetaPrefab } from "../../nodeView/prefabs";

interface IOverrideStylesNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      strokeWidth: Length;
      strokeColor: Color;
      fillColor: Color;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      strokeColor: Color;
      strokeWidth: Length;
      fillColor: Color;
      strokeJoin: StrokeJoinMode;
      strokeCap: StrokeCapMode;

      isStrokeColor: boolean;
      isStrokeWidth: boolean;
      isFillColor: boolean;
      isStrokeJoin: boolean;
      isStrokeCap: boolean;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IOverrideStylesNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
   const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
   const [strokeJoin, setStrokeJoin] = nodeHooks.useValueState(nodeId, "strokeJoin");
   const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");

   const [isStrokeWidth, setIsStrokeWidth] = nodeHooks.useValueState(nodeId, "isStrokeWidth");
   const [isStrokeColor, setIsStrokeColor] = nodeHooks.useValueState(nodeId, "isStrokeColor");
   const [isStrokeCap, setIsStrokeCap] = nodeHooks.useValueState(nodeId, "isStrokeCap");
   const [isStrokeJoin, setIsStrokeJoin] = nodeHooks.useValueState(nodeId, "isStrokeJoin");
   const [isFillColor, setIsFillColor] = nodeHooks.useValueState(nodeId, "isFillColor");

   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");
   const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");

   return (
      <BaseNode<IOverrideStylesNode> nodeId={nodeId} helper={OverrideStylesNodeHelper} hooks={nodeHooks}>
         <SocketOut<IOverrideStylesNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IOverrideStylesNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
            Input
         </SocketIn>
         <hr />
         <SocketIn<IOverrideStylesNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Stroke Width"}>
               <ToggleDiv>
                  <Checkbox checked={isStrokeWidth} onToggle={setIsStrokeWidth} title={"Enabled?"} />
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </ToggleDiv>
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Stroke Cap"}>
            <ToggleDiv>
               <Checkbox checked={isStrokeCap} onToggle={setIsStrokeCap} title={"Enabled?"} />
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES} />
            </ToggleDiv>
         </BaseNode.Input>
         <BaseNode.Input label={"Stroke Join"}>
            <ToggleDiv>
               <Checkbox checked={isStrokeJoin} onToggle={setIsStrokeJoin} title={"Enabled?"} />
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODES} />
            </ToggleDiv>
         </BaseNode.Input>
         <SocketIn<IOverrideStylesNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
            <BaseNode.Input label={"Stroke Color"}>
               <ToggleDiv>
                  <Checkbox checked={isStrokeColor} onToggle={setIsStrokeColor} title={"Enabled?"} />
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </ToggleDiv>
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IOverrideStylesNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
            <BaseNode.Input label={"Fill Color"}>
               <ToggleDiv>
                  <Checkbox checked={isFillColor} onToggle={setIsFillColor} title={"Enabled?"} />
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </ToggleDiv>
            </BaseNode.Input>
         </SocketIn>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const fillColor = nodeHooks.useCoalesce(nodeId, "fillColor", "fillColor", globals);
   const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");
   const strokeJoin = nodeHooks.useValue(nodeId, "strokeJoin");
   const isStrokeWidth = nodeHooks.useValue(nodeId, "isStrokeWidth");
   const isStrokeColor = nodeHooks.useValue(nodeId, "isStrokeColor");
   const isFillColor = nodeHooks.useValue(nodeId, "isFillColor");
   const isStrokeCap = nodeHooks.useValue(nodeId, "isStrokeCap");
   const isStrokeJoin = nodeHooks.useValue(nodeId, "isStrokeJoin");

   const [Content, cId] = nodeHooks.useInputNode(nodeId, "input", globals);

   const newOverrides = useMemo(() => {
      const r = { ...overrides };
      if (isStrokeWidth) {
         r.strokeWidth = strokeWidth;
      }
      if (isStrokeColor) {
         r.strokeColor = strokeColor;
      }
      if (isFillColor) {
         r.fillColor = fillColor;
      }
      if (isStrokeCap) {
         r.strokeCap = strokeCap;
      }
      if (isStrokeJoin) {
         r.strokeJoin = strokeJoin;
      }
      return r;
   }, [overrides, strokeWidth, strokeColor, fillColor, strokeCap, strokeJoin, isStrokeWidth, isStrokeColor, isFillColor, isStrokeCap, isStrokeJoin]);

   return <>{Content && cId && <Content nodeId={cId} depth={(depth ?? "") + `_${nodeId}`} globals={globals} overrides={newOverrides} />}</>;
});

const OverrideStylesNodeHelper: INodeHelper<IOverrideStylesNode> = {
   name: "Restyle",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.COL_RESTYLE,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IOverrideStylesNode["outputs"]) => Renderer,
   initialize: () => ({
      strokeWidth: { value: 1, unit: "px" },
      strokeCap: "butt",
      strokeJoin: "miter",
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      fillColor: null as Color,
      isStrokeCap: true,
      isFillColor: true,
      isStrokeColor: true,
      isStrokeJoin: true,
      isStrokeWidth: true,
   }),
   controls: Controls,
};

export default OverrideStylesNodeHelper;

const ToggleDiv = styled.div`
   display: grid;
   grid-template-columns: auto 1fr;
   align-items: center;
   gap: 0.25em;
`;
