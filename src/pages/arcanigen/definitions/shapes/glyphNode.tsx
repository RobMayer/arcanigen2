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
import { MetaPrefab, TransformPrefabs } from "../../nodeView/prefabs";
import TextInput from "!/components/inputs/TextInput";
import NumberInput from "!/components/inputs/NumberInput";

interface IGlyphNode extends INodeDefinition {
   inputs: {
      strokeWidth: Length;
      strokeColor: Color;
      strokeOffset: Length;
      fillColor: Color;
      width: Length;
      height: Length;
      viewX: Length;
      viewY: Length;
      viewW: Length;
      viewH: Length;

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
      width: Length;
      height: Length;
      viewX: Length;
      viewY: Length;
      viewW: Length;
      viewH: Length;
      dpi: number;

      path: string;
      strokeWidth: Length;
      strokeColor: Color;
      strokeJoin: StrokeJoinMode;
      strokeCap: StrokeCapMode;
      strokeDash: string;
      strokeOffset: Length;

      fillColor: Color;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IGlyphNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [path, setPath] = nodeHooks.useValueState(nodeId, "path");
   const [width, setWidth] = nodeHooks.useValueState(nodeId, "width");
   const [height, setHeight] = nodeHooks.useValueState(nodeId, "height");
   const [dpi, setDpi] = nodeHooks.useValueState(nodeId, "dpi");

   const [viewX, setViewX] = nodeHooks.useValueState(nodeId, "viewX");
   const [viewY, setViewY] = nodeHooks.useValueState(nodeId, "viewY");
   const [viewW, setViewW] = nodeHooks.useValueState(nodeId, "viewW");
   const [viewH, setViewH] = nodeHooks.useValueState(nodeId, "viewH");

   const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
   const [strokeJoin, setStrokeJoin] = nodeHooks.useValueState(nodeId, "strokeJoin");
   const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
   const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
   const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");
   const [fillColor, setFillColor] = nodeHooks.useValueState(nodeId, "fillColor");

   const viewXIn = nodeHooks.useInput(nodeId, "viewX", globals);
   const viewYIn = nodeHooks.useInput(nodeId, "viewY", globals);
   const viewWIn = nodeHooks.useInput(nodeId, "viewW", globals);
   const viewHIn = nodeHooks.useInput(nodeId, "viewH", globals);

   const hasWidth = nodeHooks.useHasLink(nodeId, "width");
   const hasHeight = nodeHooks.useHasLink(nodeId, "height");
   const hasViewX = nodeHooks.useHasLink(nodeId, "viewX");
   const hasViewY = nodeHooks.useHasLink(nodeId, "viewY");
   const hasViewW = nodeHooks.useHasLink(nodeId, "viewW");
   const hasViewH = nodeHooks.useHasLink(nodeId, "viewH");
   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
   const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");
   const hasFillColor = nodeHooks.useHasLink(nodeId, "fillColor");

   return (
      <BaseNode<IGlyphNode> nodeId={nodeId} helper={GlyphNodeHelper} hooks={nodeHooks}>
         <SocketOut<IGlyphNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <BaseNode.Input label={"preview"}>
            <Preview
               viewBox={`
               ${(MathHelper.lengthToPx(hasViewX ? viewXIn : viewX) / dpi) * 72}
               ${(MathHelper.lengthToPx(hasViewY ? viewYIn : viewY) / dpi) * 72}
               ${(MathHelper.lengthToPx(hasViewW ? viewWIn : viewW) / dpi) * 72}
               ${(MathHelper.lengthToPx(hasViewH ? viewHIn : viewH) / dpi) * 72}
            `}
            >
               <g fill={"black"} stroke={"none"}>
                  <path d={path} />
               </g>
            </Preview>
         </BaseNode.Input>
         <BaseNode.Foldout panelId={"pathDef"} label={"Custom Path"} inputs={"viewX viewY viewW viewH"} nodeId={nodeId} outputs={""}>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"viewX"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Viewbox X"}>
                  <LengthInput value={viewX} onValidValue={setViewX} disabled={hasViewX} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"viewY"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Viewbox Y"}>
                  <LengthInput value={viewY} onValidValue={setViewY} disabled={hasViewY} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"viewW"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Viewbox Width"}>
                  <LengthInput value={viewW} onValidValue={setViewW} disabled={hasViewW} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"viewH"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Viewbox Height"}>
                  <LengthInput value={viewH} onValidValue={setViewH} disabled={hasViewH} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"DPI"}>
               <NumberInput value={dpi} onValidValue={setDpi} />
            </BaseNode.Input>
            <TextArea className={"auto tall"} value={path} onValidCommit={setPath} />
         </BaseNode.Foldout>
         <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"width"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Width"}>
               <LengthInput value={width} onValidValue={setWidth} disabled={hasWidth} min={0} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"height"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Height"}>
               <LengthInput value={height} onValidValue={setHeight} disabled={hasHeight} min={0} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} inputs={"strokeWidth strokeColor fillColor"} nodeId={nodeId} outputs={""}>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Join"}>
               <ToggleList value={strokeJoin} onValue={setStrokeJoin} options={STROKEJOIN_MODES} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Dash"}>
               <TextInput value={strokeDash} onValidValue={setStrokeDash} pattern={MathHelper.LENGTH_LIST_REGEX} />
            </BaseNode.Input>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Dash Offset"}>
                  <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IGlyphNode> nodeId={nodeId} socketId={"fillColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Fill Color"}>
                  <HexColorInput value={fillColor} onValue={setFillColor} disabled={hasFillColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IGlyphNode> nodeId={nodeId} hooks={nodeHooks} />
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides = {} }: NodeRendererProps) => {
   const path = nodeHooks.useValue(nodeId, "path");
   const dpi = nodeHooks.useValue(nodeId, "dpi");
   const width = nodeHooks.useCoalesce(nodeId, "width", "width", globals);
   const height = nodeHooks.useCoalesce(nodeId, "height", "height", globals);
   const viewX = nodeHooks.useCoalesce(nodeId, "viewX", "viewX", globals);
   const viewY = nodeHooks.useCoalesce(nodeId, "viewY", "viewY", globals);
   const viewW = nodeHooks.useCoalesce(nodeId, "viewW", "viewW", globals);
   const viewH = nodeHooks.useCoalesce(nodeId, "viewH", "viewH", globals);
   const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const fillColor = nodeHooks.useCoalesce(nodeId, "fillColor", "fillColor", globals);
   const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");
   const strokeJoin = nodeHooks.useValue(nodeId, "strokeJoin");

   const positionMode = nodeHooks.useValue(nodeId, "positionMode");
   const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);

   return (
      <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}>
         <symbol
            id={`glyph_${nodeId}_lyr-${depth ?? ""}`}
            viewBox={`${(MathHelper.lengthToPx(viewX) / dpi) * 72} ${(MathHelper.lengthToPx(viewY) / dpi) * 72} ${(MathHelper.lengthToPx(viewW) / dpi) * 72} ${
               (MathHelper.lengthToPx(viewH) / dpi) * 72
            }`}
         >
            <path d={path} vectorEffect={"non-scaling-stroke"} />
         </symbol>
         <g
            stroke={MathHelper.colorToSVG("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fill={MathHelper.colorToSVG("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
            fillOpacity={MathHelper.colorToOpacity("fillColor" in overrides ? overrides.fillColor : fillColor)}
            strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
            strokeLinecap={"strokeCap" in overrides ? overrides.strokeCap : strokeCap}
            strokeLinejoin={"strokeJoin" in overrides ? overrides.strokeJoin : strokeJoin}
         >
            <use
               href={`#glyph_${nodeId}_lyr-${depth ?? ""}`}
               width={Math.max(0, MathHelper.lengthToPx(width))}
               height={Math.max(0, MathHelper.lengthToPx(height))}
               x={MathHelper.lengthToPx(width) * -0.5}
               y={MathHelper.lengthToPx(height) * -0.5}
               vectorEffect={"non-scaling-stroke"}
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
      width: { value: 100, unit: "px" },
      height: { value: 100, unit: "px" },
      dpi: 96,
      strokeWidth: { value: 0, unit: "px" },
      strokeDash: "",
      strokeOffset: { value: 0, unit: "px" },
      fillColor: { r: 0, g: 0, b: 0, a: 1 },
      strokeColor: null as Color,
      strokeJoin: "miter",
      strokeCap: "butt",
      viewX: { value: 0, unit: "px" },
      viewY: { value: 0, unit: "px" },
      viewW: { value: 512, unit: "px" },
      viewH: { value: 512, unit: "px" },

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
