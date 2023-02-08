import { memo } from "react";
import ArcaneGraph from "../graph";
import { Curve, CurveFunction, CURVE_FUNCTIONS, EasingMode, EASING_MODES, IArcaneGraph, INodeDefinition, INodeHelper, NodeTypes, SocketTypes } from "../types";

import { faFunction as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faFunction as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import BaseNode from "../../nodeView/node";
import { SocketOut } from "../../nodeView/socket";
import Dropdown from "!/components/selectors/Dropdown";
import ToggleList from "!/components/selectors/ToggleList";

interface ICurveNode extends INodeDefinition {
   inputs: {};
   outputs: {
      output: Curve;
   };
   values: {
      curveFn: CurveFunction;
      easing: EasingMode;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<ICurveNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [curveFn, setCurveFn] = nodeHelper.useValueState(nodeId, "curveFn");
   const [easing, setEasing] = nodeHelper.useValueState(nodeId, "easing");

   return (
      <BaseNode<ICurveNode> nodeId={nodeId} helper={CurveNodeHelper}>
         <SocketOut<ICurveNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.CURVE}>
            Function
         </SocketOut>
         <hr />
         <BaseNode.Input label={"Curve"}>
            <Dropdown value={curveFn} onValue={setCurveFn} options={CURVE_FUNCTIONS} />
         </BaseNode.Input>
         <BaseNode.Input label={"Easing"}>
            <ToggleList value={easing} onValue={setEasing} options={EASING_MODES} />
         </BaseNode.Input>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<ICurveNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof ICurveNode["outputs"]) => {
   const curveFn = nodeMethods.getValue(graph, nodeId, "curveFn");
   const easing = nodeMethods.getValue(graph, nodeId, "easing");
   return {
      curveFn,
      easing,
   };
};

const CurveNodeHelper: INodeHelper<ICurveNode> = {
   name: "Curve",
   buttonIcon,
   nodeIcon,
   flavour: "info",
   type: NodeTypes.VALUE_CURVE,
   getOutput,
   initialize: () => ({
      curveFn: "linear",
      easing: "in",
   }),
   controls: Controls,
};

export default CurveNodeHelper;
