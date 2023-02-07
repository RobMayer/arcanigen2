import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
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
import { TransformPrefabs } from "../../nodeView/prefabs";
import AngleInput from "!/components/inputs/AngleInput";

interface IArcNode extends INodeDefinition {
   inputs: {
      radius: Length;
      strokeWidth: Length;
      strokeColor: Color;
      fillColor: Color;
      thetaStart: number;
      thetaEnd: number;

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
      strokeCap: StrokeCapMode;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IArcNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [thetaStart, setThetaStart] = nodeHelper.useValueState(nodeId, "thetaStart");
   const [thetaEnd, setThetaEnd] = nodeHelper.useValueState(nodeId, "thetaEnd");
   const [pieSlice, setPieSlice] = nodeHelper.useValueState(nodeId, "pieSlice");

   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [strokeCap, setStrokeCap] = nodeHelper.useValueState(nodeId, "strokeCap");
   const [strokeJoin, setStrokeJoin] = nodeHelper.useValueState(nodeId, "strokeJoin");

   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");

   const hasThetaStart = nodeHelper.useHasLink(nodeId, "thetaStart");
   const hasThetaEnd = nodeHelper.useHasLink(nodeId, "thetaEnd");
   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");

   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");

   return (
      <BaseNode<IArcNode> nodeId={nodeId} helper={ArcNodeHelper}>
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
         <BaseNode.Foldout label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
            <SocketIn<IArcNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Join"}>
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODES} />
            </BaseNode.Input>
            <SocketIn<IArcNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IArcNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IArcNode> nodeId={nodeId} nodeHelper={nodeHelper} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId }: NodeRendererProps) => {
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius");
   const thetaStart = nodeHelper.useCoalesce(nodeId, "thetaStart", "thetaStart");
   const thetaEnd = nodeHelper.useCoalesce(nodeId, "thetaEnd", "thetaEnd");
   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth");
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor");
   const fillColor = nodeHelper.useCoalesce(nodeId, "fillColor", "fillColor");
   const strokeCap = nodeHelper.useValue(nodeId, "strokeCap");
   const strokeJoin = nodeHelper.useValue(nodeId, "strokeJoin");

   const pieSlice = nodeHelper.useValue(nodeId, "pieSlice");

   const positionMode = nodeHelper.useValue(nodeId, "positionMode");
   const positionX = nodeHelper.useCoalesce(nodeId, "positionX", "positionX");
   const positionY = nodeHelper.useCoalesce(nodeId, "positionY", "positionY");
   const positionTheta = nodeHelper.useCoalesce(nodeId, "positionTheta", "positionTheta");
   const positionRadius = nodeHelper.useCoalesce(nodeId, "positionRadius", "positionRadius");
   const rotation = nodeHelper.useCoalesce(nodeId, "rotation", "rotation");

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
      <g style={{ transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation}deg)` }}>
         <g
            stroke={MathHelper.colorToHex(strokeColor)}
            fill={MathHelper.colorToHex(fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx(strokeWidth))}
            strokeLinecap={strokeCap}
            strokeLinejoin={strokeJoin}
         >
            <path d={pathD} />
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
      strokeCap: "butt",
      strokeJoin: "miter",
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      fillColor: null as Color,
      thetaStart: 0,
      thetaEnd: 90,
      pieSlice: false,

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
