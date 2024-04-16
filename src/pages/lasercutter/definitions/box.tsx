import NumberInput from "../../../components/inputs/NumberInput";
import ToggleList from "../../../components/selectors/ToggleList";
import { convertLength } from "../../../utility/mathhelper";
import { cutRect, drawArray, drawBottom, drawTabbedRect } from "../cuthelper";
import { Wide, ItemPanel, Label, Section } from "../parts/common";
import { FOOT_LAYOUT, FOOT_LAYOUT_OPTIONS, FOOT_STYLES, FootLayout, GridSystem, ItemControlProps, ItemDefinition, Material, TOP_STYLES, TOP_STYLE_OPTIONS, TopStyle } from "../types";

export type BoxParams = {
   type: "BOX";
   cellX: number;
   cellY: number;
   cellZ: number;
   footLayout: FootLayout;

   divX: number;
   divY: number;

   topStyle: TopStyle;

   footPack: boolean;
};

const getInitial = (): BoxParams => ({
   type: "BOX",
   cellX: 1,
   cellY: 1,
   cellZ: 2,
   footLayout: FOOT_LAYOUT.MINIMAL,
   divX: 0,
   divY: 0,
   topStyle: TOP_STYLES.NONE,
   footPack: true,
});

const getLayout = (item: BoxParams, material: Material, grid: GridSystem) => {
   const gridSize = convertLength(grid.gridSize, "mm").value;
   const stackSize = convertLength(grid.stackSize, "mm").value;

   const tX = item.cellX * gridSize;
   const tY = item.cellY * gridSize;
   const tZ = item.cellZ * stackSize;

   const panels = [
      { width: tX, height: tY, path: drawBottom(item.cellX, item.cellY, item.footLayout, material, grid) },
      { width: tX, height: tZ, path: drawEnd(item, material, grid) },
      { width: tX, height: tZ, path: drawEnd(item, material, grid) },
      { width: tY, height: tZ, path: drawSide(item, material, grid) },
      { width: tY, height: tZ, path: drawSide(item, material, grid) },
   ];

   if (item.topStyle !== TOP_STYLES.NONE) {
      panels.push({ width: tX, height: tY, path: drawTop(item, material, grid) });
   }

   if (item.divY > 0) {
      for (let dX = 1; dX <= item.divY; dX++) {
         panels.push({ width: tX, height: tZ, path: drawDivX(item, material, grid) });
      }
   }

   if (item.divX > 0) {
      for (let dY = 1; dY <= item.divX; dY++) {
         panels.push({ width: tY, height: tZ, path: drawDivY(item, material, grid) });
      }
   }

   return panels;
};

const Controls = ({ value, setValue, grid }: ItemControlProps<BoxParams>) => {
   return (
      <ItemPanel value={value} setValue={setValue} label={"Box"}>
         <Section>Size</Section>
         <Label>Cells X</Label>
         <NumberInput value={value.cellX} onValidCommit={(v) => setValue("cellX", v)} min={1} step={1} />
         <Label>Cells Y</Label>
         <NumberInput value={value.cellY} onValidCommit={(v) => setValue("cellY", v)} min={1} step={1} />
         <Label>Cells Z</Label>
         <NumberInput value={value.cellZ} onValidCommit={(v) => setValue("cellZ", v)} min={1} step={1} />
         <Section>Divisions</Section>
         <Label>Dividers X</Label>
         <NumberInput value={value.divX} onValidCommit={(v) => setValue("divX", v)} min={0} step={1} />
         <Label>Dividers Y</Label>
         <NumberInput value={value.divY} onValidCommit={(v) => setValue("divY", v)} min={0} step={1} />
         <Section>Extra Options</Section>
         <Label>Foot Layout</Label>
         <Wide>
            <ToggleList disabled={grid.footStyle !== FOOT_STYLES.RUNNER} options={FOOT_LAYOUT_OPTIONS} value={value.footLayout} onValue={(v) => setValue("footLayout", v)} />
         </Wide>
         <Label>Top Style</Label>
         <ToggleList className={"spanRest"} options={TOP_STYLE_OPTIONS} value={value.topStyle} onValue={(v) => setValue("topStyle", v)} />
      </ItemPanel>
   );
};

export const BoxDef: ItemDefinition<BoxParams> = {
   getLayout,
   Controls,
   getInitial,
   getLabel: (item) => `Box (${item.cellX}x${item.cellY}x${item.cellZ})`,
   getTitle: () => "Box",
   getDescription: () => "A simple Box with optional dividers",
};

const drawEnd = (item: BoxParams, material: Material, grid: GridSystem) => {
   const materialThickness = convertLength(material.thickness, "mm").value;
   const gridSize = convertLength(grid.gridSize, "mm").value;
   const gridClearance = convertLength(grid.gridClearance, "mm").value;
   const gridTab = convertLength(grid.gridTab, "mm").value;
   const stackSize = convertLength(grid.stackSize, "mm").value;
   const stackTab = convertLength(grid.stackTab, "mm").value;

   const inset: string[] = [];
   const divs: string[] = [];

   if (item.topStyle === TOP_STYLES.INSET) {
      inset.push(`m ${-(gridSize / 2)},${materialThickness * 1.5}`);
      for (let x = 1; x <= item.cellX; x++) {
         inset.push(`m ${gridSize * x},0`, cutRect(gridTab, materialThickness), `m ${-(gridSize * x)},0`);
      }
      inset.push(`m ${gridSize / 2},${-(materialThickness * 1.5)}`);
   }

   if (item.divX > 0) {
      divs.push(`m 0,${-(stackSize / 2)}`);
      if (item.topStyle === TOP_STYLES.GRID) {
         divs.push(`m 0,${-materialThickness}`);
      }
      const span = (gridSize * item.cellX) / (item.divX + 1);

      for (let x = 1; x <= item.divX; x++) {
         for (let z = 1; z <= item.cellZ; z++) {
            divs.push(`m ${span * x},${z * stackSize}`, cutRect(materialThickness, stackTab), `m ${-(span * x)},${-(z * stackSize)}`);
         }
      }
      if (item.topStyle === TOP_STYLES.GRID) {
         divs.push(`m 0,${materialThickness}`);
      }
      divs.push(`m 0,${stackSize / 2}`);
   }

   const squat = item.topStyle === TOP_STYLES.GRID ? materialThickness : 0;

   const divSpacing = (gridSize * item.cellX - gridClearance * 2 - materialThickness) / (item.divX + 1);

   return [
      //OUTLINE
      drawTabbedRect(
         item.cellX * gridSize,
         item.cellZ * stackSize,
         {
            tabs: item.topStyle === TOP_STYLES.NONE || item.topStyle === TOP_STYLES.INSET ? 0 : item.cellX,
            margin: squat,
            size: gridTab,
            thickness: materialThickness,
         },
         {
            tabs: item.cellZ,
            margin: gridClearance,
            size: stackTab,
            thickness: materialThickness,
         },
         {
            tabs: item.cellX,
            size: gridTab,
            thickness: -materialThickness,
         },
         {
            tabs: item.cellZ,
            margin: gridClearance,
            size: stackTab,
            thickness: materialThickness,
         }
      ),
      // Extras
      item.topStyle === TOP_STYLES.INSET ? drawArray({ count: item.cellX, spacing: gridSize }, { count: 1, spacing: 0, offset: -((stackSize * item.cellZ) / 2 - materialThickness * 1.5) }, cutRect(gridTab, materialThickness)) : "",
      item.divX > 0 ? drawArray({ count: item.divX, spacing: divSpacing }, { count: item.cellZ, spacing: stackSize }, cutRect(materialThickness, stackTab)) : "",
   ].join(" ");
};

const drawSide = (item: BoxParams, material: Material, grid: GridSystem) => {
   const materialThickness = convertLength(material.thickness, "mm").value;
   const gridSize = convertLength(grid.gridSize, "mm").value;
   const gridClearance = convertLength(grid.gridClearance, "mm").value;
   const gridTab = convertLength(grid.gridTab, "mm").value;
   const stackSize = convertLength(grid.stackSize, "mm").value;
   const stackTab = convertLength(grid.stackTab, "mm").value;

   const squat = item.topStyle === TOP_STYLES.GRID ? materialThickness : 0;

   const divSpacing = (gridSize * item.cellY - gridClearance * 2 - materialThickness) / (item.divY + 1);

   return [
      //OUTLINE
      drawTabbedRect(
         item.cellY * gridSize,
         item.cellZ * stackSize,
         {
            tabs: item.topStyle === TOP_STYLES.NONE || item.topStyle === TOP_STYLES.INSET ? 0 : item.cellY,
            // tabs: 0,
            margin: squat,
            size: gridTab,
            thickness: materialThickness,
         },
         {
            tabs: item.cellZ,
            margin: gridClearance,
            size: stackTab,
            thickness: -materialThickness,
         },
         {
            tabs: item.cellY,
            size: gridTab,
            thickness: -materialThickness,
         },
         {
            tabs: item.cellZ,
            margin: gridClearance,
            size: stackTab,
            thickness: -materialThickness,
         }
      ),
      // Extras
      item.topStyle === TOP_STYLES.INSET ? drawArray({ count: item.cellY, spacing: gridSize }, { count: 1, spacing: 0, offset: -((stackSize * item.cellZ) / 2 - materialThickness * 1.5) }, cutRect(gridTab, materialThickness)) : "",
      item.divY > 0 ? drawArray({ count: item.divY, spacing: divSpacing }, { count: item.cellZ, spacing: stackSize }, cutRect(materialThickness, stackTab)) : "",
   ].join(" ");
};

const drawDivX = (item: BoxParams, material: Material, grid: GridSystem) => {
   const materialThickness = convertLength(material.thickness, "mm").value;
   const gridSize = convertLength(grid.gridSize, "mm").value;
   const gridClearance = convertLength(grid.gridClearance, "mm").value;
   const gridTab = convertLength(grid.gridTab, "mm").value;
   const stackSize = convertLength(grid.stackSize, "mm").value;
   const stackTab = convertLength(grid.stackTab, "mm").value;

   const squat = item.topStyle === TOP_STYLES.GRID || item.topStyle === TOP_STYLES.INSET ? materialThickness * 2 : materialThickness;

   return [
      //OUTLINE
      drawTabbedRect(
         item.cellX * gridSize,
         item.cellZ * stackSize,
         {
            tabs: 0,
            margin: squat,
            size: gridTab,
            thickness: materialThickness,
         },
         {
            tabs: item.cellZ,
            margin: gridClearance,
            size: stackTab,
            thickness: -materialThickness,
         },
         {
            divs: item.divX,
            margin: materialThickness,
            size: materialThickness,
            inset: materialThickness / 2 + gridClearance,
            thickness: (item.cellZ * stackSize) / 2 - squat,
         },
         {
            tabs: item.cellZ,
            margin: gridClearance,
            size: stackTab,
            thickness: -materialThickness,
         }
      ),
   ].join(" ");
};

const drawDivY = (item: BoxParams, material: Material, grid: GridSystem) => {
   const materialThickness = convertLength(material.thickness, "mm").value;
   const gridSize = convertLength(grid.gridSize, "mm").value;
   const gridClearance = convertLength(grid.gridClearance, "mm").value;
   const gridTab = convertLength(grid.gridTab, "mm").value;
   const stackSize = convertLength(grid.stackSize, "mm").value;
   const stackTab = convertLength(grid.stackTab, "mm").value;

   const squat = item.topStyle === TOP_STYLES.GRID || item.topStyle === TOP_STYLES.INSET ? materialThickness * 2 : materialThickness;

   return [
      //OUTLINE
      drawTabbedRect(
         item.cellY * gridSize,
         item.cellZ * stackSize,
         {
            divs: item.divY,
            margin: squat,
            size: materialThickness,
            inset: materialThickness / 2 + gridClearance,
            thickness: (item.cellZ * stackSize) / 2 - materialThickness,
         },
         {
            tabs: item.cellZ,
            margin: gridClearance,
            size: stackTab,
            thickness: -materialThickness,
         },
         {
            tabs: 0,
            margin: materialThickness,
            size: gridTab,
            thickness: materialThickness,
         },
         {
            tabs: item.cellZ,
            margin: gridClearance,
            size: stackTab,
            thickness: -materialThickness,
         }
      ),
   ].join(" ");
};

const drawTop = (item: BoxParams, material: Material, grid: GridSystem) => {
   const materialThickness = convertLength(material.thickness, "mm").value;
   const gridSize = convertLength(grid.gridSize, "mm").value;
   const gridClearance = convertLength(grid.gridClearance, "mm").value;
   const gridTab = convertLength(grid.gridTab, "mm").value;

   return [
      //Main
      drawTabbedRect(
         item.cellX * gridSize,
         item.cellY * gridSize,
         {
            tabs: item.cellX,
            margin: gridClearance,
            size: gridTab,
            thickness: -materialThickness,
         },
         {
            tabs: item.cellY,
            margin: gridClearance,
            size: gridTab,
            thickness: -materialThickness,
         },
         {
            tabs: item.cellX,
            margin: gridClearance,
            size: gridTab,
            thickness: -materialThickness,
         },
         {
            tabs: item.cellY,
            margin: gridClearance,
            size: gridTab,
            thickness: -materialThickness,
         }
      ),
   ].join(" ");
};
