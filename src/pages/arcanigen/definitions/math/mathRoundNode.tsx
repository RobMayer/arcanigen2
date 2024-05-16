import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";
import { RoundingMode, ROUNDING_MODE_OPTIONS, RoundingModes, NodeTypes, SocketTypes } from "../../../../utility/enums";
import NativeDropdown from "!/components/selectors/NativeDropdown";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import MathHelper from "!/utility/mathhelper";
import { MetaPrefab } from "../../nodeView/prefabs";
import { nodeIcons } from "../icons";

interface IMathRndNode extends INodeDefinition {
    inputs: {
        input: number;
    };
    outputs: {
        output: number;
    };
    values: {
        roundingMode: RoundingMode;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IMathRndNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [roundingMode, setRoundingMode] = nodeHooks.useValueState(nodeId, "roundingMode");

    return (
        <BaseNode<IMathRndNode> nodeId={nodeId} helper={MathRndNodeHelper} hooks={nodeHooks}>
            <SocketIn<IMathRndNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.NUMBER}>
                Value
            </SocketIn>
            <hr />
            <SocketOut<IMathRndNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.INTEGER}>
                Output
            </SocketOut>
            <BaseNode.Input label={"Rounding Method"}>
                <NativeDropdown value={roundingMode} options={ROUNDING_MODE_OPTIONS} onSelect={setRoundingMode} />
            </BaseNode.Input>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IMathRndNode["outputs"], globals: GraphGlobals) => {
    const value = nodeMethods.getInput(graph, nodeId, "input", globals) ?? 0;
    return MathHelper.round(value, nodeMethods.getValue(graph, nodeId, "roundingMode"));
};

const nodeMethods = ArcaneGraph.nodeMethods<IMathRndNode>();

const MathRndNodeHelper: INodeHelper<IMathRndNode> = {
    name: "Round",
    buttonIcon: nodeIcons.roundValue.buttonIcon,
    nodeIcon: nodeIcons.roundValue.nodeIcon,
    flavour: "accent",
    type: NodeTypes.MATH_RND,
    getOutput,
    initialize: () => ({
        roundingMode: RoundingModes.NEAREST_UP,
    }),
    controls: Controls,
};

export default MathRndNodeHelper;
