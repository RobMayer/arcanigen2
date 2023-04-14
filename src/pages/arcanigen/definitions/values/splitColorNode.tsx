import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faSplit as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faSplit as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import HexColorInput from "!/components/inputs/colorHexInput";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import { colorComponents } from "!/utility/colorconvert";
import { MetaPrefab } from "../../nodeView/prefabs";

interface ISplitColorNode extends INodeDefinition {
   inputs: {
      input: Color;
   };
   outputs: {
      alpha: number;
      red: number;
      green: number;
      blue: number;
      cyan: number;
      magenta: number;
      yellow: number;
      hue: number;
      white: number;
      black: number;
      saturationV: number;
      saturationI: number;
      saturationL: number;
      lightness: number;
      value: number;
      intensity: number;
      chroma: number;
      luminance: number;
   };
   values: {
      value: Color;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<ISplitColorNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [value, setValue] = nodeHooks.useValueState(nodeId, "value");
   const hasInput = nodeHooks.useHasLink(nodeId, "input");
   return (
      <BaseNode<ISplitColorNode> nodeId={nodeId} helper={SplitColorNodeHelper} hooks={nodeHooks}>
         <SocketIn<ISplitColorNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.COLOR}>
            <BaseNode.Input label={"Value"}>
               <HexColorInput value={value} onValue={setValue} disabled={hasInput} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <BaseNode.Foldout
            panelId={"channels"}
            outputs={"red green blue cyan magenta yellow hue white black saturationV saturationL sturationI lightness value intensity chroma luminance alpha"}
            inputs={""}
            nodeId={nodeId}
            label={"Channels"}
         >
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"red"} type={SocketTypes.PERCENT}>
               Red (R)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"green"} type={SocketTypes.PERCENT}>
               Green (G)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"blue"} type={SocketTypes.PERCENT}>
               Blue (B)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"cyan"} type={SocketTypes.PERCENT}>
               Cyan (C)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"magenta"} type={SocketTypes.PERCENT}>
               Magenta (M)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"yellow"} type={SocketTypes.PERCENT}>
               Yellow (Y)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"hue"} type={SocketTypes.ANGLE}>
               Hue (H)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"white"} type={SocketTypes.PERCENT}>
               White (W)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"black"} type={SocketTypes.PERCENT}>
               Black (K)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.PERCENT}>
               Value (V)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"saturationV"} type={SocketTypes.PERCENT}>
               Saturation (S<sub>V</sub>)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"intensity"} type={SocketTypes.PERCENT}>
               Intensity (I)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"saturationI"} type={SocketTypes.PERCENT}>
               Saturation (S<sub>I</sub>)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"lightness"} type={SocketTypes.PERCENT}>
               Lightness (L)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"saturationL"} type={SocketTypes.PERCENT}>
               Saturation (S<sub>L</sub>)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"chroma"} type={SocketTypes.PERCENT}>
               Chroma (C)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"luminance"} type={SocketTypes.PERCENT}>
               Luminance (Y)
            </SocketOut>
            <SocketOut<ISplitColorNode> nodeId={nodeId} socketId={"alpha"} type={SocketTypes.PERCENT}>
               Alpha (α)
            </SocketOut>
         </BaseNode.Foldout>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof ISplitColorNode["outputs"], globals: Globals) => {
   const v = nodeMethods.coalesce(graph, nodeId, "input", "value", globals);
   return colorComponents(v)[socket];
};

const nodeMethods = ArcaneGraph.nodeMethods<ISplitColorNode>();

const SplitColorNodeHelper: INodeHelper<ISplitColorNode> = {
   name: "Split Color",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.SPLIT_COLOR,
   getOutput,
   initialize: () => ({
      value: { r: 0, g: 0, b: 0, a: 1 },
   }),
   controls: Controls,
};

export default SplitColorNodeHelper;
