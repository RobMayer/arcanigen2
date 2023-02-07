import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import HexColorInput from "!/components/inputs/colorHexInput";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut } from "../../nodeView/socket";

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

const nodeHelper = ArcaneGraph.nodeHooks<IHexColorNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [value, setValue] = nodeHelper.useValueState(nodeId, "value");
   return (
      <BaseNode<IHexColorNode> nodeId={nodeId} helper={HexColorNodeHelper}>
         <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"full"} type={SocketTypes.COLOR}>
            <BaseNode.Input label={"Value"}>
               <HexColorInput value={value} onValue={setValue} />
            </BaseNode.Input>
         </SocketOut>
         <hr />
         <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"solid"} type={SocketTypes.COLOR}>
            Solid
         </SocketOut>
         <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"alpha"} type={SocketTypes.INTERVAL}>
            Alpha
         </SocketOut>
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
         return v ? v.a : v === null ? 0 : 1;
   }
};

const nodeMethods = ArcaneGraph.nodeMethods<IHexColorNode>();

const HexColorNodeHelper: INodeHelper<IHexColorNode> = {
   name: "Color (hex)",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.COLOR_HEX,
   getOutput,
   initialize: () => ({
      value: { r: 0, g: 0, b: 0, a: 1 },
   }),
   controls: Controls,
};

export default HexColorNodeHelper;
