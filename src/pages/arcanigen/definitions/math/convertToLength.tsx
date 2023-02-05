import { memo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";
import { faPencilRuler as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPencilRuler as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import Dropdown from "!/components/selectors/Dropdown";
import { Length } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";

interface IToLengthNode extends INodeDefinition {
   inputs: {
      input: number;
   };
   outputs: {
      result: Length;
   };
   values: {
      unit: Length["unit"];
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IToLengthNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [unit, setUnit] = nodeHelper.useValueState(nodeId, "unit");
   const input = nodeHelper.useInput(nodeId, "input") ?? 0;

   return (
      <BaseNode<IToLengthNode> nodeId={nodeId} helper={ToLengthNodeHelper}>
         <SocketOut<IToLengthNode> nodeId={nodeId} socketId={"result"} type={SocketTypes.LENGTH}>
            <BaseNode.Output label={"Result"}>{input}</BaseNode.Output>
         </SocketOut>
         <hr />
         <SocketIn<IToLengthNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.NUMBER}>
            Value
         </SocketIn>
         <BaseNode.Input label={"Unit"}>
            <Dropdown value={unit} options={UNIT_OPTIONS} onValue={setUnit} />
         </BaseNode.Input>
      </BaseNode>
   );
});

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IToLengthNode["outputs"]) => {
   const value = nodeMethods.getInput(graph, nodeId, "input") ?? 0;
   const unit = nodeMethods.getValue(graph, nodeId, "unit");
   return { value, unit };
};

const nodeMethods = ArcaneGraph.nodeMethods<IToLengthNode>();

const ToLengthNodeHelper: INodeHelper<IToLengthNode> = {
   name: "To Length",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.CONVERT_LENGTH,
   getOutput,
   initialize: () => ({
      unit: "px",
   }),
   controls: Controls,
};

export default ToLengthNodeHelper;

const UNIT_OPTIONS: { [keys in Length["unit"]]: string } = {
   px: "px",
   pt: "pt",
   in: "in",
   cm: "cm",
   mm: "mm",
};
