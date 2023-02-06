import LengthInput from "!/components/inputs/LengthInput";
import NumberInput from "!/components/inputs/NumberInput";
import ToggleList from "!/components/selectors/ToggleList";
import ArcaneGraph from "../definitions/graph";
import { INodeDefinition, POSITION_MODES, SocketTypes } from "../definitions/types";
import BaseNode from "./node";
import { SocketIn } from "./socket";

const TransformFull = <T extends INodeDefinition>({ nodeId, nodeHelper }: { nodeId: string; nodeHelper: ReturnType<typeof ArcaneGraph["nodeHooks"]> }) => {
   const [positionX, setPositionX] = nodeHelper.useValueState(nodeId, "positionX");
   const [positionY, setPositionY] = nodeHelper.useValueState(nodeId, "positionY");
   const [positionTheta, setPositionTheta] = nodeHelper.useValueState(nodeId, "positionTheta");
   const [positionRadius, setPositionRadius] = nodeHelper.useValueState(nodeId, "positionRadius");
   const [positionMode, setPositionMode] = nodeHelper.useValueState(nodeId, "positionMode");
   const [rotation, setRotation] = nodeHelper.useValueState(nodeId, "rotation");

   const hasPositionX = nodeHelper.useHasLink(nodeId, "positionX");
   const hasPositionY = nodeHelper.useHasLink(nodeId, "positionY");
   const hasPositionTheta = nodeHelper.useHasLink(nodeId, "positionTheta");
   const hasPositionRadius = nodeHelper.useHasLink(nodeId, "positionRadius");
   const hasRotation = nodeHelper.useHasLink(nodeId, "rotation");

   return (
      <BaseNode.Foldout label={"Transform"} nodeId={nodeId} inputs={"positionX positionY positionTheta positionRadius rotation"} outputs={""}>
         <BaseNode.Input label={"Position Mode"}>
            <ToggleList value={positionMode} onValue={setPositionMode} options={POSITION_MODES} />
         </BaseNode.Input>
         <SocketIn<T> nodeId={nodeId} socketId={"positionX"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"X Coordinate"}>
               <LengthInput value={positionX} onCommit={setPositionX} disabled={hasPositionX || positionMode === "polar"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"positionY"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Y Coordinate"}>
               <LengthInput value={positionY} onCommit={setPositionY} disabled={hasPositionY || positionMode === "polar"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"positionTheta"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"θ Angle"}>
               <NumberInput value={positionTheta} onValidCommit={setPositionTheta} disabled={hasPositionTheta || positionMode === "cartesian"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"positionRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={positionRadius} onCommit={setPositionRadius} disabled={hasPositionRadius || positionMode === "cartesian"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"rotation"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Rotation"}>
               <NumberInput value={rotation} onValidCommit={setRotation} disabled={hasRotation} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode.Foldout>
   );
};

const TransformPos = <T extends INodeDefinition>({ nodeId, nodeHelper }: { nodeId: string; nodeHelper: ReturnType<typeof ArcaneGraph["nodeHooks"]> }) => {
   const [positionX, setPositionX] = nodeHelper.useValueState(nodeId, "positionX");
   const [positionY, setPositionY] = nodeHelper.useValueState(nodeId, "positionY");
   const [positionTheta, setPositionTheta] = nodeHelper.useValueState(nodeId, "positionTheta");
   const [positionRadius, setPositionRadius] = nodeHelper.useValueState(nodeId, "positionRadius");
   const [positionMode, setPositionMode] = nodeHelper.useValueState(nodeId, "positionMode");

   const hasPositionX = nodeHelper.useHasLink(nodeId, "positionX");
   const hasPositionY = nodeHelper.useHasLink(nodeId, "positionY");
   const hasPositionTheta = nodeHelper.useHasLink(nodeId, "positionTheta");
   const hasPositionRadius = nodeHelper.useHasLink(nodeId, "positionRadius");

   return (
      <BaseNode.Foldout label={"Transform"} nodeId={nodeId} inputs={"positionX positionY positionTheta positionRadius"} outputs={""}>
         <BaseNode.Input label={"Position Mode"}>
            <ToggleList value={positionMode} onValue={setPositionMode} options={POSITION_MODES} />
         </BaseNode.Input>
         <SocketIn<T> nodeId={nodeId} socketId={"positionX"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"X Coordinate"}>
               <LengthInput value={positionX} onCommit={setPositionX} disabled={hasPositionX || positionMode === "polar"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"positionY"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Y Coordinate"}>
               <LengthInput value={positionY} onCommit={setPositionY} disabled={hasPositionY || positionMode === "polar"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"positionTheta"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"θ Angle"}>
               <NumberInput value={positionTheta} onValidCommit={setPositionTheta} disabled={hasPositionTheta || positionMode === "cartesian"} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"positionRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={positionRadius} onCommit={setPositionRadius} disabled={hasPositionRadius || positionMode === "cartesian"} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode.Foldout>
   );
};

export const TransformPrefabs = {
   Full: TransformFull,
   Position: TransformPos,
};
