import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { NumericInput } from "!/components/inputs/NumericInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";
import { nodeIcons } from "../icons";

interface IMathModNode extends INodeDefinition {
    inputs: {
        aIn: number;
        bIn: number;
    };
    outputs: {
        result: number;
    };
    values: {
        a: number;
        b: number;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IMathModNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [a, setA] = nodeHooks.useValueState(nodeId, "a");
    const [b, setB] = nodeHooks.useValueState(nodeId, "b");
    const aIn = nodeHooks.useInput(nodeId, "aIn", globals);
    const bIn = nodeHooks.useInput(nodeId, "bIn", globals);
    const hasA = nodeHooks.useHasLink(nodeId, "aIn");
    const hasB = nodeHooks.useHasLink(nodeId, "bIn");
    return (
        <BaseNode<IMathModNode> nodeId={nodeId} helper={MathModNodeHelper} hooks={nodeHooks}>
            <SocketOut<IMathModNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.FLOAT}>
                <BaseNode.Output label={"Result"}>{b === 0 ? 0 : ((a % b) + b) % b}</BaseNode.Output>
            </SocketOut>
            <hr />
            <SocketIn<IMathModNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.NUMBER}>
                <BaseNode.Input label={"A"}>
                    <NumericInput value={hasA ? aIn : a} onValidValue={setA} disabled={hasA} />
                </BaseNode.Input>
            </SocketIn>
            <SocketIn<IMathModNode> nodeId={nodeId} socketId={"bIn"} type={SocketTypes.NUMBER}>
                <BaseNode.Input label={"B"}>
                    <NumericInput value={hasB ? bIn : b} onValidValue={setB} disabled={hasB} />
                </BaseNode.Input>
            </SocketIn>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const nodeMethods = ArcaneGraph.nodeMethods<IMathModNode>();

const MathModNodeHelper: INodeHelper<IMathModNode> = {
    name: "Modulo",
    buttonIcon: nodeIcons.modValue.buttonIcon,
    nodeIcon: nodeIcons.modValue.nodeIcon,
    flavour: "accent",
    type: NodeTypes.MATH_MOD,
    getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMathModNode["outputs"], globals: GraphGlobals) => {
        const b = nodeMethods.coalesce(graph, nodeId, "bIn", "b", globals);
        const a = nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals);
        return b === 0 ? 0 : ((a % b) + b) % b;
    },
    initialize: () => ({
        a: 0,
        b: 0,
    }),
    controls: Controls,
};

export default MathModNodeHelper;
