import LayersNodeHelper from "./collections/layersNode";
import MaskNodeHelper from "./collections/maskNode";
import SpiralArrayNodeHelper from "./collections/spiralArrayNode";
import VertexArrayNodeHelper from "./collections/vertexArrayNode";
import BrushEffectNodeHelper from "./effects/brushEffectNode";
import PencilEffectNodeHelper from "./effects/pencilEffectNode";
import PenEffectNodeHelper from "./effects/penEffectNode";
import ToLengthNodeHelper from "./math/convertToLength";
import MathAbsNodeHelper from "./math/mathAbsNode";
import MathAddNodeHelper from "./math/mathAddNode";
import MathDivNodeHelper from "./math/mathDivNode";
import MathModNodeHelper from "./math/mathModNode";
import MathMulNodeHelper from "./math/mathMulNode";
import MathSubNodeHelper from "./math/mathSubNode";
import ArcNodeHelper from "./shapes/arcNode";
import BurstNodeHelper from "./shapes/burstNode";
import CircleNodeHelper from "./shapes/circleNode";
import FloodFillNodeHelper from "./shapes/floodFillNode";
import GlyphNodeHelper from "./shapes/glyphNode";
import PolygonNodeHelper from "./shapes/polygonNode";
import PolygramNodeHelper from "./shapes/polygramNode";
import RingNodeHelper from "./shapes/ringNode";
import StarNodeHelper from "./shapes/starNode";
import { NodeTypes } from "./types";
import HexColorNodeHelper from "./values/hexColorNode";
import LengthValueNodeHelper from "./values/lengthValueNode";
import RandomValueNodeHelper from "./values/randomValueNode";
import ResultNodeHelper from "./values/resultNode";

// prettier-ignore
export const getNodeHelper = (key: NodeTypes) => {
   switch (key) {
      case NodeTypes.RESULT: return ResultNodeHelper;
      
      case NodeTypes.COL_LAYERS: return LayersNodeHelper;
      case NodeTypes.COL_MASK: return MaskNodeHelper;

      case NodeTypes.ARRAY_VERTEX: return VertexArrayNodeHelper;
      case NodeTypes.ARRAY_SPIRAL: return SpiralArrayNodeHelper;

      case NodeTypes.SHAPE_CIRCLE: return CircleNodeHelper;
      case NodeTypes.SHAPE_RING: return RingNodeHelper;
      case NodeTypes.SHAPE_POLYGON: return PolygonNodeHelper;
      case NodeTypes.SHAPE_POLYGRAM: return PolygramNodeHelper;
      case NodeTypes.SHAPE_STAR: return StarNodeHelper;
      case NodeTypes.SHAPE_BURST: return BurstNodeHelper;
      case NodeTypes.SHAPE_ARC: return ArcNodeHelper;

      case NodeTypes.SHAPE_FLOODFILL: return FloodFillNodeHelper;
      case NodeTypes.SHAPE_GLYPH: return GlyphNodeHelper;

      case NodeTypes.VALUE_LENGTH: return LengthValueNodeHelper;
      case NodeTypes.VALUE_RANDOM: return RandomValueNodeHelper;
      case NodeTypes.VALUE_COLOR_HEX: return HexColorNodeHelper;

      case NodeTypes.MATH_ADD: return MathAddNodeHelper;
      case NodeTypes.MATH_SUB: return MathSubNodeHelper;
      case NodeTypes.MATH_MUL: return MathMulNodeHelper;
      case NodeTypes.MATH_DIV: return MathDivNodeHelper;
      case NodeTypes.MATH_MOD: return MathModNodeHelper;
      case NodeTypes.MATH_ABS: return MathAbsNodeHelper;

      case NodeTypes.EFFECT_BRUSH: return BrushEffectNodeHelper;
      case NodeTypes.EFFECT_PENCIL: return PencilEffectNodeHelper;
      case NodeTypes.EFFECT_PEN: return PenEffectNodeHelper;

      case NodeTypes.CONVERT_LENGTH: return ToLengthNodeHelper;

   }
};
