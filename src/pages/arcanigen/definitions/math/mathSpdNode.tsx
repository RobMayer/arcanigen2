import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { NumericInput } from "!/components/inputs/NumericInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";
import { nodeIcons } from "../icons";

interface IMathSpreadNode extends INodeDefinition {
    inputs: {
        aIn: number;
        bIn: number;
    };
    outputs: {
        inner: number;
        outer: number;
    };
    values: {
        a: number;
        b: number;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IMathSpreadNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [a, setA] = nodeHooks.useValueState(nodeId, "a");
    const [b, setB] = nodeHooks.useValueState(nodeId, "b");
    const aIn = nodeHooks.useInput(nodeId, "aIn", globals);
    const bIn = nodeHooks.useInput(nodeId, "bIn", globals);
    const hasA = nodeHooks.useHasLink(nodeId, "aIn");
    const hasB = nodeHooks.useHasLink(nodeId, "bIn");
    return (
        <BaseNode<IMathSpreadNode> nodeId={nodeId} helper={MathSpreadNodeHelper} hooks={nodeHooks}>
            <SocketOut<IMathSpreadNode> nodeId={nodeId} socketId={"inner"} type={SocketTypes.FLOAT}>
                <BaseNode.Output label={"Inner"}>{(hasA ? aIn : a) - (hasB ? bIn : b)}</BaseNode.Output>
            </SocketOut>
            <SocketOut<IMathSpreadNode> nodeId={nodeId} socketId={"outer"} type={SocketTypes.FLOAT}>
                <BaseNode.Output label={"Outer"}>{(hasA ? aIn : a) + (hasB ? bIn : b)}</BaseNode.Output>
            </SocketOut>
            <hr />
            <SocketIn<IMathSpreadNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.NUMBER}>
                <BaseNode.Input label={"A"}>
                    <NumericInput value={hasA ? aIn : a} onValidValue={setA} disabled={hasA} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IMathSpreadNode> nodeId={nodeId} socketId={"bIn"} type={SocketTypes.NUMBER}>
                <BaseNode.Input label={"B"}>
                    <NumericInput value={hasB ? bIn : b} onValidValue={setB} disabled={hasB} />
                </BaseNode.Input>
            </SocketIn>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const nodeMethods = ArcaneGraph.nodeMethods<IMathSpreadNode>();

const MathSpreadNodeHelper: INodeHelper<IMathSpreadNode> = {
    name: "Spread",
    buttonIcon: nodeIcons.spreadValue.buttonIcon,
    nodeIcon: nodeIcons.spreadValue.nodeIcon,
    flavour: "accent",
    type: NodeTypes.MATH_SPD,
    getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMathSpreadNode["outputs"], globals: GraphGlobals) => {
        const b = nodeMethods.coalesce(graph, nodeId, "bIn", "b", globals);
        const a = nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals);
        switch (socket) {
            case "inner":
                return a - b;
            case "outer":
                return a + b;
        }
    },
    initialize: () => ({
        a: 0,
        b: 0,
    }),
    controls: Controls,
};

export default MathSpreadNodeHelper;
