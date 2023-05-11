import { memo, useEffect } from "react";
import ArcaneGraph from "../graph";
import { ControlRendererProps, GraphGlobals, IArcaneGraph, INodeDefinition, INodeHelper, Sequence, Interpolator } from "../types";
import { AngleLerpMode, ANGLE_LERP_MODE_OPTIONS, AngleLerpModes, NodeTypes, SocketTypes } from "../../../../utility/enums";
import MathHelper from "!/utility/mathhelper";

import { faGaugeMed as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faGaugeMed as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import SliderInput from "!/components/inputs/SliderInput";
import AngleInput from "!/components/inputs/AngleInput";
import Checkbox from "!/components/buttons/Checkbox";
import Dropdown from "!/components/selectors/Dropdown";
import { MetaPrefab } from "../../nodeView/prefabs";

interface ILerpAngleNode extends INodeDefinition {
   inputs: {
      from: number;
      to: number;
      percent: number;
      sequence: Sequence;
      distribution: Interpolator;
   };
   outputs: {
      value: number;
   };
   values: {
      from: number;
      to: number;
      percent: number;
      mode: AngleLerpMode;
      bounded: boolean;
      isInclusive: boolean;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<ILerpAngleNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [from, setFrom] = nodeHooks.useValueState(nodeId, "from");
   const [to, setTo] = nodeHooks.useValueState(nodeId, "to");
   const [percent, setPercent] = nodeHooks.useValueState(nodeId, "percent");
   const [bounded, setBounded] = nodeHooks.useValueState(nodeId, "bounded");
   const [mode, setMode] = nodeHooks.useValueState(nodeId, "mode");
   const [isInclusive, setIsInclusive] = nodeHooks.useValueState(nodeId, "isInclusive");

   const hasSequence = nodeHooks.useHasLink(nodeId, "sequence");

   useEffect(() => {
      if (bounded) {
         setFrom((p) => MathHelper.mod(p, 360));
         setTo((p) => MathHelper.mod(p, 360));
      }
   }, [bounded, setFrom, setTo]);

   return (
      <BaseNode<ILerpAngleNode> nodeId={nodeId} helper={LerpAngleNodeHelper} hooks={nodeHooks}>
         <SocketOut<ILerpAngleNode> socketId={"value"} nodeId={nodeId} type={SocketTypes.ANGLE}>
            Value
         </SocketOut>
         <hr />
         <SocketIn<ILerpAngleNode> socketId={"sequence"} nodeId={nodeId} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketIn>
         <SocketIn<ILerpAngleNode> socketId={"from"} nodeId={nodeId} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"From"}>
               <AngleInput value={from} onValidValue={setFrom} wrap={!bounded} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ILerpAngleNode> socketId={"to"} nodeId={nodeId} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"To"}>
               <AngleInput value={to} onValidValue={setTo} wrap={!bounded} />
            </BaseNode.Input>
         </SocketIn>
         <Checkbox checked={bounded} onToggle={setBounded}>
            Bounded (0-360)
         </Checkbox>
         <BaseNode.Input label={"Hue Direction"}>
            <Dropdown value={mode} onValue={setMode} options={ANGLE_LERP_MODE_OPTIONS} disabled={!bounded} />
         </BaseNode.Input>
         <Checkbox checked={isInclusive} onToggle={setIsInclusive} disabled={!hasSequence}>
            Inclusive
         </Checkbox>
         <hr />
         <SocketIn<ILerpAngleNode> socketId={"distribution"} nodeId={nodeId} type={SocketTypes.CURVE}>
            Value Distribution
         </SocketIn>
         <SocketIn<ILerpAngleNode> socketId={"percent"} nodeId={nodeId} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Percent"}>
               <SliderInput value={percent} onValidValue={setPercent} disabled={hasSequence} min={0} max={1} />
            </BaseNode.Input>
         </SocketIn>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<ILerpAngleNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof ILerpAngleNode["outputs"], globals: GraphGlobals) => {
   const sequence = nodeMethods.getInput(graph, nodeId, "sequence", globals);

   const percent = nodeMethods.coalesce(graph, nodeId, "percent", "percent", globals);
   const mode = nodeMethods.getValue(graph, nodeId, "mode");
   const bounded = nodeMethods.getValue(graph, nodeId, "bounded");
   const from = nodeMethods.coalesce(graph, nodeId, "from", "from", globals);
   const to = nodeMethods.coalesce(graph, nodeId, "to", "to", globals);
   const distribution = nodeMethods.getInput(graph, nodeId, "distribution", globals);

   const isInclusive = nodeMethods.getValue(graph, nodeId, "isInclusive");

   if (sequence) {
      const iter = globals.sequenceData[sequence.senderId] ?? sequence.min;
      const t = MathHelper.delerp(iter, sequence.min, sequence.max - (isInclusive ? 1 : 0));
      return bounded ? MathHelper.angleLerp(t, from, to, mode, distribution) : MathHelper.lerp(t, from, to, distribution);
   }

   const t = MathHelper.angleLerp(MathHelper.clamp(percent, 0, 1), from / 360, to / 360, mode, distribution) * 360;

   return bounded ? t : MathHelper.lerp(MathHelper.clamp(percent, 0, 1), from, to, distribution);
};

const LerpAngleNodeHelper: INodeHelper<ILerpAngleNode> = {
   name: "Angle Lerp",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.LERP_ANGLE,
   getOutput,
   initialize: () => ({
      from: 0,
      to: 180,
      percent: 0,
      mode: AngleLerpModes.CLOSEST_CW,
      bounded: true,
      isInclusive: true,
   }),
   controls: Controls,
};

export default LerpAngleNodeHelper;
