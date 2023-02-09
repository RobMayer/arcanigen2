import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import MathHelper from "!/utility/mathhelper";
import { Color, Length } from "!/utility/types/units";
import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import BaseNode from "../../nodeView/node";
import { SocketIn } from "../../nodeView/socket";
import { ControlRendererProps, INodeDefinition, INodeHelper, NodeRenderer, NodeTypes, SocketTypes } from "../types";
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

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
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
               <HexColorInput value={canvasColor} onValue={setCanvasColor} disabled={hasCanvasColor} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IResultNode> type={SocketTypes.LENGTH} nodeId={nodeId} socketId={"canvasWidth"}>
            <BaseNode.Input label={"Canvas Width"}>
               <LengthInput value={canvasWidth} onValidValue={setCanvasWidth} disabled={hasCanvasWidth} min={0} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IResultNode> type={SocketTypes.LENGTH} nodeId={nodeId} socketId={"canvasHeight"}>
            <BaseNode.Input label={"Canvas Height"}>
               <LengthInput value={canvasHeight} onValidValue={setCanvasHeight} disabled={hasCanvasHeight} min={0} />
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
   const globals = useMemo(() => ({ sequenceData: START_SEQUENCE }), []);

   const canvasColor = nodeHelper.useCoalesce("ROOT", "canvasColor", "canvasColor", globals);
   const canvasHeight = nodeHelper.useCoalesce("ROOT", "canvasHeight", "canvasHeight", globals);
   const canvasWidth = nodeHelper.useCoalesce("ROOT", "canvasWidth", "canvasWidth", globals);

   const h = useMemo(() => Math.max(0, MathHelper.lengthToPx(canvasHeight ?? { value: 800, unit: "px" })), [canvasHeight]);
   const w = useMemo(() => Math.max(0, MathHelper.lengthToPx(canvasWidth ?? { value: 800, unit: "px" })), [canvasWidth]);

   const [OutputRenderer, childNodeId] = nodeHelper.useInputNode("ROOT", "input", globals);

   return (
      <svg
         width={`${w}px`}
         height={`${h}px`}
         viewBox={`${w / -2} ${h / -2} ${w} ${h}`}
         style={{ backgroundColor: MathHelper.colorToHTML(canvasColor) }}
         xmlns="http://www.w3.org/2000/svg"
         xmlnsXlink="http://www.w3.org/1999/xlink"
      >
         {OutputRenderer && childNodeId && <OutputRenderer nodeId={childNodeId} depth={"ROOT"} globals={globals} />}
      </svg>
   );
};

const START_SEQUENCE = {
   ROOT: 0,
};
