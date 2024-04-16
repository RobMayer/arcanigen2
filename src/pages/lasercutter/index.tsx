import { HTMLAttributes, useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import Page from "../../components/content/Page";
import { CutSheet } from "./parts/cutsheet";
import { LaserMenu } from "./parts/menu";
import { GridSettings } from "./parts/gridsettings";
import { MaterialList } from "./parts/materiallist";
import { MaterialSettings } from "./parts/materialsettings";
import { ItemList } from "./parts/itemlist";
import { useGridState, useItemState } from "./systemstate";
import { ITEM_DEFINITIONS } from "./definitions";

const LaserPage = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
   const { material, item, selectMaterial, selectItem } = useSelection();

   return (
      <Page {...props}>
         <LaserMenu className={"menu"} />
         <CutSheet className={"preview"} selected={material} />
         <Panel className={"settings"}>
            <GridSettings />
            <MaterialList selected={material} onSelect={selectMaterial} />
            {material !== null ? (
               <>
                  <MaterialSettings material={material} />
                  <ItemList material={material} selected={item} onSelect={selectItem} />
               </>
            ) : (
               <Notice>Select or Add a Material</Notice>
            )}
         </Panel>
         <Panel className={"item"}>{material !== null && item !== null ? <ItemControls item={item} material={material} /> : <Notice>Select or Add an Item</Notice>}</Panel>
      </Page>
   );
})`
   display: grid;
   grid-template-columns: 3fr minmax(450px, 1fr) minmax(450px, 1fr);
   grid-template-rows: auto 1fr;

   grid-template-areas:
      "menu menu menu"
      "preview settings item";

   gap: 0.25em;
   padding: 0.25em;
   place-content: stretch;

   & > .menu {
      grid-area: menu;
   }

   & > .preview {
      grid-area: preview;
   }

   & > .settings {
      grid-area: settings;
   }

   & > .item {
      grid-area: item;
   }
`;

export default LaserPage;

const Notice = styled.div`
   text-align: center;
   color: #888;
`;

const Panel = styled.div`
   border: 1px solid var(--effect-border-highlight);
   background: var(--layer1);
   overflow-y: scroll;
   display: grid;
   grid-auto-rows: max-content;
   grid-template-column: 1fr;
   gap: 1em;
   padding: 1em;
   align-content: start;
`;

const ItemControls = ({ item, material }: { item: number; material: number }) => {
   const [value, setValue] = useItemState(material, item);
   const [grid] = useGridState();

   const Comp = useMemo(() => ITEM_DEFINITIONS[value.type].Controls, [value.type]);

   return <Comp grid={grid} value={value} setValue={setValue} />;
};

const useSelection = () => {
   const [state, setState] = useState<{ material: number | null; item: number | null }>({ material: null, item: null });

   const selectMaterial = useCallback((idx: number | null) => {
      setState((prev) => {
         if (idx !== prev.material) {
            return { material: idx, item: null };
         }
         return prev;
      });
   }, []);

   const selectItem = useCallback((idx: number | null) => {
      setState((prev) => {
         if (idx !== prev.item) {
            return { material: prev.material, item: idx };
         }
         return prev;
      });
   }, []);

   return {
      item: state.item,
      material: state.material,
      selectItem,
      selectMaterial,
   };
};
