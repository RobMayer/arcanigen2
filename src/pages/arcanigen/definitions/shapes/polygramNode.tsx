import { memo, useEffect, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
   ControlRendererProps,
   Curve,
   Globals,
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

import nodeIcon from "!/components/icons/faPentagram";
import buttonIcon from "!/components/icons/faPentagramLight";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import SliderInput from "!/components/inputs/SliderInput";
import Dropdown from "!/components/selectors/Dropdown";
import ToggleList from "!/components/selectors/ToggleList";
import { Length, Color } from "!/utility/types/units";
import lodash from "lodash";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { TransformPrefabs } from "../../nodeView/prefabs";

interface IPolygramNode extends INodeDefinition {
   inputs: {
      pointCount: number;
      skipCount: number;
      radius: Length;
      thetaCurve: Curve;
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
      rTangents: Length;
      rPoints: Length;
      rMiddle: Length;
   };
   values: {
      radius: Length;
      strokeWidth: Length;
      strokeJoin: StrokeJoinMode;
      pointCount: number;
      skipCount: number;
      scribeMode: ScribeMode;
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

const nodeHelper = ArcaneGraph.nodeHooks<IPolygramNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [strokeJoin, setStrokeJoin] = nodeHelper.useValueState(nodeId, "strokeJoin");
   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");
   const [pointCount, setPointCount] = nodeHelper.useValueState(nodeId, "pointCount");
   const [skipCount, setSkipCount] = nodeHelper.useValueState(nodeId, "skipCount");
   const [scribeMode, setScribeMode] = nodeHelper.useValueState(nodeId, "scribeMode");

   const hasPointCount = nodeHelper.useHasLink(nodeId, "pointCount");
   const hasSkipCount = nodeHelper.useHasLink(nodeId, "skipCount");
   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");

   useEffect(() => {
      setSkipCount((p) => {
         const n = Math.ceil(pointCount / 2) - 2;
         if (n <= 0) {
            return 0;
         }
         if (p > n) {
            return n;
         }
         return p;
      });
   }, [pointCount, setSkipCount]);

   return (
      <BaseNode<IPolygramNode> nodeId={nodeId} helper={PolygramNodeHelper}>
         <SocketOut<IPolygramNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IPolygramNode> nodeId={nodeId} socketId={"pointCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Points"}>
               <SliderInput revertInvalid value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} disabled={hasPointCount} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPolygramNode> nodeId={nodeId} socketId={"skipCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Skip Count"}>
               <SliderInput
                  revertInvalid
                  value={skipCount}
                  onValidValue={setSkipCount}
                  min={0}
                  max={Math.ceil(pointCount / 2) - 2}
                  step={1}
                  disabled={Math.ceil(pointCount / 2) - 2 <= 0 || hasSkipCount}
               />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPolygramNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Scribe Mode"}>
            <Dropdown value={scribeMode} onValue={setScribeMode} options={SCRIBE_MODES} />
         </BaseNode.Input>
         <SocketIn<IPolygramNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
            θ Distribution
         </SocketIn>

         <hr />
         <BaseNode.Foldout label={"Appearance"} inputs={"strokeWidth strokeColor fillColor"} nodeId={nodeId} outputs={""}>
            <SocketIn<IPolygramNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Join"}>
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODES} />
            </BaseNode.Input>
            <SocketIn<IPolygramNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IPolygramNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IPolygramNode> nodeId={nodeId} nodeHelper={nodeHelper} />
         <BaseNode.Foldout label={"Additional Outputs"} inputs={""} outputs={"rTangents rPoints rMiddle"} nodeId={nodeId}>
            <SocketOut<IPolygramNode> nodeId={nodeId} socketId={"rTangents"} type={SocketTypes.LENGTH}>
               Tangents Radius
            </SocketOut>
            <SocketOut<IPolygramNode> nodeId={nodeId} socketId={"rPoints"} type={SocketTypes.LENGTH}>
               Points Radius
            </SocketOut>
            <SocketOut<IPolygramNode> nodeId={nodeId} socketId={"rMiddle"} type={SocketTypes.LENGTH}>
               Middle Radius
            </SocketOut>
         </BaseNode.Foldout>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, globals }: NodeRendererProps) => {
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius", globals);
   const pointCount = nodeHelper.useCoalesce(nodeId, "pointCount", "pointCount", globals);
   const scribeMode = nodeHelper.useValue(nodeId, "scribeMode");

   const theMax = Math.ceil(pointCount / 2) - 2;

   const skipCount = Math.min(theMax, Math.max(0, nodeHelper.useCoalesce(nodeId, "skipCount", "skipCount", globals)));

   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeJoin = nodeHelper.useValue(nodeId, "strokeJoin");
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const fillColor = nodeHelper.useCoalesce(nodeId, "fillColor", "fillColor", globals);

   const positionMode = nodeHelper.useValue(nodeId, "positionMode");
   const positionX = nodeHelper.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHelper.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHelper.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHelper.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHelper.useCoalesce(nodeId, "rotation", "rotation", globals);
   const thetaCurve = nodeHelper.useInput(nodeId, "thetaCurve", globals);

   const points = useMemo(() => {
      const tR = getTrueRadius(MathHelper.lengthToPx(radius), scribeMode, pointCount);
      const angles = lodash.range(0, pointCount).map((i) =>
         MathHelper.lerp(MathHelper.delerp(i, 0, pointCount), 0, 360, {
            curveFn: thetaCurve?.curveFn ?? "linear",
            easing: thetaCurve?.easing ?? "in",
            intensity: thetaCurve?.intensity ?? 1,
         })
      );

      return lodash
         .range(0, pointCount)
         .map((a) => {
            const i = angles[(a * (skipCount + 1)) % angles.length];
            return `${tR * Math.cos(MathHelper.deg2rad(i - 90))},${tR * Math.sin(MathHelper.deg2rad(i - 90))}`;
         })
         .join(" ");
   }, [radius, scribeMode, pointCount, skipCount, thetaCurve?.curveFn, thetaCurve?.easing, thetaCurve?.intensity]);

   return (
      <g style={{ transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation}deg)` }}>
         <g
            stroke={MathHelper.colorToHTML(strokeColor)}
            fill={MathHelper.colorToHTML(fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx(strokeWidth))}
            strokeLinejoin={strokeJoin}
         >
            <polygon points={points} vectorEffect={"non-scaling-stroke"} />
         </g>
      </g>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IPolygramNode>();

const PolygramNodeHelper: INodeHelper<IPolygramNode> = {
   name: "Polygram",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_POLYGRAM,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IPolygramNode["outputs"], globals: Globals) => {
      if (socket === "output") {
         return Renderer;
      }
      const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius", globals);
      const pointCount = nodeMethods.getValue(graph, nodeId, "pointCount");
      const skipCount = nodeMethods.getValue(graph, nodeId, "skipCount");
      const scribeMode = nodeMethods.getValue(graph, nodeId, "scribeMode");

      const tR = getTrueRadius(MathHelper.lengthToPx(radius), scribeMode, pointCount);

      switch (socket) {
         case "rTangents":
            return MathHelper.pxToLength(getPassedRadius(tR, "tangents", pointCount, skipCount));
         case "rPoints":
            return MathHelper.pxToLength(getPassedRadius(tR, "points", pointCount, skipCount));
         case "rMiddle":
            return MathHelper.pxToLength(getPassedRadius(tR, "middle", pointCount, skipCount));
      }
   },
   initialize: () => ({
      radius: { value: 100, unit: "px" },
      strokeWidth: { value: 1, unit: "px" },
      pointCount: 5,
      skipCount: 1,
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

export default PolygramNodeHelper;

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

const getPassedRadius = (r: number, desired: "middle" | "points" | "tangents", pointCount: number, skipCount: number) => {
   if (desired === "points") {
      return r;
   }

   const start = {
      x: r * Math.cos(MathHelper.deg2rad(-90)),
      y: r * Math.sin(MathHelper.deg2rad(-90)),
   };
   const end = {
      x: r * Math.cos(MathHelper.deg2rad(MathHelper.lerp(MathHelper.delerp((skipCount + 1) % pointCount, 0, pointCount), 0, 360) - 90)),
      y: r * Math.sin(MathHelper.deg2rad(MathHelper.lerp(MathHelper.delerp((skipCount + 1) % pointCount, 0, pointCount), 0, 360) - 90)),
   };

   const tR = Math.sqrt(((start.x + end.x) / 2) * ((start.x + end.x) / 2) + ((start.y + end.y) / 2) * ((start.y + end.y) / 2));

   switch (desired) {
      case "middle":
         return (r + tR) / 2;
      case "tangents":
         return tR;
   }
};
