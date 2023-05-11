import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps } from "../types";
import {
   STROKECAP_MODE_OPTIONS,
   STROKEJOIN_MODE_OPTIONS,
   StrokeCapMode,
   StrokeCapModes,
   StrokeJoinMode,
   StrokeJoinModes,
   NodeTypes,
   SocketTypes,
} from "../../../../utility/enums";

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
import TextInput from "!/components/inputs/TextInput";
import MathHelper from "!/utility/mathhelper";

interface IOverrideStylesNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      strokeWidth: Length;
      strokeColor: Color;
      fillColor: Color;
      strokeOffset: Length;
      strokeMarkStart: NodeRenderer;
      strokeMarkMid: NodeRenderer;
      strokeMarkEnd: NodeRenderer;
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
      strokeOffset: Length;
      strokeDash: string;
      strokeMarkAlign: boolean;

      isStrokeColor: boolean;
      isStrokeWidth: boolean;
      isFillColor: boolean;
      isStrokeJoin: boolean;
      isStrokeCap: boolean;
      isStrokeDash: boolean;
      isStrokeOffset: boolean;
      isStrokeMarkAlign: boolean;

      isStrokeMarkStart: boolean;
      isStrokeMarkMid: boolean;
      isStrokeMarkEnd: boolean;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IOverrideStylesNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
   const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
   const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
   const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
   const [strokeJoin, setStrokeJoin] = nodeHooks.useValueState(nodeId, "strokeJoin");
   const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");
   const [strokeMarkAlign, setStrokeMarkAlign] = nodeHooks.useValueState(nodeId, "strokeMarkAlign");

   const [isStrokeWidth, setIsStrokeWidth] = nodeHooks.useValueState(nodeId, "isStrokeWidth");
   const [isStrokeColor, setIsStrokeColor] = nodeHooks.useValueState(nodeId, "isStrokeColor");
   const [isStrokeCap, setIsStrokeCap] = nodeHooks.useValueState(nodeId, "isStrokeCap");
   const [isStrokeJoin, setIsStrokeJoin] = nodeHooks.useValueState(nodeId, "isStrokeJoin");
   const [isStrokeDash, setIsStrokeDash] = nodeHooks.useValueState(nodeId, "isStrokeDash");
   const [isStrokeOffset, setIsStrokeOffset] = nodeHooks.useValueState(nodeId, "isStrokeOffset");
   const [isFillColor, setIsFillColor] = nodeHooks.useValueState(nodeId, "isFillColor");
   const [isStrokeMarkAlign, setIsStrokeMarkAlign] = nodeHooks.useValueState(nodeId, "isStrokeMarkAlign");
   const [isStrokeMarkStart, setIsStrokeMarkStart] = nodeHooks.useValueState(nodeId, "isStrokeMarkStart");
   const [isStrokeMarkMid, setIsStrokeMarkMid] = nodeHooks.useValueState(nodeId, "isStrokeMarkMid");
   const [isStrokeMarkEnd, setIsStrokeMarkEnd] = nodeHooks.useValueState(nodeId, "isStrokeMarkEnd");

   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
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
         <SocketIn<IOverrideStylesNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
            <BaseNode.Input label={"Stroke Color"}>
               <ToggleDiv>
                  <Checkbox checked={isStrokeColor} onToggle={setIsStrokeColor} title={"Enabled?"} />
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </ToggleDiv>
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Stroke Cap"}>
            <ToggleDiv>
               <Checkbox checked={isStrokeCap} onToggle={setIsStrokeCap} title={"Enabled?"} />
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODE_OPTIONS} />
            </ToggleDiv>
         </BaseNode.Input>
         <BaseNode.Input label={"Stroke Join"}>
            <ToggleDiv>
               <Checkbox checked={isStrokeJoin} onToggle={setIsStrokeJoin} title={"Enabled?"} />
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODE_OPTIONS} />
            </ToggleDiv>
         </BaseNode.Input>
         <BaseNode.Input label={"Stroke Dash"}>
            <ToggleDiv>
               <Checkbox checked={isStrokeDash} onToggle={setIsStrokeDash} title={"Enabled?"} />
               <TextInput value={strokeDash} onValidValue={setStrokeDash} pattern={MathHelper.LENGTH_LIST_REGEX} />
            </ToggleDiv>
         </BaseNode.Input>
         <SocketIn<IOverrideStylesNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Stroke Dash Offset"}>
               <ToggleDiv>
                  <Checkbox checked={isStrokeOffset} onToggle={setIsStrokeOffset} title={"Enabled?"} />
                  <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
               </ToggleDiv>
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IOverrideStylesNode> nodeId={nodeId} socketId={"strokeMarkStart"} type={SocketTypes.SHAPE}>
            <ToggleDiv>
               <Checkbox checked={isStrokeMarkStart} onToggle={setIsStrokeMarkStart} title={"enabled"} />
               <span>Marker Start</span>
            </ToggleDiv>
         </SocketIn>
         <SocketIn<IOverrideStylesNode> nodeId={nodeId} socketId={"strokeMarkMid"} type={SocketTypes.SHAPE}>
            <ToggleDiv>
               <Checkbox checked={isStrokeMarkMid} onToggle={setIsStrokeMarkMid} title={"enabled"} />
               <span>Marker Mid</span>
            </ToggleDiv>
         </SocketIn>
         <SocketIn<IOverrideStylesNode> nodeId={nodeId} socketId={"strokeMarkEnd"} type={SocketTypes.SHAPE}>
            <ToggleDiv>
               <Checkbox checked={isStrokeMarkEnd} onToggle={setIsStrokeMarkEnd} title={"enabled"} />
               <span>Marker End</span>
            </ToggleDiv>
         </SocketIn>
         <ToggleDiv>
            <Checkbox checked={isStrokeMarkAlign} onToggle={setIsStrokeMarkAlign} title={"enabled"} />
            <Checkbox checked={strokeMarkAlign} onToggle={setStrokeMarkAlign}>
               Align Markers
            </Checkbox>
         </ToggleDiv>
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
   const strokeDash = nodeHooks.useValue(nodeId, "strokeDash");
   const strokeOffset = nodeHooks.useValue(nodeId, "strokeOffset");
   const strokeJoin = nodeHooks.useValue(nodeId, "strokeJoin");
   const strokeMarkAlign = nodeHooks.useValue(nodeId, "strokeMarkAlign");

   const isStrokeWidth = nodeHooks.useValue(nodeId, "isStrokeWidth");
   const isStrokeColor = nodeHooks.useValue(nodeId, "isStrokeColor");
   const isFillColor = nodeHooks.useValue(nodeId, "isFillColor");
   const isStrokeCap = nodeHooks.useValue(nodeId, "isStrokeCap");
   const isStrokeJoin = nodeHooks.useValue(nodeId, "isStrokeJoin");
   const isStrokeOffset = nodeHooks.useValue(nodeId, "isStrokeOffset");
   const isStrokeDash = nodeHooks.useValue(nodeId, "isStrokeDash");
   const isStrokeMarkAlign = nodeHooks.useValue(nodeId, "isStrokeMarkAlign");

   const [Content, cId] = nodeHooks.useInputNode(nodeId, "input", globals);
   const [MarkerStart, msId] = nodeHooks.useInputNode(nodeId, "strokeMarkStart", globals);
   const [MarkerMid, mmId] = nodeHooks.useInputNode(nodeId, "strokeMarkMid", globals);
   const [MarkerEnd, meId] = nodeHooks.useInputNode(nodeId, "strokeMarkEnd", globals);

   const isStrokeMarkStart = nodeHooks.useValue(nodeId, "isStrokeMarkStart");
   const isStrokeMarkMid = nodeHooks.useValue(nodeId, "isStrokeMarkMid");
   const isStrokeMarkEnd = nodeHooks.useValue(nodeId, "isStrokeMarkEnd");

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
      if (isStrokeOffset) {
         r.strokeOffset = strokeOffset;
      }
      if (isStrokeDash) {
         r.strokeDash = strokeDash;
      }
      if (isStrokeMarkAlign) {
         r.strokeMarkAlign = strokeMarkAlign;
      }
      if (isStrokeMarkStart) {
         r.strokeMarkStart = { Renderer: MarkerStart, id: msId };
      }
      if (isStrokeMarkEnd) {
         r.strokeMarkEnd = { Renderer: MarkerEnd, id: meId };
      }
      if (isStrokeMarkMid) {
         r.strokeMarkMid = { Renderer: MarkerMid, id: mmId };
      }
      return r;
   }, [
      overrides,
      isStrokeWidth,
      isStrokeColor,
      isFillColor,
      isStrokeCap,
      isStrokeJoin,
      isStrokeOffset,
      isStrokeDash,
      isStrokeMarkAlign,
      isStrokeMarkStart,
      isStrokeMarkEnd,
      isStrokeMarkMid,
      strokeWidth,
      strokeColor,
      fillColor,
      strokeCap,
      strokeJoin,
      strokeOffset,
      strokeDash,
      strokeMarkAlign,
      MarkerStart,
      msId,
      MarkerEnd,
      meId,
      MarkerMid,
      mmId,
   ]);

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
      strokeCap: StrokeCapModes.BUTT,
      strokeJoin: StrokeJoinModes.MITER,
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      strokeDash: "",
      strokeOffset: { value: 0, unit: "px" },
      fillColor: null as Color,
      strokeMarkAlign: true,
      isStrokeCap: false,
      isFillColor: false,
      isStrokeColor: false,
      isStrokeJoin: false,
      isStrokeWidth: false,
      isStrokeDash: false,
      isStrokeOffset: false,
      isStrokeMarkAlign: false,
      isStrokeMarkStart: false,
      isStrokeMarkMid: false,
      isStrokeMarkEnd: false,
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
