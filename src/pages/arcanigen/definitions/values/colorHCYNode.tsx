import { HTMLAttributes, memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { HCY2color } from "!/utility/colorconvert";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInputOld from "!/components/inputs/SliderInput";
import MathHelper from "!/utility/mathhelper";
import styled from "styled-components";
import RotaryInput from "!/components/inputs/RotaryInput";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";
import { nodeIcons } from "../icons";

interface IColorHCYNode extends INodeDefinition {
    inputs: {
        hIn: number;
        cIn: number;
        yIn: number;
        aIn: number;
    };
    outputs: {
        value: Color;
    };
    values: {
        h: number;
        c: number;
        y: number;
        a: number;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IColorHCYNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [h, setH] = nodeHooks.useValueState(nodeId, "h");
    const [c, setC] = nodeHooks.useValueState(nodeId, "c");
    const [y, setY] = nodeHooks.useValueState(nodeId, "y");
    const [a, setA] = nodeHooks.useValueState(nodeId, "a");

    const hasHIn = nodeHooks.useHasLink(nodeId, "hIn");
    const hasCIn = nodeHooks.useHasLink(nodeId, "cIn");
    const hasYIn = nodeHooks.useHasLink(nodeId, "yIn");
    const hasAIn = nodeHooks.useHasLink(nodeId, "aIn");

    const actualH = nodeHooks.useCoalesce(nodeId, "hIn", "h", globals);
    const actualC = nodeHooks.useCoalesce(nodeId, "cIn", "c", globals);
    const actualY = nodeHooks.useCoalesce(nodeId, "yIn", "y", globals);
    const actualA = nodeHooks.useCoalesce(nodeId, "aIn", "a", globals);

    const res = useMemo(() => {
        return MathHelper.colorToHTML(
            HCY2color({
                h: MathHelper.mod(actualH, 360),
                c: MathHelper.clamp(actualC, 0, 1),
                y: MathHelper.clamp(actualY, 0, 1),
                a: MathHelper.clamp(actualA, 0, 1),
            })
        );
    }, [actualH, actualC, actualY, actualA]);

    return (
        <BaseNode<IColorHCYNode> nodeId={nodeId} helper={ColorHCYNodeHelper} hooks={nodeHooks}>
            <SocketOut<IColorHCYNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
                <Swatch value={res} />
            </SocketOut>
            <hr />
            <SocketIn<IColorHCYNode> nodeId={nodeId} socketId={"hIn"} type={SocketTypes.ANGLE}>
                <BaseNode.Input label={"Hue"}>
                    <RotaryInput value={h} onValidValue={setH} disabled={hasHIn} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IColorHCYNode> nodeId={nodeId} socketId={"cIn"} type={SocketTypes.PERCENT}>
                <BaseNode.Input label={"Chroma"}>
                    <SliderInputOld min={0} max={1} value={c} onValidValue={setC} disabled={hasCIn} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IColorHCYNode> nodeId={nodeId} socketId={"yIn"} type={SocketTypes.PERCENT}>
                <BaseNode.Input label={"Luminance"}>
                    <SliderInputOld min={0} max={1} value={y} onValidValue={setY} disabled={hasYIn} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IColorHCYNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.PERCENT}>
                <BaseNode.Input label={"Alpha"}>
                    <SliderInputOld min={0} max={1} value={a} onValidValue={setA} disabled={hasAIn} />
                </BaseNode.Input>
            </SocketIn>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorHCYNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorHCYNode["outputs"], globals: GraphGlobals) => {
    const h = MathHelper.mod(nodeMethods.coalesce(graph, nodeId, "hIn", "h", globals), 360);
    const c = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "cIn", "c", globals)));
    const y = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "yIn", "y", globals)));
    const a = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals)));
    return HCY2color({ h, c, y, a });
};

const ColorHCYNodeHelper: INodeHelper<IColorHCYNode> = {
    name: "Color (hcy)",
    buttonIcon: nodeIcons.colorValue.buttonIcon,
    nodeIcon: nodeIcons.colorValue.nodeIcon,
    flavour: "accent",
    type: NodeTypes.COLOR_HCY,
    getOutput,
    initialize: () => ({
        h: 0,
        c: 0,
        y: 1,
        a: 1,
    }),
    controls: Controls,
};

export default ColorHCYNodeHelper;

const Swatch = styled(({ value, ...props }: { value: string } & HTMLAttributes<HTMLDivElement>) => {
    const style = useMemo(() => {
        return { color: value };
    }, [value]);

    return <div {...props} style={style} />;
})`
    outline: 1px solid var(--effect-border-highlight);
    aspect-ratio: 1;
    width: 50%;
    background: currentColor;
    display: flex;
    justify-self: center;
    align-self: center;
    text-align: center;
    margin: 0.25em auto;
`;
