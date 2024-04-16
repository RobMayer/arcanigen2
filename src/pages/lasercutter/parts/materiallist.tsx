import styled from "styled-components";
import { useCutsheet, useMaterialList } from "../systemstate";
import { useMemo } from "react";
import { Section } from "./common";
import ActionButton from "../../../components/buttons/ActionButton";
import Icon from "../../../components/icons";
import { faWarning } from "@fortawesome/pro-solid-svg-icons";

export const MaterialList = styled(({ className, selected, onSelect }: { className?: string; selected: number | null; onSelect: (idx: number | null) => void }) => {
   const [materials, methods] = useMaterialList();

   const sheetData = useCutsheet();

   const list = useMemo(() => {
      return materials.map(({ material }, i) => {
         return `${material.width.value} ${material.width.unit} x ${material.height.value} ${material.height.unit} @ ${material.thickness.value} ${material.thickness.unit}`;
      });
   }, [materials]);

   return (
      <div className={className}>
         <Section className={"span"}>Material List</Section>
         <ArraySelect className={"span"}>
            {materials.map(({ material }, i) => {
               const sheetsUsed = sheetData[i].result?.length ?? 0;
               const unallocatedCount = sheetData[i].unallocated.length;

               const theThickness = `${material.thickness.value}${material.thickness.unit}`;

               return (
                  <Item
                     key={i}
                     className={i === selected ? "state-selected" : ""}
                     onClick={() => {
                        onSelect(i === selected ? null : i);
                     }}
                  >
                     <div>{`${material.width.value}${material.width.unit} x ${material.height.value}${material.height.unit} @ ${theThickness}`}</div>
                     {unallocatedCount > 0 ? <Icon icon={faWarning} className={"flavour-danger"} title={`${unallocatedCount} items could not be packed on this material`} /> : null}
                     <div>
                        {sheetsUsed} Sheet{sheetsUsed === 1 ? "" : "s"}
                     </div>
                  </Item>
               );
            })}
         </ArraySelect>
         <ActionButton
            onClick={() => {
               methods.add({
                  width: { value: 450, unit: "mm" },
                  height: { value: 300, unit: "mm" },
                  gap: { value: 2, unit: "mm" },
                  margin: { value: 4, unit: "mm" },
                  thickness: { value: 3, unit: "mm" },
               });
               onSelect(list.length);
            }}
         >
            Add Material
         </ActionButton>
         <ActionButton
            flavour="danger"
            disabled={selected === null}
            onClick={() => {
               methods.delete(selected);
               onSelect(null);
            }}
         >
            Delete Material
         </ActionButton>
      </div>
   );
})`
   display: grid;
   grid-template-rows: auto minmax(200px, 1fr) auto;
   grid-template-columns: 1fr 1fr;

   & > .span {
      grid-column: 1 / -1;
   }
`;

const ArraySelect = styled.div`
   background: var(--layer0);
   border: 1px solid var(--flavour-button);
   padding: 1px;
   display: flex;
   flex-direction: column;
   overflow-y: scroll;
`;

const Item = styled.div`
   cursor: pointer;
   padding: 1px 0.5em;
   &.state-selected {
      background: var(--flavour-button-muted);
   }
   display: grid;
   align-items: center;
   grid-auto-flow: column;
   grid-auto-columns: auto;
   grid-template-columns: 1fr;
`;
