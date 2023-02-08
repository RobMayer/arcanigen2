import { memo } from "react";
import ArcaneGraph from "../graph";
import {
   AngleLerpMode,
   ANGLE_LERP_MODES,
   ColorSpace,
   COLOR_SPACES,
   ControlRendererProps,
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
import NumberInput from "!/components/inputs/NumberInput";
import Icon from "!/components/icons";
import styled from "styled-components";
import { Color } from "!/utility/types/units";
import HexColorInput from "!/components/inputs/colorHexInput";
import Dropdown from "!/components/selectors/Dropdown";

interface IColorLerpNode extends INodeDefinition {
   inputs: {
      from: Color;
      to: Color;
      start: number;
      end: number;
      interval: number;
      sequence: Sequence;
   };
   outputs: {
      value: Color;
   };
   values: {
      from: Color;
      to: Color;
      start: number;
      end: number;
      interval: number;
      colorSpace: ColorSpace;
      hueMode: AngleLerpMode;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IColorLerpNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [from, setFrom] = nodeHelper.useValueState(nodeId, "from");
   const [to, setTo] = nodeHelper.useValueState(nodeId, "to");
   const [start, setStart] = nodeHelper.useValueState(nodeId, "start");
   const [end, setEnd] = nodeHelper.useValueState(nodeId, "end");
   const [interval, setInterval] = nodeHelper.useValueState(nodeId, "interval");

   const hasSequence = nodeHelper.useHasLink(nodeId, "sequence");
   const hasFrom = nodeHelper.useHasLink(nodeId, "from");
   const hasTo = nodeHelper.useHasLink(nodeId, "to");

   const [colorSpace, setColorSpace] = nodeHelper.useValueState(nodeId, "colorSpace");
   const [hueMode, setHueMode] = nodeHelper.useValueState(nodeId, "hueMode");

   return (
      <BaseNode<IColorLerpNode> nodeId={nodeId} helper={ColorLerpNodeHelper}>
         <SocketOut<IColorLerpNode> socketId={"value"} nodeId={nodeId} type={SocketTypes.COLOR}>
            <BaseNode.Output label={"Value"}>
               {hasSequence ? (
                  <Warning title={"This will be calculated during the render"}>
                     <Icon icon={faExclamationCircle} />
                     Varies
                  </Warning>
               ) : (
                  interval
               )}
            </BaseNode.Output>
         </SocketOut>
         <hr />
         <SocketIn<IColorLerpNode> socketId={"sequence"} nodeId={nodeId} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketIn>
         <SocketIn<IColorLerpNode> socketId={"from"} nodeId={nodeId} type={SocketTypes.COLOR}>
            <BaseNode.Input label={"From"}>
               <HexColorInput value={from} onValue={setFrom} disabled={hasFrom} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorLerpNode> socketId={"to"} nodeId={nodeId} type={SocketTypes.COLOR}>
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
         <hr />
         <SocketIn<IColorLerpNode> socketId={"start"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"Start"}>
               <NumberInput value={start} onValidValue={setStart} disabled={hasSequence} max={end} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorLerpNode> socketId={"interval"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"Interval"}>
               <NumberInput value={interval} onValidValue={setInterval} disabled={hasSequence} min={start} max={end} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IColorLerpNode> socketId={"end"} nodeId={nodeId} type={SocketTypes.NUMBER}>
            <BaseNode.Input label={"End"}>
               <NumberInput value={end} onValidValue={setEnd} disabled={hasSequence} min={start} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const nodeMethods = ArcaneGraph.nodeMethods<IColorLerpNode>();

const getOutput = (graph: IArcaneGraph, nodeId: string, socket: keyof IColorLerpNode["outputs"], globals: Globals) => {
   const sequence = nodeMethods.getInput(graph, nodeId, "sequence", globals);

   const interval = nodeMethods.coalesce(graph, nodeId, "interval", "interval", globals);
   const from = nodeMethods.coalesce(graph, nodeId, "from", "from", globals);
   const to = nodeMethods.coalesce(graph, nodeId, "to", "to", globals);
   const start = nodeMethods.coalesce(graph, nodeId, "start", "start", globals);
   const end = nodeMethods.coalesce(graph, nodeId, "end", "end", globals);

   const colorSpace = nodeMethods.getValue(graph, nodeId, "colorSpace");
   const hueMode = nodeMethods.getValue(graph, nodeId, "hueMode");

   if (sequence) {
      const iter = globals.sequenceData[sequence.senderId] ?? sequence.min;
      const t = MathHelper.delerp(iter, sequence.min, sequence.max);
      return MathHelper.colorLerp(t, from, to, colorSpace, hueMode);
   }

   const t = MathHelper.delerp(interval, start, end);
   return MathHelper.colorLerp(t, from, to, colorSpace, hueMode);

   //TODO: How do I get sequence data from here?!?
};

const ColorLerpNodeHelper: INodeHelper<IColorLerpNode> = {
   name: "Color Lerp",
   buttonIcon,
   nodeIcon,
   flavour: "help",
   type: NodeTypes.LERP_COLOR,
   getOutput,
   initialize: () => ({
      from: { r: 0, g: 0, b: 0, a: 1 },
      to: { r: 1, g: 1, b: 1, a: 1 },
      start: 0,
      end: 1,
      interval: 0,
      colorSpace: "RGB",
      hueMode: "closestCW",
   }),
   controls: Controls,
};

export default ColorLerpNodeHelper;

const Warning = styled.div`
   display: grid;
   grid-template-columns: auto 1fr;
   align-items: center;
   gap: 0.5em;
   color: var(--danger-icon);
   cursor: default;
`;

const HAS_HUE: ColorSpace[] = ["HSL", "HSV", "HWK", "HSI", "HCY"];
