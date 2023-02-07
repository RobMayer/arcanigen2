import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodeTypes, SocketTypes } from "../types";
import MathHelper from "!/utility/mathhelper";

import { faPaintRoller as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faPaintRoller as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import HexColorInput from "!/components/inputs/colorHexInput";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";

interface IFloodFillNode extends INodeDefinition {
   inputs: {
      floodColor: Color;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      floodColor: Color;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IFloodFillNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [floodColor, setFloodColor] = nodeHelper.useValueState(nodeId, "floodColor");
   const hasFloodColor = nodeHelper.useHasLink(nodeId, "floodColor");

   return (
      <BaseNode<IFloodFillNode> nodeId={nodeId} helper={FloodFillNodeHelper}>
         <SocketOut<IFloodFillNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IFloodFillNode> nodeId={nodeId} socketId={"floodColor"} type={SocketTypes.COLOR}>
            <BaseNode.Input label={"Floor Color"}>
               <HexColorInput value={floodColor} onValue={setFloodColor} disabled={hasFloodColor} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId }: NodeRendererProps) => {
   const floodColor = nodeHelper.useValue(nodeId, "floodColor");
   return <rect x={"-1000%"} y={"-1000%"} width={"2000%"} height={"2000%"} fill={MathHelper.colorToHex(floodColor)} />;
});

const FloodFillNodeHelper: INodeHelper<IFloodFillNode> = {
   name: "Flood Fill",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_FLOODFILL,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IFloodFillNode["outputs"]) => Renderer,
   initialize: () => ({
      floodColor: { r: 0, g: 0, b: 0, a: 1 },
   }),
   controls: Controls,
};

export default FloodFillNodeHelper;
