import { memo, useMemo } from "react";
import ArcaneGraph from "../graph";
import { IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, ControlRendererProps, NodeRendererProps, Sequence, GraphGlobals } from "../types";
import { StrokeCapMode, PositionMode, STROKECAP_MODE_OPTIONS, StrokeCapModes, NodeTypes, SocketTypes, PositionModes } from "../../../../utility/enums";
import MathHelper, { seededRandom } from "!/utility/mathhelper";

import { faShareNodes as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faShareNodes as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import { Length, Color } from "!/utility/types/units";
import BaseNode from "../../nodeView/node";
import LengthInput from "!/components/inputs/LengthInput";
import NumberInput from "!/components/inputs/NumberInput";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import TextInput from "!/components/inputs/TextInput";
import HexColorInput from "!/components/inputs/colorHexInput";
import ToggleList from "!/components/selectors/ToggleList";
import { TransformPrefabs, MetaPrefab } from "../../nodeView/prefabs";
import SliderInput from "!/components/inputs/SliderInput";
import lodash from "lodash";

interface IClusterArrayNode extends INodeDefinition {
   inputs: {
      input: NodeRenderer;
      seed: number;
      radius: Length;
      distance: number;
      minCount: number;
      maxCount: number;
      minEdges: number;
      maxEdges: number;
      reach: number;

      strokeWidth: Length;
      strokeColor: Color;
      strokeOffset: Length;

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
      seed: number;
      radius: Length;
      distance: number;
      minCount: number;
      maxCount: number;
      minEdges: number;
      maxEdges: number;
      reach: number;

      strokeWidth: Length;
      strokeColor: Color;
      strokeCap: StrokeCapMode;
      strokeDash: string;
      strokeOffset: Length;

      positionX: Length;
      positionY: Length;
      positionRadius: Length;
      positionTheta: number;
      positionMode: PositionMode;
      rotation: number;
   };
}

const nodeHooks = ArcaneGraph.nodeHooks<IClusterArrayNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [radius, setRadius] = nodeHooks.useValueState(nodeId, "radius");
   const [distance, setDistance] = nodeHooks.useValueState(nodeId, "distance");
   const [seed, setSeed] = nodeHooks.useValueState(nodeId, "seed");
   const [maxCount, setMaxCount] = nodeHooks.useValueState(nodeId, "maxCount");
   const [minCount, setMinCount] = nodeHooks.useValueState(nodeId, "minCount");
   const [minEdges, setMinEdges] = nodeHooks.useValueState(nodeId, "minEdges");
   const [maxEdges, setMaxEdges] = nodeHooks.useValueState(nodeId, "maxEdges");
   const [reach, setReach] = nodeHooks.useValueState(nodeId, "reach");

   const [strokeWidth, setStrokeWidth] = nodeHooks.useValueState(nodeId, "strokeWidth");
   const [strokeColor, setStrokeColor] = nodeHooks.useValueState(nodeId, "strokeColor");
   const [strokeCap, setStrokeCap] = nodeHooks.useValueState(nodeId, "strokeCap");
   const [strokeDash, setStrokeDash] = nodeHooks.useValueState(nodeId, "strokeDash");
   const [strokeOffset, setStrokeOffset] = nodeHooks.useValueState(nodeId, "strokeOffset");

   const hasRadius = nodeHooks.useHasLink(nodeId, "radius");
   const hasSeed = nodeHooks.useHasLink(nodeId, "seed");
   const hasStrokeWidth = nodeHooks.useHasLink(nodeId, "strokeWidth");
   const hasStrokeColor = nodeHooks.useHasLink(nodeId, "strokeColor");
   const hasStrokeOffset = nodeHooks.useHasLink(nodeId, "strokeOffset");

   const hasDistance = nodeHooks.useHasLink(nodeId, "distance");
   const hasMinCount = nodeHooks.useHasLink(nodeId, "minCount");
   const hasMaxCount = nodeHooks.useHasLink(nodeId, "maxCount");
   const hasMinEdges = nodeHooks.useHasLink(nodeId, "minEdges");
   const hasMaxEdges = nodeHooks.useHasLink(nodeId, "maxEdges");
   const hasReach = nodeHooks.useHasLink(nodeId, "reach");

   return (
      <BaseNode<IClusterArrayNode> nodeId={nodeId} helper={ClusterArrayNodeHelper} hooks={nodeHooks}>
         <SocketOut<IClusterArrayNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />

         <SocketIn<IClusterArrayNode> nodeId={nodeId} socketId={"radius"} type={SocketTypes.LENGTH}>
            <BaseNode.Input label={"Radius"}>
               <LengthInput value={radius} onValidValue={setRadius} disabled={hasRadius} />
            </BaseNode.Input>
         </SocketIn>
         <SocketIn<IClusterArrayNode> nodeId={nodeId} socketId={"seed"} type={SocketTypes.INTEGER}>
            <BaseNode.Input label={"Seed"}>
               <NumberInput value={seed} onValidValue={setSeed} disabled={hasSeed} min={0} />
            </BaseNode.Input>
         </SocketIn>
         <BaseNode.Foldout panelId={"nodes"} label={"Nodes"} nodeId={nodeId} inputs={"input distance minCount maxCount"} outputs={""}>
            <SocketIn<IClusterArrayNode> nodeId={nodeId} socketId={"input"} type={SocketTypes.SHAPE}>
               Node Shape
            </SocketIn>
            <SocketIn<IClusterArrayNode> nodeId={nodeId} socketId={"distance"} type={SocketTypes.PERCENT}>
               <BaseNode.Input label={"Distance Factor"}>
                  <SliderInput value={distance} onValidValue={setDistance} disabled={hasDistance} min={0} max={1.0} step={0.01} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IClusterArrayNode> nodeId={nodeId} socketId={"minCount"} type={SocketTypes.INTEGER}>
               <BaseNode.Input label={"Minimum Nodes"}>
                  <SliderInput value={minCount} onValidValue={setMinCount} disabled={hasMinCount} min={1} max={32} step={1} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IClusterArrayNode> nodeId={nodeId} socketId={"maxCount"} type={SocketTypes.INTEGER}>
               <BaseNode.Input label={"Maximum Nodes"}>
                  <SliderInput value={maxCount} onValidValue={setMaxCount} disabled={hasMaxCount} min={1} max={32} step={1} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <BaseNode.Foldout panelId={"connections"} label={"Connections"} nodeId={nodeId} inputs={"minEdges maxEdges reach"} outputs={""}>
            <SocketIn<IClusterArrayNode> nodeId={nodeId} socketId={"minEdges"} type={SocketTypes.INTEGER}>
               <BaseNode.Input label={"Minimum Connections"}>
                  <SliderInput value={minEdges} onValidValue={setMinEdges} disabled={hasMinEdges} min={1} max={32} step={1} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IClusterArrayNode> nodeId={nodeId} socketId={"maxEdges"} type={SocketTypes.INTEGER}>
               <BaseNode.Input label={"Maximum Connections"}>
                  <SliderInput value={maxEdges} onValidValue={setMaxEdges} disabled={hasMaxEdges} min={1} max={32} step={1} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IClusterArrayNode> nodeId={nodeId} socketId={"reach"} type={SocketTypes.INTEGER}>
               <BaseNode.Input label={"Reach"}>
                  <SliderInput value={reach} onValidValue={setReach} disabled={hasReach} min={1} max={32} step={1} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <BaseNode.Foldout panelId={"appearance"} label={"Appearance"} nodeId={nodeId} inputs={"strokeWidth strokeColor strokeOffset"} outputs={""}>
            <SocketIn<IClusterArrayNode> nodeId={nodeId} socketId={"strokeWidth"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Width"}>
                  <LengthInput value={strokeWidth} onValidValue={setStrokeWidth} disabled={hasStrokeWidth} min={0} />
               </BaseNode.Input>
            </SocketIn>
            <SocketIn<IClusterArrayNode> nodeId={nodeId} socketId={"strokeColor"} type={SocketTypes.COLOR}>
               <BaseNode.Input label={"Stroke Color"}>
                  <HexColorInput value={strokeColor} onValue={setStrokeColor} disabled={hasStrokeColor} />
               </BaseNode.Input>
            </SocketIn>
            <BaseNode.Input label={"Stroke Cap"}>
               <ToggleList value={strokeCap} onValue={setStrokeCap} options={STROKECAP_MODE_OPTIONS} />
            </BaseNode.Input>
            <BaseNode.Input label={"Stroke Dash"}>
               <TextInput value={strokeDash} onValidValue={setStrokeDash} pattern={MathHelper.LENGTH_LIST_REGEX} />
            </BaseNode.Input>
            <SocketIn<IClusterArrayNode> nodeId={nodeId} socketId={"strokeOffset"} type={SocketTypes.LENGTH}>
               <BaseNode.Input label={"Stroke Dash Offset"}>
                  <LengthInput value={strokeOffset} onValidValue={setStrokeOffset} disabled={hasStrokeOffset} />
               </BaseNode.Input>
            </SocketIn>
         </BaseNode.Foldout>
         <TransformPrefabs.Full<IClusterArrayNode> nodeId={nodeId} hooks={nodeHooks} />
         <SocketOut<IClusterArrayNode> nodeId={nodeId} socketId={"sequence"} type={SocketTypes.SEQUENCE}>
            Sequence
         </SocketOut>
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides = {} }: NodeRendererProps) => {
   const [input, childNodeId] = nodeHooks.useInputNode(nodeId, "input", globals);
   const seed = nodeHooks.useCoalesce(nodeId, "seed", "seed", globals);
   const radius = nodeHooks.useCoalesce(nodeId, "radius", "radius", globals);
   const distance = nodeHooks.useCoalesce(nodeId, "distance", "distance", globals);
   const minCount = nodeHooks.useCoalesce(nodeId, "minCount", "minCount", globals);
   const maxCount = nodeHooks.useCoalesce(nodeId, "maxCount", "maxCount", globals);
   const minEdges = nodeHooks.useCoalesce(nodeId, "minEdges", "minEdges", globals);
   const maxEdges = nodeHooks.useCoalesce(nodeId, "maxEdges", "maxEdges", globals);
   const reach = nodeHooks.useCoalesce(nodeId, "reach", "reach", globals);

   const strokeWidth = nodeHooks.useCoalesce(nodeId, "strokeWidth", "strokeWidth", globals);
   const strokeColor = nodeHooks.useCoalesce(nodeId, "strokeColor", "strokeColor", globals);
   const strokeDash = nodeHooks.useValue(nodeId, "strokeDash");
   const strokeCap = nodeHooks.useValue(nodeId, "strokeCap");
   const strokeOffset = nodeHooks.useCoalesce(nodeId, "strokeOffset", "strokeOffset", globals);

   const positionMode = nodeHooks.useValue(nodeId, "positionMode");
   const positionX = nodeHooks.useCoalesce(nodeId, "positionX", "positionX", globals);
   const positionY = nodeHooks.useCoalesce(nodeId, "positionY", "positionY", globals);
   const positionTheta = nodeHooks.useCoalesce(nodeId, "positionTheta", "positionTheta", globals);
   const positionRadius = nodeHooks.useCoalesce(nodeId, "positionRadius", "positionRadius", globals);
   const rotation = nodeHooks.useCoalesce(nodeId, "rotation", "rotation", globals);

   const [points, connections] = useMemo(() => {
      const sRand = seededRandom(seed);
      const theCount = Math.round(sRand.between(minCount, maxCount));

      const thePoints = lodash.range(theCount).reduce((acc) => {
         let found = false;
         let attempts = 0;
         while (!found && attempts < 10) {
            attempts++;
            const r = sRand.between(0, MathHelper.lengthToPx(radius));
            const a = MathHelper.deg2rad(sRand.between(0, 360));
            const theTry = {
               x: Math.sin(a) * r,
               y: Math.cos(a) * r,
            };
            const nearby = acc.filter((each) => {
               const d = MathHelper.distance(each.x, each.y, theTry.x, theTry.y);
               const theRange = MathHelper.lengthToPx(radius) * distance;
               return d <= theRange;
            });
            if (nearby.length === 0) {
               acc.push(theTry);
               found = true;
            }
         }
         return acc;
      }, [] as { x: number; y: number }[]);

      const theDistances = thePoints.reduce((acc, point, i, ary) => {
         const byDistance = lodash
            .range(ary.length)
            .sort((a, b) => {
               const distA = MathHelper.distance(ary[a].x, ary[a].y, point.x, point.y);
               const distB = MathHelper.distance(ary[b].x, ary[b].y, point.x, point.y);
               return MathHelper.compare(distA, distB);
            })
            .slice(1, reach + 1);
         acc[i] = byDistance;
         return acc;
      }, {} as { [key: number]: number[] });

      const theBridgings = new Set<string>();
      keysOf(theDistances).forEach((idx) => {
         const dist = theDistances[idx];
         const c = Math.round(sRand.between(Math.min(minEdges, maxEdges), Math.max(minEdges, maxEdges)));

         sRand.pick(dist, c).forEach((probedIdx) => {
            const toAdd = [idx, probedIdx].sort().join("|");
            theBridgings.add(toAdd);
         });
      }, {} as { [key: number]: number[] });

      const theConnections: { x1: number; y1: number; x2: number; y2: number }[] = [];

      theBridgings.forEach((p) => {
         const [idx, target] = p.split("|").map(Number);
         theConnections.push({
            x1: thePoints[idx].x,
            y1: thePoints[idx].y,
            x2: thePoints[target].x,
            y2: thePoints[target].y,
         });
      });

      return [thePoints, theConnections];
   }, [seed, minCount, maxCount, radius, reach, minEdges, maxEdges, distance]);

   return (
      <g transform={`${MathHelper.getPosition(positionMode, positionX, positionY, positionTheta, positionRadius)} rotate(${rotation})`}>
         <g>
            {connections.map(({ x1, y1, x2, y2 }, i) => {
               return (
                  <line
                     key={i}
                     x1={x1}
                     y1={y1}
                     x2={x2}
                     y2={y2}
                     stroke={MathHelper.colorToSVG("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
                     strokeOpacity={MathHelper.colorToOpacity("strokeColor" in overrides ? overrides.strokeColor : strokeColor)}
                     strokeWidth={Math.max(0, MathHelper.lengthToPx("strokeWidth" in overrides ? overrides.strokeWidth : strokeWidth))}
                     strokeLinecap={"strokeCap" in overrides ? overrides.strokeCap : strokeCap}
                     strokeDashoffset={MathHelper.lengthToPx("strokeOffset" in overrides ? overrides.strokeOffset : strokeOffset)}
                     strokeDasharray={MathHelper.listToLengths("strokeDash" in overrides ? overrides.strokeDash : strokeDash)
                        .map(MathHelper.lengthToPx)
                        .join(" ")}
                     fill={"none"}
                  />
               );
            })}
         </g>
         <g>
            {input &&
               childNodeId &&
               points.map(({ x, y }, i) => {
                  return (
                     <g key={i} transform={`translate(${x}, ${y})`}>
                        <Each overrides={overrides} output={input} nodeId={childNodeId} host={nodeId} depth={depth} globals={globals} index={i} />
                     </g>
                  );
               })}
         </g>
      </g>
   );
});

const Each = ({
   nodeId,
   globals,
   depth,
   index,
   host,
   output: Output,
   overrides,
}: NodeRendererProps & { index: number; host: string; output: NodeRenderer }) => {
   const newGlobals = useMemo(() => {
      return {
         ...globals,
         sequenceData: {
            ...globals.sequenceData,
            [host]: index,
         },
      };
   }, [globals, host, index]);

   return <Output overrides={overrides} nodeId={nodeId} globals={newGlobals} depth={(depth ?? "") + `_${host}.${index}`} />;
};

const nodeMethods = ArcaneGraph.nodeMethods<IClusterArrayNode>();

const ClusterArrayNodeHelper: INodeHelper<IClusterArrayNode> = {
   name: "Cluster Array",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.ARRAY_CLUSTER,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IClusterArrayNode["outputs"], globals: GraphGlobals) => {
      if (socket === "sequence") {
         const seed = nodeMethods.coalesce(graph, nodeId, "seed", "seed", globals);
         const minCount = nodeMethods.coalesce(graph, nodeId, "minCount", "minCount", globals);
         const maxCount = nodeMethods.coalesce(graph, nodeId, "maxCount", "maxCount", globals);
         const radius = nodeMethods.coalesce(graph, nodeId, "radius", "radius", globals);
         const distance = nodeMethods.coalesce(graph, nodeId, "distance", "distance", globals);
         const sRand = seededRandom(seed);
         const theCount = Math.round(sRand.between(minCount, maxCount));

         const thePoints = lodash.range(theCount).reduce((acc) => {
            let found = false;
            let attempts = 0;
            while (!found && attempts < 10) {
               attempts++;
               const r = sRand.between(0, MathHelper.lengthToPx(radius));
               const a = MathHelper.deg2rad(sRand.between(0, 360));
               const theTry = {
                  x: Math.sin(a) * r,
                  y: Math.cos(a) * r,
               };
               const nearby = acc.filter((each) => {
                  const d = MathHelper.distance(each.x, each.y, theTry.x, theTry.y);
                  const theRange = MathHelper.lengthToPx(radius) * distance;
                  return d <= theRange;
               });
               if (nearby.length === 0) {
                  acc.push(theTry);
                  found = true;
               }
            }
            return acc;
         }, [] as { x: number; y: number }[]);

         return {
            senderId: nodeId,
            min: 0,
            max: thePoints.length,
         };
      }
      return Renderer;
   },
   initialize: () => {
      const seed = Math.floor(Math.random() * 10000);
      return {
         seed,
         distance: 0.1,
         radius: { value: 150, unit: "px" },
         minCount: 4,
         maxCount: 10,
         minEdges: 1,
         maxEdges: 3,
         reach: 3,

         strokeWidth: { value: 1, unit: "px" },
         strokeDash: "",
         strokeOffset: { value: 0, unit: "px" },
         strokeCap: StrokeCapModes.BUTT,
         strokeColor: { r: 0, g: 0, b: 0, a: 1 },

         positionX: { value: 0, unit: "px" },
         positionY: { value: 0, unit: "px" },
         positionRadius: { value: 0, unit: "px" },
         positionTheta: 0,
         positionMode: PositionModes.CARTESIAN,
         rotation: 0,
      };
   },
   controls: Controls,
};

export default ClusterArrayNodeHelper;

function keysOf<T extends Object>(obj: T): Array<keyof T> {
   return Array.from(Object.keys(obj)) as any;
}
