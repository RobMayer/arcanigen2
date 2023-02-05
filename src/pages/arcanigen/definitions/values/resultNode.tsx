import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import useWhyDidYouUpdate from "!/utility/hooks/useWhyDidYouUpdate";
import MathHelper from "!/utility/mathhelper";
import { Color, Length } from "!/utility/types/units";
import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import BaseNode from "../../nodeView/node";
import { SocketIn } from "../../nodeView/socket";
import { INodeDefinition, INodeHelper, NodeRenderer, NodeTypes, SocketTypes } from "../types";
import { faFlagCheckered as nodeIcon } from "@fortawesome/pro-solid-svg-icons";

interface IResultNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      canvasColor: Color;
      canvasWidth: Length;
      canvasHeight: Length;
   };
   values: {
      canvasColor: Color;
      canvasWidth: Length;
      canvasHeight: Length;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IResultNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [canvasColor, setCanvasColor] = nodeHelper.useValueState(nodeId, "canvasColor");
   const [canvasWidth, setCanvasWidth] = nodeHelper.useValueState(nodeId, "canvasWidth");
   const [canvasHeight, setCanvasHeight] = nodeHelper.useValueState(nodeId, "canvasHeight");

   const hasCanvasColor = nodeHelper.useHasLink(nodeId, "canvasColor");
   const hasCanvasWidth = nodeHelper.useHasLink(nodeId, "canvasWidth");
   const hasCanvasHeight = nodeHelper.useHasLink(nodeId, "canvasHeight");

   return (
      <BaseNode<IResultNode> nodeId={nodeId} helper={ResultNodeHelper} noRemove>
         <SocketIn<IResultNode> type={SocketTypes.SHAPE} nodeId={nodeId} socketId={"input"}>
            Input
         </SocketIn>
         <hr />
         <SocketIn<IResultNode> type={SocketTypes.COLOR} nodeId={nodeId} socketId={"canvasColor"}>
            <BaseNode.Input label={"Canvas Color"}>
               <HexColorInput value={canvasColor} onValidCommit={setCanvasColor} disabled={hasCanvasColor} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IResultNode> type={SocketTypes.LENGTH} nodeId={nodeId} socketId={"canvasWidth"}>
            <BaseNode.Input label={"Canvas Width"}>
               <LengthInput value={canvasWidth} onChange={setCanvasWidth} disabled={hasCanvasWidth} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IResultNode> type={SocketTypes.LENGTH} nodeId={nodeId} socketId={"canvasHeight"}>
            <BaseNode.Input label={"Canvas Height"}>
               <LengthInput value={canvasHeight} onChange={setCanvasHeight} disabled={hasCanvasHeight} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const ResultNodeHelper: INodeHelper<IResultNode> = {
   name: "Canvas Output",
   buttonIcon: null,
   flavour: "confirm",
   nodeIcon,
   type: NodeTypes.RESULT,
   getOutput: () => undefined as never,
   initialize: () => ({
      canvasColor: { r: 1, g: 1, b: 1, a: 1 },
      canvasWidth: { value: 800, unit: "px" },
      canvasHeight: { value: 800, unit: "px" },
   }),
   controls: Controls,
};

export default ResultNodeHelper;

export const RootNodeRenderer = () => {
   const canvasColor = nodeHelper.useCoalesce("ROOT", "canvasColor", "canvasColor");
   const canvasHeight = nodeHelper.useCoalesce("ROOT", "canvasHeight", "canvasHeight");
   const canvasWidth = nodeHelper.useCoalesce("ROOT", "canvasWidth", "canvasWidth");

   const h = useMemo(() => MathHelper.lengthToPx(canvasHeight ?? { value: 800, unit: "px" }), [canvasHeight]);
   const w = useMemo(() => MathHelper.lengthToPx(canvasWidth ?? { value: 800, unit: "px" }), [canvasWidth]);

   const [OutputRenderer, childNodeId] = nodeHelper.useInputNode("ROOT", "input");

   useWhyDidYouUpdate("RootNodeRenderer", { h, w, Output: OutputRenderer, childNodeId });

   return (
      <svg
         width={`${w}px`}
         height={`${h}px`}
         viewBox={`${w / -2} ${h / -2} ${w} ${h}`}
         style={{ backgroundColor: MathHelper.colorToHex(canvasColor) }}
         xmlns="http://www.w3.org/2000/svg"
         xmlnsXlink="http://www.w3.org/1999/xlink"
      >
         {OutputRenderer && childNodeId && <OutputRenderer nodeId={childNodeId} layer={"ROOT"} />}
      </svg>
   );
};
