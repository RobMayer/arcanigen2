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

const nodeHelper = ArcaneGraph.nodeHooks<IOverrideStylesNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [strokeCap, setStrokeCap] = nodeHelper.useValueState(nodeId, "strokeCap");
   const [strokeJoin, setStrokeJoin] = nodeHelper.useValueState(nodeId, "strokeJoin");
   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");

   const [isStrokeWidth, setIsStrokeWidth] = nodeHelper.useValueState(nodeId, "isStrokeWidth");
   const [isStrokeColor, setIsStrokeColor] = nodeHelper.useValueState(nodeId, "isStrokeColor");
   const [isStrokeCap, setIsStrokeCap] = nodeHelper.useValueState(nodeId, "isStrokeCap");
   const [isStrokeJoin, setIsStrokeJoin] = nodeHelper.useValueState(nodeId, "isStrokeJoin");
   const [isFillColor, setIsFillColor] = nodeHelper.useValueState(nodeId, "isFillColor");

   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");

   return (
      <BaseNode<IOverrideStylesNode> nodeId={nodeId} helper={OverrideStylesNodeHelper}>
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
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const fillColor = nodeHelper.useCoalesce(nodeId, "fillColor", "fillColor", globals);
   const strokeCap = nodeHelper.useValue(nodeId, "strokeCap");
   const strokeJoin = nodeHelper.useValue(nodeId, "strokeJoin");
   const isStrokeWidth = nodeHelper.useValue(nodeId, "isStrokeWidth");
   const isStrokeColor = nodeHelper.useValue(nodeId, "isStrokeColor");
   const isFillColor = nodeHelper.useValue(nodeId, "isFillColor");
   const isStrokeCap = nodeHelper.useValue(nodeId, "isStrokeCap");
   const isStrokeJoin = nodeHelper.useValue(nodeId, "isStrokeJoin");

   const [Content, cId] = nodeHelper.useInputNode(nodeId, "input", globals);

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
