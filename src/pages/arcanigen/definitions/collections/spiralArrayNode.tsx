import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeRendererProps,
   NodeTypes,
   RadialMode,
   RADIAL_MODES,
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
import NumberInput from "!/components/inputs/NumberInput";
import ToggleList from "!/components/selectors/ToggleList";

interface ISpiralArrayNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      radius: Length;
      spread: Length;
      innerRadius: Length;
      outerRadius: Length;
      thetaStart: number;
      thetaEnd: number;
      thetaSteps: number;
   };
   outputs: {
      output: NodeRenderer;
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
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<ISpiralArrayNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
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
         <BaseNode.Input label={"Points"}>
            <SliderInput revertInvalid value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} />
         </BaseNode.Input>
         <BaseNode.Input label={"Radial Mode"}>
            <ToggleList value={radialMode} onValue={setRadialMode} options={RADIAL_MODES} />
         </BaseNode.Input>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Inner Radius"}>
               <LengthInput className={"inline small"} value={innerRadius} onChange={setInnerRadius} disabled={hasInnerRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Outer Radius"}>
               <LengthInput className={"inline small"} value={outerRadius} onChange={setOuterRadius} disabled={hasOuterRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput className={"inline small"} value={radius} onChange={setRadius} disabled={hasRadius || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Spread"}>
               <LengthInput className={"inline small"} value={spread} onChange={setSpread} disabled={hasSpread || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <BaseNode.Input label={"Theta Mode"}>
            <ToggleList value={thetaMode} onValue={setThetaMode} options={THETA_MODES} />
         </BaseNode.Input>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"thetaSteps"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Incremental θ"}>
               <NumberInput value={thetaSteps} onValidValue={setThetaSteps} disabled={hasThetaSteps || thetaMode === "startstop"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"thetaStart"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Start θ"}>
               <NumberInput value={thetaStart} onValidValue={setThetaStart} disabled={hasThetaStart || thetaMode === "incremental"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ISpiralArrayNode> nodeId={nodeId} socketId={"thetaEnd"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"End θ"}>
               <NumberInput value={thetaEnd} onValidValue={setThetaEnd} disabled={hasThetaEnd || thetaMode === "incremental"} />
            </BaseNode.Input>
         </SocketIn>
         <Checkbox checked={thetaInclusive} onToggle={setThetaInclusive} disabled={thetaMode === "incremental"}>
            Inclusive End θ
         </Checkbox>
         <hr />
         <Checkbox checked={isRotating} onToggle={setIsRotating}>
            Rotate Iterations
         </Checkbox>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, layer }: NodeRendererProps) => {
   const [Output, childNodeId] = nodeHelper.useInputNode(nodeId, "input");

   const pointCount = nodeHelper.useValue(nodeId, "pointCount");
   const isRotating = nodeHelper.useValue(nodeId, "isRotating");

   const radialMode = nodeHelper.useValue(nodeId, "radialMode");
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius");
   const spread = nodeHelper.useCoalesce(nodeId, "spread", "spread");
   const innerRadius = nodeHelper.useCoalesce(nodeId, "innerRadius", "innerRadius");
   const outerRadius = nodeHelper.useCoalesce(nodeId, "outerRadius", "outerRadius");

   const thetaMode = nodeHelper.useValue(nodeId, "thetaMode");
   const thetaStart = nodeHelper.useCoalesce(nodeId, "thetaStart", "thetaStart");
   const thetaEnd = nodeHelper.useCoalesce(nodeId, "thetaEnd", "thetaEnd");
   const thetaSteps = nodeHelper.useCoalesce(nodeId, "thetaSteps", "thetaSteps");
   const thetaInclusive = nodeHelper.useValue(nodeId, "thetaInclusive");

   const rI = radialMode === "inout" ? MathHelper.lengthToPx(innerRadius) : MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(spread) / 2;
   const rO = radialMode === "inout" ? MathHelper.lengthToPx(outerRadius) : MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(spread) / 2;

   const children = useMemo(() => {
      return lodash.range(pointCount).map((n, i) => {
         const coeff = MathHelper.delerp(n, 0, thetaInclusive ? pointCount - 1 : pointCount);
         const rot = thetaMode === "startstop" ? MathHelper.lerp(coeff, 1 * thetaStart, 1 * thetaEnd) : thetaSteps * n;

         // const rot = MathHelper.lerp(coeff, 0, 360) - 180;
         const rad = MathHelper.lerp(coeff, rI, rO);

         return (
            <g key={n} style={{ transform: `rotate(${rot + 180}deg) translate(0px, ${rad}px) rotate(${isRotating ? 180 : -rot - 180}deg)` }}>
               {Output && childNodeId && <Output nodeId={childNodeId} layer={(layer ?? "") + `_${nodeId}.${i}`} />}
            </g>
         );
      });
   }, [pointCount, thetaMode, thetaStart, thetaEnd, thetaSteps, rI, rO, isRotating, Output, childNodeId, thetaInclusive, nodeId, layer]);

   return <g>{children}</g>;
});

const SpiralArrayNodeHelper: INodeHelper<ISpiralArrayNode> = {
   name: "Spiral Array",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.ARRAY_SPIRAL,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof ISpiralArrayNode["outputs"]) => Renderer,
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
   }),
   controls: Controls,
};

export default SpiralArrayNodeHelper;
