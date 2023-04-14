import { memo } from "react";
import ArcaneGraph from "../graph";
import { BlendMode, ControlRendererProps, IArcaneGraph, INodeDefinition, INodeHelper, NodeRenderer, NodeRendererProps, NodeTypes, SocketTypes } from "../types";

import { faMask as nodeIcon } from "@fortawesome/pro-solid-svg-icons";
import { faMask as buttonIcon } from "@fortawesome/pro-light-svg-icons";
import Checkbox from "!/components/buttons/Checkbox";
import ToggleList from "!/components/selectors/ToggleList";
import BaseNode from "../../nodeView/node";
import { SocketOut, SocketIn } from "../../nodeView/socket";
import { MetaPrefab } from "../../nodeView/prefabs";

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

const nodeHooks = ArcaneGraph.nodeHooks<IMaskNode>();

const Controls = memo(({ nodeId, globals }: ControlRendererProps) => {
   const [display, setDisplay] = nodeHooks.useValueState(nodeId, "display");
   const [invert, setInvert] = nodeHooks.useValueState(nodeId, "invert");
   const [mode, setMode] = nodeHooks.useValueState(nodeId, "mode");

   return (
      <BaseNode<IMaskNode> nodeId={nodeId} helper={MaskNodeHelper} hooks={nodeHooks}>
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
         <MetaPrefab nodeId={nodeId} hooks={nodeHooks} />
      </BaseNode>
   );
});

const Renderer = memo(({ nodeId, depth, globals, overrides }: NodeRendererProps) => {
   const [Content, cId] = nodeHooks.useInputNode(nodeId, "content", globals);
   const [Mask, mId] = nodeHooks.useInputNode(nodeId, "mask", globals);
   const invert = nodeHooks.useValue(nodeId, "invert");
   const mode = nodeHooks.useValue(nodeId, "mode");
   const display = nodeHooks.useValue(nodeId, "display");

   return (
      <>
         <g>
            {display ? (
               Mask && (
                  <g>
                     <rect x={"-1000%"} y={"-1000%"} width={"2000%"} height={"2000%"} fill={mode === "alpha" ? "none" : "#000f"} />
                     <Mask nodeId={mId} depth={(depth ?? "") + `_${nodeId}.mask`} globals={globals} />
                  </g>
               )
            ) : (
               <>
                  <mask id={`mask_${nodeId}_lyr-${depth ?? ""}`} mask-type={mode}>
                     <rect x={"-1000%"} y={"-1000%"} width={"2000%"} height={"2000%"} fill={mode === "alpha" ? "none" : "#000f"} />
                     {Mask && mId && <Mask nodeId={mId} depth={(depth ?? "") + `_${nodeId}.mask`} globals={globals} />}
                     {invert && mode === "luminance" && <rect x={"-1000%"} y={"-1000%"} width={"2000%"} height={"2000%"} fill={"#ffff"} style={INVERT} />}
                  </mask>
                  <g mask={`url('#mask_${nodeId}_lyr-${depth ?? ""}')`}>
                     {Content && cId && <Content nodeId={cId} depth={(depth ?? "") + `_${nodeId}.content`} globals={globals} overrides={overrides} />}
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
