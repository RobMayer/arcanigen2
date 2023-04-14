import { memo, useEffect } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faAngle as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faAngle as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { SocketOut } from "../../nodeView/socket";
import BaseNode from "../../nodeView/node";
import AngleInput from "!/components/inputs/AngleInput";
import MathHelper from "!/utility/mathhelper";
import Checkbox from "!/components/buttons/Checkbox";
import TextInput from "!/components/inputs/TextInput";

interface IAngleValueNode extends INodeDefinition {
   inputs: {};
   outputs: {
      value: number;
      asDegrees: number;
      asRadians: number;
      asTurns: number;
   };
   values: {
      name: string;
      value: number;
      bounded: boolean;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IAngleValueNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [value, setValue] = nodeHelper.useValueState(nodeId, "value");
   const [bounded, setBounded] = nodeHelper.useValueState(nodeId, "bounded");

   useEffect(() => {
      if (bounded) {
         setValue((p) => MathHelper.mod(p, 360));
      }
   }, [bounded, setValue]);

   return (
      <BaseNode<IAngleValueNode> nodeId={nodeId} helper={AngleValueNodeHelper} name={name}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
         <SocketOut<IAngleValueNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.ANGLE}>
            <AngleInput value={value} onValidValue={setValue} wrap={!bounded} />
         </SocketOut>
         <Checkbox checked={bounded} onToggle={setBounded}>
            Bounded (0-360)
         </Checkbox>
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
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.VALUE_ANGLE,
   getOutput,
   initialize: () => ({
      name: "",
      value: 0,
      bounded: false,
   }),
   controls: Controls,
};

export default AngleValueNodeHelper;
