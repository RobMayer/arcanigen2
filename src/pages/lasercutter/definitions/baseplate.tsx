import Checkbox from "../../../components/buttons/Checkbox";
import NumberInput from "../../../components/inputs/NumberInput";
import { convertLength } from "../../../utility/mathhelper";
import { drawRect, drawArray, cutRect, drawFootBlock, drawFootBracket, drawFootRunner } from "../cuthelper";
import { Wide, ItemPanel, Label, Section } from "../parts/common";
import { ItemControlProps, ItemDefinition, GridSystem, Material, FOOT_STYLES } from "../types";

export type BaseplateParams = {
   type: "BASEPLATE";
   cellX: number;
   cellY: number;
   footPack: boolean;
};

const Controls = ({ value, setValue, grid }: ItemControlProps<BaseplateParams>) => {
   return (
      <ItemPanel value={value} setValue={setValue} label={"Baseplate"}>
         <Section>Size</Section>
         <Label>Cells X</Label>
         <NumberInput value={value.cellX} onValidCommit={(v) => setValue("cellX", v)} min={1} step={1} />
         <Label>Cells Y</Label>
         <NumberInput value={value.cellY} onValidCommit={(v) => setValue("cellY", v)} min={1} step={1} />
         <Section>Extras</Section>
         <Label>Pack Feet</Label>
         <Wide>
            <Checkbox checked={value.footPack} onToggle={(v) => setValue("footPack", v)}>
               (This works best with default grid settings, careful)
            </Checkbox>
         </Wide>
      </ItemPanel>
   );
};

const getLayout = (item: BaseplateParams, material: Material, grid: GridSystem) => {
   const gridSize = convertLength(grid.gridSize, "mm").value;
   const tX = item.cellX * gridSize;
   const tY = item.cellY * gridSize;

   return [{ width: tX, height: tY, path: drawGrid(item.cellX, item.cellY, item.footPack, material, grid) }];
};

export const BaseplateDef: ItemDefinition<BaseplateParams> = {
   getLayout,
   Controls,
   getInitial: () => ({
      type: "BASEPLATE",
      cellX: 3,
      cellY: 3,
      footPack: false,
   }),
   getLabel: (item) => `Baseplate (${item.cellX}x${item.cellY})`,
   getTitle: () => `Baseplate`,
   getDescription: () => "Baseplate with sockets for your grid boxes",
};

const drawGrid = (x: number, y: number, footPack: boolean, material: Material, grid: GridSystem) => {
   const materialThickness = convertLength(material.thickness, "mm").value;
   const gridSize = convertLength(grid.gridSize, "mm").value;
   const gridClearance = convertLength(grid.gridClearance, "mm").value;

   let feet = "";
   if (footPack) {
      if (grid.footStyle === FOOT_STYLES.BLOCK) {
         feet = drawFootBlock(material, grid);
      }
      if (grid.footStyle === FOOT_STYLES.RUNNER) {
         feet = drawArray({ count: 1, spacing: 0 }, { count: 5, spacing: (gridSize - materialThickness * 2.5) / 5 }, drawFootRunner(material, grid));
      }
      if (grid.footStyle === FOOT_STYLES.BRACKET) {
         feet = drawFootBracket(material, grid);
      }
   }

   return [
      // OUTLINE
      drawRect(gridSize * x - gridClearance * 2, gridSize * y - gridClearance * 2),
      drawArray({ count: x, spacing: gridSize }, { count: y, spacing: gridSize }, cutRect(gridSize - materialThickness * 2 - gridClearance * 2, gridSize - materialThickness * 2 - gridClearance * 2)),
      footPack ? drawArray({ count: x, spacing: gridSize }, { count: y, spacing: gridSize }, feet) : "",
   ].join(" ");
};
