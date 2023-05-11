import AngleInput from "!/components/inputs/AngleInput";
import LengthInput from "!/components/inputs/LengthInput";
import TextInput from "!/components/inputs/TextInput";
import ToggleList from "!/components/selectors/ToggleList";
import ArcaneGraph from "../definitions/graph";
import { INodeDefinition } from "../definitions/types";
import { POSITION_MODE_OPTIONS, PositionModes, SocketTypes } from "../../../utility/enums";
import BaseNode from "./node";
import { SocketIn } from "./socket";

const Meta = ({ nodeId, hooks }: { nodeId: string; hooks: ReturnType<(typeof ArcaneGraph)["nodeHooks"]> }) => {
   const [name, setName] = hooks.useValueState(nodeId, "name");
   return (
      <BaseNode.Foldout panelId={"meta"} label={"Meta"} nodeId={nodeId} inputs={""} outputs={""}>
         <BaseNode.Input label={"Node Label"}>
            <TextInput className={"slim"} value={name} onCommit={setName} />
         </BaseNode.Input>
      </BaseNode.Foldout>
   );
};

const TransformFull = <T extends INodeDefinition>({ nodeId, hooks }: { nodeId: string; hooks: ReturnType<(typeof ArcaneGraph)["nodeHooks"]> }) => {
   const [positionX, setPositionX] = hooks.useValueState(nodeId, "positionX");
   const [positionY, setPositionY] = hooks.useValueState(nodeId, "positionY");
   const [positionTheta, setPositionTheta] = hooks.useValueState(nodeId, "positionTheta");
   const [positionRadius, setPositionRadius] = hooks.useValueState(nodeId, "positionRadius");
   const [positionMode, setPositionMode] = hooks.useValueState(nodeId, "positionMode");
   const [rotation, setRotation] = hooks.useValueState(nodeId, "rotation");

   const hasPositionX = hooks.useHasLink(nodeId, "positionX");
   const hasPositionY = hooks.useHasLink(nodeId, "positionY");
   const hasPositionTheta = hooks.useHasLink(nodeId, "positionTheta");
   const hasPositionRadius = hooks.useHasLink(nodeId, "positionRadius");
   const hasRotation = hooks.useHasLink(nodeId, "rotation");

   return (
      <BaseNode.Foldout
         panelId={"transform"}
         label={"Transform"}
         nodeId={nodeId}
         inputs={"positionX positionY positionTheta positionRadius rotation"}
         outputs={""}
      >
         <BaseNode.Input label={"Position Mode"}>
            <ToggleList value={positionMode} onValue={setPositionMode} options={POSITION_MODE_OPTIONS} />
         </BaseNode.Input>
         <SocketIn<T> nodeId={nodeId} socketId={"positionX"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"X Coordinate"}>
               <LengthInput value={positionX} onCommit={setPositionX} disabled={hasPositionX || positionMode === PositionModes.POLAR} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"positionY"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Y Coordinate"}>
               <LengthInput value={positionY} onCommit={setPositionY} disabled={hasPositionY || positionMode === PositionModes.POLAR} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"positionRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={positionRadius} onCommit={setPositionRadius} disabled={hasPositionRadius || positionMode === PositionModes.CARTESIAN} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"positionTheta"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"θ Angle"}>
               <AngleInput value={positionTheta} onValidValue={setPositionTheta} disabled={hasPositionTheta || positionMode === PositionModes.CARTESIAN} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"rotation"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"Rotation"}>
               <AngleInput value={rotation} onValidValue={setRotation} disabled={hasRotation} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode.Foldout>
   );
};

const TransformPos = <T extends INodeDefinition>({ nodeId, hooks }: { nodeId: string; hooks: ReturnType<(typeof ArcaneGraph)["nodeHooks"]> }) => {
   const [positionX, setPositionX] = hooks.useValueState(nodeId, "positionX");
   const [positionY, setPositionY] = hooks.useValueState(nodeId, "positionY");
   const [positionTheta, setPositionTheta] = hooks.useValueState(nodeId, "positionTheta");
   const [positionRadius, setPositionRadius] = hooks.useValueState(nodeId, "positionRadius");
   const [positionMode, setPositionMode] = hooks.useValueState(nodeId, "positionMode");

   const hasPositionX = hooks.useHasLink(nodeId, "positionX");
   const hasPositionY = hooks.useHasLink(nodeId, "positionY");
   const hasPositionTheta = hooks.useHasLink(nodeId, "positionTheta");
   const hasPositionRadius = hooks.useHasLink(nodeId, "positionRadius");

   return (
      <BaseNode.Foldout panelId={"transform"} label={"Transform"} nodeId={nodeId} inputs={"positionX positionY positionTheta positionRadius"} outputs={""}>
         <BaseNode.Input label={"Position Mode"}>
            <ToggleList value={positionMode} onValue={setPositionMode} options={POSITION_MODE_OPTIONS} />
         </BaseNode.Input>
         <SocketIn<T> nodeId={nodeId} socketId={"positionX"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"X Coordinate"}>
               <LengthInput value={positionX} onCommit={setPositionX} disabled={hasPositionX || positionMode === PositionModes.POLAR} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"positionY"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Y Coordinate"}>
               <LengthInput value={positionY} onCommit={setPositionY} disabled={hasPositionY || positionMode === PositionModes.POLAR} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"positionRadius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={positionRadius} onCommit={setPositionRadius} disabled={hasPositionRadius || positionMode === PositionModes.CARTESIAN} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<T> nodeId={nodeId} socketId={"positionTheta"} type={SocketTypes.ANGLE}>
            <BaseNode.Input label={"θ Angle"}>
               <AngleInput value={positionTheta} onValidValue={setPositionTheta} disabled={hasPositionTheta || positionMode === PositionModes.CARTESIAN} />
            </BaseNode.Input>
         </SocketIn>
      </BaseNode.Foldout>
   );
};

export const TransformPrefabs = {
   Full: TransformFull,
   Position: TransformPos,
};

export const MetaPrefab = Meta;
