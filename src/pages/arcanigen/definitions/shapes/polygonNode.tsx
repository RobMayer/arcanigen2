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
   ScribeMode,
   SCRIBE_MODES,
   SocketTypes,
   StrokeJoinMode,
   STROKEJOIN_MODES,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { faTriangle as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faTriangle as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import SliderInput from "!/components/inputs/SliderInput";
import Dropdown from "!/components/selectors/Dropdown";
import ToggleList from "!/components/selectors/ToggleList";
import { Length, Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import lodash from "lodash";
import { TransformPrefabs } from "../../nodeView/prefabs";

interface IPolygonNode extends INodeDefinition {
   inputs: {
      pointCount: number;
      radius: Length;
      strokeWidth: Length;
      strokeColor: Color;
      fillColor: Color;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      rotation: number;
   };
   outputs: {
      output: NodeRenderer;
      rInscribe: Length;
      rCircumscribe: Length;
      rMiddle: Length;
   };
   values: {
      radius: Length;
      strokeWidth: Length;
      pointCount: number;
      scribeMode: ScribeMode;
      strokeJoin: StrokeJoinMode;
      strokeColor: Color;
      fillColor: Color;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IPolygonNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [strokeJoin, setStrokeJoin] = nodeHelper.useValueState(nodeId, "strokeJoin");
   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");
   const [pointCount, setPointCount] = nodeHelper.useValueState(nodeId, "pointCount");
   const [scribeMode, setScribeMode] = nodeHelper.useValueState(nodeId, "scribeMode");
   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasPointCount = nodeHelper.useHasLink(nodeId, "pointCount");
   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");

   return (
      <BaseNode<IPolygonNode> nodeId={nodeId} helper={PolygonNodeHelper}>
         <SocketOut<IPolygonNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IPolygonNode> nodeId={nodeId} socketId={"pointCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Points"}>
               <SliderInput revertInvalid value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} disabled={hasPointCount} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPolygonNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Scribe Mode"}>
            <Dropdown value={scribeMode} onValue={setScribeMode} options={SCRIBE_MODES} />
         </BaseNode.Input>
         <hr />
         <BaseNode.Foldout label={"Appearance"} inputs={"strokeWidth strokeColor fillColor"} nodeId={nodeId} outputs={""}>
            <SocketIn<IPolygonNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Join"}>
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODES} />
            </BaseNode.Input>
            <SocketIn<IPolygonNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IPolygonNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IPolygonNode> nodeId={nodeId} nodeHelper={nodeHelper} />
         <BaseNode.Foldout label={"Additional Outputs"} inputs={""} outputs={"rInscribe rCircumscribe rMiddle"} nodeId={nodeId}>
            <SocketOut<IPolygonNode> nodeId={nodeId} socketId={"rInscribe"} type={SocketTypes.LENGTH}>
               Inscribe Radius
            </SocketOut>
            <SocketOut<IPolygonNode> nodeId={nodeId} socketId={"rCircumscribe"} type={SocketTypes.LENGTH}>
               Circumscribe Radius
            </SocketOut>
            <SocketOut<IPolygonNode> nodeId={nodeId} socketId={"rMiddle"} type={SocketTypes.LENGTH}>
               Middle Radius
            </SocketOut>
         </BaseNode.Foldout>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId }: NodeRendererProps) => {
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius");
   const pointCount = Math.min(24, Math.max(3, nodeHelper.useCoalesce(nodeId, "pointCount", "pointCount")));
   const scribeMode = nodeHelper.useValue(nodeId, "scribeMode");

   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth");
   const strokeJoin = nodeHelper.useValue(nodeId, "strokeJoin");
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor");
   const fillColor = nodeHelper.useCoalesce(nodeId, "fillColor", "fillColor");

   const positionMode = nodeHelper.useValue(nodeId, "positionMode");
   const positionX = nodeHelper.useCoalesce(nodeId, "positionX", "positionX");
   const positionY = nodeHelper.useCoalesce(nodeId, "positionY", "positionY");
   const positionTheta = nodeHelper.useCoalesce(nodeId, "positionTheta", "positionTheta");
   const positionRadius = nodeHelper.useCoalesce(nodeId, "positionRadius", "positionRadius");
   const rotation = nodeHelper.useCoalesce(nodeId, "rotation", "rotation");

   const points = useMemo(() => {
      const tR = getTrueRadius(MathHelper.lengthToPx(radius), scribeMode, pointCount);
      return lodash
         .range(pointCount)
         .map((i) => {
            const coeff = MathHelper.lerp(MathHelper.delerp(i, 0, pointCount), 0, 360);
            return `${tR * Math.cos(MathHelper.deg2rad(coeff - 90))},${tR * Math.sin(MathHelper.deg2rad(coeff - 90))}`;
         })
         .join(" ");
   }, [pointCount, radius, scribeMode]);

   return (
      <g style={{ transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation}deg)` }}>
         <g
            stroke={MathHelper.colorToHex(strokeColor, "#000f")}
            fill={MathHelper.colorToHex(fillColor, "transparent")}
            strokeWidth={Math.max(0, MathHelper.lengthToPx(strokeWidth))}
            strokeLinejoin={strokeJoin}
         >
            <polygon points={points} />
         </g>
      </g>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IPolygonNode>();

const PolygonNodeHelper: INodeHelper<IPolygonNode> = {
   name: "Polygon",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_POLYGON,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IPolygonNode["outputs"]) => {
      if (socket === "output") {
         return Renderer;
      }
      const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius");
      const pointCount = nodeMethods.getValue(graph, nodeId, "pointCount");
      const scribeMode = nodeMethods.getValue(graph, nodeId, "scribeMode");

      const tR = getTrueRadius(MathHelper.lengthToPx(radius), scribeMode, pointCount);

      switch (socket) {
         case "rInscribe":
            return MathHelper.pxToLength(getPassedRadius(tR, "inscribe", pointCount));
         case "rCircumscribe":
            return MathHelper.pxToLength(getPassedRadius(tR, "circumscribe", pointCount));
         case "rMiddle":
            return MathHelper.pxToLength(getPassedRadius(tR, "middle", pointCount));
      }
   },
   initialize: () => ({
      radius: { value: 100, unit: "px" },
      strokeWidth: { value: 1, unit: "px" },
      pointCount: 3,
      strokeJoin: "miter",
      scribeMode: "inscribe",
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      fillColor: null as Color,

      positionX: { value: 0, unit: "px" },
      positionY: { value: 0, unit: "px" },
      positionRadius: { value: 0, unit: "px" },
      positionTheta: 0,
      positionMode: "cartesian",
      rotation: 0,
   }),
   controls: Controls,
};

export default PolygonNodeHelper;

const getTrueRadius = (r: number, scribe: ScribeMode, sides: number) => {
   switch (scribe) {
      case "middle":
         return (r + r / Math.cos(Math.PI / sides)) / 2;
      case "circumscribe":
         return r / Math.cos(Math.PI / sides);
      case "inscribe":
         return r;
   }
};

const getPassedRadius = (r: number, desired: ScribeMode, sides: number) => {
   switch (desired) {
      case "middle":
         return (r + r * Math.cos(Math.PI / sides)) / 2;
      case "circumscribe":
         return r;
      case "inscribe":
         return r * Math.cos(Math.PI / sides);
   }
};
