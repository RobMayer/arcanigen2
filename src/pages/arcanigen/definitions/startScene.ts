import { v4 as uuid } from "uuid";
import { IArcaneGraph, IArcanePos, IArcaneToggle, NodeTypes } from "./types";

const EXAMPLE_TEXT = `Navigation
-----------
Middle-click and drag to pan the graph view. Mouse wheel handles zoom.
If you get lost, click the "Center" button in the top right corner of the graph.
Click and Drag a node's name to move the node around the graph.

Modifying the Graph
-----------
drag and drop or click Nodes from the drawer below to add them to the graph.
click-and-drag from one node's socket to another node's socket to connect nodes together.
Delete a node by hitting the X button.
Break a link by clicking the link to select it and hit the [delete] key.
Click the "Reset" button above to get a clean graph to start over with.

Rendering to the Canvas
-----------
the Input of the Result node is what ends up on the canvas. 
the "Layers" node combines multiple shapes into one output.

Examples
-----------
There are examples in the top menu bar (or will be soon) that you can load and experiment with.
`;

export const getStartScene = () => {
   const layersId = uuid();
   const circleId = uuid();
   const polygonId = uuid();
   const notesId = uuid();

   const linkResultToLayer = uuid();
   const linkLayerToPolygon = uuid();
   const linkLayerToCircle = uuid();

   const layerSocket1 = uuid();
   const layerSocket2 = uuid();
   const layerSocket3 = uuid();

   return {
      nodes: {
         ROOT: {
            nodeId: "ROOT",
            canvasColor: {
               r: 1,
               g: 1,
               b: 1,
               a: 1,
            },
            canvasWidth: {
               value: 800,
               unit: "px",
            },
            canvasHeight: {
               value: 800,
               unit: "px",
            },
            type: NodeTypes.META_RESULT,
            in: {
               result: null,
               canvasColor: null,
               input: linkResultToLayer,
            },
            out: {},
         },
         [layersId]: {
            sockets: [layerSocket1, layerSocket2, layerSocket3],
            modes: {
               [layerSocket1]: "normal",
               [layerSocket2]: "normal",
               [layerSocket3]: "normal",
            },
            enabled: {
               [layerSocket1]: true,
               [layerSocket2]: true,
               [layerSocket3]: true,
            },
            in: {
               [layerSocket1]: linkLayerToCircle,
               [layerSocket2]: linkLayerToPolygon,
               [layerSocket3]: null,
            },
            name: "",
            out: {
               output: [linkResultToLayer],
            },
            type: NodeTypes.COL_LAYERS,
            nodeId: layersId,
         },
         [circleId]: {
            radius: {
               value: 100,
               unit: "px",
            },
            strokeWidth: {
               value: 1,
               unit: "px",
            },
            strokeDash: "",
            strokeOffset: {
               value: 0,
               unit: "px",
            },
            strokeCap: "butt",
            strokeColor: {
               r: 0,
               g: 0,
               b: 0,
               a: 1,
            },
            fillColor: null,
            positionX: {
               value: 0,
               unit: "px",
            },
            positionY: {
               value: 0,
               unit: "px",
            },
            positionRadius: {
               value: 0,
               unit: "px",
            },
            positionTheta: 0,
            positionMode: "cartesian",
            rotation: 0,
            name: "",
            in: {},
            out: {
               output: [linkLayerToCircle],
            },
            type: NodeTypes.SHAPE_CIRCLE,
            nodeId: circleId,
         },
         [polygonId]: {
            radius: {
               value: 100,
               unit: "px",
            },
            strokeWidth: {
               value: 1,
               unit: "px",
            },
            pointCount: 3,
            strokeJoin: "miter",
            rScribe: "inscribe",
            strokeColor: {
               r: 0,
               g: 0,
               b: 0,
               a: 1,
            },
            strokeDash: "",
            strokeOffset: {
               value: 0,
               unit: "px",
            },
            strokeCap: "butt",
            fillColor: null,
            positionX: {
               value: 0,
               unit: "px",
            },
            positionY: {
               value: 0,
               unit: "px",
            },
            positionRadius: {
               value: 0,
               unit: "px",
            },
            positionTheta: 0,
            positionMode: "cartesian",
            rotation: 0,
            name: "",
            in: {},
            out: {
               output: [linkLayerToPolygon],
            },
            type: NodeTypes.SHAPE_POLYGON,
            nodeId: polygonId,
         },
         [notesId]: {
            title: "Getting Started",
            text: EXAMPLE_TEXT,
            name: "",
            in: {},
            out: {},
            type: NodeTypes.META_NOTES,
            nodeId: notesId,
         },
      } as IArcaneGraph["nodes"],
      links: {
         [linkLayerToCircle]: {
            linkId: linkLayerToCircle,
            fromNode: circleId,
            fromSocket: "output",
            toNode: layersId,
            toSocket: layerSocket1,
            type: 2,
         },
         [linkLayerToPolygon]: {
            linkId: linkLayerToPolygon,
            fromNode: polygonId,
            fromSocket: "output",
            toNode: layersId,
            toSocket: layerSocket2,
            type: 2,
         },
         [linkResultToLayer]: {
            linkId: linkResultToLayer,
            fromNode: layersId,
            fromSocket: "output",
            toNode: "ROOT",
            toSocket: "input",
            type: 2,
         },
      } as IArcaneGraph["links"],
      positions: {
         ROOT: {
            x: -274,
            y: -51,
         },
         [layersId]: {
            x: -518.2547781808032,
            y: -52.525010608492025,
         },
         [circleId]: {
            x: -781.9214448474739,
            y: -69.85834394182476,
         },
         [polygonId]: {
            x: -767.7309686569931,
            y: 185.14165605817647,
         },
         [notesId]: {
            x: 151.07292279205683,
            y: -196.15481091571272,
         },
      } as IArcanePos,
      toggles: {
         ROOT: {
            node: true,
         },
         [layersId]: {
            node: true,
         },
         [circleId]: {
            node: true,
            appearance: false,
         },
         [polygonId]: {
            node: true,
         },
         [notesId]: {
            node: true,
         },
      } as IArcaneToggle,
   };
};
