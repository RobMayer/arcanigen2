import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
   ControlRendererProps,
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
   NodePatherProps,
   NodePather,
   Interpolator,
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
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import TextInput from "!/components/inputs/TextInput";

interface IPolygonNode extends INodeDefinition {
   inputs: {
      pointCount: number;
      radius: Length;
      thetaCurve: Interpolator;

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
      rInscribe: Length;
      rCircumscribe: Length;
      rMiddle: Length;
   };
   values: {
      radius: Length;
      strokeWidth: Length;
      pointCount: number;
      rScribe: ScribeMode;
      strokeJoin: StrokeJoinMode;
      strokeDash: string;
      strokeCap: StrokeCapMode;
      strokeOffset: Length;
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

const nodeHooks = ArcaneGraph.nodeHooks<IPolygonNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
   const [pointCount, setPointCount] = nodeHooks.useValueState(nodeId, "pointCount");
   const [rScribe, setRScribe] = nodeHooks.useValueState(nodeId, "rScribe");

   const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
   const [strokeJoin, setStrokeJoin] = nodeHooks.useValueState(nodeId, "strokeJoin");
   const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
   const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
   const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
   const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");

   const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
   const hasPointCount = nodeHooks.useHasLink(nodeId, "pointCount");
   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
   const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");

   return (
      <BaseNode<IPolygonNode> nodeId={nodeId} helper={PolygonNodeHelper} hooks={nodeHooks}>
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
               <Dropdown value={rScribe} onValue={setRScribe} options={SCRIBE_MODES} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IPolygonNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
            θ Distribution
         </SocketIn>
         <hr />
         <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} inputs={"strokeWidth strokeColor fillColor"} nodeId={nodeId} outputs={""}>
            <SocketIn<IPolygonNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IPolygonNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
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
            <SocketIn<IPolygonNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Dash Offset"}>
                  <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IPolygonNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IPolygonNode> nodeId={nodeId} hooks={nodeHooks} />
         <BaseNode.Foldout panelId={"moreOutputs"} label={"Additional Outputs"} inputs={""} outputs={"path rInscribe rCircumscribe rMiddle"} nodeId={nodeId}>
            <SocketOut<IPolygonNode> nodeId={nodeId} socketId={"path"} type={SocketTypes.PATH}>
               Conformal Path
            </SocketOut>
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
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Pather = memo(({ nodeId, globals, pathId, depth, pathLength }: NodePatherProps) => {
   const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
   const pointCount = Math.min(24, Math.max(3, nodeHooks.useCoalesce(nodeId, "pointCount", "pointCount", globals)));
   const rScribe = nodeHooks.useValue(nodeId, "rScribe");

   const positionMode = nodeHooks.useValue(nodeId, "positionMode");
   const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);
   const thetaCurve = nodeHooks.useInput(nodeId, "thetaCurve", globals);

   const points = useMemo(() => {
      const tR = getTrueRadius(MathHelper.lengthToPx(radius), rScribe, pointCount);
      const p = lodash.range(pointCount).map((each, i) => {
         const coeff = MathHelper.lerp(MathHelper.delerp(each, 0, pointCount), 0, 360, thetaCurve ?? MathHelper.DEFUALT_INTERPOLATOR);
         return `${tR * Math.cos(MathHelper.deg2rad(coeff - 90))},${tR * Math.sin(MathHelper.deg2rad(coeff - 90))}`;
      });
      return `M ${p[0]} ${p
         .slice(1)
         .map((e) => `L ${e}`)
         .join(" ")} Z`;
   }, [pointCount, radius, rScribe, thetaCurve]);

   return (
      <g>
         <path
            transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}
            d={points}
            id={pathId}
            pathLength={pathLength}
         />
      </g>
   );
});

const Renderer = memo(({ nodeId, globals, overrides = {} }: NodeRendererProps) => {
   const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
   const pointCount = Math.min(24, Math.max(3, nodeHooks.useCoalesce(nodeId, "pointCount", "pointCount", globals)));
   const rScribe = nodeHooks.useValue(nodeId, "rScribe");

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
      const tR = getTrueRadius(MathHelper.lengthToPx(radius), rScribe, pointCount);
      const p = lodash.range(pointCount).map((each, i) => {
         const coeff = MathHelper.lerp(MathHelper.delerp(each, 0, pointCount), 0, 360, thetaCurve ?? MathHelper.DEFUALT_INTERPOLATOR);
         return `${tR * Math.cos(MathHelper.deg2rad(coeff - 90))},${tR * Math.sin(MathHelper.deg2rad(coeff - 90))} `;
      });
      return `M ${p[0]} ${p
         .slice(1)
         .map((e) => `L ${e}`)
         .join(" ")} Z`;
   }, [pointCount, radius, rScribe, thetaCurve]);

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

const nodeMethods = ArcaneGraph.nodeMethods<IPolygonNode>();

const PolygonNodeHelper: INodeHelper<IPolygonNode> = {
   name: "Polygon",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_POLYGON,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IPolygonNode["outputs"], globals: Globals) => {
      if (socket === "output") {
         return Renderer;
      }
      if (socket === "path") {
         return Pather;
      }
      const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius", globals);
      const pointCount = nodeMethods.getValue(graph, nodeId, "pointCount");
      const rScribe = nodeMethods.getValue(graph, nodeId, "rScribe");

      const tR = getTrueRadius(MathHelper.lengthToPx(radius), rScribe, pointCount);

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
      rScribe: "inscribe",
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

//thetaCurve ?? MathHelper.DEFUALT_INTERPOLATOR
