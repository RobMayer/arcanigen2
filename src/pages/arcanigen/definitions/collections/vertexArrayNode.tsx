import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodeTypes, ScribeMode, SCRIBE_MODES, SocketTypes } from "../types";
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

interface IVertexArrayNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      radius: Length;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      radius: Length;
      scribeMode: ScribeMode;
      pointCount: number;
      isRotating: boolean;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IVertexArrayNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [radius, setRadius] = nodeHelper.useValueState(nodeId, "radius");
   const [pointCount, setPointCount] = nodeHelper.useValueState(nodeId, "pointCount");
   const [scribeMode, setScribeMode] = nodeHelper.useValueState(nodeId, "scribeMode");
   const [isRotating, setIsRotating] = nodeHelper.useValueState(nodeId, "isRotating");

   const hasRadius = nodeHelper.useHasLink(nodeId, "radius");

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
         <BaseNode.Input label={"Points"}>
            <SliderInput revertInvalid value={pointCount} onValidValue={setPointCount} min={3} max={24} step={1} />
         </BaseNode.Input>
         <SocketIn<IVertexArrayNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput className={"inline small"} value={radius} onChange={setRadius} disabled={hasRadius} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Input label={"Scribe Mode"}>
            <Dropdown value={scribeMode} onValue={setScribeMode} options={SCRIBE_MODES} />
         </BaseNode.Input>
         <Checkbox checked={isRotating} onToggle={setIsRotating}>
            Rotate Iterations
         </Checkbox>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, layer }: NodeRendererProps) => {
   const [Output, childNodeId] = nodeHelper.useInputNode(nodeId, "input");
   const radius = nodeHelper.useCoalesce(nodeId, "radius", "radius");
   const scribeMode = nodeHelper.useValue(nodeId, "scribeMode");
   const pointCount = nodeHelper.useValue(nodeId, "pointCount");
   const isRotating = nodeHelper.useValue(nodeId, "isRotating");
   const tR = getTrueRadius(MathHelper.lengthToPx(radius), scribeMode, pointCount);

   const children = useMemo(() => {
      return lodash.range(pointCount).map((n, i) => {
         const coeff = MathHelper.delerp(n, 0, pointCount);
         const rot = MathHelper.lerp(coeff, 0, 360) - 180;

         return (
            <g key={n} style={{ transform: `rotate(${rot}deg) translate(0px, ${tR}px) rotate(${isRotating ? 180 : -rot}deg)` }}>
               {Output && childNodeId && <Output nodeId={childNodeId} layer={(layer ?? "") + `_${nodeId}.${i}`} />}
            </g>
         );
      });
   }, [Output, childNodeId, pointCount, tR, isRotating, nodeId, layer]);

   return <>{children}</>;
});

const VertexArrayNodeHelper: INodeHelper<IVertexArrayNode> = {
   name: "Vertex Array",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.ARRAY_VERTEX,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IVertexArrayNode["outputs"]) => Renderer,
   initialize: () => ({
      radius: { value: 100, unit: "px" },
      scribeMode: "inscribe",
      pointCount: 5,
      isRotating: true,
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
