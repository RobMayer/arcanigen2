import { memo } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, Globals, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, RoundingMode, ROUNDING_MODES, SocketTypes } from "../types";
import { faBracketsSquare as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faBracketsSquare as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import Dropdown from "!/components/selectors/Dropdown";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import MathHelper from "!/utility/mathhelper";
import TextInput from "!/components/inputs/TextInput";

interface IMathRndNode extends INodeDefinition {
   inputs: {
      input: number;
   };
   outputs: {
      output: number;
   };
   values: {
      name: string;
      roundingMode: RoundingMode;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IMathRndNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [roundingMode, setRoundingMode] = nodeHelper.useValueState(nodeId, "roundingMode");

   return (
      <BaseNode<IMathRndNode> nodeId={nodeId} helper={MathRndNodeHelper} name={name}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
         <SocketIn<IMathRndNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.NUMBER}>
            Value
         </SocketIn>
         <hr />
         <SocketOut<IMathRndNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.INTEGER}>
            Output
         </SocketOut>
         <BaseNode.Input label={"Rounding Method"}>
            <Dropdown value={roundingMode} options={ROUNDING_MODES} onValue={setRoundingMode} />
         </BaseNode.Input>
      </BaseNode>
   );
});

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IMathRndNode["outputs"], globals: Globals) => {
   const value = nodeMethods.getInput(graph, nodeId, "input", globals) ?? 0;
   return MathHelper.round(value, nodeMethods.getValue(graph, nodeId, "roundingMode"));
};

const nodeMethods = ArcaneGraph.nodeMethods<IMathRndNode>();

const MathRndNodeHelper: INodeHelper<IMathRndNode> = {
   name: "Round",
   buttonIcon,
   nodeIcon,
   flavour: "accent",
   type: NodeTypes.MATH_RND,
   getOutput,
   initialize: () => ({
      name: "",
      roundingMode: "nearestUp",
   }),
   controls: Controls,
};

export default MathRndNodeHelper;
