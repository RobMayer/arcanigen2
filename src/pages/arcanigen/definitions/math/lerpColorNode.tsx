import { memo } from "react";
import ArcaneGraph from "../graph";
import {
   AngleLerpMode,
   ANGLE_LERP_MODES,
   ColorSpace,
   COLOR_SPACES,
   ControlRendererProps,
   Curve,
   Globals,
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeTypes,
   Sequence,
   SocketTypes,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { faExclamationCircle, faGaugeMed as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faGaugeMed as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import Icon from "!/components/icons";
import styled from "styled-components";
import { Color } from "!/utility/types/units";
import HexColorInput from "!/components/inputs/colorHexInput";
import Dropdown from "!/components/selectors/Dropdown";
import SliderInput from "!/components/inputs/SliderInput";
import Checkbox from "!/components/buttons/Checkbox";
import TextInput from "!/components/inputs/TextInput";

interface ILerpColorNode extends INodeDefinition {
   inputs: {
      from: Color;
      to: Color;
      percent: number;
      sequence: Sequence;
      distribution: Curve;
   };
   outputs: {
      value: Color;
   };
   values: {
      name: string;
      from: Color;
      to: Color;
      percent: number;
      colorSpace: ColorSpace;
      hueMode: AngleLerpMode;
      isInclusive: boolean;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<ILerpColorNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [name, setName] = nodeHelper.useValueState(nodeId, "name");
   const [from, setFrom] = nodeHelper.useValueState(nodeId, "from");
   const [to, setTo] = nodeHelper.useValueState(nodeId, "to");
   const [percent, setPercent] = nodeHelper.useValueState(nodeId, "percent");
   const [isInclusive, setIsInclusive] = nodeHelper.useValueState(nodeId, "isInclusive");

   const hasSequence = nodeHelper.useHasLink(nodeId, "sequence");
   const hasFrom = nodeHelper.useHasLink(nodeId, "from");
   const hasTo = nodeHelper.useHasLink(nodeId, "to");

   const [colorSpace, setColorSpace] = nodeHelper.useValueState(nodeId, "colorSpace");
   const [hueMode, setHueMode] = nodeHelper.useValueState(nodeId, "hueMode");

   return (
      <BaseNode<ILerpColorNode> nodeId={nodeId} helper={LerpColorNodeHelper} name={name}>
         <BaseNode.Input>
            <TextInput className={"slim"} placeholder={"Label"} value={name} onCommit={setName} />
         </BaseNode.Input>
         <SocketOut<ILerpColorNode> socketId={"value"} nodeId={nodeId} type={SocketTypes.COLOR}>
            <BaseNode.Output label={"Value"}>
               {hasSequence ? (
                  <Warning title={"This will be calculated during the render"}>
                     <Icon icon={faExclamationCircle} />
                     Varies
                  </Warning>
               ) : (
                  percent
               )}
            </BaseNode.Output>
         </SocketOut>
         <hr />
         <SocketIn<ILerpColorNode> socketId={"sequence"} nodeId={nodeId} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketIn>
         <SocketIn<ILerpColorNode> socketId={"from"} nodeId={nodeId} type={SocketTypes.COLOR}>
            <BaseNode.Input label={"From"}>
               <HexColorInput value={from} onValue={setFrom} disabled={hasFrom} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ILerpColorNode> socketId={"to"} nodeId={nodeId} type={SocketTypes.COLOR}>
            <BaseNode.Input label={"To"}>
               <HexColorInput value={to} onValue={setTo} disabled={hasTo} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <BaseNode.Input label={"Color Space"}>
            <Dropdown value={colorSpace} onValue={setColorSpace} options={COLOR_SPACES} />
         </BaseNode.Input>
         <BaseNode.Input label={"Hue Direction"}>
            <Dropdown value={hueMode} onValue={setHueMode} options={ANGLE_LERP_MODES} disabled={!HAS_HUE.includes(colorSpace)} />
         </BaseNode.Input>
         <Checkbox checked={isInclusive} onToggle={setIsInclusive} disabled={!hasSequence}>
            Inclusive
         </Checkbox>
         <hr />
         <SocketIn<ILerpColorNode> socketId={"distribution"} nodeId={nodeId} type={SocketTypes.CURVE}>
            Value Distribution
         </SocketIn>
         <SocketIn<ILerpColorNode> socketId={"percent"} nodeId={nodeId} type={SocketTypes.PERCENT}>
            <BaseNode.Input label={"Percent"}>
               <SliderInput value={percent} onValidValue={setPercent} disabled={hasSequence} min={0} max={1} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<ILerpColorNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof ILerpColorNode["outputs"], globals: Globals) => {
   const sequence = nodeMethods.getInput(graph, nodeId, "sequence", globals);

   const percent = nodeMethods.coalesce(graph, nodeId, "percent", "percent", globals);
   const from = nodeMethods.coalesce(graph, nodeId, "from", "from", globals);
   const to = nodeMethods.coalesce(graph, nodeId, "to", "to", globals);

   const colorSpace = nodeMethods.getValue(graph, nodeId, "colorSpace");
   const hueMode = nodeMethods.getValue(graph, nodeId, "hueMode");
   const distribution = nodeMethods.getInput(graph, nodeId, "distribution", globals);

   const isInclusive = nodeMethods.getValue(graph, nodeId, "isInclusive");

   if (sequence) {
      const iter = globals.sequenceData[sequence.senderId] ?? sequence.min;
      const t = MathHelper.delerp(iter, sequence.min, sequence.max - (isInclusive ? 1 : 0));
      return MathHelper.colorLerp(t, from, to, colorSpace, hueMode, distribution);
   }

   return MathHelper.colorLerp(MathHelper.clamp(percent, 0, 1), from, to, colorSpace, hueMode, distribution);

   //TODO: How do I get sequence data from here?!?
};

const LerpColorNodeHelper: INodeHelper<ILerpColorNode> = {
   name: "Color Lerp",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.LERP_COLOR,
   getOutput,
   initialize: () => ({
      name: "",
      from: { r: 0, g: 0, b: 0, a: 1 },
      to: { r: 1, g: 1, b: 1, a: 1 },
      percent: 0,
      colorSpace: "RGB",
      hueMode: "closestCW",
      isInclusive: true,
   }),
   controls: Controls,
};

export default LerpColorNodeHelper;

const Warning = styled.div`
   display: grid;
   grid-template-columns: auto 1fr;
   align-items: center;
   gap: 0.5em;
   color: var(--danger-icon);
   cursor: default;
`;

const HAS_HUE: ColorSpace[] = ["HSL", "HSV", "HWK", "HSI", "HCY"];
