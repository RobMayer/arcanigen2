import { ReactNode, useMemo } from "react";
import styled from "styled-components";

export const ArraySelect = styled(({ className, items, value, onSelect }: { className?: string; items: ReactNode[]; value: number | null; onSelect: (idx: number | null) => void }) => {
   const cN = useMemo(() => {
      return `${className ?? ""}`;
   }, [className]);

   return (
      <div className={cN}>
         {items.map((each, i) => {
            return (
               <Item key={i} idx={i} selected={i === value} onSelect={onSelect}>
                  {each}
               </Item>
            );
         })}
      </div>
   );
})`
   background: var(--layer0);
   border: 1px solid var(--flavour-button);
   padding: 1px;
   display: flex;
   flex-direction: column;
   overflow-y: scroll;
`;

const Item = styled(({ idx, selected, onSelect, className, children }: { idx: number; selected: boolean; onSelect: (idx: number | null) => void; className?: string; children?: ReactNode }) => {
   const cN = useMemo(() => {
      return `${className ?? ""} ${selected ? "state-selected" : ""}`;
   }, [className, selected]);

   return (
      <div
         className={cN}
         onClick={() => {
            onSelect(selected ? null : idx);
         }}
      >
         {children}
      </div>
   );
})`
   cursor: pointer;
   padding: 1px 0.5em;
   &.state-selected {
      background: var(--flavour-button-muted);
   }
`;
