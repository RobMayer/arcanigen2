import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
   ControlRendererProps,
   Curve,
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeRendererProps,
   NodeTypes,
   PositionMode,
   SocketTypes,
   StrokeJoinMode,
   STROKEJOIN_MODES,
   SCRIBE_MODES,
   ScribeMode,
   RadialMode,
   RADIAL_MODES,
   Globals,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { faStar as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faStar as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import SliderInput from "!/components/inputs/SliderInput";
import ToggleList from "!/components/selectors/ToggleList";
import { Length, Color } from "!/utility/types/units";
import lodash from "lodash";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { TransformPrefabs } from "../../nodeView/prefabs";
import Dropdown from "!/components/selectors/Dropdown";
import TextInput from "!/components/inputs/TextInput";

interface IStarNode extends INodeDefinition {
   inputs: {
      pointCount: number;
      majorRadius: Length;
      minorRadius: Length;
      radius: Length;
      deviation: Length;
      thetaCurve: Curve;
      strokeWidth: Length;
      strokeColor: Color;
      fillColor: Color;

      smoothing: number;
      cusping: number;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      rotation: number;
   };
   outputs: {
      output: NodeRenderer;

      cInscribe: Length;
      cCircumscribe: Length;
      cMiddle: Length;

      oInscribe: Length;
      oCircumscribe: Length;
      oMiddle: Length;

      iInscribe: Length;
      iCircumscribe: Length;
      iMiddle: Length;
   };
   values: {
      name: string;
      radius: Length;
      deviation: Length;
      radialMode: RadialMode;
      minorRadius: Length;
      majorRadius: Length;
      pointCount: number;
      rScribeMode: ScribeMode;
      majorScribeMode: ScribeMode;
      minorScribeMode: ScribeMode;

      smoothing: number;
      cusping: number;

      strokeWidth: Length;
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

const nodeHelper = ArcaneGraph.nodeHooks<IStarNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [pointCount, setPointCount] = nodeHelper.useValueState(nodeId, "pointCount");
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [deviation, setDeviation] = nodeHelper.useValueState(nodeId, "deviation");
   const [radialMode, setRadialMode] = nodeHelper.useValueState(nodeId, "radialMode");
   const [minorRadius, setMinorRadius] = nodeHelper.useValueState(nodeId, "minorRadius");
   const [majorRadius, setMajorRadius] = nodeHelper.useValueState(nodeId, "majorRadius");
   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");
   const [strokeJoin, setStrokeJoin] = nodeHelper.useValueState(nodeId, "strokeJoin");

   const [rScribeMode, setRScribeMode] = nodeHelper.useValueState(nodeId, "rScribeMode");
   const [majorScribeMode, setMajorScribeMode] = nodeHelper.useValueState(nodeId, "majorScribeMode");
   const [minorScribeMode, setMinorScribeMode] = nodeHelper.useValueState(nodeId, "minorScribeMode");
   const [smoothing, setSmoothing] = nodeHelper.useValueState(nodeId, "smoothing");
   const [cusping, setCusping] = nodeHelper.useValueState(nodeId, "cusping");

   const hasPointCount = nodeHelper.useHasLink(nodeId, "pointCount");
   const hasMinorRadius = nodeHelper.useHasLink(nodeId, "minorRadius");
   const hasMajorRadius = nodeHelper.useHasLink(nodeId, "majorRadius");
   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasDeviation = nodeHelper.useHasLink(nodeId, "deviation");
   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");

   const hasSmoothing = nodeHelper.useHasLink(nodeId, "smoothing");
   const hasCusping = nodeHelper.useHasLink(nodeId, "cusping");

   return (
      <BaseNode<IStarNode> nodeId={nodeId} helper={StarNodeHelper} name={name}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
         <SocketOut<IStarNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"pointCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Points"}>
               <SliderInput revertInvalid value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} disabled={hasPointCount} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Radial Mode"}>
            <ToggleList value={radialMode} onValue={setRadialMode} options={RADIAL_MODES} />
         </BaseNode.Input>
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"majorRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Major Radius"}>
               <LengthInput value={majorRadius} onValidValue={setMajorRadius} disabled={hasMajorRadius || radialMode === "deviation"} />
               <Dropdown value={majorScribeMode} onValue={setMajorScribeMode} options={SCRIBE_MODES} disabled={radialMode === "deviation"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"minorRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Minor Radius"}>
               <LengthInput value={minorRadius} onValidValue={setMinorRadius} disabled={hasMinorRadius || radialMode === "deviation"} />
               <Dropdown value={minorScribeMode} onValue={setMinorScribeMode} options={SCRIBE_MODES} disabled={radialMode === "deviation"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || radialMode === "majorminor"} />
               <Dropdown value={rScribeMode} onValue={setRScribeMode} options={SCRIBE_MODES} disabled={radialMode === "majorminor"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"deviation"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Deviation"}>
               <LengthInput value={deviation} onValidValue={setDeviation} disabled={hasDeviation || radialMode === "majorminor"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"smoothing"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Smoothing"}>
               <SliderInput value={smoothing} min={0} max={1} onValidValue={setSmoothing} disabled={hasSmoothing} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"cusping"} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Cusping"}>
               <SliderInput value={cusping} min={0} max={1} onValidValue={setCusping} disabled={hasCusping} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IStarNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
            θ Distribution
         </SocketIn>

         <hr />
         <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Join"}>
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODES} />
            </BaseNode.Input>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IStarNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IStarNode> nodeId={nodeId} nodeHelper={nodeHelper} />
         <BaseNode.Foldout
            panelId={"moreOutputs"}
            label={"Additional Outputs"}
            inputs={""}
            outputs={"cInscribe cCircumscribe cMiddle oInscribe oCircumscribe oMiddle iInscribe iCircumscribe iMiddle"}
            nodeId={nodeId}
         >
            <SocketOut<IStarNode> nodeId={nodeId} socketId={"cInscribe"} type={SocketTypes.LENGTH}>
               Inscribe Center
            </SocketOut>
            <SocketOut<IStarNode> nodeId={nodeId} socketId={"cCircumscribe"} type={SocketTypes.LENGTH}>
               Circumscribe Center
            </SocketOut>
            <SocketOut<IStarNode> nodeId={nodeId} socketId={"cMiddle"} type={SocketTypes.LENGTH}>
               Middle Center
            </SocketOut>

            <SocketOut<IStarNode> nodeId={nodeId} socketId={"oInscribe"} type={SocketTypes.LENGTH}>
               Inscribe Major
            </SocketOut>
            <SocketOut<IStarNode> nodeId={nodeId} socketId={"oCircumscribe"} type={SocketTypes.LENGTH}>
               Circumscribe Major
            </SocketOut>
            <SocketOut<IStarNode> nodeId={nodeId} socketId={"oMiddle"} type={SocketTypes.LENGTH}>
               Middle Major
            </SocketOut>

            <SocketOut<IStarNode> nodeId={nodeId} socketId={"iInscribe"} type={SocketTypes.LENGTH}>
               Inscribe Minor
            </SocketOut>
            <SocketOut<IStarNode> nodeId={nodeId} socketId={"iCircumscribe"} type={SocketTypes.LENGTH}>
               Circumscribe Minor
            </SocketOut>
            <SocketOut<IStarNode> nodeId={nodeId} socketId={"iMiddle"} type={SocketTypes.LENGTH}>
               Middle Minor
            </SocketOut>
         </BaseNode.Foldout>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, globals, overrides = {} }: NodeRendererProps) => {
   const radialMode = nodeHelper.useValue(nodeId, "radialMode");
   const rScribeMode = nodeHelper.useValue(nodeId, "rScribeMode");
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius", globals);
   const deviation = nodeHelper.useCoalesce(nodeId, "deviation", "deviation", globals);
   const minorRadius = nodeHelper.useCoalesce(nodeId, "minorRadius", "minorRadius", globals);
   const majorRadius = nodeHelper.useCoalesce(nodeId, "majorRadius", "majorRadius", globals);
   const minorScribeMode = nodeHelper.useValue(nodeId, "minorScribeMode");
   const majorScribeMode = nodeHelper.useValue(nodeId, "majorScribeMode");
   const pointCount = Math.min(24, Math.max(3, nodeHelper.useCoalesce(nodeId, "pointCount", "pointCount", globals)));

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

   const smoothing = nodeHelper.useCoalesce(nodeId, "smoothing", "smoothing", globals);
   const cusping = nodeHelper.useCoalesce(nodeId, "cusping", "cusping", globals);

   const points = useMemo(() => {
      const rI =
         radialMode === "majorminor"
            ? getTrueRadius(MathHelper.lengthToPx(minorRadius), minorScribeMode, pointCount)
            : getTrueRadius(MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(deviation), rScribeMode, pointCount);
      const rO =
         radialMode === "majorminor"
            ? getTrueRadius(MathHelper.lengthToPx(majorRadius), majorScribeMode, pointCount)
            : getTrueRadius(MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(deviation), rScribeMode, pointCount);

      //const th = 360 / (pointCount * 2);

      return lodash
         .range(pointCount)
         .map((n, i, ary) => {
            const ang = MathHelper.lerp(MathHelper.delerp(i, 0, pointCount), 0, 360, {
               curveFn: thetaCurve?.curveFn ?? "linear",
               easing: thetaCurve?.easing ?? "in",
               intensity: thetaCurve?.intensity ?? 1,
            });

            const nextAng = MathHelper.lerp(MathHelper.delerp(i + 1, 0, pointCount), 0, 360, {
               curveFn: thetaCurve?.curveFn ?? "linear",
               easing: thetaCurve?.easing ?? "in",
               intensity: thetaCurve?.intensity ?? 1,
            });

            const th = Math.abs(nextAng - ang) / 2;
            // const rad = i % 2 === 0 ? rO : rI;
            // return `${rad * Math.cos(MathHelper.deg2rad(coeff - 90))},${rad * Math.sin(MathHelper.deg2rad(coeff - 90))}`;

            // const ang = (360 / pointCount) * n;
            // const nextAng = (360 / pointCount) * (n + 1);

            const sTan = rO * Math.tan(MathHelper.deg2rad(th));
            const eTan = rI * Math.tan(MathHelper.deg2rad(th));
            const outerTanR = Math.sqrt(sTan * sTan + rO * rO);
            const innerTanR = Math.sqrt(eTan * eTan + rI * rI);

            const endX = rO * Math.cos(MathHelper.deg2rad(nextAng - 90));
            const endY = rO * Math.sin(MathHelper.deg2rad(nextAng - 90));

            const midX = rI * Math.cos(MathHelper.deg2rad((ang + nextAng) / 2 - 90));
            const midY = rI * Math.sin(MathHelper.deg2rad((ang + nextAng) / 2 - 90));

            const startX = rO * Math.cos(MathHelper.deg2rad(ang - 90));
            const startY = rO * Math.sin(MathHelper.deg2rad(ang - 90));

            // const rTO = rO * Math.tan(MathHelper.deg2rad(th));
            // const rTI = rI * Math.cos(MathHelper.deg2rad(ang + th));
            const startTangentX = MathHelper.lerp(cusping, startX, outerTanR * Math.cos(MathHelper.deg2rad(ang + th - 90)));
            const startTangentY = MathHelper.lerp(cusping, startY, outerTanR * Math.sin(MathHelper.deg2rad(ang + th - 90)));

            const midInX = MathHelper.lerp(smoothing, midX, innerTanR * Math.cos(MathHelper.deg2rad(ang - 90)));
            const midInY = MathHelper.lerp(smoothing, midY, innerTanR * Math.sin(MathHelper.deg2rad(ang - 90)));
            const midOutX = MathHelper.lerp(smoothing, midX, innerTanR * Math.cos(MathHelper.deg2rad(nextAng - 90)));
            const midOutY = MathHelper.lerp(smoothing, midY, innerTanR * Math.sin(MathHelper.deg2rad(nextAng - 90)));

            const endTangentX = MathHelper.lerp(cusping, endX, outerTanR * Math.cos(MathHelper.deg2rad(nextAng - th - 90)));
            const endTangentY = MathHelper.lerp(cusping, endY, outerTanR * Math.sin(MathHelper.deg2rad(nextAng - th - 90)));

            return `${
               i === 0 ? `M ${startX}, ${startY}` : ""
            } C ${startTangentX},${startTangentY} ${midInX},${midInY} ${midX},${midY} C ${midOutX},${midOutY} ${endTangentX},${endTangentY} ${endX},${endY} ${
               i === ary.length - 1 ? "Z" : ""
            }`;
         })
         .join(" ");
   }, [
      minorRadius,
      smoothing,
      majorRadius,
      cusping,
      pointCount,
      radialMode,
      deviation,
      radius,
      rScribeMode,
      minorScribeMode,
      majorScribeMode,
      thetaCurve?.curveFn,
      thetaCurve?.easing,
      thetaCurve?.intensity,
   ]);

   return (
      <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}>
         <g
            stroke={MathHelper.colorToSVG("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fill={MathHelper.colorToSVG("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fillOpacity={MathHelper.colorToOpacity("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
            strokeLinejoin={"strokeJoin" in overrides ? overrides.strokeJoin : strokeJoin}
         >
            <path d={points} vectorEffect={"non-scaling-stroke"} />
         </g>
      </g>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IStarNode>();

const StarNodeHelper: INodeHelper<IStarNode> = {
   name: "Star",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_STAR,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IStarNode["outputs"], globals: Globals) => {
      if (socket === "output") {
         return Renderer;
      }

      const deviation = nodeMethods.getValue(graph, nodeId, "deviation");
      const radialMode = nodeMethods.getValue(graph, nodeId, "radialMode");
      const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius", globals);
      const minorRadius = nodeMethods.coalesce(graph, nodeId, "minorRadius", "minorRadius", globals);
      const majorRadius = nodeMethods.coalesce(graph, nodeId, "majorRadius", "majorRadius", globals);

      const minorScribeMode = nodeMethods.getValue(graph, nodeId, "minorScribeMode");
      const majorScribeMode = nodeMethods.getValue(graph, nodeId, "majorScribeMode");
      const rScribeMode = nodeMethods.getValue(graph, nodeId, "rScribeMode");

      const pointCount = nodeMethods.getValue(graph, nodeId, "pointCount");

      const tI =
         radialMode === "majorminor"
            ? getTrueRadius(MathHelper.lengthToPx(minorRadius), minorScribeMode, pointCount)
            : getTrueRadius(MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(deviation), rScribeMode, pointCount);
      const tO =
         radialMode === "majorminor"
            ? getTrueRadius(MathHelper.lengthToPx(majorRadius), majorScribeMode, pointCount)
            : getTrueRadius(MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(deviation), rScribeMode, pointCount);

      const tR = (tI + tO) / 2;

      switch (socket) {
         case "cInscribe":
            return MathHelper.pxToLength(getPassedRadius(tR, "inscribe", pointCount));
         case "cCircumscribe":
            return MathHelper.pxToLength(getPassedRadius(tR, "circumscribe", pointCount));
         case "cMiddle":
            return MathHelper.pxToLength(getPassedRadius(tR, "middle", pointCount));
         case "oInscribe":
            return MathHelper.pxToLength(getPassedRadius(tO, "inscribe", pointCount));
         case "oCircumscribe":
            return MathHelper.pxToLength(getPassedRadius(tO, "circumscribe", pointCount));
         case "oMiddle":
            return MathHelper.pxToLength(getPassedRadius(tO, "middle", pointCount));
         case "iInscribe":
            return MathHelper.pxToLength(getPassedRadius(tI, "inscribe", pointCount));
         case "iCircumscribe":
            return MathHelper.pxToLength(getPassedRadius(tI, "circumscribe", pointCount));
         case "iMiddle":
            return MathHelper.pxToLength(getPassedRadius(tI, "middle", pointCount));
      }
   },
   initialize: () => ({
      name: "",
      radius: { value: 110, unit: "px" },
      deviation: { value: 50, unit: "px" },
      radialMode: "majorminor",
      pointCount: 5,
      minorRadius: { value: 60, unit: "px" },
      majorRadius: { value: 160, unit: "px" },
      smoothing: 0,
      cusping: 0,
      rScribeMode: "inscribe",
      minorScribeMode: "inscribe",
      majorScribeMode: "inscribe",

      strokeWidth: { value: 1, unit: "px" },
      strokeJoin: "miter",
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

export default StarNodeHelper;

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
