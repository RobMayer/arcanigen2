import { memo } from "react";
import ArcaneGraph from "../graph";
import { INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps } from "../types";
import { PositionMode, POSITION_MODE_OPTIONS, NodeTypes, SocketTypes, PositionModes } from "../../../../utility/enums";
import MathHelper from "!/utility/mathhelper";

import { faCube as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faCube as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { Length } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketIn, SocketOut } from "../../nodeView/socket";
import AngleInput from "!/components/inputs/AngleInput";
import LengthInput from "!/components/inputs/LengthInput";
import ToggleList from "!/components/selectors/ToggleList";
import NumberInput from "!/components/inputs/NumberInput";
import { MetaPrefab } from "../../nodeView/prefabs";

interface ITransformNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      preRotation: number;
      postRotation: number;
      scaleX: number;
      scaleY: number;
      skewX: number;
      skewY: number;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      preRotation: number;
      postRotation: number;
      scaleX: number;
      scaleY: number;
      skewX: number;
      skewY: number;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<ITransformNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [positionX, setPositionX] = nodeHooks.useValueState(nodeId, "positionX");
   const [positionY, setPositionY] = nodeHooks.useValueState(nodeId, "positionY");
   const [positionTheta, setPositionTheta] = nodeHooks.useValueState(nodeId, "positionTheta");
   const [positionRadius, setPositionRadius] = nodeHooks.useValueState(nodeId, "positionRadius");
   const [positionMode, setPositionMode] = nodeHooks.useValueState(nodeId, "positionMode");
   const [preRotation, setPreRotation] = nodeHooks.useValueState(nodeId, "preRotation");
   const [postRotation, setPostRotation] = nodeHooks.useValueState(nodeId, "postRotation");

   const [scaleX, setScaleX] = nodeHooks.useValueState(nodeId, "scaleX");
   const [scaleY, setScaleY] = nodeHooks.useValueState(nodeId, "scaleY");
   const [skewX, setSkewX] = nodeHooks.useValueState(nodeId, "skewX");
   const [skewY, setSkewY] = nodeHooks.useValueState(nodeId, "skewY");

   const hasPositionX = nodeHooks.useHasLink(nodeId, "positionX");
   const hasPositionY = nodeHooks.useHasLink(nodeId, "positionY");
   const hasPositionTheta = nodeHooks.useHasLink(nodeId, "positionTheta");
   const hasPositionRadius = nodeHooks.useHasLink(nodeId, "positionRadius");
   const hasPreRotation = nodeHooks.useHasLink(nodeId, "preRotation");
   const hasPostRotation = nodeHooks.useHasLink(nodeId, "postRotation");

   const hasScaleX = nodeHooks.useHasLink(nodeId, "scaleX");
   const hasScaleY = nodeHooks.useHasLink(nodeId, "scaleY");
   const hasSkewX = nodeHooks.useHasLink(nodeId, "skewX");
   const hasSkewY = nodeHooks.useHasLink(nodeId, "skewY");

   return (
      <BaseNode<ITransformNode> nodeId={nodeId} helper={TransformNodeHelper} hooks={nodeHooks}>
         <SocketOut<ITransformNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
            Input
         </SocketIn>
         <BaseNode.Input label={"Position Mode"}>
            <ToggleList value={positionMode} onValue={setPositionMode} options={POSITION_MODE_OPTIONS} />
         </BaseNode.Input>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"positionX"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"X Coordinate"}>
               <LengthInput value={positionX} onCommit={setPositionX} disabled={hasPositionX || positionMode === PositionModes.POLAR} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"positionY"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Y Coordinate"}>
               <LengthInput value={positionY} onCommit={setPositionY} disabled={hasPositionY || positionMode === PositionModes.POLAR} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"positionRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={positionRadius} onCommit={setPositionRadius} disabled={hasPositionRadius || positionMode === PositionModes.CARTESIAN} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"positionTheta"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"θ Angle"}>
               <AngleInput value={positionTheta} onValidValue={setPositionTheta} disabled={hasPositionTheta || positionMode === PositionModes.CARTESIAN} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"preRotation"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Pre-Rotation"}>
               <AngleInput value={preRotation} onValidValue={setPreRotation} disabled={hasPreRotation} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"scaleX"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Scale X"}>
               <NumberInput value={scaleX} onValidValue={setScaleX} disabled={hasScaleX} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"scaleY"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Scale Y"}>
               <NumberInput value={scaleY} onValidValue={setScaleY} disabled={hasScaleY} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"skewX"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Skew X"}>
               <AngleInput value={skewX} onValidValue={setSkewX} disabled={hasSkewX} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"scaleY"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Skew Y"}>
               <AngleInput value={skewY} onValidValue={setSkewY} disabled={hasSkewY} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"postRotation"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Post-Rotation"}>
               <AngleInput value={postRotation} onValidValue={setPostRotation} disabled={hasPostRotation} />
            </BaseNode.Input>
         </SocketIn>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const positionMode = nodeHooks.useValue(nodeId, "positionMode");
   const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const preRotation = nodeHooks.useCoalesce(nodeId, "preRotation", "preRotation", globals);
   const postRotation = nodeHooks.useCoalesce(nodeId, "postRotation", "postRotation", globals);
   const scaleX = nodeHooks.useCoalesce(nodeId, "scaleX", "scaleX", globals);
   const scaleY = nodeHooks.useCoalesce(nodeId, "scaleY", "scaleY", globals);
   const skewX = nodeHooks.useCoalesce(nodeId, "skewX", "skewX", globals);
   const skewY = nodeHooks.useCoalesce(nodeId, "skewY", "skewY", globals);

   const [Output, cid] = nodeHooks.useInputNode(nodeId, "input", globals);

   return (
      <g
         transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${postRotation}) scale(${
            scaleX / 100
         }, ${scaleY / 100}) skewX(${skewX}) skewY(${skewY})`}
         vectorEffect={"non-scaling-stroke"}
      >
         <g transform={`rotate(${preRotation})`}>
            {Output && cid && <Output overrides={overrides} nodeId={cid} depth={`${depth}_${nodeId}`} globals={globals} />}
         </g>
      </g>
   );
});

const TransformNodeHelper: INodeHelper<ITransformNode> = {
   name: "Transform",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.COL_TRANSFORM,
   getOutput: () => Renderer,
   initialize: () => ({
      positionX: { value: 0, unit: "px" },
      positionY: { value: 0, unit: "px" },
      positionRadius: { value: 0, unit: "px" },
      positionTheta: 0,
      positionMode: PositionModes.CARTESIAN,
      preRotation: 0,
      postRotation: 0,
      scaleX: 100,
      scaleY: 100,
      skewX: 0,
      skewY: 0,
   }),
   controls: Controls,
};

export default TransformNodeHelper;
