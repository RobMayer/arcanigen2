import styled from "styled-components";
import { useCutsheet } from "../statehelper";

export const CutSheet = styled(({ className, selected }: { className?: string; selected: null | number }) => {
   const cutsheet = useCutsheet();

   return (
      <div className={className} id={"EXPORT_ME"}>
         {cutsheet.map(({ result, width, height, margin }, i) => {
            return (
               <MatGroup key={i}>
                  {result?.map((objs, j) => {
                     return (
                        <Sheet
                           key={`${i}_${j}`}
                           width={width * DPMM}
                           height={height * DPMM}
                           viewBox={`0 0 ${width} ${height}`}
                           style={MAT_STYLE}
                           data-material={`${i + 1}`}
                           data-sheet={`${j + 1}`}
                           xmlns="http://www.w3.org/2000/svg"
                           xmlnsXlink="http://www.w3.org/1999/xlink"
                        >
                           {objs.map((box, k) => {
                              return (
                                 <path key={`${i}_${j}_${k}`} d={`M ${box.x},${box.y} m ${margin},${margin} m ${box.width / 2},${box.height / 2} ${box.item.path}`} stroke={box.item.color} fill={"none"} vectorEffect={"non-scaling-stroke"} />
                              );
                           })}
                        </Sheet>
                     );
                  })}
               </MatGroup>
            );
         })}
      </div>
   );
})`
   overflow-y: scroll;
   display: grid;
   justify-items: center;
   align-items: center;
   grid-template-column: 1fr;
   background: var(--layer0);
   gap: 1em;
   padding-block: 1em;
   border: 1px solid var(--effect-border-highlight);
   background: var(--layer0);
`;

const MatGroup = styled.div`
   display: contents;
`;

const DPMM = 283.5 / 100;

const MAT_STYLE = {
   background: "white",
};

const Sheet = styled.svg`
   width: 80%;
   height: max-content;
`;
