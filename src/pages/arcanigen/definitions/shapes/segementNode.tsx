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
import { TransformPrefabs } from "../../nodeView/prefabs";
import AngleInput from "!/components/inputs/AngleInput";

import { faSlash as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faSlash as buttonIcon } from "@fortawesome/pro-light-svg-icons";

import Checkbox from "!/components/buttons/Checkbox";

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
      strokeCap: StrokeCapMode;
      strokeMarkAlign: boolean;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<ISegmentNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [startX, setStartX] = nodeHelper.useValueState(nodeId, "startX");
   const [startY, setStartY] = nodeHelper.useValueState(nodeId, "startY");
   const [startRadius, setStartRadius] = nodeHelper.useValueState(nodeId, "startRadius");
   const [startTheta, setStartTheta] = nodeHelper.useValueState(nodeId, "startTheta");

   const [endX, setEndX] = nodeHelper.useValueState(nodeId, "endX");
   const [endY, setEndY] = nodeHelper.useValueState(nodeId, "endY");
   const [endRadius, setEndRadius] = nodeHelper.useValueState(nodeId, "endRadius");
   const [endTheta, setEndTheta] = nodeHelper.useValueState(nodeId, "endTheta");

   const [startMode, setStartMode] = nodeHelper.useValueState(nodeId, "startMode");
   const [endMode, setEndMode] = nodeHelper.useValueState(nodeId, "endMode");

   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [strokeCap, setStrokeCap] = nodeHelper.useValueState(nodeId, "strokeCap");

   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");
   const [strokeMarkAlign, setStrokeMarkAlign] = nodeHelper.useValueState(nodeId, "strokeMarkAlign");

   const hasStartX = nodeHelper.useHasLink(nodeId, "startX");
   const hasStartY = nodeHelper.useHasLink(nodeId, "startY");
   const hasStartRadius = nodeHelper.useHasLink(nodeId, "startRadius");
   const hasStartTheta = nodeHelper.useHasLink(nodeId, "startTheta");
   const hasEndX = nodeHelper.useHasLink(nodeId, "endX");
   const hasEndY = nodeHelper.useHasLink(nodeId, "endY");
   const hasEndRadius = nodeHelper.useHasLink(nodeId, "endRadius");
   const hasEndTheta = nodeHelper.useHasLink(nodeId, "endTheta");

   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");

   return (
      <BaseNode<ISegmentNode> nodeId={nodeId} helper={SegmentNodeHelper}>
         <SocketOut<ISegmentNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />

         <BaseNode.Foldout label={"Start Point"} nodeId={nodeId} inputs={"startX startY startTheta startRadius"} outputs={""}>
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

         <BaseNode.Foldout label={"End Point"} nodeId={nodeId} inputs={"endX endY endTheta endRadius"} outputs={""}>
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

         <BaseNode.Foldout label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES} />
            </BaseNode.Input>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeMarkStart"} type={SocketTypes.SHAPE}>
               Marker Start
            </SocketIn>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeMarkEnd"} type={SocketTypes.SHAPE}>
               Marker End
            </SocketIn>
            <Checkbox checked={strokeMarkAlign} onToggle={setStrokeMarkAlign}>
               Align Markers
            </Checkbox>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<ISegmentNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<ISegmentNode> nodeId={nodeId} nodeHelper={nodeHelper} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides = {} }: NodeRendererProps) => {
   const startMode = nodeHelper.useValue(nodeId, "startMode");

   const startX = nodeHelper.useCoalesce(nodeId, "startX", "startX", globals);
   const startY = nodeHelper.useCoalesce(nodeId, "startY", "startY", globals);
   const startRadius = nodeHelper.useCoalesce(nodeId, "startRadius", "startRadius", globals);
   const startTheta = nodeHelper.useCoalesce(nodeId, "startTheta", "startTheta", globals);

   const endMode = nodeHelper.useValue(nodeId, "endMode");
   const endX = nodeHelper.useCoalesce(nodeId, "endX", "endX", globals);
   const endY = nodeHelper.useCoalesce(nodeId, "endY", "endY", globals);
   const endRadius = nodeHelper.useCoalesce(nodeId, "endRadius", "endRadius", globals);
   const endTheta = nodeHelper.useCoalesce(nodeId, "endTheta", "endTheta", globals);

   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const fillColor = nodeHelper.useCoalesce(nodeId, "fillColor", "fillColor", globals);
   const strokeCap = nodeHelper.useValue(nodeId, "strokeCap");

   const [MarkStart, msId] = nodeHelper.useInputNode(nodeId, "strokeMarkStart", globals);
   const [MarkEnd, meId] = nodeHelper.useInputNode(nodeId, "strokeMarkEnd", globals);
   const strokeMarkAlign = nodeHelper.useValue(nodeId, "strokeMarkAlign");

   const positionMode = nodeHelper.useValue(nodeId, "positionMode");
   const positionX = nodeHelper.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHelper.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHelper.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHelper.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHelper.useCoalesce(nodeId, "rotation", "rotation", globals);

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
