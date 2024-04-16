import styled from "styled-components";
import { useCutsheet } from "../systemstate";

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
                              const rot = box.rotated ? `rotate(90, 0, 0)` : "";
                              const pos = `translate(${margin + box.x + box.width / 2},${margin + box.y + box.height / 2})`;

                              return <path key={`${i}_${j}_${k}`} d={`${box.item.path}`} stroke={box.item.color} fill={"none"} vectorEffect={"non-scaling-stroke"} transform={`${pos} ${rot}`} />;
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

const DPMM = 283.5 / 100.0;

const MAT_STYLE = {
   background: "white",
};

const Sheet = styled.svg`
   width: 80%;
   height: max-content;
   overflow: visible;
`;
