import LayersNodeHelper from "./collections/layersNode";
import BurstNodeHelper from "./shapes/burstNode";
import CircleNodeHelper from "./shapes/circleNode";
import PolygonNodeHelper from "./shapes/polygonNode";
import PolygramNodeHelper from "./shapes/polygramNode";
import RingNodeHelper from "./shapes/ringNode";
import StarNodeHelper from "./shapes/starNode";
import { NodeTypes } from "./types";
import ResultNodeHelper from "./values/resultNode";

export const getNodeHelper = (key: NodeTypes) => {
   switch (key) {
      case NodeTypes.RESULT:
         return ResultNodeHelper;
      case NodeTypes.COL_LAYERS:
         return LayersNodeHelper;
      case NodeTypes.SHAPE_CIRCLE:
         return CircleNodeHelper;
      case NodeTypes.SHAPE_RING:
         return RingNodeHelper;
      case NodeTypes.SHAPE_POLYGON:
         return PolygonNodeHelper;
      case NodeTypes.SHAPE_POLYGRAM:
         return PolygramNodeHelper;
      case NodeTypes.SHAPE_STAR:
         return StarNodeHelper;
      case NodeTypes.SHAPE_BURST:
         return BurstNodeHelper;
   }
};
