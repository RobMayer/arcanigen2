import { memo } from "react";
import ArcaneGraph from "../graph";
import { BlendMode, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeTypes, SocketTypes } from "../types";

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
      <>
         <SocketOut<IMaskNode> nodeId={nodeId} socketId={"output"} type={SocketTypes.SHAPE}>
            Shape
         </SocketOut>
         <Checkbox checked={display} onToggle={setDisplay}>
            Show Mask on Output
         </Checkbox>
         <BaseNode.Input label={"Mask Mode"}>
            <ToggleList value={mode} options={MASK_MODES} onValue={setMode} />
         </BaseNode.Input>
         <Checkbox checked={invert} onToggle={setInvert} disabled={mode !== "luminance"}>
            Invert Luminance
         </Checkbox>
         <hr />
         <SocketIn<IMaskNode> nodeId={nodeId} socketId={"content"} type={SocketTypes.SHAPE}>
            Content
         </SocketIn>
         <SocketIn<IMaskNode> nodeId={nodeId} socketId={"mask"} type={SocketTypes.SHAPE}>
            Mask
         </SocketIn>
      </>
   );
});

const Renderer = memo(({ nodeId }: { nodeId: string }) => {
   const [Content, cId] = nodeHelper.useInputNode(nodeId, "content");
   const [Mask, mId] = nodeHelper.useInputNode(nodeId, "mask");
   const invert = nodeHelper.useValue(nodeId, "invert");
   const mode = nodeHelper.useValue(nodeId, "mode");
   const display = nodeHelper.useValue(nodeId, "display");

   return (
      <>
         <g>
            {display ? (
               Mask && <Mask nodeId={mId} />
            ) : (
               <>
                  <mask id={`mask_${nodeId}`} mask-type={mode}>
                     <rect x={"-100%"} y={"-100%"} width={"200%"} height={"200%"} fill={mode === "alpha" ? "none" : "#000f"} />
                     {Mask && mId && <Mask nodeId={mId} />}
                     {invert && mode === "luminance" && <rect x={"-100%"} y={"-100%"} width={"200%"} height={"200%"} fill={"#ffff"} style={INVERT} />}
                  </mask>
                  <g mask={`url(#mask_${nodeId})`}>{Content && cId && <Content nodeId={cId} />}</g>
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
