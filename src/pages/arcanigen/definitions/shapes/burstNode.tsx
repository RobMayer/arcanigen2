import { memo } from "react";
import ArcaneGraph from "../graph";
import {
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeTypes,
   RadialMode,
   RADIAL_MODES,
   SocketTypes,
   StrokeCapMode,
   STROKECAP_MODES,
   ThetaMode,
   THETA_MODES,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { faStarOfLife as nodeIcon } from "@fortawesome/pro-regular-svg-icons";
import { faStarOfLife as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import Checkbox from "!/components/buttons/Checkbox";
import HexColorInput from "!/components/inputs/colorHexInput";
import LengthInput from "!/components/inputs/LengthInput";
import NumberInput from "!/components/inputs/NumberInput";
import ToggleList from "!/components/selectors/ToggleList";
import { Length, Color } from "!/utility/types/units";
import lodash from "lodash";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";

interface IBurstNode extends INodeDefinition {
   inputs: {
      radius: Length;
      spread: Length;
      innerRadius: Length;
      outerRadius: Length;
      strokeWidth: Length;
      strokeColor: Color;
      thetaStart: number;
      thetaEnd: number;
      thetaSteps: number;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      radialMode: RadialMode;
      thetaMode: ThetaMode;
      thetaStart: number;
      thetaEnd: number;
      thetaSteps: number;
      thetaInclusive: boolean;
      radius: Length;
      spread: Length;
      innerRadius: Length;
      outerRadius: Length;
      spurCount: number;
      strokeWidth: Length;
      strokeCap: StrokeCapMode;
      strokeColor: Color;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IBurstNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [spread, setSpread] = nodeHelper.useValueState(nodeId, "spread");
   const [radialMode, setRadialMode] = nodeHelper.useValueState(nodeId, "radialMode");
   const [innerRadius, setInnerRadius] = nodeHelper.useValueState(nodeId, "innerRadius");
   const [outerRadius, setOuterRadius] = nodeHelper.useValueState(nodeId, "outerRadius");

   const [thetaMode, setThetaMode] = nodeHelper.useValueState(nodeId, "thetaMode");
   const [thetaStart, setThetaStart] = nodeHelper.useValueState(nodeId, "thetaStart");
   const [thetaEnd, setThetaEnd] = nodeHelper.useValueState(nodeId, "thetaEnd");
   const [thetaSteps, setThetaSteps] = nodeHelper.useValueState(nodeId, "thetaSteps");
   const [thetaInclusive, setThetaInclusive] = nodeHelper.useValueState(nodeId, "thetaInclusive");

   const [spurCount, setSpurCount] = nodeHelper.useValueState(nodeId, "spurCount");

   const [strokeWidth, setStrokeWidth] = nodeHelper.useValueState(nodeId, "strokeWidth");
   const [strokeCap, setStrokeCap] = nodeHelper.useValueState(nodeId, "strokeCap");

   const [strokeColor, setStrokeColor] = nodeHelper.useValueState(nodeId, "strokeColor");

   const hasThetaStart = nodeHelper.useHasLink(nodeId, "thetaStart");
   const hasThetaEnd = nodeHelper.useHasLink(nodeId, "thetaEnd");
   const hasThetaSteps = nodeHelper.useHasLink(nodeId, "thetaSteps");

   const hasInnerRadius = nodeHelper.useHasLink(nodeId, "innerRadius");
   const hasOuterRadius = nodeHelper.useHasLink(nodeId, "outerRadius");
   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasSpread = nodeHelper.useHasLink(nodeId, "spread");
   const hasStrokeWidth = nodeHelper.useHasLink(nodeId, "strokeWidth");

   const hasStrokeColor = nodeHelper.useHasLink(nodeId, "strokeColor");

   return (
      <>
         <SocketOut<IBurstNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <BaseNode.Input label={"Points"}>
            <NumberInput value={spurCount} min={0} step={1} onValidValue={setSpurCount} />
         </BaseNode.Input>
         <BaseNode.Input label={"Radial Mode"}>
            <ToggleList value={radialMode} onValue={setRadialMode} options={RADIAL_MODES} />
         </BaseNode.Input>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"innerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Inner Radius"}>
               <LengthInput className={"inline small"} value={innerRadius} onChange={setInnerRadius} disabled={hasInnerRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"outerRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Outer Radius"}>
               <LengthInput className={"inline small"} value={outerRadius} onChange={setOuterRadius} disabled={hasOuterRadius || radialMode === "spread"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput className={"inline small"} value={radius} onChange={setRadius} disabled={hasRadius || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"spread"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Spread"}>
               <LengthInput className={"inline small"} value={spread} onChange={setSpread} disabled={hasSpread || radialMode === "inout"} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <BaseNode.Input label={"Theta Mode"}>
            <ToggleList value={thetaMode} onValue={setThetaMode} options={THETA_MODES} />
         </BaseNode.Input>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"thetaSteps"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Incremental θ"}>
               <NumberInput value={thetaSteps} onValidValue={setThetaSteps} disabled={hasThetaSteps || thetaMode === "startstop"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"thetaStart"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Start θ"}>
               <NumberInput value={thetaStart} onValidValue={setThetaStart} disabled={hasThetaStart || thetaMode === "incremental"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IBurstNode> nodeId={nodeId} socketId={"thetaEnd"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"End θ"}>
               <NumberInput value={thetaEnd} onValidValue={setThetaEnd} disabled={hasThetaEnd || thetaMode === "incremental"} />
            </BaseNode.Input>
         </SocketIn>
         <Checkbox checked={thetaInclusive} onToggle={setThetaInclusive} disabled={thetaMode === "incremental"}>
            Inclusive End θ
         </Checkbox>
         <hr />
         <BaseNode.Foldout label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor fillColor"} outputs={""}>
            <SocketIn<IBurstNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput className={"inline small"} value={strokeWidth} onChange={setStrokeWidth} disabled={hasStrokeWidth} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODES}></ToggleList>
            </BaseNode.Input>
            <SocketIn<IBurstNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValidCommit={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
      </>
   );
});

const Renderer = memo(({ nodeId }: { nodeId: string }) => {
   const spurCount = nodeHelper.useValue(nodeId, "spurCount");
   const radialMode = nodeHelper.useValue(nodeId, "radialMode");
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius");
   const spread = nodeHelper.useCoalesce(nodeId, "spread", "spread");
   const innerRadius = nodeHelper.useCoalesce(nodeId, "innerRadius", "innerRadius");
   const outerRadius = nodeHelper.useCoalesce(nodeId, "outerRadius", "outerRadius");

   const thetaMode = nodeHelper.useValue(nodeId, "thetaMode");
   const thetaStart = nodeHelper.useCoalesce(nodeId, "thetaStart", "thetaStart");
   const thetaEnd = nodeHelper.useCoalesce(nodeId, "thetaEnd", "thetaEnd");
   const thetaSteps = nodeHelper.useCoalesce(nodeId, "thetaSteps", "thetaSteps");
   const thetaInclusive = nodeHelper.useValue(nodeId, "thetaInclusive");

   const strokeWidth = nodeHelper.useCoalesce(nodeId, "strokeWidth", "strokeWidth");
   const strokeColor = nodeHelper.useCoalesce(nodeId, "strokeColor", "strokeColor");
   const strokeCap = nodeHelper.useValue(nodeId, "strokeCap");

   const rI = radialMode === "inout" ? MathHelper.lengthToPx(innerRadius) : MathHelper.lengthToPx(radius) - MathHelper.lengthToPx(spread) / 2;
   const rO = radialMode === "inout" ? MathHelper.lengthToPx(outerRadius) : MathHelper.lengthToPx(radius) + MathHelper.lengthToPx(spread) / 2;

   return (
      <>
         <g stroke={MathHelper.colorToHex(strokeColor, "#000f")} strokeWidth={MathHelper.lengthToPx(strokeWidth)} strokeLinecap={strokeCap}>
            {lodash.range(spurCount).map((n) => {
               const coeff = MathHelper.delerp(n, 0, thetaInclusive ? spurCount - 1 : spurCount);
               const angle = thetaMode === "startstop" ? MathHelper.lerp(coeff, 1 * thetaStart, 1 * thetaEnd) : thetaSteps * n;
               const c = Math.cos(MathHelper.deg2rad(angle - 90));
               const s = Math.sin(MathHelper.deg2rad(angle - 90));
               return <line key={n} x1={rI * c} y1={rI * s} x2={rO * c} y2={rO * s} />;
            })}
         </g>
      </>
   );
});

const BurstNodeHelper: INodeHelper<IBurstNode> = {
   name: "Burst",
   buttonIcon,
   nodeIcon,
   flavour: "emphasis",
   type: NodeTypes.SHAPE_BURST,
   getOutput: () => Renderer,
   initialize: () => ({
      radius: { value: 150, unit: "px" },
      spread: { value: 20, unit: "px" },
      radialMode: "inout",
      thetaMode: "incremental",
      spurCount: 5,
      innerRadius: { value: 140, unit: "px" },
      outerRadius: { value: 160, unit: "px" },
      strokeWidth: { value: 1, unit: "px" },
      strokeCap: "butt",
      strokeColor: { r: 0, g: 0, b: 0, a: 1 },
      thetaStart: 0,
      thetaEnd: 90,
      thetaSteps: 30,
      thetaInclusive: true,
   }),
   controls: Controls,
};

export default BurstNodeHelper;
