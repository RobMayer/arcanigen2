import { memo, useMemo } from "react";
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
   RadialMode,
   RADIAL_MODES,
   Sequence,
   SocketTypes,
   ThetaMode,
   THETA_MODES,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { faBezierCurve as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faBezierCurve as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import LengthInput from "!/components/inputs/LengthInput";
import SliderInput from "!/components/inputs/SliderInput";
import { Length } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import lodash from "lodash";
import Checkbox from "!/components/buttons/Checkbox";
import ToggleList from "!/components/selectors/ToggleList";
import { TransformPrefabs } from "../../nodeView/prefabs";
import AngleInput from "!/components/inputs/AngleInput";

interface ISpiralArrayNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      pointCount: number;
      radius: Length;
      spread: Length;
      innerRadius: Length;
      outerRadius: Length;
      thetaStart: number;
      thetaEnd: number;
      thetaSteps: number;
      thetaCurve: Curve;
      radialCurve: Curve;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      rotation: number;
   };
   outputs: {
      output: NodeRenderer;
      sequence: Sequence;
   };
   values: {
      pointCount: number;
      isRotating: boolean;
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

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<ISpiralArrayNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [pointCount, setPointCount] = nodeHelper.useValueState(nodeId, "pointCount");
   const [isRotating, setIsRotating] = nodeHelper.useValueState(nodeId, "isRotating");

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

   const hasPointCount = nodeHelper.useHasLink(nodeId, "pointCount");
   const hasThetaStart = nodeHelper.useHasLink(nodeId, "thetaStart");
   const hasThetaEnd = nodeHelper.useHasLink(nodeId, "thetaEnd");
   const hasThetaSteps = nodeHelper.useHasLink(nodeId, "thetaSteps");

   const hasInnerRadius = nodeHelper.useHasLink(nodeId, "innerRadius");
   const hasOuterRadius = nodeHelper.useHasLink(nodeId, "outerRadius");
   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasSpread = nodeHelper.useHasLink(nodeId, "spread");

   return (
      <BaseNode<ISpiralArrayNode> nodeId={nodeId} helper={SpiralArrayNodeHelper}>
         <SocketOut<ISpiralArrayNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
            Input
         </SocketIn>
         <hr />
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"pointCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Points"}>
               <SliderInput revertInvalid value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} disabled={hasPointCount} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Radial Mode"}>
            <ToggleList value={radialMode} onValue={setRadialMode} options={RADIAL_MODES} />
         </BaseNode.Input>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Inner Radius"}>
               <LengthInput value={innerRadius} onValidValue={setInnerRadius} disabled={hasInnerRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Outer Radius"}>
               <LengthInput value={outerRadius} onValidValue={setOuterRadius} disabled={hasOuterRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Spread"}>
               <LengthInput value={spread} onValidValue={setSpread} disabled={hasSpread || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"radialCurve"} type={SocketTypes.CURVE}>
            Radial Distribution
         </SocketIn>
         <hr />
         <BaseNode.Input label={"Theta Mode"}>
            <ToggleList value={thetaMode} onValue={setThetaMode} options={THETA_MODES} />
         </BaseNode.Input>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"thetaSteps"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Incremental θ"}>
               <AngleInput value={thetaSteps} onValidValue={setThetaSteps} disabled={hasThetaSteps || thetaMode === "startstop"} wrap />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"thetaStart"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Start θ"}>
               <AngleInput value={thetaStart} onValidValue={setThetaStart} disabled={hasThetaStart || thetaMode === "incremental"} wrap />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"thetaEnd"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"End θ"}>
               <AngleInput value={thetaEnd} onValidValue={setThetaEnd} disabled={hasThetaEnd || thetaMode === "incremental"} wrap />
            </BaseNode.Input>
         </SocketIn>
         <Checkbox checked={thetaInclusive} onToggle={setThetaInclusive} disabled={thetaMode === "incremental"}>
            Inclusive End θ
         </Checkbox>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
            θ Distribution
         </SocketIn>
         <Checkbox checked={isRotating} onToggle={setIsRotating}>
            Rotate Iterations
         </Checkbox>
         <hr />
         <TransformPrefabs.Full<ISpiralArrayNode> nodeId={nodeId} nodeHelper={nodeHelper} />
         <hr />
         <SocketOut<ISpiralArrayNode> nodeId={nodeId} socketId={"sequence"} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketOut>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals }: NodeRendererProps) => {
   const [output, childNodeId] = nodeHelper.useInputNode(nodeId, "input", globals);

   const pointCount = Math.min(24, Math.max(3, nodeHelper.useCoalesce(nodeId, "pointCount", "pointCount", globals)));
   const isRotating = nodeHelper.useValue(nodeId, "isRotating");

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
   const radialCurve = nodeHelper.useInput(nodeId, "radialCurve", globals);

   const rI = radialMode === "inout" ? MathHelper.lengthToPx(innerRadius) : MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(spread) / 2;
   const rO = radialMode === "inout" ? MathHelper.lengthToPx(outerRadius) : MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(spread) / 2;

   const children = useMemo(() => {
      return lodash.range(pointCount).map((n, i) => {
         const coeff = MathHelper.delerp(n, 0, thetaInclusive ? pointCount - 1 : pointCount);
         const rot =
            thetaMode === "startstop"
               ? MathHelper.lerp(coeff, 1 * thetaStart, 1 * thetaEnd, { curveFn: thetaCurve?.curveFn ?? "linear", easing: thetaCurve?.easing ?? "in" })
               : thetaSteps * n;

         // const rot = MathHelper.lerp(coeff, 0, 360) - 180;
         const rad = MathHelper.lerp(coeff, rI, rO, { curveFn: radialCurve?.curveFn ?? "linear", easing: radialCurve?.easing ?? "in" });

         return (
            <g key={n} style={{ transform: `rotate(${rot + 180}deg) translate(0px, ${rad}px) rotate(${isRotating ? 180 : -rot - 180}deg)` }}>
               {output && childNodeId && <Each output={output} nodeId={childNodeId} host={nodeId} depth={depth} globals={globals} index={i} />}
            </g>
         );
      });
   }, [
      pointCount,
      thetaMode,
      thetaStart,
      thetaEnd,
      thetaSteps,
      rI,
      rO,
      isRotating,
      output,
      childNodeId,
      thetaInclusive,
      nodeId,
      depth,
      globals,
      radialCurve?.curveFn,
      radialCurve?.easing,
      thetaCurve?.curveFn,
      thetaCurve?.easing,
   ]);

   return (
      <g style={{ transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation}deg)` }}>
         {children}
      </g>
   );
});

const Each = ({ nodeId, globals, depth, index, host, output: Output }: NodeRendererProps & { index: number; host: string; output: NodeRenderer }) => {
   const newGlobals = useMemo(() => {
      return {
         ...globals,
         sequenceData: {
            ...globals.sequenceData,
            [host]: index,
         },
      };
   }, [globals, host, index]);

   return <Output nodeId={nodeId} globals={newGlobals} depth={(depth ?? "") + `_${host}.${index}`} />;
};

const nodeMethods = ArcaneGraph.nodeMethods<ISpiralArrayNode>();

const SpiralArrayNodeHelper: INodeHelper<ISpiralArrayNode> = {
   name: "Spiral Array",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.ARRAY_SPIRAL,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof ISpiralArrayNode["outputs"], globals: Globals) => {
      switch (socket) {
         case "output":
            return Renderer;
         case "sequence":
            return {
               senderId: nodeId,
               min: 0,
               max: nodeMethods.coalesce(graph, nodeId, "pointCount", "pointCount", globals),
            };
      }
   },
   initialize: () => ({
      pointCount: 5,
      isRotating: true,
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

      positionX: { value: 0, unit: "px" },
      positionY: { value: 0, unit: "px" },
      positionRadius: { value: 0, unit: "px" },
      positionTheta: 0,
      positionMode: "cartesian",
      rotation: 0,
   }),
   controls: Controls,
};

export default SpiralArrayNodeHelper;
