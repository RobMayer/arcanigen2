import { memo, useCallback } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { SocketOut } from "../../nodeView/socket";
import BaseNode from "../../nodeView/node";
import ActionButton from "!/components/buttons/ActionButton";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";
import { nodeIcons } from "../icons";
import { Icon } from "../../../../components/icons";

interface IRandomValueNode extends INodeDefinition {
    inputs: {};
    outputs: {
        result: number;
    };
    values: {
        result: number;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IRandomValueNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [result, setResult] = nodeHooks.useValueState(nodeId, "result");

    const doRandom = useCallback(() => {
        setResult(Math.floor(Math.random() * 100000));
    }, [setResult]);

    return (
        <BaseNode<IRandomValueNode> nodeId={nodeId} helper={RandomValueNodeHelper} hooks={nodeHooks}>
            <SocketOut<IRandomValueNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.INTEGER}>
                <BaseNode.Output label={"Result"}>{result}</BaseNode.Output>
            </SocketOut>
            <hr />
            <BaseNode.Input label={"Randomize"}>
                <ActionButton onAction={doRandom} className={"center"}>
                    <Icon value={nodeIcons.randomValue.nodeIcon} /> Roll the Dice
                </ActionButton>
            </BaseNode.Input>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IRandomValueNode["outputs"]) => {
    return nodeMethods.getValue(graph, nodeId, "result");
};

const nodeMethods = ArcaneGraph.nodeMethods<IRandomValueNode>();

const RandomValueNodeHelper: INodeHelper<IRandomValueNode> = {
    name: "Random",
    buttonIcon: nodeIcons.randomValue.buttonIcon,
    nodeIcon: nodeIcons.randomValue.nodeIcon,
    flavour: "accent",
    type: NodeTypes.VALUE_RANDOM,
    getOutput,
    initialize: () => ({
        result: Math.floor(Math.random() * 10000),
    }),
    controls: Controls,
};

export default RandomValueNodeHelper;
