import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
   ControlRendererProps,
   GraphGlobals,
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeRendererProps,
   Sequence,
   Interpolator,
} from "../types";
import {
   PositionMode,
   SpanMode,
   SPAN_MODE_OPTIONS,
   ThetaMode,
   THETA_MODE_OPTIONS,
   SpanModes,
   ThetaModes,
   NodeTypes,
   SocketTypes,
   PositionModes,
} from "../../../../utility/enums";
import MathHelper from "!/utility/mathhelper";

import { faBezierCurve as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faBezierCurve as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import LengthInput from "!/components/inputs/LengthInput";
import SliderInput from "!/components/inputs/SliderInput";
import { Length } from "!/utility/types/units";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import lodash from "lodash";
import Checkbox from "!/components/buttons/Checkbox";
import ToggleList from "!/components/selectors/ToggleList";
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import AngleInput from "!/components/inputs/AngleInput";
import BaseNode from "../../nodeView/node";

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
      thetaCurve: Interpolator;
      radialCurve: Interpolator;

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
      radialMode: SpanMode;
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

const nodeHooks = ArcaneGraph.nodeHooks<ISpiralArrayNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [pointCount, setPointCount] = nodeHooks.useValueState(nodeId, "pointCount");
   const [isRotating, setIsRotating] = nodeHooks.useValueState(nodeId, "isRotating");

   const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
   const [spread, setSpread] = nodeHooks.useValueState(nodeId, "spread");
   const [radialMode, setRadialMode] = nodeHooks.useValueState(nodeId, "radialMode");
   const [innerRadius, setInnerRadius] = nodeHooks.useValueState(nodeId, "innerRadius");
   const [outerRadius, setOuterRadius] = nodeHooks.useValueState(nodeId, "outerRadius");

   const [thetaMode, setThetaMode] = nodeHooks.useValueState(nodeId, "thetaMode");
   const [thetaStart, setThetaStart] = nodeHooks.useValueState(nodeId, "thetaStart");
   const [thetaEnd, setThetaEnd] = nodeHooks.useValueState(nodeId, "thetaEnd");
   const [thetaSteps, setThetaSteps] = nodeHooks.useValueState(nodeId, "thetaSteps");
   const [thetaInclusive, setThetaInclusive] = nodeHooks.useValueState(nodeId, "thetaInclusive");

   const hasPointCount = nodeHooks.useHasLink(nodeId, "pointCount");
   const hasThetaStart = nodeHooks.useHasLink(nodeId, "thetaStart");
   const hasThetaEnd = nodeHooks.useHasLink(nodeId, "thetaEnd");
   const hasThetaSteps = nodeHooks.useHasLink(nodeId, "thetaSteps");

   const hasInnerRadius = nodeHooks.useHasLink(nodeId, "innerRadius");
   const hasOuterRadius = nodeHooks.useHasLink(nodeId, "outerRadius");
   const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
   const hasSpread = nodeHooks.useHasLink(nodeId, "spread");

   return (
      <BaseNode<ISpiralArrayNode> nodeId={nodeId} helper={SpiralArrayNodeHelper} hooks={nodeHooks}>
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
            <ToggleList value={radialMode} onValue={setRadialMode} options={SPAN_MODE_OPTIONS} />
         </BaseNode.Input>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Inner Radius"}>
               <LengthInput value={innerRadius} onValidValue={setInnerRadius} disabled={hasInnerRadius || radialMode === SpanModes.SPREAD} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Outer Radius"}>
               <LengthInput value={outerRadius} onValidValue={setOuterRadius} disabled={hasOuterRadius || radialMode === SpanModes.SPREAD} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius || radialMode === SpanModes.INOUT} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Spread"}>
               <LengthInput value={spread} onValidValue={setSpread} disabled={hasSpread || radialMode === SpanModes.INOUT} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"radialCurve"} type={SocketTypes.CURVE}>
            Radial Distribution
         </SocketIn>
         <hr />
         <BaseNode.Input label={"Theta Mode"}>
            <ToggleList value={thetaMode} onValue={setThetaMode} options={THETA_MODE_OPTIONS} />
         </BaseNode.Input>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"thetaSteps"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Incremental θ"}>
               <AngleInput value={thetaSteps} onValidValue={setThetaSteps} disabled={hasThetaSteps || thetaMode === ThetaModes.STARTSTOP} wrap />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"thetaStart"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Start θ"}>
               <AngleInput value={thetaStart} onValidValue={setThetaStart} disabled={hasThetaStart || thetaMode === ThetaModes.INCREMENTAL} wrap />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"thetaEnd"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"End θ"}>
               <AngleInput value={thetaEnd} onValidValue={setThetaEnd} disabled={hasThetaEnd || thetaMode === ThetaModes.INCREMENTAL} wrap />
            </BaseNode.Input>
         </SocketIn>
         <Checkbox checked={thetaInclusive} onToggle={setThetaInclusive} disabled={thetaMode === ThetaModes.INCREMENTAL}>
            Inclusive End θ
         </Checkbox>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
            θ Distribution
         </SocketIn>
         <Checkbox checked={isRotating} onToggle={setIsRotating}>
            Rotate Iterations
         </Checkbox>
         <hr />
         <TransformPrefabs.Full<ISpiralArrayNode> nodeId={nodeId} hooks={nodeHooks} />
         <SocketOut<ISpiralArrayNode> nodeId={nodeId} socketId={"sequence"} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketOut>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const [output, childNodeId] = nodeHooks.useInputNode(nodeId, "input", globals);

   const pointCount = Math.min(24, Math.max(3, nodeHooks.useCoalesce(nodeId, "pointCount", "pointCount", globals)));
   const isRotating = nodeHooks.useValue(nodeId, "isRotating");

   const radialMode = nodeHooks.useValue(nodeId, "radialMode");
   const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
   const spread = nodeHooks.useCoalesce(nodeId, "spread", "spread", globals);
   const innerRadius = nodeHooks.useCoalesce(nodeId, "innerRadius", "innerRadius", globals);
   const outerRadius = nodeHooks.useCoalesce(nodeId, "outerRadius", "outerRadius", globals);

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
   const radialCurve = nodeHooks.useInput(nodeId, "radialCurve", globals);

   const rI = radialMode === SpanModes.INOUT ? MathHelper.lengthToPx(innerRadius) : MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(spread) / 2;
   const rO = radialMode === SpanModes.INOUT ? MathHelper.lengthToPx(outerRadius) : MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(spread) / 2;

   const children = useMemo(() => {
      return lodash.range(pointCount).map((n, i) => {
         const coeff = MathHelper.delerp(n, 0, thetaInclusive ? pointCount - 1 : pointCount);
         const rot =
            thetaMode === ThetaModes.STARTSTOP
               ? MathHelper.lerp(coeff, 1 * thetaStart, 1 * thetaEnd, thetaCurve ?? MathHelper.DEFUALT_INTERPOLATOR)
               : MathHelper.lerp(coeff, 0, pointCount * thetaSteps, thetaCurve ?? MathHelper.DEFUALT_INTERPOLATOR);

         // const rot = MathHelper.lerp(coeff, 0, 360) - 180;
         const rad = MathHelper.lerp(coeff, rI, rO, radialCurve ?? MathHelper.DEFUALT_INTERPOLATOR);

         return (
            <g key={n} transform={`rotate(${rot + 180}) translate(0, ${rad})`}>
               <g key={n} transform={`rotate(${isRotating ? 180 : -rot - 180})`}>
                  {output && childNodeId && (
                     <Each overrides={overrides} output={output} nodeId={childNodeId} host={nodeId} depth={depth} globals={globals} index={i} />
                  )}
               </g>
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
      radialCurve,
      thetaCurve,
      overrides,
   ]);

   return <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}>{children}</g>;
});

const Each = ({
   nodeId,
   globals,
   depth,
   index,
   host,
   output: Output,
   overrides,
}: NodeRendererProps & { index: number; host: string; output: NodeRenderer }) => {
   const newGlobals = useMemo(() => {
      return {
         ...globals,
         sequenceData: {
            ...globals.sequenceData,
            [host]: index,
         },
      };
   }, [globals, host, index]);

   return <Output nodeId={nodeId} globals={newGlobals} depth={(depth ?? "") + `_${host}.${index}`} overrides={overrides} />;
};

const nodeMethods = ArcaneGraph.nodeMethods<ISpiralArrayNode>();

const SpiralArrayNodeHelper: INodeHelper<ISpiralArrayNode> = {
   name: "Spiral Array",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.ARRAY_SPIRAL,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof ISpiralArrayNode["outputs"], globals: GraphGlobals) => {
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
      radialMode: SpanModes.INOUT,
      thetaMode: ThetaModes.INCREMENTAL,
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
      positionMode: PositionModes.CARTESIAN,
      rotation: 0,
   }),
   controls: Controls,
};

export default SpiralArrayNodeHelper;
