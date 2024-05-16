import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { NumericInput } from "!/components/inputs/NumericInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";
import { nodeIcons } from "../icons";

interface IMathASinNode extends INodeDefinition {
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

const nodeHooks = ArcaneGraph.nodeHooks<IMathASinNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [a, setA] = nodeHooks.useValueState(nodeId, "a");
    const aIn = nodeHooks.useInput(nodeId, "aIn", globals);
    const hasA = nodeHooks.useHasLink(nodeId, "aIn");
    return (
        <BaseNode<IMathASinNode> nodeId={nodeId} helper={MathASinNodeHelper} hooks={nodeHooks}>
            <SocketOut<IMathASinNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.FLOAT}>
                <BaseNode.Output label={"Result"}>{Math.sin((hasA ? aIn : a) ?? 0)}</BaseNode.Output>
            </SocketOut>
            <hr />
            <SocketIn<IMathASinNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.NUMBER}>
                <BaseNode.Input label={"A"}>
                    <NumericInput value={hasA ? aIn : a} onValidValue={setA} disabled={hasA} />
                </BaseNode.Input>
            </SocketIn>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const nodeMethods = ArcaneGraph.nodeMethods<IMathASinNode>();

const MathASinNodeHelper: INodeHelper<IMathASinNode> = {
    name: "Arc Sine",
    buttonIcon: nodeIcons.wave.buttonIcon,
    nodeIcon: nodeIcons.wave.nodeIcon,
    flavour: "accent",
    type: NodeTypes.MATH_ASIN,
    getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMathASinNode["outputs"], globals: GraphGlobals) => {
        const a = nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals);
        return Math.sin(a);
    },
    initialize: () => ({
        a: 0,
        b: 0,
    }),
    controls: Controls,
};

export default MathASinNodeHelper;
