import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faPalette as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faPalette as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import HexColorInput from "!/components/inputs/colorHexInput";
import { Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut } from "../../nodeView/socket";
import { colorComponents } from "!/utility/colorconvert";

interface IHexColorNode extends INodeDefinition {
   inputs: {};
   outputs: {
      full: Color;
      solid: Color;
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

const nodeHelper = ArcaneGraph.nodeHooks<IHexColorNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [value, setValue] = nodeHelper.useValueState(nodeId, "value");
   return (
      <BaseNode<IHexColorNode> nodeId={nodeId} helper={HexColorNodeHelper}>
         <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"full"} type={SocketTypes.COLOR}>
            <BaseNode.Input label={"Value"}>
               <HexColorInput value={value} onValue={setValue} />
            </BaseNode.Input>
         </SocketOut>
         <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"solid"} type={SocketTypes.COLOR}>
            Solid
         </SocketOut>
         <hr />
         <BaseNode.Foldout
            outputs={"red green blue cyan magenta yellow hue white black saturationV saturationL sturationI lightness value intensity chroma luminance alpha"}
            inputs={""}
            nodeId={nodeId}
            label={"Channels"}
         >
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"red"} type={SocketTypes.INTEGER}>
               Red (R)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"green"} type={SocketTypes.INTEGER}>
               Green (G)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"blue"} type={SocketTypes.INTEGER}>
               Blue (B)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"cyan"} type={SocketTypes.FLOAT}>
               Cyan (C)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"magenta"} type={SocketTypes.FLOAT}>
               Magenta (M)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"yellow"} type={SocketTypes.FLOAT}>
               Yellow (Y)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"hue"} type={SocketTypes.ANGLE}>
               Hue (H)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"white"} type={SocketTypes.FLOAT}>
               White (W)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"black"} type={SocketTypes.FLOAT}>
               Black (K)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.FLOAT}>
               Value (V)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"saturationV"} type={SocketTypes.FLOAT}>
               Saturation (S<sub>V</sub>)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"intensity"} type={SocketTypes.FLOAT}>
               Intensity (I)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"saturationI"} type={SocketTypes.FLOAT}>
               Saturation (S<sub>I</sub>)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"lightness"} type={SocketTypes.FLOAT}>
               Lightness (L)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"saturationL"} type={SocketTypes.FLOAT}>
               Saturation (S<sub>L</sub>)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"chroma"} type={SocketTypes.FLOAT}>
               Chroma (C)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"luminance"} type={SocketTypes.FLOAT}>
               Luminance (Y)
            </SocketOut>
            <SocketOut<IHexColorNode> nodeId={nodeId} socketId={"alpha"} type={SocketTypes.FLOAT}>
               Alpha (α)
            </SocketOut>
         </BaseNode.Foldout>
      </BaseNode>
   );
});

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IHexColorNode["outputs"]) => {
   const v = nodeMethods.getValue(graph, nodeId, "value");

   switch (socket) {
      case "full":
         return v;
      case "solid":
         return { ...v, a: 1 } as Color;
      default:
         return colorComponents(v)[socket];
   }
};

const nodeMethods = ArcaneGraph.nodeMethods<IHexColorNode>();

const HexColorNodeHelper: INodeHelper<IHexColorNode> = {
   name: "Color",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.VALUE_COLOR,
   getOutput,
   initialize: () => ({
      value: { r: 0, g: 0, b: 0, a: 1 },
   }),
   controls: Controls,
};

export default HexColorNodeHelper;
