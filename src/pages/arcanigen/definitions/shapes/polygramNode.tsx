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
   STROKECAP_MODES,
   StrokeCapMode,
   NodePather,
   NodePatherProps,
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
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import TextInput from "!/components/inputs/TextInput";

interface IPolygramNode extends INodeDefinition {
   inputs: {
      pointCount: number;
      skipCount: number;
      radius: Length;
      thetaCurve: Curve;
      strokeWidth: Length;
      strokeColor: Color;
      strokeOffset: Length;
      fillColor: Color;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      rotation: number;
   };
   outputs: {
      output: NodeRenderer;
      path: NodePather;
      rTangents: Length;
      rPoints: Length;
      rMiddle: Length;
   };
   values: {
      radius: Length;
      rScribeMode: ScribeMode;
      strokeWidth: Length;
      strokeJoin: StrokeJoinMode;
      pointCount: number;
      skipCount: number;
      strokeColor: Color;
      strokeDash: string;
      strokeCap: StrokeCapMode;
      strokeOffset: Length;
      fillColor: Color;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IPolygramNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
   const [pointCount, setPointCount] = nodeHooks.useValueState(nodeId, "pointCount");
   const [skipCount, setSkipCount] = nodeHooks.useValueState(nodeId, "skipCount");
   const [rScribeMode, setRScribeMode] = nodeHooks.useValueState(nodeId, "rScribeMode");

   const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
   const [strokeJoin, setStrokeJoin] = nodeHooks.useValueState(nodeId, "strokeJoin");
   const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
   const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
   const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
   const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");

   const hasPointCount = nodeHooks.useHasLink(nodeId, "pointCount");
   const hasSkipCount = nodeHooks.useHasLink(nodeId, "skipCount");
   const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
   const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
   const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");

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
      <BaseNode<IPolygramNode> nodeId={nodeId} helper={PolygramNodeHelper} hooks={nodeHooks}>
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
               <Dropdown value={rScribeMode} onValue={setRScribeMode} options={SCRIBE_MODES} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPolygramNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
            θ Distribution
         </SocketIn>

         <hr />
         <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} inputs={"strokeWidth strokeColor fillColor"} nodeId={nodeId} outputs={""}>
            <SocketIn<IPolygramNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IPolygramNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
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
            <SocketIn<IPolygramNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Dash Offset"}>
                  <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IPolygramNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IPolygramNode> nodeId={nodeId} hooks={nodeHooks} />
         <BaseNode.Foldout panelId={"moreOutputs"} label={"Additional Outputs"} inputs={""} outputs={"path rTangents rPoints rMiddle"} nodeId={nodeId}>
            <SocketOut<IPolygramNode> nodeId={nodeId} socketId={"path"} type={SocketTypes.PATH}>
               Conformal Path
            </SocketOut>
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
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, globals, overrides = {} }: NodeRendererProps) => {
   const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
   const pointCount = nodeHooks.useCoalesce(nodeId, "pointCount", "pointCount", globals);
   const rScribeMode = nodeHooks.useValue(nodeId, "rScribeMode");

   const theMax = Math.ceil(pointCount / 2) - 2;

   const skipCount = Math.min(theMax, Math.max(0, nodeHooks.useCoalesce(nodeId, "skipCount", "skipCount", globals)));

   const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeJoin = nodeHooks.useValue(nodeId, "strokeJoin");
   const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const strokeDash = nodeHooks.useValue(nodeId, "strokeDash");
   const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");
   const strokeOffset = nodeHooks.useCoalesce(nodeId, "strokeOffset", "strokeOffset", globals);
   const fillColor = nodeHooks.useCoalesce(nodeId, "fillColor", "fillColor", globals);

   const positionMode = nodeHooks.useValue(nodeId, "positionMode");
   const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);
   const thetaCurve = nodeHooks.useInput(nodeId, "thetaCurve", globals);

   const points = useMemo(() => {
      const tR = getTrueRadius(MathHelper.lengthToPx(radius), rScribeMode, pointCount);
      const angles = lodash.range(0, pointCount).map((i) =>
         MathHelper.lerp(MathHelper.delerp(i, 0, pointCount), 0, 360, {
            curveFn: thetaCurve?.curveFn ?? "linear",
            easing: thetaCurve?.easing ?? "in",
            intensity: thetaCurve?.intensity ?? 1,
         })
      );

      const numShapes = MathHelper.gcd(pointCount, skipCount + 1);
      const numLines = pointCount / numShapes;

      const shapes = lodash.range(0, numShapes).map((a, startIndex) => {
         const startAngle = angles[startIndex];
         const pts = lodash
            .range(0, numLines)
            .map((e, eachCount) => {
               const eachAngle = angles[(startIndex + eachCount * (skipCount + 1)) % angles.length];
               return `${tR * Math.cos(MathHelper.deg2rad(eachAngle - 90))}, ${tR * Math.sin(MathHelper.deg2rad(eachAngle - 90))}`;
            })
            .slice(1)
            .map((e) => `L ${e}`)
            .join(" ");

         return `M ${tR * Math.cos(MathHelper.deg2rad(startAngle - 90))}, ${tR * Math.sin(MathHelper.deg2rad(startAngle - 90))} ${pts} Z`;
      });

      return shapes.join(" ");
   }, [radius, rScribeMode, pointCount, skipCount, thetaCurve?.curveFn, thetaCurve?.easing, thetaCurve?.intensity]);

   return (
      <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}>
         <g
            stroke={MathHelper.colorToSVG("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fill={MathHelper.colorToSVG("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fillOpacity={MathHelper.colorToOpacity("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
            strokeLinejoin={"strokeJoin" in overrides ? overrides.strokeJoin : strokeJoin}
            strokeLinecap={"strokeCap" in overrides ? overrides.strokeCap : strokeCap}
            strokeDashoffset={MathHelper.lengthToPx("strokeOffset" in overrides ? overrides.strokeOffset : strokeOffset)}
            strokeDasharray={MathHelper.listToLengths("strokeDash" in overrides ? overrides.strokeDash : strokeDash)
               .map(MathHelper.lengthToPx)
               .join(" ")}
         >
            <path d={points} vectorEffect={"non-scaling-stroke"} />
         </g>
      </g>
   );
});

const Pather = memo(({ nodeId, globals, pathId, pathLength }: NodePatherProps) => {
   const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
   const pointCount = nodeHooks.useCoalesce(nodeId, "pointCount", "pointCount", globals);
   const rScribeMode = nodeHooks.useValue(nodeId, "rScribeMode");

   const theMax = Math.ceil(pointCount / 2) - 2;

   const skipCount = Math.min(theMax, Math.max(0, nodeHooks.useCoalesce(nodeId, "skipCount", "skipCount", globals)));

   const positionMode = nodeHooks.useValue(nodeId, "positionMode");
   const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);
   const thetaCurve = nodeHooks.useInput(nodeId, "thetaCurve", globals);

   const points = useMemo(() => {
      const tR = getTrueRadius(MathHelper.lengthToPx(radius), rScribeMode, pointCount);
      const angles = lodash.range(0, pointCount).map((i) =>
         MathHelper.lerp(MathHelper.delerp(i, 0, pointCount), 0, 360, {
            curveFn: thetaCurve?.curveFn ?? "linear",
            easing: thetaCurve?.easing ?? "in",
            intensity: thetaCurve?.intensity ?? 1,
         })
      );

      const numShapes = MathHelper.gcd(pointCount, skipCount + 1);
      const numLines = pointCount / numShapes;

      const shapes = lodash.range(0, numShapes).map((a, startIndex) => {
         const startAngle = angles[startIndex];
         const pts = lodash
            .range(0, numLines)
            .map((e, eachCount) => {
               const eachAngle = angles[(startIndex + eachCount * (skipCount + 1)) % angles.length];
               return `${tR * Math.cos(MathHelper.deg2rad(eachAngle - 90))}, ${tR * Math.sin(MathHelper.deg2rad(eachAngle - 90))}`;
            })
            .slice(1)
            .map((e) => `L ${e}`)
            .join(" ");

         return `M ${tR * Math.cos(MathHelper.deg2rad(startAngle - 90))}, ${tR * Math.sin(MathHelper.deg2rad(startAngle - 90))} ${pts} Z`;
      });

      return shapes.join(" ");
   }, [radius, rScribeMode, pointCount, skipCount, thetaCurve?.curveFn, thetaCurve?.easing, thetaCurve?.intensity]);

   return (
      <path
         d={points}
         transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}
         pathLength={pathLength}
         id={pathId}
      />
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
      if (socket === "path") {
         return Pather;
      }
      const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius", globals);
      const pointCount = nodeMethods.getValue(graph, nodeId, "pointCount");
      const skipCount = nodeMethods.getValue(graph, nodeId, "skipCount");
      const rScribeMode = nodeMethods.getValue(graph, nodeId, "rScribeMode");

      const tR = getTrueRadius(MathHelper.lengthToPx(radius), rScribeMode, pointCount);

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
      rScribeMode: "inscribe",
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      strokeDash: "",
      strokeOffset: { value: 0, unit: "px" },
      strokeCap: "butt",
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
