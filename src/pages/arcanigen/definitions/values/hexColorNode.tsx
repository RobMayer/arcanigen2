import { memo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

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

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [value, setValue] = nodeHelper.useValueState(nodeId, "value");
   return (
      <>
         <BaseNode.Input label={"Value"}>
            <HexColorInput value={value} onValidCommit={setValue} />
         </BaseNode.Input>
         <hr />
         <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"full"} type={SocketTypes.COLOR}>
            rgbα
         </SocketOut>
         <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"solid"} type={SocketTypes.COLOR}>
            rgb
         </SocketOut>
         <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"alpha"} type={SocketTypes.INTERVAL}>
            α
         </SocketOut>
      </>
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
   flavour: "help",
   type: NodeTypes.VALUE_COLOR_HEX,
   getOutput,
   initialize: () => ({
      value: { r: 0, g: 0, b: 0, a: 1 },
   }),
   controls: Controls,
};

export default HexColorNodeHelper;
