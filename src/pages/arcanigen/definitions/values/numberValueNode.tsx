import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";
import BaseNode from "../../nodeView/node";
import { SocketOut } from "../../nodeView/socket";
import { NumericInput } from "!/components/inputs/NumericInput";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";
import { nodeIcons } from "../icons";

interface INumberValueNode extends INodeDefinition {
    inputs: {};
    outputs: {
        value: number;
    };
    values: {
        value: number;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<INumberValueNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [value, setValue] = nodeHooks.useValueState(nodeId, "value");

    return (
        <BaseNode<INumberValueNode> nodeId={nodeId} helper={NumberValueNodeHelper} hooks={nodeHooks}>
            <SocketOut<INumberValueNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.NUMBER}>
                <BaseNode.Input label={"Value"}>
                    <NumericInput value={value} onValidValue={setValue} />
                </BaseNode.Input>
            </SocketOut>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const nodeMethods = ArcaneGraph.nodeMethods<INumberValueNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof INumberValueNode["outputs"]) => {
    return nodeMethods.getValue(graph, nodeId, "value");
};

const NumberValueNodeHelper: INodeHelper<INumberValueNode> = {
    name: "Number",
    buttonIcon: nodeIcons.numericValue.buttonIcon,
    nodeIcon: nodeIcons.numericValue.nodeIcon,
    flavour: "help",
    type: NodeTypes.VALUE_NUMBER,
    getOutput,
    initialize: () => ({
        value: 0,
    }),
    controls: Controls,
};

export default NumberValueNodeHelper;
