import LayersNodeHelper from "./collections/layersNode";
import { NodeTypes } from "./types";
import ResultNodeHelper from "./values/resultNode";

export const getNodeHelper = (key: NodeTypes) => {
   switch (key) {
      case NodeTypes.RESULT:
         return ResultNodeHelper;
      case NodeTypes.COL_LAYERS:
         return LayersNodeHelper;
   }
};
