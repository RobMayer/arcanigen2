import { memo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, Interpolator } from "../types";
import { CurvePreset, CURVE_PRESET_OPTIONS, EasingMode, EASING_MODE_OPTIONS, CurvePresets, EasingModes, NodeTypes, SocketTypes } from "../../../../utility/enums";

import BaseNode from "../../nodeView/node";
import { SocketOut } from "../../nodeView/socket";
import NativeDropdown from "!/components/selectors/NativeDropdown";
import ToggleList from "!/components/selectors/ToggleList";
import SliderInputOld from "!/components/inputs/SliderInput";
import { MetaPrefab } from "../../nodeView/prefabs";
import { nodeIcons } from "../icons";

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
                <NativeDropdown value={curveFn} onSelect={setCurveFn} options={CURVE_PRESET_OPTIONS} />
            </BaseNode.Input>
            <BaseNode.Input label={"Easing"}>
                <ToggleList value={easing} onSelect={setEasing} options={EASING_MODE_OPTIONS} />
            </BaseNode.Input>
            <BaseNode.Input label={"Intensity"}>
                <SliderInputOld value={intensity} onValidValue={setIntensity} min={0} max={1} />
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
    buttonIcon: nodeIcons.curveValue.buttonIcon,
    nodeIcon: nodeIcons.curveValue.nodeIcon,
    flavour: "info",
    type: NodeTypes.VALUE_CURVE,
    getOutput,
    initialize: () => ({
        curveFn: CurvePresets.LINEAR,
        easing: EasingModes.IN,
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
    [CurvePresets.LINEAR]: (t: number) => t,
    [CurvePresets.SEMIQUADRATIC]: (t: number) => Math.pow(t, 1.5),
    [CurvePresets.QUADRATIC]: (t: number) => Math.pow(t, 2),
    [CurvePresets.CUBIC]: (t: number) => Math.pow(t, 3),
    [CurvePresets.EXPONENTIAL]: (t: number) => Math.pow(2, t) - 1,
    [CurvePresets.SINUSOIDAL]: (t: number) => Math.sin(t * (Math.PI / 2)),
    [CurvePresets.ROOTIC]: (t: number) => Math.sqrt(t),
    [CurvePresets.CIRCULAR]: (t: number) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
};

const getEasedCurve = (e: EasingMode, func: (t: number) => number) => {
    switch (e) {
        case EasingModes.IN:
            return (a: number) => func(a);
        case EasingModes.OUT:
            return (a: number) => 1 - func(1 - a);
        case EasingModes.INOUT:
            return (a: number) => (a < 0.5 ? func(a * 2) / 2 : a > 0.5 ? 1 - func(a * -2 + 2) / 2 : 0.5);
        case EasingModes.OUTIN:
            return (a: number) => (a < 0.5 ? 0.5 - func(1 - a * 2) / 2 : a > 0.5 ? 0.5 + func(a * 2 - 1) / 2 : 0.5);
    }
};
