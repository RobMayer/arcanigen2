import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import useWhyDidYouUpdate from "!/utility/hooks/useWhyDidYouUpdate";
import MathHelper from "!/utility/mathhelper";
import { Color, Length } from "!/utility/types/units";
import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import BaseNode from "../node";
import { SocketIn } from "../socket";
import { INodeDefinition, INodeHelper, NodeRenderer, NodeTypes, SocketTypes } from "../types";
import { faFlagCheckered as nodeIcon } from "@fortawesome/pro-solid-svg-icons";

interface IResultNode extends INodeDefinition {
   inputs: {
      shape: NodeRenderer;
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

const getHooks = () => {
   return ArcaneGraph.nodeHooks<IResultNode>();
};

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const node = getHooks();
   const [canvasColor, setCanvasColor] = node.useValueState(nodeId, "canvasColor");
   const [canvasWidth, setCanvasWidth] = node.useValueState(nodeId, "canvasWidth");
   const [canvasHeight, setCanvasHeight] = node.useValueState(nodeId, "canvasHeight");

   const hasCanvasColor = node.useHasLink(nodeId, "canvasColor");
   const hasCanvasWidth = node.useHasLink(nodeId, "canvasWidth");
   const hasCanvasHeight = node.useHasLink(nodeId, "canvasHeight");

   return (
      <>
         <SocketIn<IResultNode> type={SocketTypes.SHAPE} nodeId={nodeId} socketId={"shape"}>
            Shape
         </SocketIn>
         <SocketIn<IResultNode> type={SocketTypes.COLOR} nodeId={nodeId} socketId={"canvasColor"}>
            <BaseNode.Input label={"Canvas Color"}>
               <HexColorInput value={canvasColor} onValidCommit={setCanvasColor} disabled={hasCanvasColor} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IResultNode> type={SocketTypes.COLOR} nodeId={nodeId} socketId={"canvasWidth"}>
            <BaseNode.Input label={"Canvas Width"}>
               <LengthInput value={canvasWidth} onChange={setCanvasWidth} disabled={hasCanvasWidth} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IResultNode> type={SocketTypes.COLOR} nodeId={nodeId} socketId={"canvasHeight"}>
            <BaseNode.Input label={"Canvas Height"}>
               <LengthInput value={canvasHeight} onChange={setCanvasHeight} disabled={hasCanvasHeight} />
            </BaseNode.Input>
         </SocketIn>
      </>
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
   const node = getHooks();
   const canvasColor = node.useCoalesce("ROOT", "canvasColor", "canvasColor");
   const canvasHeight = node.useCoalesce("ROOT", "canvasHeight", "canvasHeight");
   const canvasWidth = node.useCoalesce("ROOT", "canvasWidth", "canvasWidth");

   const h = useMemo(() => MathHelper.lengthToPx(canvasHeight ?? { value: 800, unit: "px" }), [canvasHeight]);
   const w = useMemo(() => MathHelper.lengthToPx(canvasWidth ?? { value: 800, unit: "px" }), [canvasWidth]);

   const Output = node.useInput("ROOT", "shape");
   const childNodeId = node.useInputNodeId("ROOT", "shape");

   useWhyDidYouUpdate("RootNodeRenderer", { h, w, Output, childNodeId });

   return (
      <svg
         width={`${w}px`}
         height={`${h}px`}
         viewBox={`${w / -2} ${h / -2} ${w} ${h}`}
         style={{ backgroundColor: MathHelper.colorToHex(canvasColor, "#ffff") }}
      >
         {Output && childNodeId && <Output nodeId={childNodeId} />}
      </svg>
   );
};
