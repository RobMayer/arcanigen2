import { memo } from "react";
import ArcaneGraph from "../graph";
import { INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodeTypes, PositionMode, POSITION_MODES, SocketTypes } from "../types";
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

const nodeHelper = ArcaneGraph.nodeHooks<ITransformNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [positionX, setPositionX] = nodeHelper.useValueState(nodeId, "positionX");
   const [positionY, setPositionY] = nodeHelper.useValueState(nodeId, "positionY");
   const [positionTheta, setPositionTheta] = nodeHelper.useValueState(nodeId, "positionTheta");
   const [positionRadius, setPositionRadius] = nodeHelper.useValueState(nodeId, "positionRadius");
   const [positionMode, setPositionMode] = nodeHelper.useValueState(nodeId, "positionMode");
   const [preRotation, setPreRotation] = nodeHelper.useValueState(nodeId, "preRotation");
   const [postRotation, setPostRotation] = nodeHelper.useValueState(nodeId, "postRotation");

   const [scaleX, setScaleX] = nodeHelper.useValueState(nodeId, "scaleX");
   const [scaleY, setScaleY] = nodeHelper.useValueState(nodeId, "scaleY");
   const [skewX, setSkewX] = nodeHelper.useValueState(nodeId, "skewX");
   const [skewY, setSkewY] = nodeHelper.useValueState(nodeId, "skewY");

   const hasPositionX = nodeHelper.useHasLink(nodeId, "positionX");
   const hasPositionY = nodeHelper.useHasLink(nodeId, "positionY");
   const hasPositionTheta = nodeHelper.useHasLink(nodeId, "positionTheta");
   const hasPositionRadius = nodeHelper.useHasLink(nodeId, "positionRadius");
   const hasPreRotation = nodeHelper.useHasLink(nodeId, "preRotation");
   const hasPostRotation = nodeHelper.useHasLink(nodeId, "postRotation");

   const hasScaleX = nodeHelper.useHasLink(nodeId, "scaleX");
   const hasScaleY = nodeHelper.useHasLink(nodeId, "scaleY");
   const hasSkewX = nodeHelper.useHasLink(nodeId, "skewX");
   const hasSkewY = nodeHelper.useHasLink(nodeId, "skewY");

   return (
      <BaseNode<ITransformNode> nodeId={nodeId} helper={TransformNodeHelper}>
         <SocketOut<ITransformNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
            Input
         </SocketIn>
         <BaseNode.Input label={"Position Mode"}>
            <ToggleList value={positionMode} onValue={setPositionMode} options={POSITION_MODES} />
         </BaseNode.Input>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"positionX"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"X Coordinate"}>
               <LengthInput value={positionX} onCommit={setPositionX} disabled={hasPositionX || positionMode === "polar"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"positionY"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Y Coordinate"}>
               <LengthInput value={positionY} onCommit={setPositionY} disabled={hasPositionY || positionMode === "polar"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"positionRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={positionRadius} onCommit={setPositionRadius} disabled={hasPositionRadius || positionMode === "cartesian"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"positionTheta"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"θ Angle"}>
               <AngleInput value={positionTheta} onValidValue={setPositionTheta} disabled={hasPositionTheta || positionMode === "cartesian"} />
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
               <NumberInput value={scaleX} onCommit={setScaleX} disabled={hasScaleX} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"scaleY"} type={SocketTypes.FLOAT}>
            <BaseNode.Input label={"Scale Y"}>
               <NumberInput value={scaleY} onCommit={setScaleY} disabled={hasScaleY} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"skewX"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Skew X"}>
               <AngleInput value={skewX} onCommit={setSkewX} disabled={hasSkewX} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"scaleY"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Skew Y"}>
               <AngleInput value={skewY} onCommit={setSkewY} disabled={hasSkewY} />
            </BaseNode.Input>
         </SocketIn>
         <hr />
         <SocketIn<ITransformNode> nodeId={nodeId} socketId={"postRotation"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Post-Rotation"}>
               <AngleInput value={postRotation} onValidValue={setPostRotation} disabled={hasPostRotation} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const positionMode = nodeHelper.useValue(nodeId, "positionMode");
   const positionX = nodeHelper.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHelper.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHelper.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHelper.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const preRotation = nodeHelper.useCoalesce(nodeId, "preRotation", "preRotation", globals);
   const postRotation = nodeHelper.useCoalesce(nodeId, "postRotation", "postRotation", globals);
   const scaleX = nodeHelper.useCoalesce(nodeId, "scaleX", "scaleX", globals);
   const scaleY = nodeHelper.useCoalesce(nodeId, "scaleY", "scaleY", globals);
   const skewX = nodeHelper.useCoalesce(nodeId, "skewX", "skewX", globals);
   const skewY = nodeHelper.useCoalesce(nodeId, "skewY", "skewY", globals);

   const [Output, cid] = nodeHelper.useInputNode(nodeId, "input", globals);

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
      positionMode: "cartesian",
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
