import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";
import MathHelper from "!/utility/mathhelper";

import { faRuler as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faRuler as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import LengthInput from "!/components/inputs/LengthInput";
import { Length } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";

interface ILengthValueNode extends INodeDefinition {
   inputs: {};
   outputs: {
      value: Length;
      lengthToPx: number;
      lengthToPt: number;
      lengthToIn: number;
      lengthToMm: number;
      lengthToCm: number;
   };
   values: {
      value: Length;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<ILengthValueNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [value, setValue] = nodeHooks.useValueState(nodeId, "value");

   return (
      <BaseNode<ILengthValueNode> nodeId={nodeId} helper={LengthValueNodeHelper} hooks={nodeHooks}>
         <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"value"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Value"}>
               <LengthInput value={value} onValidValue={setValue} />
            </BaseNode.Input>
         </SocketOut>
         <BaseNode.Foldout
            panelId={"units"}
            nodeId={nodeId}
            inputs={""}
            outputs={"lengthToPx lengthToPt lengthToIn lengthToCm lengthToMm"}
            label={"Additional Outputs"}
         >
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"lengthToPx"} type={SocketTypes.FLOAT}>
               as Pixels (px)
            </SocketOut>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"lengthToPt"} type={SocketTypes.FLOAT}>
               as Points (pt)
            </SocketOut>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"lengthToIn"} type={SocketTypes.FLOAT}>
               as Inches (in)
            </SocketOut>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"lengthToMm"} type={SocketTypes.FLOAT}>
               as Millimeters (mm)
            </SocketOut>
            <SocketOut<ILengthValueNode> nodeId={nodeId} socketId={"lengthToCm"} type={SocketTypes.FLOAT}>
               as Centimeters (cm)
            </SocketOut>
         </BaseNode.Foldout>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<ILengthValueNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof ILengthValueNode["outputs"]) => {
   const inputLength = nodeMethods.getValue(graph, nodeId, "value");
   switch (socket) {
      case "value":
         return inputLength;
      case "lengthToPx":
         return inputLength.value;
      case "lengthToPt":
         return MathHelper.convertLength(inputLength, "pt").value;
      case "lengthToIn":
         return MathHelper.convertLength(inputLength, "in").value;
      case "lengthToMm":
         return MathHelper.convertLength(inputLength, "mm").value;
      case "lengthToCm":
         return MathHelper.convertLength(inputLength, "cm").value;
   }
};

const LengthValueNodeHelper: INodeHelper<ILengthValueNode> = {
   name: "Length",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.VALUE_LENGTH,
   getOutput,
   initialize: () => ({
      value: { value: 1, unit: "px" },
   }),
   controls: Controls,
};

export default LengthValueNodeHelper;
