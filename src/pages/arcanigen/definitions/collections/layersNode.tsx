import { v4 as uuid } from "uuid";
import { INodeDefinition, NodeRenderer, INodeHelper, NodeTypes, BlendMode } from "../types";
import { faLayerGroup as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faLayerGroup as buttonIcon } from "@fortawesome/pro-light-svg-icons";

interface ILayersNode extends INodeDefinition {
   inputs: {
      [key: string]: NodeRenderer;
   };
   values: {
      sockets: string[];
      modes: { [key: string]: BlendMode };
   };
   outputs: {
      result: NodeRenderer;
   };
}

const Controls = (p: { nodeId: string }) => {
   return <></>;
};

const Renderer = (p: { nodeId: string }) => {
   return <></>;
};

const LayersNodeHelper: INodeHelper<ILayersNode> = {
   name: "Layers",
   buttonIcon,
   flavour: "danger",
   nodeIcon,
   type: NodeTypes.COL_LAYERS,
   getOutput: () => Renderer,
   initialize: () => {
      const socketId = uuid();
      return {
         sockets: [socketId],
         modes: { [socketId]: "normal" },
         in: {
            [socketId]: null,
         },
      };
   },
   controls: Controls,
};

export default LayersNodeHelper;
