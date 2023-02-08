import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import {
   ControlRendererProps,
   Curve,
   Globals,
   IArcaneGraph,
   INodeDefinition,
   INodeHelper,
   NodeRenderer,
   NodeRendererProps,
   NodeTypes,
   PositionMode,
   ScribeMode,
   SCRIBE_MODES,
   Sequence,
   SocketTypes,
} from "../types";
import MathHelper from "!/utility/mathhelper";

import { faVectorCircle as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faVectorCircle as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import LengthInput from "!/components/inputs/LengthInput";
import SliderInput from "!/components/inputs/SliderInput";
import Dropdown from "!/components/selectors/Dropdown";
import { Length } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import lodash from "lodash";
import Checkbox from "!/components/buttons/Checkbox";
import { TransformPrefabs } from "../../nodeView/prefabs";

interface IVertexArrayNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      radius: Length;
      pointCount: number;
      thetaCurve: Curve;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      rotation: number;
   };
   outputs: {
      output: NodeRenderer;
      sequence: Sequence;
   };
   values: {
      radius: Length;
      scribeMode: ScribeMode;
      pointCount: number;
      isRotating: boolean;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IVertexArrayNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [pointCount, setPointCount] = nodeHelper.useValueState(nodeId, "pointCount");
   const [scribeMode, setScribeMode] = nodeHelper.useValueState(nodeId, "scribeMode");
   const [isRotating, setIsRotating] = nodeHelper.useValueState(nodeId, "isRotating");

   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");
   const hasPointCount = nodeHelper.useHasLink(nodeId, "pointCount");

   return (
      <BaseNode<IVertexArrayNode> nodeId={nodeId} helper={VertexArrayNodeHelper}>
         <SocketOut<IVertexArrayNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IVertexArrayNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
            Input
         </SocketIn>
         <hr />
         <SocketIn<IVertexArrayNode> nodeId={nodeId} socketId={"pointCount"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Points"}>
               <SliderInput revertInvalid value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} disabled={hasPointCount} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IVertexArrayNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Scribe Mode"}>
            <Dropdown value={scribeMode} onValue={setScribeMode} options={SCRIBE_MODES} />
         </BaseNode.Input>
         <SocketIn<IVertexArrayNode> nodeId={nodeId} socketId={"thetaCurve"} type={SocketTypes.CURVE}>
            θ Distribution
         </SocketIn>
         <Checkbox checked={isRotating} onToggle={setIsRotating}>
            Rotate Iterations
         </Checkbox>
         <hr />
         <TransformPrefabs.Full<IVertexArrayNode> nodeId={nodeId} nodeHelper={nodeHelper} />
         <hr />
         <SocketOut<IVertexArrayNode> nodeId={nodeId} socketId={"sequence"} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketOut>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals }: NodeRendererProps) => {
   const [output, childNodeId] = nodeHelper.useInputNode(nodeId, "input", globals);
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius", globals);
   const scribeMode = nodeHelper.useValue(nodeId, "scribeMode");
   const pointCount = Math.min(24, Math.max(3, nodeHelper.useCoalesce(nodeId, "pointCount", "pointCount", globals)));
   const isRotating = nodeHelper.useValue(nodeId, "isRotating");
   const tR = getTrueRadius(MathHelper.lengthToPx(radius), scribeMode, pointCount);

   const positionMode = nodeHelper.useValue(nodeId, "positionMode");
   const positionX = nodeHelper.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHelper.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHelper.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHelper.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHelper.useCoalesce(nodeId, "rotation", "rotation", globals);
   const thetaCurve = nodeHelper.useInput(nodeId, "thetaCurve", globals);

   const children = useMemo(() => {
      return lodash.range(pointCount).map((n, i) => {
         const coeff = MathHelper.delerp(n, 0, pointCount);
         const rot = MathHelper.lerp(coeff, 0, 360, { curveFn: thetaCurve?.curveFn ?? "linear", easing: thetaCurve?.easing ?? "in" }) - 180;

         return (
            <g key={n} style={{ transform: `rotate(${rot}deg) translate(0px, ${tR}px) rotate(${isRotating ? 180 : -rot}deg)` }}>
               {output && childNodeId && <Each output={output} host={nodeId} globals={globals} nodeId={childNodeId} depth={depth} index={i} />}
            </g>
         );
      });
   }, [output, childNodeId, pointCount, tR, isRotating, nodeId, depth, globals, thetaCurve?.curveFn, thetaCurve?.easing]);

   return (
      <g style={{ transform: `${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation}deg)` }}>
         {children}
      </g>
   );
});

const Each = ({ nodeId, globals, depth, index, host, output: Output }: NodeRendererProps & { index: number; host: string; output: NodeRenderer }) => {
   const newGlobals = useMemo(() => {
      return {
         ...globals,
         sequenceData: {
            ...globals.sequenceData,
            [host]: index,
         },
      };
   }, [globals, host, index]);

   return <Output nodeId={nodeId} globals={newGlobals} depth={(depth ?? "") + `_${host}.${index}`} />;
};

const nodeMethods = ArcaneGraph.nodeMethods<IVertexArrayNode>();

const VertexArrayNodeHelper: INodeHelper<IVertexArrayNode> = {
   name: "Vertex Array",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.ARRAY_VERTEX,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IVertexArrayNode["outputs"], globals: Globals) => {
      switch (socket) {
         case "output":
            return Renderer;
         case "sequence":
            return {
               senderId: nodeId,
               min: 0,
               max: nodeMethods.coalesce(graph, nodeId, "pointCount", "pointCount", globals),
            };
      }
   },
   initialize: () => ({
      radius: { value: 100, unit: "px" },
      scribeMode: "inscribe",
      pointCount: 5,
      isRotating: true,

      positionX: { value: 0, unit: "px" },
      positionY: { value: 0, unit: "px" },
      positionRadius: { value: 0, unit: "px" },
      positionTheta: 0,
      positionMode: "cartesian",
      rotation: 0,
   }),
   controls: Controls,
};

export default VertexArrayNodeHelper;

const getTrueRadius = (r: number, scribe: ScribeMode, sides: number) => {
   switch (scribe) {
      case "middle":
         return (r + r / Math.cos(Math.PI / sides)) / 2;
      case "circumscribe":
         return r / Math.cos(Math.PI / sides);
      case "inscribe":
         return r;
   }
};
