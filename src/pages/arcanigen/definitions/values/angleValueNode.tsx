import { memo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faAngle as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faAngle as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { SocketOut } from "../../nodeView/socket";
import BaseNode from "../../nodeView/node";
import AngleInput from "!/components/inputs/AngleInput";
import MathHelper from "!/utility/mathhelper";

interface IAngleValueNode extends INodeDefinition {
   inputs: {};
   outputs: {
      value: number;
      bounded: number;
   };
   values: {
      value: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IAngleValueNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [value, setValue] = nodeHelper.useValueState(nodeId, "value");

   return (
      <BaseNode<IAngleValueNode> nodeId={nodeId} helper={AngleValueNodeHelper}>
         <SocketOut<IAngleValueNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.ANGLE}>
            <AngleInput value={value} onValidValue={setValue} wrap />
         </SocketOut>
         <hr />
         <SocketOut<IAngleValueNode> nodeId={nodeId} socketId={"bounded"} type={SocketTypes.ANGLE}>
            Bounded (0-360)
         </SocketOut>
      </BaseNode>
   );
});

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IAngleValueNode["outputs"]) => {
   switch (socket) {
      case "value":
         return nodeMethods.getValue(graph, nodeId, "value");
      case "bounded":
         return MathHelper.mod(nodeMethods.getValue(graph, nodeId, "value"), 360);
   }
};

const nodeMethods = ArcaneGraph.nodeMethods<IAngleValueNode>();

const AngleValueNodeHelper: INodeHelper<IAngleValueNode> = {
   name: "Angle",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.VALUE_ANGLE,
   getOutput,
   initialize: () => ({
      value: 0,
   }),
   controls: Controls,
};

export default AngleValueNodeHelper;
