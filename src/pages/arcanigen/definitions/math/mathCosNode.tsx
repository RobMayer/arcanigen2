import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { NumericInput } from "!/components/inputs/NumericInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";
import { nodeIcons } from "../icons";

interface IMathCosNode extends INodeDefinition {
    inputs: {
        aIn: number;
    };
    outputs: {
        result: number;
    };
    values: {
        a: number;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IMathCosNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [a, setA] = nodeHooks.useValueState(nodeId, "a");
    const aIn = nodeHooks.useInput(nodeId, "aIn", globals);
    const hasA = nodeHooks.useHasLink(nodeId, "aIn");
    return (
        <BaseNode<IMathCosNode> nodeId={nodeId} helper={MathCosNodeHelper} hooks={nodeHooks}>
            <SocketOut<IMathCosNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.FLOAT}>
                <BaseNode.Output label={"Result"}>{Math.cos((hasA ? aIn : a) ?? 0)}</BaseNode.Output>
            </SocketOut>
            <hr />
            <SocketIn<IMathCosNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.NUMBER}>
                <BaseNode.Input label={"A"}>
                    <NumericInput value={hasA ? aIn : a} onValidValue={setA} disabled={hasA} />
                </BaseNode.Input>
            </SocketIn>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const nodeMethods = ArcaneGraph.nodeMethods<IMathCosNode>();

const MathCosNodeHelper: INodeHelper<IMathCosNode> = {
    name: "Cosine",
    buttonIcon: nodeIcons.wave.buttonIcon,
    nodeIcon: nodeIcons.wave.nodeIcon,
    flavour: "accent",
    type: NodeTypes.MATH_COS,
    getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMathCosNode["outputs"], globals: GraphGlobals) => {
        const a = nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals);
        return Math.cos(a);
    },
    initialize: () => ({
        a: 0,
        b: 0,
    }),
    controls: Controls,
};

export default MathCosNodeHelper;
