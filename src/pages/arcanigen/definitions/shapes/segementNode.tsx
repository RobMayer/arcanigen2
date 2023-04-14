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
   PositionMode,
   SocketTypes,
   StrokeCapMode,
   STROKECAP_MODES,
   POSITION_MODES,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { Length, Color } from "!/utility/types/units";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import ToggleList from "!/components/selectors/ToggleList";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import AngleInput from "!/components/inputs/AngleInput";

import { faSlash as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faSlash as buttonIcon } from "@fortawesome/pro-light-svg-icons";

import Checkbox from "!/components/buttons/Checkbox";
import TextInput from "!/components/inputs/TextInput";

interface ISegmentNode extends INodeDefinition {
   inputs: {
      startX: Length;
      startY: Length;
      startRadius: Length;
      startTheta: number;

      endX: Length;
      endY: Length;
      endRadius: Length;
      endTheta: number;

      strokeWidth: Length;
      strokeColor: Color;
      strokeOffset: Length;
      fillColor: Color;
      strokeMarkStart: NodeRenderer;
      strokeMarkEnd: NodeRenderer;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      rotation: number;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      startMode: PositionMode;
      endMode: PositionMode;

      startX: Length;
      startY: Length;
      startRadius: Length;
      startTheta: number;

      endX: Length;
      endY: Length;
      endRadius: Length;
      endTheta: number;

      strokeColor: Color;
      strokeWidth: Length;
      fillColor: Color;
      strokeDash: string;
      strokeCap: StrokeCapMode;
      strokeOffset: Length;
      strokeMarkAlign: boolean;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<ISegmentNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [startX, setStartX] = nodeHooks.useValueState(nodeId, "startX");
   const [startY, setStartY] = nodeHooks.useValueState(nodeId, "startY");
   const [startRadius, setStartRadius] = nodeHooks.useValueState(nodeId, "startRadius");
   const [startTheta, setStartTheta] = nodeHooks.useValueState(nodeId, "startTheta");

   const [endX, setEndX] = nodeHooks.useValueState(nodeId, "endX");
   const [endY, setEndY] = nodeHooks.useValueState(nodeId, "endY");
   const [endRadius, setEndRadius] = nodeHooks.useValueState(nodeId, "endRadius");
   const [endTheta, setEndTheta] = nodeHooks.useValueState(nodeId, "endTheta");

   const [startMode, setStartMode] = nodeHooks.useValueState(nodeId, "startMode");
   const [endMode, setEndMode] = nodeHooks.useValueState(nodeId, "endMode");

   const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
   const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
   const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
   const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");

   const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");
   const [strokeMarkAlign, setStrokeMarkAlign] = nodeHooks.useValueState(nodeId, "strokeMarkAlign");

   const hasStartX = nodeHooks.useHasLink(nodeId, "startX");
   const hasStartY = nodeHooks.useHasLink(nodeId, "startY");
   const hasStartRadius = nodeHooks.useHasLink(nodeId, "startRadius");
   const hasStartTheta = nodeHooks.useHasLink(nodeId, "startTheta");
   const hasEndX = nodeHooks.useHasLink(nodeId, "endX");
   const hasEndY = nodeHooks.useHasLink(nodeId, "endY");
   const hasEndRadius = nodeHooks.useHasLink(nodeId, "endRadius");
   const hasEndTheta = nodeHooks.useHasLink(nodeId, "endTheta");

   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
   const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");

   return (
      <BaseNode<ISegmentNode> nodeId={nodeId} helper={SegmentNodeHelper} hooks={nodeHooks}>
         <SocketOut<ISegmentNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />

         <BaseNode.Foldout panelId={"startPoint"} label={"Start Point"} nodeId={nodeId} inputs={"startX startY startTheta startRadius"} outputs={""} startOpen>
            <BaseNode.Input label={"Position Mode"}>
               <ToggleList value={startMode} onValue={setStartMode} options={POSITION_MODES} />
            </BaseNode.Input>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"startX"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"X Coordinate"}>
                  <LengthInput value={startX} onCommit={setStartX} disabled={hasStartX || startMode === "polar"} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"startY"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Y Coordinate"}>
                  <LengthInput value={startY} onCommit={setStartY} disabled={hasStartY || startMode === "polar"} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"startRadius"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Radius"}>
                  <LengthInput value={startRadius} onCommit={setStartRadius} disabled={hasStartRadius || startMode === "cartesian"} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"startTheta"} type={SocketTypes.ANGLE}>
               <BaseNode.Input label={"θ Angle"}>
                  <AngleInput value={startTheta} onValidValue={setStartTheta} disabled={hasStartTheta || startMode === "cartesian"} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>

         <BaseNode.Foldout panelId={"endPoint"} label={"End Point"} nodeId={nodeId} inputs={"endX endY endTheta endRadius"} outputs={""} startOpen>
            <BaseNode.Input label={"Position Mode"}>
               <ToggleList value={endMode} onValue={setEndMode} options={POSITION_MODES} />
            </BaseNode.Input>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"endX"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"X Coordinate"}>
                  <LengthInput value={endX} onCommit={setEndX} disabled={hasEndX || endMode === "polar"} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"endY"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Y Coordinate"}>
                  <LengthInput value={endY} onCommit={setEndY} disabled={hasEndY || endMode === "polar"} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"endRadius"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Radius"}>
                  <LengthInput value={endRadius} onCommit={setEndRadius} disabled={hasEndRadius || endMode === "cartesian"} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"endTheta"} type={SocketTypes.ANGLE}>
               <BaseNode.Input label={"θ Angle"}>
                  <AngleInput value={endTheta} onValidValue={setEndTheta} disabled={hasEndTheta || endMode === "cartesian"} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>

         <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Dash"}>
               <TextInput value={strokeDash} onValidValue={setStrokeDash} pattern={MathHelper.LENGTH_LIST_REGEX} />
            </BaseNode.Input>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Dash Offset"}>
                  <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeMarkStart"} type={SocketTypes.SHAPE}>
               Marker Start
            </SocketIn>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeMarkEnd"} type={SocketTypes.SHAPE}>
               Marker End
            </SocketIn>
            <Checkbox checked={strokeMarkAlign} onToggle={setStrokeMarkAlign}>
               Align Markers
            </Checkbox>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<ISegmentNode> nodeId={nodeId} hooks={nodeHooks} />
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides = {} }: NodeRendererProps) => {
   const startMode = nodeHooks.useValue(nodeId, "startMode");

   const startX = nodeHooks.useCoalesce(nodeId, "startX", "startX", globals);
   const startY = nodeHooks.useCoalesce(nodeId, "startY", "startY", globals);
   const startRadius = nodeHooks.useCoalesce(nodeId, "startRadius", "startRadius", globals);
   const startTheta = nodeHooks.useCoalesce(nodeId, "startTheta", "startTheta", globals);

   const endMode = nodeHooks.useValue(nodeId, "endMode");
   const endX = nodeHooks.useCoalesce(nodeId, "endX", "endX", globals);
   const endY = nodeHooks.useCoalesce(nodeId, "endY", "endY", globals);
   const endRadius = nodeHooks.useCoalesce(nodeId, "endRadius", "endRadius", globals);
   const endTheta = nodeHooks.useCoalesce(nodeId, "endTheta", "endTheta", globals);

   const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const fillColor = nodeHooks.useCoalesce(nodeId, "fillColor", "fillColor", globals);
   const strokeDash = nodeHooks.useValue(nodeId, "strokeDash");
   const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");
   const strokeOffset = nodeHooks.useCoalesce(nodeId, "strokeOffset", "strokeOffset", globals);

   const [MarkStart, msId] = nodeHooks.useInputNode(nodeId, "strokeMarkStart", globals);
   const [MarkEnd, meId] = nodeHooks.useInputNode(nodeId, "strokeMarkEnd", globals);
   const strokeMarkAlign = nodeHooks.useValue(nodeId, "strokeMarkAlign");

   const positionMode = nodeHooks.useValue(nodeId, "positionMode");
   const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);

   const x1 = useMemo(
      () => (startMode === "cartesian" ? MathHelper.lengthToPx(startX) : MathHelper.lengthToPx(startRadius) * Math.cos(((startTheta - 90) * Math.PI) / 180)),
      [startMode, startRadius, startTheta, startX]
   );
   const y1 = useMemo(
      () => (startMode === "cartesian" ? MathHelper.lengthToPx(startY) : MathHelper.lengthToPx(startRadius) * Math.sin(((startTheta - 90) * Math.PI) / 180)),
      [startMode, startRadius, startTheta, startY]
   );

   const x2 = useMemo(
      () => (endMode === "cartesian" ? MathHelper.lengthToPx(endX) : MathHelper.lengthToPx(endRadius) * Math.cos(((endTheta - 90) * Math.PI) / 180)),
      [endMode, endRadius, endTheta, endX]
   );
   const y2 = useMemo(
      () => (endMode === "cartesian" ? MathHelper.lengthToPx(endY) : MathHelper.lengthToPx(endRadius) * Math.sin(((endTheta - 90) * Math.PI) / 180)),
      [endMode, endRadius, endTheta, endY]
   );

   return (
      <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}>
         {MarkStart && msId && (
            <marker
               id={`markstart_${nodeId}_lyr-${depth ?? ""}`}
               markerUnits="userSpaceOnUse"
               markerWidth={"100%"}
               markerHeight={"100%"}
               refX={"center"}
               refY={"center"}
               overflow={"visible"}
               orient={strokeMarkAlign ? "auto-start-reverse" : undefined}
            >
               <g transform={strokeMarkAlign ? `rotate(-90)` : ""}>
                  <MarkStart nodeId={msId} depth={(depth ?? "") + `_${nodeId}.markStart`} globals={globals} />
               </g>
            </marker>
         )}
         {MarkEnd && meId && (
            <marker
               id={`markend_${nodeId}_lyr-${depth ?? ""}`}
               markerUnits="userSpaceOnUse"
               markerWidth={"100%"}
               markerHeight={"100%"}
               refX={"center"}
               refY={"center"}
               overflow={"visible"}
               orient={strokeMarkAlign ? "auto-start-reverse" : undefined}
            >
               <g transform={strokeMarkAlign ? `rotate(-90)` : ""}>
                  <MarkEnd nodeId={meId} depth={(depth ?? "") + `_${nodeId}.markEnd`} globals={globals} />
               </g>
            </marker>
         )}
         <g
            stroke={MathHelper.colorToSVG("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fill={MathHelper.colorToSVG("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fillOpacity={MathHelper.colorToOpacity("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
            strokeLinecap={"strokeCap" in overrides ? overrides.strokeCap : strokeCap}
            strokeDashoffset={MathHelper.lengthToPx("strokeOffset" in overrides ? overrides.strokeOffset : strokeOffset)}
            strokeDasharray={MathHelper.listToLengths("strokeDash" in overrides ? overrides.strokeDash : strokeDash)
               .map(MathHelper.lengthToPx)
               .join(" ")}
            markerStart={MarkStart && msId ? `url('#markstart_${nodeId}_lyr-${depth ?? ""}')` : undefined}
            markerEnd={MarkEnd && meId ? `url('#markend_${nodeId}_lyr-${depth ?? ""}')` : undefined}
         >
            <line x1={x1} x2={x2} y1={y1} y2={y2} vectorEffect={"non-scaling-stroke"} />
         </g>
      </g>
   );
});

const SegmentNodeHelper: INodeHelper<ISegmentNode> = {
   name: "Segment",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_SEGMENT,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof ISegmentNode["outputs"]) => Renderer,
   initialize: () => ({
      startX: { value: 0, unit: "px" },
      startY: { value: 0, unit: "px" },
      endX: { value: 100, unit: "px" },
      endY: { value: 100, unit: "px" },

      startRadius: { value: 0, unit: "px" },
      startTheta: 0,
      endRadius: { value: 100, unit: "px" },
      endTheta: 180,

      startMode: "cartesian",
      endMode: "cartesian",

      strokeWidth: { value: 1, unit: "px" },
      strokeDash: "",
      strokeOffset: { value: 0, unit: "px" },
      strokeCap: "butt",
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      fillColor: null as Color,
      strokeMarkAlign: true,
      thetaStart: 0,
      thetaEnd: 90,

      positionX: { value: 0, unit: "px" },
      positionY: { value: 0, unit: "px" },
      positionRadius: { value: 0, unit: "px" },
      positionTheta: 0,
      positionMode: "cartesian",
      rotation: 0,
   }),
   controls: Controls,
};

export default SegmentNodeHelper;
