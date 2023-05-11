import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps } from "../types";
import MathHelper from "!/utility/mathhelper";

import { faPaintRoller as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faPaintRoller as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import HexColorInput from "!/components/inputs/colorHexInput";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";

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

const nodeHooks = ArcaneGraph.nodeHooks<IFloodFillNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [floodColor, setFloodColor] = nodeHooks.useValueState(nodeId, "floodColor");
   const hasFloodColor = nodeHooks.useHasLink(nodeId, "floodColor");

   return (
      <BaseNode<IFloodFillNode> nodeId={nodeId} helper={FloodFillNodeHelper} hooks={nodeHooks}>
         <SocketOut<IFloodFillNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IFloodFillNode> nodeId={nodeId} socketId={"floodColor"} type={SocketTypes.COLOR}>
            <BaseNode.Input label={"Flood Color"}>
               <HexColorInput value={floodColor} onValue={setFloodColor} disabled={hasFloodColor} />
            </BaseNode.Input>
         </SocketIn>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId }: NodeRendererProps) => {
   const floodColor = nodeHooks.useValue(nodeId, "floodColor");
   return (
      <rect
         x={"-1000%"}
         y={"-1000%"}
         width={"2000%"}
         height={"2000%"}
         fill={MathHelper.colorToSVG(floodColor)}
         fillOpacity={MathHelper.colorToOpacity(floodColor)}
      />
   );
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
