import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, RoundingMode, ROUNDING_MODES, SocketTypes } from "../types";
import { faMicrochip as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faMicrochip as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import Dropdown from "!/components/selectors/Dropdown";
import { Length } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import Checkbox from "!/components/buttons/Checkbox";
import MathHelper from "!/utility/mathhelper";

interface IConvertNode extends INodeDefinition {
   inputs: {
      input: number;
   };
   outputs: {
      toLength: Length;
      toAngle: number;
      toInteger: number;
   };
   values: {
      lengthUnit: Length["unit"];
      angleBounded: boolean;
      roundingMode: RoundingMode;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IConvertNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [lengthUnit, setLengthUnit] = nodeHelper.useValueState(nodeId, "lengthUnit");
   const [angleBounded, setAngleBounded] = nodeHelper.useValueState(nodeId, "angleBounded");
   const [roundingMode, setRoundingMode] = nodeHelper.useValueState(nodeId, "roundingMode");

   return (
      <BaseNode<IConvertNode> nodeId={nodeId} helper={ConvertNodeHelper}>
         <SocketIn<IConvertNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.NUMBER}>
            Value
         </SocketIn>
         <hr />
         <SocketOut<IConvertNode> nodeId={nodeId} socketId={"toLength"} type={SocketTypes.LENGTH}>
            To Length
         </SocketOut>
         <BaseNode.Input label={"Unit"}>
            <Dropdown value={lengthUnit} options={UNIT_OPTIONS} onValue={setLengthUnit} />
         </BaseNode.Input>
         <hr />
         <SocketOut<IConvertNode> nodeId={nodeId} socketId={"toAngle"} type={SocketTypes.ANGLE}>
            To Angle
         </SocketOut>
         <Checkbox checked={angleBounded} onToggle={setAngleBounded}>
            Bounded 0-360
         </Checkbox>
         <hr />
         <SocketOut<IConvertNode> nodeId={nodeId} socketId={"toInteger"} type={SocketTypes.INTEGER}>
            To Integer
         </SocketOut>
         <BaseNode.Input label={"Rounding Method"}>
            <Dropdown value={roundingMode} options={ROUNDING_MODES} onValue={setRoundingMode} />
         </BaseNode.Input>
      </BaseNode>
   );
});

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IConvertNode["outputs"], globals: Globals) => {
   const value = nodeMethods.getInput(graph, nodeId, "input", globals) ?? 0;
   switch (socket) {
      case "toAngle":
         return nodeMethods.getValue(graph, nodeId, "angleBounded") ? MathHelper.mod(value, 360) : value;
      case "toLength":
         return { value, unit: nodeMethods.getValue(graph, nodeId, "lengthUnit") };
      case "toInteger":
         return MathHelper.round(value, nodeMethods.getValue(graph, nodeId, "roundingMode"));
   }
};

const nodeMethods = ArcaneGraph.nodeMethods<IConvertNode>();

const ConvertNodeHelper: INodeHelper<IConvertNode> = {
   name: "Convert Value",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.CONVERT_VALUE,
   getOutput,
   initialize: () => ({
      lengthUnit: "px",
      angleBounded: true,
      roundingMode: "nearestUp",
   }),
   controls: Controls,
};

export default ConvertNodeHelper;

const UNIT_OPTIONS: { [keys in Length["unit"]]: string } = {
   px: "px",
   pt: "pt",
   in: "in",
   cm: "cm",
   mm: "mm",
};
