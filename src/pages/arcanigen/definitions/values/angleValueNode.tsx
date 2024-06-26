import { memo, useEffect } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { SocketOut } from "../../nodeView/socket";
import BaseNode from "../../nodeView/node";
import RotaryInput from "!/components/inputs/RotaryInput";
import MathHelper from "!/utility/mathhelper";
import CheckBox from "!/components/buttons/Checkbox";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";
import { nodeIcons } from "../icons";

interface IAngleValueNode extends INodeDefinition {
    inputs: {};
    outputs: {
        value: number;
        asDegrees: number;
        asRadians: number;
        asTurns: number;
    };
    values: {
        value: number;
        bounded: boolean;
    };
}

const nodeHooks = ArcaneGraph.nodeHooks<IAngleValueNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
    const [value, setValue] = nodeHooks.useValueState(nodeId, "value");
    const [bounded, setBounded] = nodeHooks.useValueState(nodeId, "bounded");

    useEffect(() => {
        if (bounded) {
            setValue((p) => MathHelper.mod(p, 360));
        }
    }, [bounded, setValue]);

    return (
        <BaseNode<IAngleValueNode> nodeId={nodeId} helper={AngleValueNodeHelper} hooks={nodeHooks}>
            <SocketOut<IAngleValueNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.ANGLE}>
                <RotaryInput value={value} onValidValue={setValue} wrap={!bounded} />
            </SocketOut>
            <CheckBox checked={bounded} onToggle={setBounded}>
                Bounded (0-360)
            </CheckBox>
            <hr />
            <BaseNode.Foldout panelId={"moreOutputs"} nodeId={nodeId} inputs={""} outputs={"asDegrees asRadians asTurns"} label={"Additional Outputs"}>
                <SocketOut<IAngleValueNode> nodeId={nodeId} socketId={"asDegrees"} type={SocketTypes.FLOAT}>
                    as Degrees
                </SocketOut>
                <SocketOut<IAngleValueNode> nodeId={nodeId} socketId={"asRadians"} type={SocketTypes.FLOAT}>
                    as Radians
                </SocketOut>
                <SocketOut<IAngleValueNode> nodeId={nodeId} socketId={"asTurns"} type={SocketTypes.FLOAT}>
                    as Turns
                </SocketOut>
            </BaseNode.Foldout>
            <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
        </BaseNode>
    );
});

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IAngleValueNode["outputs"]) => {
    const bounded = nodeMethods.getValue(graph, nodeId, "bounded");
    const value = nodeMethods.getValue(graph, nodeId, "value");
    const v = bounded ? MathHelper.mod(value, 360) : value;
    switch (socket) {
        case "value":
        case "asDegrees":
            return v;
        case "asTurns":
            return v / 360;
        case "asRadians":
            return MathHelper.deg2rad(v);
    }
};

const nodeMethods = ArcaneGraph.nodeMethods<IAngleValueNode>();

const AngleValueNodeHelper: INodeHelper<IAngleValueNode> = {
    name: "Angle",
    buttonIcon: nodeIcons.angleValue.buttonIcon,
    nodeIcon: nodeIcons.angleValue.nodeIcon,
    flavour: "help",
    type: NodeTypes.VALUE_ANGLE,
    getOutput,
    initialize: () => ({
        value: 0,
        bounded: false,
    }),
    controls: Controls,
};

export default AngleValueNodeHelper;
