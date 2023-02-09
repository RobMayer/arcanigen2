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
   RadialMode,
   RADIAL_MODES,
   SocketTypes,
   StrokeCapMode,
   STROKECAP_MODES,
   ThetaMode,
   THETA_MODES,
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
import { TransformPrefabs } from "../../nodeView/prefabs";
import AngleInput from "!/components/inputs/AngleInput";

interface IBurstNode extends INodeDefinition {
   inputs: {
      spurCount: number;
      radius: Length;
      spread: Length;
      innerRadius: Length;
      outerRadius: Length;
      thetaStart: number;
      thetaEnd: number;
      thetaSteps: number;
      thetaCurve: Curve;

      strokeColor: Color;
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
      spread: Length;
      innerRadius: Length;
      outerRadius: Length;
      spurCount: number;

      strokeWidth: Length;
      strokeCap: StrokeCapMode;
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

const nodeHelper = ArcaneGraph.nodeHooks<IBurstNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [spread, setSpread] = nodeHelper.useValueState(nodeId, "spread");
   const [radialMode, setRadialMode] = nodeHelper.useValueState(nodeId, "radialMode");
   const [innerRadius, setInnerRadius] = nodeHelper.useValueState(nodeId, "innerRadius");
   const [outerRadius, setOuterRadius] = nodeHelper.useValueState(nodeId, "outerRadius");

   const [thetaMode, setThetaMode] = nodeHelper.useValueState(nodeId, "thetaMode");
   const [thetaStart, setThetaStart] = nodeHelper.useValueState(nodeId, "thetaStart");
   const [thetaEnd, setThetaEnd] = nodeHelper.useValueState(nodeId, "thetaEnd");
   const [thetaSteps, setThetaSteps] = nodeHelper.useValueState(nodeId, "thetaSteps");
   const [thetaInclusive, setThetaInclusive] = nodeHelper.useValueState(nodeId, "thetaInclusive");

   const [spurCount, setSpurCount] = nodeHelper.useValueState(nodeId, "spurCount");

   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeCap, setStrokeCap] = nodeHelper.useValueState(nodeId, "strokeCap");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [strokeMarkAlign, setStrokeMarkAlign] = nodeHelper.useValueState(nodeId, "strokeMarkAlign");

   const hasSpurCount = nodeHelper.useHasLink(nodeId, "spurCount");
   const hasThetaStart = nodeHelper.useHasLink(nodeId, "thetaStart");
   const hasThetaEnd = nodeHelper.useHasLink(nodeId, "thetaEnd");
   const hasThetaSteps = nodeHelper.useHasLink(nodeId, "thetaSteps");

   const hasInnerRadius = nodeHelper.useHasLink(nodeId, "innerRadius");
   const hasOuterRadius = nodeHelper.useHasLink(nodeId, "outerRadius");
   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasSpread = nodeHelper.useHasLink(nodeId, "spread");
   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");

   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");

   return (
      <BaseNode<IBurstNode> nodeId={nodeId} helper={BurstNodeHelper}>
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
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Inner Radius"}>
               <LengthInput value={innerRadius} onValidValue={setInnerRadius} disabled={hasInnerRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Outer Radius"}>
               <LengthInput value={outerRadius} onValidValue={setOuterRadius} disabled={hasOuterRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Spread"}>
               <LengthInput value={spread} onValidValue={setSpread} disabled={hasSpread || radialMode === "inout"} />
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
         <BaseNode.Foldout label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor strokeMarkStart strokeMarkEnd"} outputs={""}>
            <SocketIn<IBurstNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES} />
            </BaseNode.Input>
            <SocketIn<IBurstNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
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
         <TransformPrefabs.Full<IBurstNode> nodeId={nodeId} nodeHelper={nodeHelper} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals }: NodeRendererProps) => {
   const spurCount = Math.max(0, nodeHelper.useCoalesce(nodeId, "spurCount", "spurCount", globals));
   const radialMode = nodeHelper.useValue(nodeId, "radialMode");
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius", globals);
   const spread = nodeHelper.useCoalesce(nodeId, "spread", "spread", globals);
   const innerRadius = nodeHelper.useCoalesce(nodeId, "innerRadius", "innerRadius", globals);
   const outerRadius = nodeHelper.useCoalesce(nodeId, "outerRadius", "outerRadius", globals);

   const positionMode = nodeHelper.useValue(nodeId, "positionMode");
   const positionX = nodeHelper.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHelper.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHelper.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHelper.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHelper.useCoalesce(nodeId, "rotation", "rotation", globals);

   const thetaMode = nodeHelper.useValue(nodeId, "thetaMode");
   const thetaStart = nodeHelper.useCoalesce(nodeId, "thetaStart", "thetaStart", globals);
   const thetaEnd = nodeHelper.useCoalesce(nodeId, "thetaEnd", "thetaEnd", globals);
   const thetaSteps = nodeHelper.useCoalesce(nodeId, "thetaSteps", "thetaSteps", globals);
   const thetaInclusive = nodeHelper.useValue(nodeId, "thetaInclusive");
   const thetaCurve = nodeHelper.useInput(nodeId, "thetaCurve", globals);

   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const strokeCap = nodeHelper.useValue(nodeId, "strokeCap");

   const [MarkStart, msId] = nodeHelper.useInputNode(nodeId, "strokeMarkStart", globals);
   const [MarkEnd, meId] = nodeHelper.useInputNode(nodeId, "strokeMarkEnd", globals);
   const strokeMarkAlign = nodeHelper.useValue(nodeId, "strokeMarkAlign");

   const rI = radialMode === "inout" ? MathHelper.lengthToPx(innerRadius) : MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(spread) / 2;
   const rO = radialMode === "inout" ? MathHelper.lengthToPx(outerRadius) : MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(spread) / 2;

   const points = useMemo(() => {
      return lodash.range(spurCount).map((n) => {
         const coeff = MathHelper.delerp(n, 0, thetaInclusive ? spurCount - 1 : spurCount);
         const angle =
            thetaMode === "startstop"
               ? MathHelper.lerp(coeff, 1 * thetaStart, 1 * thetaEnd, { curveFn: thetaCurve?.curveFn ?? "linear", easing: thetaCurve?.easing ?? "in" })
               : thetaSteps * n;
         const c = Math.cos(MathHelper.deg2rad(angle - 90));
         const s = Math.sin(MathHelper.deg2rad(angle - 90));
         return <line key={n} x1={rI * c} y1={rI * s} x2={rO * c} y2={rO * s} />;
      });
   }, [rI, rO, spurCount, thetaCurve?.curveFn, thetaCurve?.easing, thetaEnd, thetaInclusive, thetaMode, thetaStart, thetaSteps]);

   return (
      <g style={{ transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation}deg)` }}>
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
               <g style={{ transform: strokeMarkAlign ? `rotate(-90deg)` : "" }}>
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
               <g style={{ transform: strokeMarkAlign ? `rotate(-90deg)` : "" }}>
                  <MarkEnd nodeId={meId} depth={(depth ?? "") + `_${nodeId}.markEnd`} globals={globals} />
               </g>
            </marker>
         )}
         <g
            stroke={MathHelper.colorToHTML(strokeColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx(strokeWidth))}
            strokeLinecap={strokeCap}
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
      spread: { value: 20, unit: "px" },
      radialMode: "inout",
      thetaMode: "incremental",
      spurCount: 5,
      innerRadius: { value: 140, unit: "px" },
      outerRadius: { value: 160, unit: "px" },
      thetaStart: 0,
      thetaEnd: 90,
      thetaSteps: 30,
      thetaInclusive: true,

      strokeWidth: { value: 1, unit: "px" },
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
