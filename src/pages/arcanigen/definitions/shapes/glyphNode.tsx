import { memo } from "react";
import ArcaneGraph from "../graph";
import {
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeRendererProps,
   NodeTypes,
   SocketTypes,
   StrokeCapMode,
   STROKECAP_MODES,
   StrokeJoinMode,
   STROKEJOIN_MODES,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { faQuestion as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faQuestion as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { Length, Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import ToggleList from "!/components/selectors/ToggleList";
import TextArea from "!/components/inputs/TextArea";

interface IGlyphNode extends INodeDefinition {
   inputs: {
      strokeWidth: Length;
      strokeColor: Color;
      fillColor: Color;
      radius: Length;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      radius: Length;
      path: string;
      strokeWidth: Length;
      strokeColor: Color;
      strokeJoin: StrokeJoinMode;
      strokeCap: StrokeCapMode;
      fillColor: Color;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IGlyphNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [path, setPath] = nodeHelper.useValueState(nodeId, "path");
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");
   const [strokeJoin, setStrokeJoin] = nodeHelper.useValueState(nodeId, "strokeJoin");
   const [strokeCap, setStrokeCap] = nodeHelper.useValueState(nodeId, "strokeCap");
   const [fillColor, setFillColor] = nodeHelper.useValueState(nodeId, "fillColor");

   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");
   const hasFillColor = nodeHelper.useHasLink(nodeId, "fillColor");

   return (
      <BaseNode<IGlyphNode> nodeId={nodeId} helper={GlyphNodeHelper}>
         <SocketOut<IGlyphNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <BaseNode.Input label={"preview"}>
            <svg viewBox={"0 0 512 512"}>
               <g fill={"black"} stroke={"none"}>
                  <path d={path} />
               </g>
            </svg>
         </BaseNode.Input>
         <BaseNode.Foldout label={"Custom Path"} inputs={""} nodeId={nodeId} outputs={""}>
            <div>Expected value is the 'd' attribute of an SVG Path with a vewbox of 512x512.</div>
            <TextArea className={"auto tall"} value={path} onValidCommit={setPath} />
         </BaseNode.Foldout>
         <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onChange={setRadius} disabled={hasRadius} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <BaseNode.Foldout label={"Appearance"} inputs={"strokeWidth strokeColor fillColor"} nodeId={nodeId} outputs={""}>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onChange={setStrokeWidth} disabled={hasStrokeWidth} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Join"}>
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODES} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES} />
            </BaseNode.Input>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValidCommit={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValidCommit={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, layer }: NodeRendererProps) => {
   const path = nodeHelper.useValue(nodeId, "path");
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius");
   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth");
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor");
   const fillColor = nodeHelper.useCoalesce(nodeId, "fillColor", "fillColor");
   const strokeCap = nodeHelper.useValue(nodeId, "strokeCap");
   const strokeJoin = nodeHelper.useValue(nodeId, "strokeJoin");

   return (
      <g>
         <symbol id={`glyph_${nodeId}_lyr-${layer ?? ""}`} viewBox="0 0 512 512">
            <path d={path} vectorEffect={"non-scaling-stroke"} />
         </symbol>
         <g
            stroke={MathHelper.colorToHex(strokeColor, "transparent")}
            fill={MathHelper.colorToHex(fillColor, "transparent")}
            strokeWidth={MathHelper.lengthToPx(strokeWidth ?? { value: 0, unit: "px" })}
            strokeLinecap={strokeCap}
            strokeLinejoin={strokeJoin}
         >
            <use
               href={`#glyph_${nodeId}_lyr-${layer ?? ""}`}
               width={MathHelper.lengthToPx(radius) * 2}
               height={MathHelper.lengthToPx(radius) * 2}
               x={MathHelper.lengthToPx(radius) * -1}
               y={MathHelper.lengthToPx(radius) * -1}
            />
         </g>
      </g>
   );
});

const GlyphNodeHelper: INodeHelper<IGlyphNode> = {
   name: "Custom Glyph",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_GLYPH,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IGlyphNode["outputs"]) => Renderer,
   initialize: () => ({
      path: "",
      radius: { value: 100, unit: "px" },
      strokeWidth: { value: 0, unit: "px" },
      fillColor: { r: 0, g: 0, b: 0, a: 1 },
      strokeColor: null as Color,
      strokeJoin: "bevel",
      strokeCap: "butt",
   }),
   controls: Controls,
};

export default GlyphNodeHelper;
