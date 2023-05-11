import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import HexColorInput from "!/components/inputs/colorHexInput";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";

interface IHexColorNode extends INodeDefinition {
   inputs: {};
   outputs: {
      full: Color;
      solid: Color;
      alpha: number;
   };
   values: {
      value: Color;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IHexColorNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [value, setValue] = nodeHooks.useValueState(nodeId, "value");
   return (
      <BaseNode<IHexColorNode> nodeId={nodeId} helper={HexColorNodeHelper} hooks={nodeHooks}>
         <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"full"} type={SocketTypes.COLOR}>
            <BaseNode.Input label={"Value"}>
               <HexColorInput value={value} onValue={setValue} />
            </BaseNode.Input>
         </SocketOut>
         <hr />
         <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"solid"} type={SocketTypes.COLOR}>
            Solid
         </SocketOut>
         <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"alpha"} type={SocketTypes.PERCENT}>
            Alpha (α)
         </SocketOut>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IHexColorNode["outputs"]) => {
   const v = nodeMethods.getValue(graph, nodeId, "value");

   switch (socket) {
      case "full":
         return v;
      case "solid":
         return { ...v, a: 1 } as Color;
      case "alpha":
         return v ? v.a : 0;
   }
};

const nodeMethods = ArcaneGraph.nodeMethods<IHexColorNode>();

const HexColorNodeHelper: INodeHelper<IHexColorNode> = {
   name: "Color",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.VALUE_COLOR,
   getOutput,
   initialize: () => ({
      value: { r: 0, g: 0, b: 0, a: 1 },
   }),
   controls: Controls,
};

export default HexColorNodeHelper;
