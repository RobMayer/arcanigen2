import { memo } from "react";
import ArcaneGraph from "../graph";
import { BlendMode, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodeTypes, SocketTypes } from "../types";

import { faMask as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faMask as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import Checkbox from "!/components/buttons/Checkbox";
import ToggleList from "!/components/selectors/ToggleList";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";

interface IMaskNode extends INodeDefinition {
   inputs: {
      content: NodeRenderer;
      mask: NodeRenderer;
   };
   outputs: {
      output: NodeRenderer;
   };
   values: {
      mode: "alpha" | "luminance";
      display: boolean;
      invert: boolean;
   };
}

const nodeHelper = ArcaneGraph.nodeHooks<IMaskNode>();

const Controls = memo(({ nodeId }: { nodeId: string }) => {
   const [display, setDisplay] = nodeHelper.useValueState(nodeId, "display");
   const [invert, setInvert] = nodeHelper.useValueState(nodeId, "invert");
   const [mode, setMode] = nodeHelper.useValueState(nodeId, "mode");

   return (
      <BaseNode<IMaskNode> nodeId={nodeId} helper={MaskNodeHelper}>
         <SocketOut<IMaskNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Output
         </SocketOut>
         <hr />
         <SocketIn<IMaskNode> nodeId={nodeId} socketId={"content"} type={SocketTypes.SHAPE}>
            Content
         </SocketIn>
         <SocketIn<IMaskNode> nodeId={nodeId} socketId={"mask"} type={SocketTypes.SHAPE}>
            Mask
         </SocketIn>
         <hr />
         <Checkbox checked={display} onToggle={setDisplay}>
            Show Mask on Output
         </Checkbox>
         <BaseNode.Input label={"Mask Mode"}>
            <ToggleList value={mode} options={MASK_MODES} onValue={setMode} />
         </BaseNode.Input>
         <Checkbox checked={invert} onToggle={setInvert} disabled={mode !== "luminance"}>
            Invert Luminance
         </Checkbox>
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, layer }: NodeRendererProps) => {
   const [Content, cId] = nodeHelper.useInputNode(nodeId, "content");
   const [Mask, mId] = nodeHelper.useInputNode(nodeId, "mask");
   const invert = nodeHelper.useValue(nodeId, "invert");
   const mode = nodeHelper.useValue(nodeId, "mode");
   const display = nodeHelper.useValue(nodeId, "display");

   return (
      <>
         <g>
            {display ? (
               Mask && <Mask nodeId={mId} layer={(layer ?? "") + `_${nodeId}.mask`} />
            ) : (
               <>
                  <mask id={`mask__${nodeId}_lyr-${layer ?? ""}`} mask-type={mode}>
                     <rect x={"-1000%"} y={"-1000%"} width={"2000%"} height={"2000%"} fill={mode === "alpha" ? "none" : "#000f"} />
                     {Mask && mId && <Mask nodeId={mId} layer={(layer ?? "") + `_${nodeId}.mask`} />}
                     {invert && mode === "luminance" && <rect x={"-1000%"} y={"-1000%"} width={"2000%"} height={"2000%"} fill={"#ffff"} style={INVERT} />}
                  </mask>
                  <g mask={`url('#mask__${nodeId}_lyr-${layer ?? ""}')`}>
                     {Content && cId && <Content nodeId={cId} layer={(layer ?? "") + `_${nodeId}.content`} />}
                  </g>
               </>
            )}
         </g>
      </>
   );
});

const MaskNodeHelper: INodeHelper<IMaskNode> = {
   name: "Mask",
   buttonIcon,
   nodeIcon,
   flavour: "danger",
   type: NodeTypes.COL_MASK,
   getOutput: (graph: IArcaneGraph, nodeId: string, socket: keyof IMaskNode["outputs"]) => Renderer,
   initialize: () => ({
      display: false,
      mode: "luminance",
      invert: false,
   }),
   controls: Controls,
};

export default MaskNodeHelper;

const MASK_MODES = {
   luminance: "Luminance",
   alpha: "Transparency",
};

const INVERT = {
   mixBlendMode: "difference" as BlendMode,
};
