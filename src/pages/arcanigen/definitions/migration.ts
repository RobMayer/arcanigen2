import { ILayersNode } from "./collections/layersNode";
import { IArcaneGraph, NodeTypes, INodeInstance, IArcanePos, IArcaneToggle } from "./types";

export const SAVE_VERSION = "0.0.2";

const migrateLoadedFile = (version: string, data: IArcaneGraph & { positions: IArcanePos } & { toggles: IArcaneToggle }) => {
   if (version === SAVE_VERSION) {
      return data;
   }
   if (version === "0.0.1") {
      version = "0.0.2";
      data.nodes = Object.entries(data.nodes).reduce((acc, [key, node]) => {
         if (node.type === NodeTypes.COL_SEQUENCE) {
            acc[key] = { ...node, reverse: false };
         } else if (node.type === NodeTypes.COL_LAYERS) {
            // add enabled/disabled to layers
            const layerNode = data.nodes[key] as INodeInstance<ILayersNode>;
            layerNode.enabled = layerNode.sockets.reduce((acc, sId) => {
               acc[sId] = true;
               return acc;
            }, {} as { [key: string]: boolean });
            acc[key] = layerNode;
         } else {
            acc[key] = node;
         }
         return acc;
      }, {} as IArcaneGraph["nodes"]);
   }
   return data;
};

export default migrateLoadedFile;
