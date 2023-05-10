import { memo } from "react";
import ArcaneGraph from "../graph";
import {
   CurvePreset,
   CURVE_PRESETS,
   EasingMode,
   EASING_MODES,
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeTypes,
   SocketTypes,
   Interpolator,
} from "../types";

import { faFunction as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faFunction as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import BaseNode from "../../nodeView/node";
import { SocketOut } from "../../nodeView/socket";
import Dropdown from "!/components/selectors/Dropdown";
import ToggleList from "!/components/selectors/ToggleList";
import SliderInput from "!/components/inputs/SliderInput";
import { MetaPrefab } from "../../nodeView/prefabs";

interface ICurveNode extends INodeDefinition {
   inputs: {};
   outputs: {
      output: Interpolator;
   };
   values: {
      curveFn: CurvePreset;
      easing: EasingMode;
      intensity: number;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<ICurveNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [curveFn, setCurveFn] = nodeHooks.useValueState(nodeId, "curveFn");
   const [easing, setEasing] = nodeHooks.useValueState(nodeId, "easing");
   const [intensity, setIntensity] = nodeHooks.useValueState(nodeId, "intensity");

   return (
      <BaseNode<ICurveNode> nodeId={nodeId} helper={CurveNodeHelper} hooks={nodeHooks}>
         <SocketOut<ICurveNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.CURVE}>
            Function
         </SocketOut>
         <hr />
         <BaseNode.Input label={"Curve"}>
            <Dropdown value={curveFn} onValue={setCurveFn} options={CURVE_PRESETS} />
         </BaseNode.Input>
         <BaseNode.Input label={"Easing"}>
            <ToggleList value={easing} onValue={setEasing} options={EASING_MODES} />
         </BaseNode.Input>
         <BaseNode.Input label={"Intensity"}>
            <SliderInput value={intensity} onValidValue={setIntensity} min={0} max={1} />
         </BaseNode.Input>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<ICurveNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof ICurveNode["outputs"]) => {
   const curveFn = nodeMethods.getValue(graph, nodeId, "curveFn");
   const easing = nodeMethods.getValue(graph, nodeId, "easing");
   const intensity = nodeMethods.getValue(graph, nodeId, "intensity");

   return getPrefabInterpolator(curveFn, easing, intensity);
};

const CurveNodeHelper: INodeHelper<ICurveNode> = {
   name: "Curve",
   buttonIcon,
   nodeIcon,
   flavour: "info",
   type: NodeTypes.VALUE_CURVE,
   getOutput,
   initialize: () => ({
      curveFn: "linear",
      easing: "in",
      intensity: 1,
   }),
   controls: Controls,
};

export default CurveNodeHelper;

const getPrefabInterpolator = (curve: CurvePreset, easing: EasingMode, i: number) => {
   const easedCurve = getEasedCurve(easing, CURVE_HANDLERS[curve]);
   return (t: number) => {
      return t + i * (easedCurve(t) - t);
   };
};

const CURVE_HANDLERS: { [keys in CurvePreset]: (t: number) => number } = {
   linear: (t: number) => t,
   semiquadratic: (t: number) => Math.pow(t, 1.5),
   quadratic: (t: number) => Math.pow(t, 2),
   cubic: (t: number) => Math.pow(t, 3),
   exponential: (t: number) => Math.pow(2, t) - 1,
   sinusoidal: (t: number) => Math.sin(t * (Math.PI / 2)),
   rootic: (t: number) => Math.sqrt(t),
   circular: (t: number) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
};

const getEasedCurve = (e: EasingMode, func: (t: number) => number) => {
   switch (e) {
      case "in":
         return (a: number) => func(a);
      case "out":
         return (a: number) => 1 - func(1 - a);
      case "inout":
         return (a: number) => (a < 0.5 ? func(a * 2) / 2 : a > 0.5 ? 1 - func(a * -2 + 2) / 2 : 0.5);
      case "outin":
         return (a: number) => (a < 0.5 ? 0.5 - func(1 - a * 2) / 2 : a > 0.5 ? 0.5 + func(a * 2 - 1) / 2 : 0.5);
   }
};
