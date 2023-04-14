import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
   ControlRendererProps,
   Curve,
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeRendererProps,
   NodeTypes,
   PositionMode,
   SocketTypes,
   StrokeCapMode,
   STROKECAP_MODES,
   ThetaMode,
   THETA_MODES,
   RADIAL_MODES,
   RadialMode,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { faStarOfLife as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faStarOfLife as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import Checkbox from "!/components/buttons/Checkbox";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import NumberInput from "!/components/inputs/NumberInput";
import ToggleList from "!/components/selectors/ToggleList";
import { Length, Color } from "!/utility/types/units";
import lodash from "lodash";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import AngleInput from "!/components/inputs/AngleInput";
import TextInput from "!/components/inputs/TextInput";

interface IBurstNode extends INodeDefinition {
   inputs: {
      spurCount: number;
      radius: Length;
      deviation: Length;
      minorRadius: Length;
      majorRadius: Length;
      thetaStart: number;
      thetaEnd: number;
      thetaSteps: number;
      thetaCurve: Curve;

      strokeColor: Color;
      strokeOffset: Length;
      strokeWidth: Length;
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
      radialMode: RadialMode;
      thetaMode: ThetaMode;
      thetaStart: number;
      thetaEnd: number;
      thetaSteps: number;
      thetaInclusive: boolean;
      radius: Length;
      deviation: Length;
      minorRadius: Length;
      majorRadius: Length;
      spurCount: number;

      strokeWidth: Length;
      strokeDash: string;
      strokeCap: StrokeCapMode;
      strokeOffset: Length;
      strokeColor: Color;
      strokeMarkAlign: boolean;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IBurstNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
   const [deviation, setDeviation] = nodeHooks.useValueState(nodeId, "deviation");
   const [radialMode, setRadialMode] = nodeHooks.useValueState(nodeId, "radialMode");
   const [minorRadius, setMinorRadius] = nodeHooks.useValueState(nodeId, "minorRadius");
   const [majorRadius, setMajorRadius] = nodeHooks.useValueState(nodeId, "majorRadius");

   const [thetaMode, setThetaMode] = nodeHooks.useValueState(nodeId, "thetaMode");
   const [thetaStart, setThetaStart] = nodeHooks.useValueState(nodeId, "thetaStart");
   const [thetaEnd, setThetaEnd] = nodeHooks.useValueState(nodeId, "thetaEnd");
   const [thetaSteps, setThetaSteps] = nodeHooks.useValueState(nodeId, "thetaSteps");
   const [thetaInclusive, setThetaInclusive] = nodeHooks.useValueState(nodeId, "thetaInclusive");

   const [spurCount, setSpurCount] = nodeHooks.useValueState(nodeId, "spurCount");

   const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
   const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
   const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
   const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
   const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
   const [strokeMarkAlign, setStrokeMarkAlign] = nodeHooks.useValueState(nodeId, "strokeMarkAlign");

   const hasSpurCount = nodeHooks.useHasLink(nodeId, "spurCount");
   const hasThetaStart = nodeHooks.useHasLink(nodeId, "thetaStart");
   const hasThetaEnd = nodeHooks.useHasLink(nodeId, "thetaEnd");
   const hasThetaSteps = nodeHooks.useHasLink(nodeId, "thetaSteps");

   const hasMinorRadius = nodeHooks.useHasLink(nodeId, "minorRadius");
   const hasMajorRadius = nodeHooks.useHasLink(nodeId, "majorRadius");
   const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
   const hasDeviation = nodeHooks.useHasLink(nodeId, "deviation");

   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
   const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");

   return (
      <BaseNode<IBurstNode> nodeId={nodeId} helper={BurstNodeHelper} hooks={nodeHooks}>
         <SocketOut<IBurstNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"spurCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Points"}>
               <NumberInput value={spurCount} min={0} step={1} onValidValue={setSpurCount} disabled={hasSpurCount} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Radial Mode"}>
            <ToggleList value={radialMode} onValue={setRadialMode} options={RADIAL_MODES} />
         </BaseNode.Input>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"majorRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Major Radius"}>
               <LengthInput value={majorRadius} onValidValue={setMajorRadius} disabled={hasMajorRadius || radialMode === "deviation"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"minorRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Minor Radius"}>
               <LengthInput value={minorRadius} onValidValue={setMinorRadius} disabled={hasMinorRadius || radialMode === "deviation"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || radialMode === "majorminor"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"deviation"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Deviation"}>
               <LengthInput value={deviation} onValidValue={setDeviation} disabled={hasDeviation || radialMode === "majorminor"} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <BaseNode.Input label={"Theta Mode"}>
            <ToggleList value={thetaMode} onValue={setThetaMode} options={THETA_MODES} />
         </BaseNode.Input>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"thetaSteps"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Incremental θ"}>
               <AngleInput value={thetaSteps} onValidValue={setThetaSteps} disabled={hasThetaSteps || thetaMode === "startstop"} wrap />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"thetaStart"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Start θ"}>
               <AngleInput value={thetaStart} onValidValue={setThetaStart} disabled={hasThetaStart || thetaMode === "incremental"} wrap />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"thetaEnd"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"End θ"}>
               <AngleInput value={thetaEnd} onValidValue={setThetaEnd} disabled={hasThetaEnd || thetaMode === "incremental"} wrap />
            </BaseNode.Input>
         </SocketIn>
         <Checkbox checked={thetaInclusive} onToggle={setThetaInclusive} disabled={thetaMode === "incremental"}>
            Inclusive End θ
         </Checkbox>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
            θ Distribution
         </SocketIn>
         <hr />
         <BaseNode.Foldout
            panelId={"appearance"}
            label={"Appearance"}
            nodeId={nodeId}
            inputs={"strokeWidth strokeColor fillColor strokeMarkStart strokeMarkEnd"}
            outputs={""}
         >
            <SocketIn<IBurstNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IBurstNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
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
            <SocketIn<IBurstNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Dash Offset"}>
                  <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IBurstNode> nodeId={nodeId} socketId={"strokeMarkStart"} type={SocketTypes.SHAPE}>
               Marker Start
            </SocketIn>
            <SocketIn<IBurstNode> nodeId={nodeId} socketId={"strokeMarkEnd"} type={SocketTypes.SHAPE}>
               Marker End
            </SocketIn>
            <Checkbox checked={strokeMarkAlign} onToggle={setStrokeMarkAlign}>
               Align Markers
            </Checkbox>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IBurstNode> nodeId={nodeId} hooks={nodeHooks} />
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides = {} }: NodeRendererProps) => {
   const spurCount = Math.max(0, nodeHooks.useCoalesce(nodeId, "spurCount", "spurCount", globals));
   const radialMode = nodeHooks.useValue(nodeId, "radialMode");
   const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
   const deviation = nodeHooks.useCoalesce(nodeId, "deviation", "deviation", globals);
   const minorRadius = nodeHooks.useCoalesce(nodeId, "minorRadius", "minorRadius", globals);
   const majorRadius = nodeHooks.useCoalesce(nodeId, "majorRadius", "majorRadius", globals);

   const positionMode = nodeHooks.useValue(nodeId, "positionMode");
   const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);

   const thetaMode = nodeHooks.useValue(nodeId, "thetaMode");
   const thetaStart = nodeHooks.useCoalesce(nodeId, "thetaStart", "thetaStart", globals);
   const thetaEnd = nodeHooks.useCoalesce(nodeId, "thetaEnd", "thetaEnd", globals);
   const thetaSteps = nodeHooks.useCoalesce(nodeId, "thetaSteps", "thetaSteps", globals);
   const thetaInclusive = nodeHooks.useValue(nodeId, "thetaInclusive");
   const thetaCurve = nodeHooks.useInput(nodeId, "thetaCurve", globals);

   const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const strokeDash = nodeHooks.useValue(nodeId, "strokeDash");
   const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");
   const strokeOffset = nodeHooks.useCoalesce(nodeId, "strokeOffset", "strokeOffset", globals);

   const [MarkStart, msId] = nodeHooks.useInputNode(nodeId, "strokeMarkStart", globals);
   const [MarkEnd, meId] = nodeHooks.useInputNode(nodeId, "strokeMarkEnd", globals);
   const strokeMarkAlign = nodeHooks.useValue(nodeId, "strokeMarkAlign");

   const rI = radialMode === "majorminor" ? MathHelper.lengthToPx(minorRadius) : MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(deviation) / 2;
   const rO = radialMode === "majorminor" ? MathHelper.lengthToPx(majorRadius) : MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(deviation) / 2;

   const points = useMemo(() => {
      return lodash.range(spurCount).map((n) => {
         const coeff = MathHelper.delerp(n, 0, thetaInclusive ? spurCount - 1 : spurCount);
         const angle =
            thetaMode === "startstop"
               ? MathHelper.lerp(coeff, 1 * thetaStart, 1 * thetaEnd, {
                    curveFn: thetaCurve?.curveFn ?? "linear",
                    easing: thetaCurve?.easing ?? "in",
                    intensity: thetaCurve?.intensity ?? 1,
                 })
               : MathHelper.lerp(coeff, 0, spurCount * thetaSteps, {
                    curveFn: thetaCurve?.curveFn ?? "linear",
                    easing: thetaCurve?.easing ?? "in",
                    intensity: thetaCurve?.intensity ?? 1,
                 });
         const c = Math.cos(MathHelper.deg2rad(angle - 90));
         const s = Math.sin(MathHelper.deg2rad(angle - 90));
         return <line key={n} x1={rI * c} y1={rI * s} x2={rO * c} y2={rO * s} vectorEffect={"non-scaling-stroke"} />;
      });
   }, [rI, rO, spurCount, thetaCurve?.curveFn, thetaCurve?.easing, thetaEnd, thetaInclusive, thetaMode, thetaStart, thetaSteps, thetaCurve?.intensity]);

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
            strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
            strokeLinecap={"strokeCap" in overrides ? overrides.strokeCap : strokeCap}
            strokeDashoffset={MathHelper.lengthToPx("strokeOffset" in overrides ? overrides.strokeOffset : strokeOffset)}
            strokeDasharray={MathHelper.listToLengths("strokeDash" in overrides ? overrides.strokeDash : strokeDash)
               .map(MathHelper.lengthToPx)
               .join(" ")}
            markerStart={msId ? `url('#markstart_${nodeId}_lyr-${depth ?? ""}')` : undefined}
            markerEnd={meId ? `url('#markend_${nodeId}_lyr-${depth ?? ""}')` : undefined}
         >
            {points}
         </g>
      </g>
   );
});

const BurstNodeHelper: INodeHelper<IBurstNode> = {
   name: "Burst",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_BURST,
   getOutput: () => Renderer,
   initialize: () => ({
      radius: { value: 150, unit: "px" },
      deviation: { value: 20, unit: "px" },
      radialMode: "majorminor",
      thetaMode: "incremental",
      spurCount: 5,
      minorRadius: { value: 140, unit: "px" },
      majorRadius: { value: 160, unit: "px" },
      thetaStart: 0,
      thetaEnd: 90,
      thetaSteps: 30,
      thetaInclusive: true,

      strokeWidth: { value: 1, unit: "px" },
      strokeDash: "",
      strokeOffset: { value: 0, unit: "px" },
      strokeCap: "butt",
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
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

export default BurstNodeHelper;
