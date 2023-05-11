import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { faPercentage as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPercentage as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { SocketOut } from "../../nodeView/socket";
import BaseNode from "../../nodeView/node";
import MathHelper from "!/utility/mathhelper";
import SliderInput from "!/components/inputs/SliderInput";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";

interface IPercentValueNode extends INodeDefinition {
   inputs: {};
   outputs: {
      value: number;
      asCentigrade: number;
      asHectograde: number;
   };
   values: {
      value: number;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IPercentValueNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [value, setValue] = nodeHooks.useValueState(nodeId, "value");

   return (
      <BaseNode<IPercentValueNode> nodeId={nodeId} helper={PercentValueNodeHelper} hooks={nodeHooks}>
         <SocketOut<IPercentValueNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.PERCENT}>
            <SliderInput value={value} onValue={setValue} min={0} max={1} />
         </SocketOut>
         <hr />
         <BaseNode.Foldout panelId={"modeOutputs"} nodeId={nodeId} inputs={""} outputs={"asCentigrade asHectograde"} label={"Additional Outputs"}>
            <SocketOut<IPercentValueNode> nodeId={nodeId} socketId={"asCentigrade"} type={SocketTypes.FLOAT}>
               as Centigrade (0-1)
            </SocketOut>
            <SocketOut<IPercentValueNode> nodeId={nodeId} socketId={"asHectograde"} type={SocketTypes.FLOAT}>
               as Hectograde (0-100)
            </SocketOut>
         </BaseNode.Foldout>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IPercentValueNode["outputs"]) => {
   const value = MathHelper.clamp(nodeMethods.getValue(graph, nodeId, "value"), 0, 1);
   switch (socket) {
      case "value":
      case "asCentigrade":
         return value;
      case "asHectograde":
         return value * 100;
   }
};

const nodeMethods = ArcaneGraph.nodeMethods<IPercentValueNode>();

const PercentValueNodeHelper: INodeHelper<IPercentValueNode> = {
   name: "Percent",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.VALUE_PERCENT,
   getOutput,
   initialize: () => ({
      value: 0,
   }),
   controls: Controls,
};

export default PercentValueNodeHelper;
