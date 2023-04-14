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
   StrokeJoinMode,
   STROKEJOIN_MODES,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { faCircleThreeQuarters as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faCircleThreeQuarters as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { Length, Color } from "!/utility/types/units";
import Checkbox from "!/components/buttons/Checkbox";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import ToggleList from "!/components/selectors/ToggleList";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import AngleInput from "!/components/inputs/AngleInput";
import TextInput from "!/components/inputs/TextInput";

interface IArcNode extends INodeDefinition {
   inputs: {
      radius: Length;
      thetaStart: number;
      thetaEnd: number;

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
      radius: Length;
      thetaStart: number;
      thetaEnd: number;
      pieSlice: boolean;

      strokeColor: Color;
      strokeWidth: Length;
      fillColor: Color;
      strokeJoin: StrokeJoinMode;
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

const nodeHooks = ArcaneGraph.nodeHooks<IArcNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
   const [thetaStart, setThetaStart] = nodeHooks.useValueState(nodeId, "thetaStart");
   const [thetaEnd, setThetaEnd] = nodeHooks.useValueState(nodeId, "thetaEnd");
   const [pieSlice, setPieSlice] = nodeHooks.useValueState(nodeId, "pieSlice");

   const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
   const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
   const [strokeJoin, setStrokeJoin] = nodeHooks.useValueState(nodeId, "strokeJoin");
   const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
   const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");

   const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");
   const [strokeMarkAlign, setStrokeMarkAlign] = nodeHooks.useValueState(nodeId, "strokeMarkAlign");

   const hasThetaStart = nodeHooks.useHasLink(nodeId, "thetaStart");
   const hasThetaEnd = nodeHooks.useHasLink(nodeId, "thetaEnd");
   const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
   const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");

   const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");

   return (
      <BaseNode<IArcNode> nodeId={nodeId} helper={ArcNodeHelper} hooks={nodeHooks}>
         <SocketOut<IArcNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IArcNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IArcNode> nodeId={nodeId} socketId={"thetaStart"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Start θ"}>
               <AngleInput value={thetaStart} onValidValue={setThetaStart} disabled={hasThetaStart} wrap />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IArcNode> nodeId={nodeId} socketId={"thetaEnd"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"End θ"}>
               <AngleInput value={thetaEnd} onValidValue={setThetaEnd} disabled={hasThetaEnd} wrap />
            </BaseNode.Input>
         </SocketIn>
         <Checkbox checked={pieSlice} onToggle={setPieSlice}>
            Pie Slice
         </Checkbox>
         <hr />
         <BaseNode.Foldout
            panelId={"appearance"}
            label={"Appearance"}
            nodeId={nodeId}
            inputs={"strokeWidth strokeColor fillColor strokeMarkStart strokeMarkEnd"}
            outputs={""}
         >
            <SocketIn<IArcNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IArcNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Join"}>
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODES} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Dash"}>
               <TextInput value={strokeDash} onValidValue={setStrokeDash} pattern={MathHelper.LENGTH_LIST_REGEX} />
            </BaseNode.Input>
            <SocketIn<IArcNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Dash Offset"}>
                  <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IArcNode> nodeId={nodeId} socketId={"strokeMarkStart"} type={SocketTypes.SHAPE}>
               Marker Start
            </SocketIn>
            <SocketIn<IArcNode> nodeId={nodeId} socketId={"strokeMarkEnd"} type={SocketTypes.SHAPE}>
               Marker End
            </SocketIn>
            <Checkbox checked={strokeMarkAlign} onToggle={setStrokeMarkAlign}>
               Align Markers
            </Checkbox>
            <SocketIn<IArcNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IArcNode> nodeId={nodeId} hooks={nodeHooks} />
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, globals, depth, overrides = {} }: NodeRendererProps) => {
   const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
   const thetaStart = nodeHooks.useCoalesce(nodeId, "thetaStart", "thetaStart", globals);
   const thetaEnd = nodeHooks.useCoalesce(nodeId, "thetaEnd", "thetaEnd", globals);
   const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const fillColor = nodeHooks.useCoalesce(nodeId, "fillColor", "fillColor", globals);
   const strokeDash = nodeHooks.useValue(nodeId, "strokeDash");
   const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");
   const strokeOffset = nodeHooks.useCoalesce(nodeId, "strokeOffset", "strokeOffset", globals);
   const strokeJoin = nodeHooks.useValue(nodeId, "strokeJoin");

   const pieSlice = nodeHooks.useValue(nodeId, "pieSlice");

   const [MarkStart, msId] = nodeHooks.useInputNode(nodeId, "strokeMarkStart", globals);
   const [MarkEnd, meId] = nodeHooks.useInputNode(nodeId, "strokeMarkEnd", globals);

   const positionMode = nodeHooks.useValue(nodeId, "positionMode");
   const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);

   const strokeMarkAlign = nodeHooks.useValue(nodeId, "strokeMarkAlign");

   const pathD = useMemo(() => {
      const rad = MathHelper.lengthToPx(radius);

      const s = Math.min(thetaStart, thetaEnd);
      const e = Math.max(thetaStart, thetaEnd);

      const startX = rad * Math.cos(((s - 90) * Math.PI) / 180);
      const startY = rad * Math.sin(((s - 90) * Math.PI) / 180);
      const midX = rad * Math.cos((((s - 90 + (e - 90)) / 2) * Math.PI) / 180);
      const midY = rad * Math.sin((((s - 90 + (e - 90)) / 2) * Math.PI) / 180);
      const endX = rad * Math.cos(((e - 90) * Math.PI) / 180);
      const endY = rad * Math.sin(((e - 90) * Math.PI) / 180);
      return `${
         pieSlice ? `M 0,0 L ${startX},${startY}` : ` M ${startX},${startY}`
      } A ${rad},${rad} 0 0 1 ${midX},${midY} A ${rad},${rad} 0 0 1 ${endX},${endY} ${pieSlice ? `Z` : ""}`;
   }, [pieSlice, radius, thetaEnd, thetaStart]);

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
            strokeLinejoin={"strokeJoin" in overrides ? overrides.strokeJoin : strokeJoin}
            markerStart={MarkStart && msId ? `url('#markstart_${nodeId}_lyr-${depth ?? ""}')` : undefined}
            markerEnd={MarkEnd && meId ? `url('#markend_${nodeId}_lyr-${depth ?? ""}')` : undefined}
         >
            <path d={pathD} vectorEffect={"non-scaling-stroke"} />
         </g>
      </g>
   );
});

const ArcNodeHelper: INodeHelper<IArcNode> = {
   name: "Arc",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_ARC,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IArcNode["outputs"]) => Renderer,
   initialize: () => ({
      radius: { value: 150, unit: "px" },
      strokeWidth: { value: 1, unit: "px" },
      strokeDash: "",
      strokeOffset: { value: 0, unit: "px" },
      strokeCap: "butt",
      strokeJoin: "miter",
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      fillColor: null as Color,
      thetaStart: 0,
      thetaEnd: 90,
      pieSlice: false,
      strokeMarkAlign: true,
      positionX: { value: 0, unit: "px" },
      positionY: { value: 0, unit: "px" },
      positionRadius: { value: 0, unit: "px" },
      positionTheta: 0,
      positionMode: "cartesian",
      rotation: 0,
   }),
   controls: Controls,
};

export default ArcNodeHelper;
