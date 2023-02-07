import { memo } from "react";
import ArcaneGraph from "../graph";
import {
   ControlRendererProps,
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeRendererProps,
   NodeTypes,
   PositionMode,
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
import styled from "styled-components";
import { TransformPrefabs } from "../../nodeView/prefabs";

interface IGlyphNode extends INodeDefinition {
   inputs: {
      strokeWidth: Length;
      strokeColor: Color;
      fillColor: Color;
      radius: Length;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      rotation: number;
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

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IGlyphNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
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
            <Preview viewBox={"0 0 512 512"}>
               <g fill={"black"} stroke={"none"}>
                  <path d={path} />
               </g>
            </Preview>
         </BaseNode.Input>
         <BaseNode.Foldout label={"Custom Path"} inputs={""} nodeId={nodeId} outputs={""}>
            <div>Expected value is the 'd' attribute of an SVG Path with a vewbox of 512x512.</div>
            <TextArea className={"auto tall"} value={path} onValidCommit={setPath} />
         </BaseNode.Foldout>
         <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius} min={0} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <BaseNode.Foldout label={"Appearance"} inputs={"strokeWidth strokeColor fillColor"} nodeId={nodeId} outputs={""}>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
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
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IGlyphNode> nodeId={nodeId} nodeHelper={nodeHelper} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals }: NodeRendererProps) => {
   const path = nodeHelper.useValue(nodeId, "path");
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius", globals);
   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const fillColor = nodeHelper.useCoalesce(nodeId, "fillColor", "fillColor", globals);
   const strokeCap = nodeHelper.useValue(nodeId, "strokeCap");
   const strokeJoin = nodeHelper.useValue(nodeId, "strokeJoin");

   const positionMode = nodeHelper.useValue(nodeId, "positionMode");
   const positionX = nodeHelper.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHelper.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHelper.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHelper.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHelper.useCoalesce(nodeId, "rotation", "rotation", globals);

   return (
      <g style={{ transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation}deg)` }}>
         <symbol id={`glyph_${nodeId}_lyr-${depth ?? ""}`} viewBox="0 0 512 512">
            <path d={path} vectorEffect={"non-scaling-stroke"} />
         </symbol>
         <g
            stroke={MathHelper.colorToHex(strokeColor, "transparent")}
            fill={MathHelper.colorToHex(fillColor, "transparent")}
            strokeWidth={Math.max(0, MathHelper.lengthToPx(strokeWidth ?? { value: 0, unit: "px" }))}
            strokeLinecap={strokeCap}
            strokeLinejoin={strokeJoin}
         >
            <use
               href={`#glyph_${nodeId}_lyr-${depth ?? ""}`}
               width={Math.max(0, MathHelper.lengthToPx(radius) * 2)}
               height={Math.max(0, MathHelper.lengthToPx(radius) * 2)}
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

      positionX: { value: 0, unit: "px" },
      positionY: { value: 0, unit: "px" },
      positionRadius: { value: 0, unit: "px" },
      positionTheta: 0,
      positionMode: "cartesian",
      rotation: 0,
   }),
   controls: Controls,
};

export default GlyphNodeHelper;

const Preview = styled.svg`
   height: 128px;
   width: 128px;
   justify-self: center;
`;
