import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper, Sequence, Interpolator } from "../types";
import { AngleLerpMode, ANGLE_LERP_MODE_OPTIONS, ColorSpace, COLOR_SPACE_OPTIONS, AngleLerpModes, NodeTypes, SocketTypes } from "../../../../utility/enums";
import MathHelper from "!/utility/mathhelper";

import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import { Icon } from "!/components/icons";
import styled from "styled-components";
import { Color } from "!/utility/types/units";
import HexColorInput from "!/components/inputs/colorHexInput";
import NativeDropdown from "!/components/selectors/NativeDropdown";
import SliderInputOld from "!/components/inputs/SliderInput";
import CheckBox from "!/components/buttons/Checkbox";
import { MetaPrefab } from "../../nodeView/prefabs";
import { nodeIcons } from "../icons";
import { iconNoticeWarning } from "../../../../components/icons/notice/warning";

interface ILerpColorNode extends INodeDefinition {
    inputs: {
        from: Color;
        to: Color;
        percent: number;
        sequence: Sequence;
        distribution: Interpolator;
    };
    outputs: {
        value: Color;
    };
    values: {
        from: Color;
        to: Color;
        percent: number;
        colorSpace: ColorSpace;
        hueMode: AngleLerpMode;
        isInclusive: boolean;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<ILerpColorNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [from, setFrom] = nodeHooks.useValueState(nodeId, "from");
    const [to, setTo] = nodeHooks.useValueState(nodeId, "to");
    const [percent, setPercent] = nodeHooks.useValueState(nodeId, "percent");
    const [isInclusive, setIsInclusive] = nodeHooks.useValueState(nodeId, "isInclusive");

    const hasSequence = nodeHooks.useHasLink(nodeId, "sequence");
    const hasFrom = nodeHooks.useHasLink(nodeId, "from");
    const hasTo = nodeHooks.useHasLink(nodeId, "to");

    const [colorSpace, setColorSpace] = nodeHooks.useValueState(nodeId, "colorSpace");
    const [hueMode, setHueMode] = nodeHooks.useValueState(nodeId, "hueMode");

    return (
        <BaseNode<ILerpColorNode> nodeId={nodeId} helper={LerpColorNodeHelper} hooks={nodeHooks}>
            <SocketOut<ILerpColorNode> socketId={"value"} nodeId={nodeId} type={SocketTypes.COLOR}>
                <BaseNode.Output label={"Value"}>
                    {hasSequence ? (
                        <Warning title={"This will be calculated during the render"}>
                            <Icon value={iconNoticeWarning} />
                            Varies
                        </Warning>
                    ) : (
                        percent
                    )}
                </BaseNode.Output>
            </SocketOut>
            <hr />
            <SocketIn<ILerpColorNode> socketId={"sequence"} nodeId={nodeId} type={SocketTypes.SEQUENCE}>
                Sequence
            </SocketIn>
            <SocketIn<ILerpColorNode> socketId={"from"} nodeId={nodeId} type={SocketTypes.COLOR}>
                <BaseNode.Input label={"From"}>
                    <HexColorInput nullable alpha value={from} onValue={setFrom} disabled={hasFrom} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<ILerpColorNode> socketId={"to"} nodeId={nodeId} type={SocketTypes.COLOR}>
                <BaseNode.Input label={"To"}>
                    <HexColorInput nullable alpha value={to} onValue={setTo} disabled={hasTo} />
                </BaseNode.Input>
            </SocketIn>
            <hr />
            <BaseNode.Input label={"Color Space"}>
                <NativeDropdown value={colorSpace} onSelect={setColorSpace} options={COLOR_SPACE_OPTIONS} />
            </BaseNode.Input>
            <BaseNode.Input label={"Hue Direction"}>
                <NativeDropdown value={hueMode} onSelect={setHueMode} options={ANGLE_LERP_MODE_OPTIONS} disabled={!HAS_HUE.includes(colorSpace)} />
            </BaseNode.Input>
            <CheckBox checked={isInclusive} onToggle={setIsInclusive} disabled={!hasSequence}>
                Inclusive
            </CheckBox>
            <hr />
            <SocketIn<ILerpColorNode> socketId={"distribution"} nodeId={nodeId} type={SocketTypes.CURVE}>
                Value Distribution
            </SocketIn>
            <SocketIn<ILerpColorNode> socketId={"percent"} nodeId={nodeId} type={SocketTypes.PERCENT}>
                <BaseNode.Input label={"Percent"}>
                    <SliderInputOld value={percent} onValidValue={setPercent} disabled={hasSequence} min={0} max={1} />
                </BaseNode.Input>
            </SocketIn>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const nodeMethods = ArcaneGraph.nodeMethods<ILerpColorNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof ILerpColorNode["outputs"], globals: GraphGlobals) => {
    const sequence = nodeMethods.getInput(graph, nodeId, "sequence", globals);

    const percent = nodeMethods.coalesce(graph, nodeId, "percent", "percent", globals);
    const from = nodeMethods.coalesce(graph, nodeId, "from", "from", globals);
    const to = nodeMethods.coalesce(graph, nodeId, "to", "to", globals);

    const colorSpace = nodeMethods.getValue(graph, nodeId, "colorSpace");
    const hueMode = nodeMethods.getValue(graph, nodeId, "hueMode");
    const distribution = nodeMethods.getInput(graph, nodeId, "distribution", globals);

    const isInclusive = nodeMethods.getValue(graph, nodeId, "isInclusive");

    if (sequence) {
        const iter = globals.sequenceData[sequence.senderId] ?? sequence.min;
        const t = MathHelper.delerp(iter, sequence.min, sequence.max - (isInclusive ? 1 : 0));
        return MathHelper.colorLerp(t, from, to, colorSpace, hueMode, distribution);
    }

    return MathHelper.colorLerp(MathHelper.clamp(percent, 0, 1), from, to, colorSpace, hueMode, distribution);

    //TODO: How do I get sequence data from here?!?
};

const LerpColorNodeHelper: INodeHelper<ILerpColorNode> = {
    name: "Color Lerp",
    buttonIcon: nodeIcons.lerp.buttonIcon,
    nodeIcon: nodeIcons.lerp.nodeIcon,
    flavour: "help",
    type: NodeTypes.LERP_COLOR,
    getOutput,
    initialize: () => ({
        from: { r: 0, g: 0, b: 0, a: 1 },
        to: { r: 1, g: 1, b: 1, a: 1 },
        percent: 0,
        colorSpace: "RGB",
        hueMode: AngleLerpModes.CLOSEST_CW,
        isInclusive: true,
    }),
    controls: Controls,
};

export default LerpColorNodeHelper;

const Warning = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.5em;
    color: var(--danger-icon);
    cursor: default;
`;

const HAS_HUE: ColorSpace[] = ["HSL", "HSV", "HWK", "HSI", "HCY"];
