import { convertLength } from "../../../utility/mathhelper";
import { drawRect, cutRect } from "../cuthelper";
import { Full, ItemPanel } from "../parts/common";
import { ItemControlProps, ItemDefinition, GridSystem, Material, FOOT_STYLES } from "../types";

export type FootJigParams = {
   type: "FOOTJIG";
};

const Controls = ({ value, setValue, grid }: ItemControlProps<FootJigParams>) => {
   return (
      <ItemPanel value={value} setValue={setValue} label={FootJigDef.getTitle()}>
         <Full>There's nothing more to edit for the foot jig...</Full>
      </ItemPanel>
   );
};

const getLayout = (item: FootJigParams, material: Material, grid: GridSystem) => {
   const materialThickness = convertLength(material.thickness, "mm").value;
   const footSize = convertLength(grid.footSize, "mm").value;
   const gridTab = convertLength(grid.gridTab, "mm").value;

   const gridSize = convertLength(grid.gridSize, "mm").value;
   const stackClearance = convertLength(grid.stackClearance, "mm").value;
   const gridClearance = convertLength(grid.gridClearance, "mm").value;

   const rOffset = gridSize / 2 - materialThickness * 1.5 - stackClearance - gridClearance;

   const rJig = [
      `m 0,${rOffset}`,
      cutRect((gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize, materialThickness),
      `m 0,${-rOffset}`,
      `m 0,${-rOffset}`,
      cutRect((gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize, materialThickness),
      `m 0,${rOffset}`,

      `m ${rOffset},0`,
      cutRect(materialThickness, (gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize),
      `m ${-rOffset},0`,
      `m ${-rOffset},0`,
      cutRect(materialThickness, (gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize),
      `m ${rOffset},0`,
      "",
   ].join(" ");

   const bOffset = gridSize / 2 - materialThickness - footSize - stackClearance - gridClearance;

   const bJig = [
      //
      `m ${bOffset},${bOffset}`,
      cutRect(footSize * 2, footSize * 2),
      `m ${-bOffset},${-bOffset}`,
   ].join(" ");

   const path = [
      drawRect(gridSize - gridClearance * 2, gridSize - gridClearance * 2),
      grid.footStyle === FOOT_STYLES.RUNNER ? rJig : "",
      grid.footStyle === FOOT_STYLES.BLOCK ? cutRect(gridSize - materialThickness * 2 - gridClearance * 2 - stackClearance * 2, gridSize - materialThickness * 2 - gridClearance * 2 - stackClearance * 2) : "",
      grid.footStyle === FOOT_STYLES.BRACKET ? bJig : "",
   ];

   return [
      {
         width: gridSize - gridClearance * 2,
         height: gridSize - gridClearance * 2,
         path: path.join(" "),
      },
   ];
};

export const FootJigDef: ItemDefinition<FootJigParams> = {
   getLayout,
   Controls,
   getInitial: () => ({
      type: "FOOTJIG",
   }),
   getLabel: (item) => `Foot Jig`,
   getTitle: () => `Foot Jig`,
   getDescription: () => "Use this to help align the feet on a box.",
};
