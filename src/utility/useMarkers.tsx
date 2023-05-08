import ArcaneGraph from "!/pages/arcanigen/definitions/graph";
import { Globals, NodeRenderer } from "!/pages/arcanigen/definitions/types";
import { useCallback } from "react";

type IProps = {
   host: string;
   depth: string;
   markStart?: NodeRenderer;
   markMid?: NodeRenderer;
   markEnd?: NodeRenderer;
   startId?: string;
   midId?: string;
   endId?: string;
   globals: Globals;
   align: boolean;
};

const MarkersRenderer = ({ markStart: MarkStart, markMid: MarkMid, markEnd: MarkEnd, midId, startId, endId, align, depth, host, globals }: IProps) => {
   return (
      <>
         {MarkStart && startId && (
            <marker
               id={`markstart_${host}_lyr-${depth ?? ""}`}
               markerUnits="userSpaceOnUse"
               markerWidth={"100%"}
               markerHeight={"100%"}
               overflow={"visible"}
               orient={align ? "auto-start-reverse" : undefined}
            >
               <g transform={align ? `rotate(-90)` : ""}>
                  <MarkStart nodeId={startId} depth={(depth ?? "") + `_${host}.markStart`} globals={globals} />
               </g>
            </marker>
         )}
         {MarkEnd && endId && (
            <marker
               id={`markend_${host}_lyr-${depth ?? ""}`}
               markerUnits="userSpaceOnUse"
               markerWidth={"100%"}
               markerHeight={"100%"}
               overflow={"visible"}
               orient={align ? "auto-start-reverse" : undefined}
            >
               <g transform={align ? `rotate(-90)` : ""}>
                  <MarkEnd nodeId={endId} depth={(depth ?? "") + `_${host}.markEnd`} globals={globals} />
               </g>
            </marker>
         )}
         {MarkMid && midId && (
            <marker
               id={`markmid_${host}_lyr-${depth ?? ""}`}
               markerUnits="userSpaceOnUse"
               markerWidth={"100%"}
               markerHeight={"100%"}
               overflow={"visible"}
               orient={align ? "auto-start-reverse" : undefined}
            >
               <g transform={align ? `rotate(-90)` : ""}>
                  <MarkMid nodeId={midId} depth={(depth ?? "") + `_${host}.markMid`} globals={globals} />
               </g>
            </marker>
         )}
      </>
   );
};

const useMarkers = (
   nodeHooks: ReturnType<(typeof ArcaneGraph)["nodeHooks"]>,
   nodeId: string,
   globals: Globals,
   overrides: { [key: string]: any },
   depth: string
) => {
   const [MarkStart, msId] = nodeHooks.useInputNode(nodeId, "strokeMarkStart", globals);
   const [MarkMid, mmId] = nodeHooks.useInputNode(nodeId, "strokeMarkMid", globals);
   const [MarkEnd, meId] = nodeHooks.useInputNode(nodeId, "strokeMarkEnd", globals);

   const align = nodeHooks.useValue(nodeId, "strokeMarkAlign");

   const ThisMarkStart = "strokeMarkStart" in overrides ? overrides.strokeMarkStart.Renderer : MarkStart;
   const thisMsId = "strokeMarkStart" in overrides ? overrides.strokeMarkStart.id : msId;

   const ThisMarkMid = "strokeMarkMid" in overrides ? overrides.strokeMarkMid.Renderer : MarkMid;
   const thisMmId = "strokeMarkMid" in overrides ? overrides.strokeMarkMid.id : mmId;

   const ThisMarkEnd = "strokeMarkEnd" in overrides ? overrides.strokeMarkEnd.Renderer : MarkEnd;
   const thisMeId = "strokeMarkEnd" in overrides ? overrides.strokeMarkEnd.id : meId;

   const Renderer = useCallback(
      () => (
         <MarkersRenderer
            markStart={"strokeMarkStart" in overrides ? overrides.strokeMarkStart.Renderer : MarkStart}
            markMid={"strokeMarkMid" in overrides ? overrides.strokeMarkMid.Renderer : MarkMid}
            markEnd={"strokeMarkEnd" in overrides ? overrides.strokeMarkEnd.Renderer : MarkEnd}
            startId={"strokeMarkStart" in overrides ? overrides.strokeMarkStart.id : msId}
            midId={"strokeMarkMid" in overrides ? overrides.strokeMarkMid.id : mmId}
            endId={"strokeMarkEnd" in overrides ? overrides.strokeMarkEnd.id : meId}
            align={align}
            host={nodeId}
            globals={globals}
            depth={depth}
         />
      ),
      [overrides, MarkStart, MarkMid, MarkEnd, msId, mmId, meId, align, nodeId, globals, depth]
   );

   return [
      Renderer,
      ThisMarkStart && thisMsId ? `url('#markstart_${nodeId}_lyr-${depth ?? ""}')` : undefined,
      ThisMarkMid && thisMmId ? `url('#markmid_${nodeId}_lyr-${depth ?? ""}')` : undefined,
      ThisMarkEnd && thisMeId ? `url('#markend_${nodeId}_lyr-${depth ?? ""}')` : undefined,
   ] as [typeof Renderer, string | undefined, string | undefined, string | undefined];
};

export default useMarkers;
