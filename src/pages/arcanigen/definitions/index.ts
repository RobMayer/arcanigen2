import LayersNodeHelper from "./collections/layersNode";
import MaskNodeHelper from "./collections/maskNode";
import SpiralArrayNodeHelper from "./collections/spiralArrayNode";
import VertexArrayNodeHelper from "./collections/vertexArrayNode";
import BrushEffectNodeHelper from "./effects/brushEffectNode";
import PencilEffectNodeHelper from "./effects/pencilEffectNode";
import PenEffectNodeHelper from "./effects/penEffectNode";
import ConvertNodeHelper from "./math/convertNode";
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
import ResultNodeHelper from "./collections/resultNode";
import SequencerNodeHelper from "./collections/sequenceNode";
import ColorRGBNodeHelper from "./values/colorRGBNode";
import ColorHSVNodeHelper from "./values/colorHSVNode";
import ColorHSLNodeHelper from "./values/colorHSLNode";
import ColorHWKNodeHelper from "./values/colorHWKNode";
import AngleValueNodeHelper from "./values/angleValueNode";
import LerpNumberNodeHelper from "./math/lerpNumberNode";
import LerpColorNodeHelper from "./math/lerpColorNode";
import ColorHCYNodeHelper from "./values/colorHCYNode";
import ColorCMYKNodeHelper from "./values/colorCMYKNode";
import ColorHSINodeHelper from "./values/colorHSINode";
import CurveNodeHelper from "./values/curveNode";
import SpiralNodeHelper from "./shapes/spiralNode";
import PercentValueNodeHelper from "./values/percentValueNode";
import MathRndNodeHelper from "./math/mathRoundNode";
import SplitColorNodeHelper from "./values/splitColorNode";
import LerpAngleNodeHelper from "./math/lerpAngleNode";
import LerpLengthNodeHelper from "./math/lerpLengthNode";
import TransformNodeHelper from "./collections/transformNode";
import MathSpreadNodeHelper from "./math/mathSpdNode";
import NumberValueNodeHelper from "./values/numberValueNode";
import SegmentNodeHelper from "./shapes/segementNode";
import RepeatArrayNodeHelper from "./collections/repeatArrayNode";
import PolyringNodeHelper from "./shapes/polyringNode";
import KnotNodeHelper from "./shapes/knotNode";
import OverrideStylesNodeHelper from "./collections/overrideStylesNode";
import PortalOutNodeHelper from "./collections/portalOutNode";
import PortalInNodeHelper from "./collections/portalInNode";
import ThatRobShapeNodeHelper from "./shapes/thatRobShapeNode";
import RectangleNodeHelper from "./shapes/reactangleNode";

// prettier-ignore
export const getNodeHelper = (key: NodeTypes) => {
   switch (key) {
      case NodeTypes.RESULT: return ResultNodeHelper;
      
      case NodeTypes.COL_LAYERS: return LayersNodeHelper;
      case NodeTypes.COL_MASK: return MaskNodeHelper;
      case NodeTypes.COL_SEQUENCE: return SequencerNodeHelper;
      case NodeTypes.COL_TRANSFORM: return TransformNodeHelper;
      case NodeTypes.COL_RESTYLE: return OverrideStylesNodeHelper;
      case NodeTypes.COL_PORTAL_IN: return PortalInNodeHelper;
      case NodeTypes.COL_PORTAL_OUT: return PortalOutNodeHelper;

      case NodeTypes.ARRAY_VERTEX: return VertexArrayNodeHelper;
      case NodeTypes.ARRAY_SPIRAL: return SpiralArrayNodeHelper;
      case NodeTypes.ARRAY_REPEAT: return RepeatArrayNodeHelper;

      case NodeTypes.SHAPE_CIRCLE: return CircleNodeHelper;
      case NodeTypes.SHAPE_RECTANGLE: return RectangleNodeHelper;
      case NodeTypes.SHAPE_RING: return RingNodeHelper;
      case NodeTypes.SHAPE_POLYGON: return PolygonNodeHelper;
      case NodeTypes.SHAPE_POLYGRAM: return PolygramNodeHelper;
      case NodeTypes.SHAPE_POLYRING: return PolyringNodeHelper;
      case NodeTypes.SHAPE_KNOT: return KnotNodeHelper;
      case NodeTypes.SHAPE_STAR: return StarNodeHelper;
      case NodeTypes.SHAPE_BURST: return BurstNodeHelper;
      case NodeTypes.SHAPE_ARC: return ArcNodeHelper;
      case NodeTypes.SHAPE_SPIRAL: return SpiralNodeHelper;
      case NodeTypes.SHAPE_SEGMENT: return SegmentNodeHelper;
      
      case NodeTypes.SHAPE_FLOODFILL: return FloodFillNodeHelper;
      case NodeTypes.SHAPE_GLYPH: return GlyphNodeHelper;
      case NodeTypes.SHAPE_THATROBSHAPE: return ThatRobShapeNodeHelper;

      case NodeTypes.VALUE_LENGTH: return LengthValueNodeHelper;
      case NodeTypes.VALUE_RANDOM: return RandomValueNodeHelper;
      case NodeTypes.VALUE_ANGLE: return AngleValueNodeHelper;

      case NodeTypes.VALUE_COLOR: return HexColorNodeHelper;
      case NodeTypes.VALUE_PERCENT: return PercentValueNodeHelper;
      case NodeTypes.VALUE_NUMBER: return NumberValueNodeHelper;

      case NodeTypes.MATH_ADD: return MathAddNodeHelper;
      case NodeTypes.MATH_SUB: return MathSubNodeHelper;
      case NodeTypes.MATH_MUL: return MathMulNodeHelper;
      case NodeTypes.MATH_DIV: return MathDivNodeHelper;
      case NodeTypes.MATH_MOD: return MathModNodeHelper;
      case NodeTypes.MATH_ABS: return MathAbsNodeHelper;
      case NodeTypes.MATH_SPD: return MathSpreadNodeHelper;
      case NodeTypes.MATH_RND: return MathRndNodeHelper;

      case NodeTypes.EFFECT_BRUSH: return BrushEffectNodeHelper;
      case NodeTypes.EFFECT_PENCIL: return PencilEffectNodeHelper;
      case NodeTypes.EFFECT_PEN: return PenEffectNodeHelper;

      case NodeTypes.CONVERT_VALUE: return ConvertNodeHelper;

      case NodeTypes.COLOR_RGB: return ColorRGBNodeHelper;
      case NodeTypes.COLOR_HSV: return ColorHSVNodeHelper;
      case NodeTypes.COLOR_HSL: return ColorHSLNodeHelper;
      case NodeTypes.COLOR_HWK: return ColorHWKNodeHelper;
      case NodeTypes.COLOR_HCY: return ColorHCYNodeHelper;
      case NodeTypes.COLOR_HSI: return ColorHSINodeHelper;
      case NodeTypes.COLOR_CMYK: return ColorCMYKNodeHelper;

      case NodeTypes.LERP_NUMBER: return LerpNumberNodeHelper;
      case NodeTypes.LERP_COLOR: return LerpColorNodeHelper;
      case NodeTypes.LERP_LENGTH: return LerpLengthNodeHelper;
      case NodeTypes.LERP_ANGLE: return LerpAngleNodeHelper;
      case NodeTypes.VALUE_CURVE: return CurveNodeHelper;

      case NodeTypes.SPLIT_COLOR: return SplitColorNodeHelper;

   }
};
