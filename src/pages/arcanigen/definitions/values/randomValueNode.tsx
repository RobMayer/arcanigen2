import { memo, useCallback } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { faDice as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faDice as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { SocketOut } from "../../nodeView/socket";
import BaseNode from "../../nodeView/node";
import ActionButton from "!/components/buttons/ActionButton";
import Icon from "!/components/icons";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";

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
            <ActionButton onClick={doRandom} className={"center"}>
               <Icon icon={nodeIcon} /> Roll the Dice
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
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.VALUE_RANDOM,
   getOutput,
   initialize: () => ({
      result: Math.floor(Math.random() * 10000),
   }),
   controls: Controls,
};

export default RandomValueNodeHelper;
