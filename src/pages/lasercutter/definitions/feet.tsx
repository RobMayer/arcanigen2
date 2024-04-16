import { convertLength } from "../../../utility/mathhelper";
import { drawFootRunner, drawFootBlock, drawFootBracket } from "../cuthelper";
import { Wide, ItemPanel } from "../parts/common";
import { ItemControlProps, ItemDefinition, GridSystem, Material } from "../types";

export type FeetParams = {
   type: "FEET";
};

const Controls = ({ value, setValue, grid }: ItemControlProps<FeetParams>) => {
   return (
      <ItemPanel value={value} setValue={setValue} label={FeetDef.getTitle()}>
         <Wide>There's nothing more to edit for feet...</Wide>
      </ItemPanel>
   );
};

const getLayout = (item: FeetParams, material: Material, grid: GridSystem) => {
   const materialThickness = convertLength(material.thickness, "mm").value;
   const footSize = convertLength(grid.footSize, "mm").value;
   const gridTab = convertLength(grid.gridTab, "mm").value;

   const gridSize = convertLength(grid.gridSize, "mm").value;
   const materialGap = convertLength(material.gap, "mm").value;
   const stackClearance = convertLength(grid.stackClearance, "mm").value;
   const gridClearance = convertLength(grid.gridClearance, "mm").value;

   switch (grid.footStyle) {
      case "RUNNER":
         return [{ width: (gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize, height: materialThickness * 2, path: drawFootRunner(material, grid) }];
      case "BLOCK":
         return [{ width: gridSize - materialThickness - stackClearance - gridClearance, height: gridSize - materialThickness - stackClearance - gridClearance, path: drawFootBlock(material, grid) }];
      case "BRACKET":
         return [{ width: footSize * 5 + materialGap * 4, height: footSize * 5 + materialGap * 4, path: drawFootBracket(material, grid) }];
   }
};

export const FeetDef: ItemDefinition<FeetParams> = {
   getLayout,
   Controls,
   getInitial: () => ({
      type: "FEET",
   }),
   getLabel: (item) => `Feet`,
   getTitle: () => `Feet`,
   getDescription: () => "Feet...",
};
