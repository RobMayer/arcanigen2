import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { NumericInput } from "!/components/inputs/NumericInput";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";
import { nodeIcons } from "../icons";

interface IMathAbsNode extends INodeDefinition {
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

const nodeHooks = ArcaneGraph.nodeHooks<IMathAbsNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [a, setA] = nodeHooks.useValueState(nodeId, "a");
    const aIn = nodeHooks.useInput(nodeId, "aIn", globals);
    const hasA = nodeHooks.useHasLink(nodeId, "aIn");
    return (
        <BaseNode<IMathAbsNode> nodeId={nodeId} helper={MathAbsNodeHelper} hooks={nodeHooks}>
            <SocketOut<IMathAbsNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.FLOAT}>
                <BaseNode.Output label={"Result"}>{hasA ? aIn : a}</BaseNode.Output>
            </SocketOut>
            <hr />
            <SocketIn<IMathAbsNode> nodeId={nodeId} socketId={"aIn"} type={SocketTypes.NUMBER}>
                <BaseNode.Input label={"A"}>
                    <NumericInput value={hasA ? aIn : a} onValidValue={setA} disabled={hasA} />
                </BaseNode.Input>
            </SocketIn>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const nodeMethods = ArcaneGraph.nodeMethods<IMathAbsNode>();

const MathAbsNodeHelper: INodeHelper<IMathAbsNode> = {
    name: "Absolute",
    buttonIcon: nodeIcons.absValue.buttonIcon,
    nodeIcon: nodeIcons.absValue.nodeIcon,
    flavour: "accent",
    type: NodeTypes.MATH_ABS,
    getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMathAbsNode["outputs"], globals: GraphGlobals) => {
        const a = nodeMethods.coalesce(graph, nodeId, "aIn", "a", globals);
        return Math.abs(a);
    },
    initialize: () => ({
        a: 0,
    }),
    controls: Controls,
};

export default MathAbsNodeHelper;
