import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper } from "../types";
import { faMicrochip as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faMicrochip as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import Dropdown from "!/components/selectors/Dropdown";
import { Length } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import Checkbox from "!/components/buttons/Checkbox";
import MathHelper from "!/utility/mathhelper";
import NumberInput from "!/components/inputs/NumberInput";
import { MetaPrefab } from "../../nodeView/prefabs";
import { SocketTypes, NodeTypes } from "!/utility/enums";

interface IConvertNode extends INodeDefinition {
   inputs: {
      inputNumber: number;
      numberToPercentLower: number;
      numberToPercentUpper: number;
      inputPercent: number;
      inputAngle: number;
      inputLength: Length;
   };
   outputs: {
      numberToLength: Length;
      numberToAngle: number;
      numberToPercent: number;
      percentToCentigrade: number;
      percentToHectograde: number;
      angleToDegrees: number;
      angleToRadians: number;
      angleToTurns: number;
      lengthToPx: number;
      lengthToPt: number;
      lengthToIn: number;
      lengthToCm: number;
      lengthToMm: number;
   };
   values: {
      numberToLengthUnit: Length["unit"];
      numberToAngleBounded: boolean;
      numberToPercentLower: number;
      numberToPercentUpper: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IConvertNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [numberToLengthUnit, setNumberToLengthUnit] = nodeHelper.useValueState(nodeId, "numberToLengthUnit");
   const [numberToAngleBounded, setNumberToAngleBounded] = nodeHelper.useValueState(nodeId, "numberToAngleBounded");
   const [numberToPercentLower, setNumberToPercentLower] = nodeHelper.useValueState(nodeId, "numberToPercentLower");
   const [numberToPercentUpper, setNumberToPercentUpper] = nodeHelper.useValueState(nodeId, "numberToPercentUpper");

   const hasNumberToPercentLower = nodeHelper.useHasLink(nodeId, "numberToPercentLower");
   const hasNumberToPercentUpper = nodeHelper.useHasLink(nodeId, "numberToPercentUpper");
   const actualPercentLower = nodeHelper.useInput(nodeId, "numberToPercentLower", globals);
   const actualPercentUpper = nodeHelper.useInput(nodeId, "numberToPercentUpper", globals);

   return (
      <BaseNode<IConvertNode> nodeId={nodeId} helper={ConvertNodeHelper} hooks={nodeHelper}>
         <BaseNode.Foldout
            panelId={"fromNumber"}
            label={"Number"}
            nodeId={nodeId}
            inputs={"inputNumber numberToPercentLower numberToPercentUpper"}
            outputs={"numberToLength numberToAngle numberToPercent"}
            startOpen
         >
            <SocketIn<IConvertNode> nodeId={nodeId} socketId={"inputNumber"} type={SocketTypes.NUMBER}>
               Number Input
            </SocketIn>
            <hr />
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"numberToLength"} type={SocketTypes.LENGTH}>
               To Length
            </SocketOut>
            <BaseNode.Input label={"Unit"}>
               <Dropdown value={numberToLengthUnit} options={UNIT_OPTIONS} onValue={setNumberToLengthUnit} />
            </BaseNode.Input>
            <hr />
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"numberToAngle"} type={SocketTypes.ANGLE}>
               To Angle
            </SocketOut>
            <Checkbox checked={numberToAngleBounded} onToggle={setNumberToAngleBounded}>
               Bounded (0-360)
            </Checkbox>
            <hr />
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"numberToPercent"} type={SocketTypes.PERCENT}>
               To Percent
            </SocketOut>
            <SocketIn<IConvertNode> nodeId={nodeId} socketId={"numberToPercentLower"} type={SocketTypes.NUMBER}>
               <BaseNode.Input label={"Lower Bound"}>
                  <NumberInput
                     value={numberToPercentLower}
                     onValidValue={setNumberToPercentLower}
                     max={actualPercentUpper ?? numberToPercentUpper}
                     disabled={hasNumberToPercentLower}
                  />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IConvertNode> nodeId={nodeId} socketId={"numberToPercentUpper"} type={SocketTypes.NUMBER}>
               <BaseNode.Input label={"Upper Bound"}>
                  <NumberInput
                     value={numberToPercentUpper}
                     onValidValue={setNumberToPercentUpper}
                     min={actualPercentLower ?? numberToPercentLower}
                     disabled={hasNumberToPercentUpper}
                  />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <BaseNode.Foldout
            panelId={"fromPercent"}
            label={"Percent"}
            nodeId={nodeId}
            inputs={"inputPercent"}
            outputs={"percentToCentigrade percentToHectograde"}
            startOpen
         >
            <SocketIn<IConvertNode> nodeId={nodeId} socketId={"inputNumber"} type={SocketTypes.PERCENT}>
               Percent Input
            </SocketIn>
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"percentToCentigrade"} type={SocketTypes.FLOAT}>
               as Centigrade (0-1)
            </SocketOut>
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"percentToHectograde"} type={SocketTypes.FLOAT}>
               as Hectograde (0-100)
            </SocketOut>
         </BaseNode.Foldout>
         <BaseNode.Foldout
            panelId={"fromAngle"}
            label={"Angle"}
            nodeId={nodeId}
            inputs={"inputAngle"}
            outputs={"angleToDegrees angleToRadians angleToTurns"}
            startOpen
         >
            <SocketIn<IConvertNode> nodeId={nodeId} socketId={"inputAngle"} type={SocketTypes.ANGLE}>
               Angle Input
            </SocketIn>
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"angleToDegrees"} type={SocketTypes.FLOAT}>
               as Degrees
            </SocketOut>
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"angleToRadians"} type={SocketTypes.FLOAT}>
               as Radians
            </SocketOut>
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"angleToTurns"} type={SocketTypes.FLOAT}>
               as Turns
            </SocketOut>
         </BaseNode.Foldout>
         <BaseNode.Foldout
            panelId={"fromLength"}
            label={"Length"}
            nodeId={nodeId}
            inputs={"inputLength"}
            outputs={"lengthToPx lengthToPt lengthToIn lengthToCm lengthToMm"}
            startOpen
         >
            <SocketIn<IConvertNode> nodeId={nodeId} socketId={"inputLength"} type={SocketTypes.LENGTH}>
               Length Input
            </SocketIn>
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"lengthToPx"} type={SocketTypes.FLOAT}>
               as Pixels (px)
            </SocketOut>
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"lengthToPt"} type={SocketTypes.FLOAT}>
               as Points (pt)
            </SocketOut>
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"lengthToIn"} type={SocketTypes.FLOAT}>
               as Inches (in)
            </SocketOut>
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"lengthToMm"} type={SocketTypes.FLOAT}>
               as Millimeters (mm)
            </SocketOut>
            <SocketOut<IConvertNode> nodeId={nodeId} socketId={"lengthToCm"} type={SocketTypes.FLOAT}>
               as Centimeters (cm)
            </SocketOut>
         </BaseNode.Foldout>
         <MetaPrefab nodeId={nodeId} hooks={nodeHelper} />
      </BaseNode>
   );
});

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IConvertNode["outputs"], globals: GraphGlobals) => {
   const inputNumber = nodeMethods.getInput(graph, nodeId, "inputNumber", globals) ?? 0;
   const percentLower = nodeMethods.coalesce(graph, nodeId, "numberToPercentLower", "numberToPercentLower", globals) ?? 0;
   const percentUpper = nodeMethods.coalesce(graph, nodeId, "numberToPercentUpper", "numberToPercentUpper", globals) ?? 1;
   const inputPercent = nodeMethods.getInput(graph, nodeId, "inputPercent", globals) ?? 0;
   const inputAngle = nodeMethods.getInput(graph, nodeId, "inputAngle", globals) ?? 0;
   const inputLength = nodeMethods.getInput(graph, nodeId, "inputLength", globals) ?? DEFUALT_LENGTH;
   switch (socket) {
      case "numberToAngle":
         return nodeMethods.getValue(graph, nodeId, "numberToAngleBounded") ? MathHelper.mod(inputNumber, 360) : inputNumber;
      case "numberToLength":
         return { value: inputNumber, unit: nodeMethods.getValue(graph, nodeId, "numberToLengthUnit") };
      case "numberToPercent":
         return MathHelper.delerp(MathHelper.clamp(inputNumber, percentLower, percentUpper), percentLower, percentUpper);
      case "percentToCentigrade":
         return MathHelper.clamp(inputPercent, 0, 1);
      case "percentToHectograde":
         return MathHelper.clamp(inputPercent * 100, 0, 100);
      case "angleToDegrees":
         return inputAngle;
      case "angleToRadians":
         return MathHelper.deg2rad(inputAngle);
      case "angleToTurns":
         return inputAngle / 360;
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

const DEFUALT_LENGTH: Length = { value: 0, unit: "px" };

const nodeMethods = ArcaneGraph.nodeMethods<IConvertNode>();

const ConvertNodeHelper: INodeHelper<IConvertNode> = {
   name: "Convert Value",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.CONVERT_VALUE,
   getOutput,
   initialize: () => ({
      numberToLengthUnit: "px",
      numberToAngleBounded: true,
      numberToPercentLower: 0,
      numberToPercentUpper: 1,
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
