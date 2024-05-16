import { HTMLAttributes, memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { HWK2color } from "!/utility/colorconvert";
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

interface IColorHWKNode extends INodeDefinition {
    inputs: {
        hIn: number;
        wIn: number;
        kIn: number;
        aIn: number;
    };
    outputs: {
        value: Color;
    };
    values: {
        h: number;
        w: number;
        k: number;
        a: number;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IColorHWKNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [h, setH] = nodeHooks.useValueState(nodeId, "h");
    const [w, setW] = nodeHooks.useValueState(nodeId, "w");
    const [k, setK] = nodeHooks.useValueState(nodeId, "k");
    const [a, setA] = nodeHooks.useValueState(nodeId, "a");

    const hasHIn = nodeHooks.useHasLink(nodeId, "hIn");
    const hasWIn = nodeHooks.useHasLink(nodeId, "wIn");
    const hasKIn = nodeHooks.useHasLink(nodeId, "kIn");
    const hasAIn = nodeHooks.useHasLink(nodeId, "aIn");

    const actualH = nodeHooks.useCoalesce(nodeId, "hIn", "h", globals);
    const actualW = nodeHooks.useCoalesce(nodeId, "wIn", "w", globals);
    const actualK = nodeHooks.useCoalesce(nodeId, "kIn", "k", globals);
    const actualA = nodeHooks.useCoalesce(nodeId, "aIn", "a", globals);

    const res = useMemo(() => {
        return MathHelper.colorToHTML(
            HWK2color({
                h: MathHelper.mod(actualH, 360),
                w: MathHelper.clamp(actualW, 0, 1),
                k: MathHelper.clamp(actualK, 0, 1),
                a: MathHelper.clamp(actualA, 0, 1),
            })
        );
    }, [actualH, actualW, actualK, actualA]);

    return (
        <BaseNode<IColorHWKNode> nodeId={nodeId} helper={ColorHWKNodeHelper} hooks={nodeHooks}>
            <SocketOut<IColorHWKNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.COLOR}>
                <Swatch value={res} />
            </SocketOut>
            <hr />
            <SocketIn<IColorHWKNode> nodeId={nodeId} socketId={"hIn"} type={SocketTypes.ANGLE}>
                <BaseNode.Input label={"Hue"}>
                    <RotaryInput value={h} onValidValue={setH} disabled={hasHIn} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IColorHWKNode> nodeId={nodeId} socketId={"wIn"} type={SocketTypes.PERCENT}>
                <BaseNode.Input label={"Whiteness"}>
                    <SliderInputOld min={0} max={1} value={w} onValidValue={setW} disabled={hasWIn} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IColorHWKNode> nodeId={nodeId} socketId={"kIn"} type={SocketTypes.PERCENT}>
                <BaseNode.Input label={"Blackness"}>
                    <SliderInputOld min={0} max={1} value={k} onValidValue={setK} disabled={hasKIn} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IColorHWKNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.PERCENT}>
                <BaseNode.Input label={"Alpha"}>
                    <SliderInputOld min={0} max={1} value={a} onValidValue={setA} disabled={hasAIn} />
                </BaseNode.Input>
            </SocketIn>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorHWKNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorHWKNode["outputs"], globals: GraphGlobals) => {
    const h = MathHelper.mod(nodeMethods.coalesce(graph, nodeId, "hIn", "h", globals), 360);
    const w = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "wIn", "w", globals)));
    const k = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "kIn", "k", globals)));
    const a = Math.max(0, Math.min(1, nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals)));
    return HWK2color({ h, w, k, a });
};

const ColorHWKNodeHelper: INodeHelper<IColorHWKNode> = {
    name: "Color (hwk)",
    buttonIcon: nodeIcons.colorValue.buttonIcon,
    nodeIcon: nodeIcons.colorValue.nodeIcon,
    flavour: "accent",
    type: NodeTypes.COLOR_HWK,
    getOutput,
    initialize: () => ({
        h: 0,
        w: 1,
        k: 1,
        a: 1,
    }),
    controls: Controls,
};

export default ColorHWKNodeHelper;

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
