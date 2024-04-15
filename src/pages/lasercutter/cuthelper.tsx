import { convertLength } from "../../utility/mathhelper";
import { FOOT_LAYOUT, FOOT_STYLES, FootLayout, GridSystem, Material } from "./types";

type DrawArrayOptions = {
   count: number;
   spacing: number;
   offset?: number;
};

export const drawArray = (x: DrawArrayOptions, y: DrawArrayOptions, shape: string) => {
   if (x.count === 0 || y.count === 0) {
      return "";
   }

   const shapes: string[] = [];

   for (let i = 0; i < x.count; i++) {
      for (let j = 0; j < y.count; j++) {
         shapes.push(
            //
            `m ${x.spacing * i},${y.spacing * j}`,
            shape,
            `m ${-x.spacing * i},${-y.spacing * j}`
         );
      }
   }

   return [
      //
      `m ${-((x.count - 1) * x.spacing) / 2},${-((y.count - 1) * y.spacing) / 2}`,
      `m ${x.offset ?? 0},${y.offset ?? 0}`,
      ...shapes,
      `m ${-(x.offset ?? 0)},${-(y.offset ?? 0)}`,
      `m ${((x.count - 1) * x.spacing) / 2},${((y.count - 1) * y.spacing) / 2}`,
   ].join(" ");
};

export const drawRect = (w: number, h: number) => {
   return `m ${-(w / 2)},${-(h / 2)} h ${w} v ${h} h ${-w} z m ${w / 2},${h / 2}`;
};

export const cutRect = (w: number, h: number) => {
   return `m ${w / 2},${h / 2} v ${-h} h ${-w} v ${h} z m ${-(w / 2)},${-(h / 2)}`;
};

type Tabbed = {
   size: number;
   margin?: number;
   inset?: number | [number, number];
   thickness: number;
} & ({ tabs: number } | { divs: number });

const DIRECTIONS = {
   north: {
      primary: "h",
      secondary: "v",
      polarity: 1,
      concavity: 1,
      start: "west",
      end: "east",
      axis: "w",
   },
   east: {
      primary: "v",
      secondary: "h",
      polarity: 1,
      concavity: -1,
      start: "north",
      end: "south",
      axis: "h",
   },
   south: {
      primary: "h",
      secondary: "v",
      polarity: -1,
      concavity: -1,
      start: "east",
      end: "west",
      axis: "w",
   },
   west: {
      primary: "v",
      secondary: "h",
      polarity: -1,
      concavity: 1,
      start: "south",
      end: "north",
      axis: "h",
   },
} as const;

export const drawTabbedRect = (w: number, h: number, north: Tabbed | null, east: Tabbed | null, south: Tabbed | null, west: Tabbed | null) => {
   const sizeOptions = {
      w,
      h,
   } as const;

   const tabOptions = {
      north,
      east,
      south,
      west,
   } as const;

   const lines = (["north", "east", "south", "west"] as const).reduce<string[]>((res, direction) => {
      const data = tabOptions[direction];
      const sData = tabOptions[DIRECTIONS[direction].start];
      const eData = tabOptions[DIRECTIONS[direction].end];
      const axis = sizeOptions[DIRECTIONS[direction].axis];
      const dirP = DIRECTIONS[direction].primary;
      const dirS = DIRECTIONS[direction].secondary;
      const polarity = DIRECTIONS[direction].polarity;
      const concavity = DIRECTIONS[direction].concavity;

      const mS = (sData?.margin ?? 0) + (!sData ? 0 : (("tabs" in sData && sData.tabs !== 0) || ("divs" in sData && sData.divs !== 0)) && sData.thickness < 0 ? -sData.thickness : 0);
      const mE = (eData?.margin ?? 0) + (!eData ? 0 : (("tabs" in eData && eData.tabs !== 0) || ("divs" in eData && eData.divs !== 0)) && eData.thickness < 0 ? -eData.thickness : 0);

      if (data && data.thickness !== 0 && (("tabs" in data && data.tabs !== 0) || ("divs" in data && data.divs !== 0))) {
         const [iS, iE] = data.inset ? (Array.isArray(data.inset) ? data.inset : [data.inset, data.inset]) : [0, 0];
         const thickness = data.thickness;
         const tabWidth = data.size;
         if ("tabs" in data) {
            const span = (axis - iS - iE) / data.tabs;
            const tabCount = data.tabs;

            for (let i = 1; i <= tabCount; i++) {
               res.push(
                  i === 1 ? `${dirP} ${(span / 2 - tabWidth / 2 - mS + iS) * polarity}` : `${dirP} ${(span / 2 - tabWidth / 2) * polarity}`,
                  `${dirS} ${thickness * concavity}`,
                  `${dirP} ${tabWidth * polarity}`,
                  `${dirS} ${thickness * -concavity}`,
                  i === tabCount ? `${dirP} ${(span / 2 - tabWidth / 2 - mE + iE) * polarity}` : `${dirP} ${(span / 2 - tabWidth / 2) * polarity}`
               );
            }
         }
         if ("divs" in data) {
            const span = (axis - iS - iE) / (data.divs + 1);
            const divCount = data.divs;

            for (let i = 1; i <= divCount; i++) {
               res.push(
                  i === 1 ? `${dirP} ${(span - tabWidth / 2 - mS + iS) * polarity}` : `${dirP} ${(span / 2 - tabWidth / 2) * polarity}`,
                  `${dirS} ${thickness * concavity}`,
                  `${dirP} ${tabWidth * polarity}`,
                  `${dirS} ${thickness * -concavity}`,
                  i === divCount ? `${dirP} ${(span - tabWidth / 2 - mE + iE) * polarity}` : `${dirP} ${(span / 2 - tabWidth / 2) * polarity}`
               );
            }
         }
      } else {
         res.push(`${dirP} ${(axis - mS - mE) * DIRECTIONS[direction].polarity}`);
      }
      return res;
   }, []);

   const mW = !west ? 0 : (("tabs" in west && west.tabs !== 0) || ("divs" in west && west.divs !== 0)) && west.thickness < 0 ? -west.thickness : 0;
   const mN = !north ? 0 : (("tabs" in north && north.tabs !== 0) || ("divs" in north && north.divs !== 0)) && north.thickness < 0 ? -north.thickness : 0;

   return [
      //
      `m ${-(w / 2)},${-(h / 2)}`,
      `m ${west?.margin ?? 0},${north?.margin ?? 0}`,
      `m ${mW},${mN}`,
      ...lines,
      "z",
      `m ${-mW},${-mN}`,
      `m ${-(west?.margin ?? 0)},${-(north?.margin ?? 0)}`,
      `m ${w / 2},${h / 2}`,
   ].join(" ");
};

export const drawFootBlock = (material: Material, grid: GridSystem) => {
   const materialThickness = convertLength(material.thickness, "mm").value;
   const gridSize = convertLength(grid.gridSize, "mm").value;
   const stackClearance = convertLength(grid.stackClearance, "mm").value;
   const gridClearance = convertLength(grid.gridClearance, "mm").value;

   const dim = gridSize - (materialThickness * 2 + stackClearance * 2 + gridClearance * 2);

   return drawRect(dim, dim);
};

export const drawFootBracket = (material: Material, grid: GridSystem) => {
   const materialThickness = convertLength(material.thickness, "mm").value;
   const materialGap = convertLength(material.gap, "mm").value;
   const footSize = convertLength(grid.footSize, "mm").value;

   const offset = materialGap / 2;

   const SW = [
      `h ${footSize}`,
      `v ${footSize}`,
      `h ${-footSize}`,
      `h ${-(footSize - materialThickness)}`,
      `l ${-materialThickness},${-materialThickness}`,
      `v ${-(footSize - materialThickness)}`,
      `v ${-footSize}`,
      `h ${footSize}`,
      `z`,
   ].join(" ");

   const NE = [`h ${-footSize}`, `v ${-footSize}`, `h ${footSize}`, `h ${footSize - materialThickness}`, `l ${materialThickness},${materialThickness}`, `v ${footSize - materialThickness}`, `v ${footSize}`, `h ${-footSize}`, `z`].join(" ");

   const NW = [`v ${footSize}`, `h ${-footSize}`, `v ${-footSize}`, `v ${-(footSize - materialThickness)}`, `l ${materialThickness},${-materialThickness}`, `h ${footSize - materialThickness}`, `h ${footSize}`, `v ${footSize}`, `z`].join(
      " "
   );

   const SE = [`v ${-footSize}`, `h ${footSize}`, `v ${footSize}`, `v ${footSize - materialThickness}`, `l ${-materialThickness},${materialThickness}`, `h ${-(footSize - materialThickness)}`, `h ${-footSize}`, `v ${-footSize}`, `z`].join(
      " "
   );

   const pAxis = footSize + offset * 3;
   const sAxis = footSize * 1.5 + offset;

   const pOffset = footSize / 2 + offset;
   const sOffset = offset;

   //prettier-ignore
   return [
      // bottomleft

      `m ${-sAxis},${-pAxis}`,
         `m ${-sOffset},${-pOffset}`,
            NW,
         `m ${sOffset},${pOffset}`,

         `m ${sOffset},${pOffset}`,
            SE,
         `m ${-sOffset},${-pOffset}`,
      `m ${sAxis},${pAxis}`,

      `m ${pAxis},${-sAxis}`,
         `m ${pOffset},${-sOffset}`,
            NE,
         `m ${-pOffset},${sOffset}`,
         `m ${-pOffset},${sOffset}`,
            SW,
         `m ${pOffset},${-sOffset}`,
      `m ${-pAxis},${sAxis}`,

      `m ${sAxis},${pAxis}`,
         `m ${-sOffset},${-pOffset}`,
            NW,
         `m ${sOffset},${pOffset}`,

         `m ${sOffset},${pOffset}`,
            SE,
         `m ${-sOffset},${-pOffset}`,
      `m ${-sAxis},${-pAxis}`,

      `m ${-pAxis},${sAxis}`,
         `m ${pOffset},${-sOffset}`,
            NE,
         `m ${-pOffset},${sOffset}`,
         `m ${-pOffset},${sOffset}`,
            SW,
         `m ${pOffset},${-sOffset}`,
      `m ${pAxis},${-sAxis}`,

      // `m ${-(footSize + offset * 1.5)},${footSize / 2 + offset / 2}`,
      // SW,
      // `m ${footSize + offset * 1.5},${-(footSize / 2 + offset / 2)}`,

      // // topLeft
      // `m ${-(footSize + offset * 0.5)},${-(footSize / 2 + offset / 2)}`,
      // NE,
      // `m ${footSize + offset * 0.5},${footSize / 2 + offset / 2}`,

      // // top right
      // `m ${footSize + offset * 0.5},${-(footSize / 2 + offset / 2)}`,
      // NW,
      // `m ${-(footSize + offset * 0.5)},${footSize / 2 + offset / 2}`,

      // `m ${footSize + offset * 1.5},${footSize / 2 + offset / 2}`,
      // SE,
      // `m ${-(footSize + offset * 1.5)},${-(footSize / 2 + offset / 2)}`,

      // top-right
      // `h ${-footSize}`,
      // `v ${-footSize}`,
      // `h ${footSize}`,
      // `h ${footSize - materialThickness}`,
      // `l ${materialThickness},${materialThickness}`,
      // `v ${footSize - materialThickness}`,
      // `v ${footSize}`,
      // `h ${-footSize}`,
      // `z`,
   ].join(" ");
};

export const drawFootRunner = (material: Material, grid: GridSystem) => {
   const materialThickness = convertLength(material.thickness, "mm").value;
   const footSize = convertLength(grid.footSize, "mm").value;
   const gridTab = convertLength(grid.gridTab, "mm").value;

   const oS = gridTab / 2 + footSize / 2 + materialThickness;
   const oW = oS * 2 + footSize;

   return [
      `m ${-(oW / 2)},${-materialThickness}`,
      `h ${footSize}`,
      `v ${materialThickness}`,
      `h ${oS * 2 - footSize}`,
      `v ${-materialThickness}`,
      `h ${footSize}`,
      `v ${materialThickness}`,
      `l ${-materialThickness},${materialThickness}`,
      `h ${-(oS * 2 + footSize - materialThickness * 2)}`,
      `l ${-materialThickness},${-materialThickness}`,
      `z`,
      `m ${oW / 2},${materialThickness}`,
   ].join(" ");
};

export const drawBottom = (cellX: number, cellY: number, footLayout: FootLayout, material: Material, grid: GridSystem) => {
   const materialThickness = convertLength(material.thickness, "mm").value;
   const gridSize = convertLength(grid.gridSize, "mm").value;
   const gridClearance = convertLength(grid.gridClearance, "mm").value;
   const gridTab = convertLength(grid.gridTab, "mm").value;
   const stackClearance = convertLength(grid.stackClearance, "mm").value;
   const footSize = convertLength(grid.footSize, "mm").value;

   const feet: string[] = [];
   if (footLayout !== FOOT_LAYOUT.NONE) {
      // if (footLayout !== FOOT_LAYOUT.NONE && grid.footStyle === FOOT_STYLES.RUNNER) {
      feet.push(`m ${gridSize / 2},${gridSize / 2}`);

      const oP = gridSize / 2 - materialThickness * 1.5 - stackClearance - gridClearance;
      const oS = gridTab / 2 + footSize / 2 + materialThickness;

      const footN = `m ${-oS},${-oP} ${cutRect(footSize, materialThickness)} m ${oS},${oP} m ${oS},${-oP} ${cutRect(footSize, materialThickness)} m ${-oS},${oP}`;
      const footS = `m ${-oS},${oP} ${cutRect(footSize, materialThickness)} m ${oS},${-oP} m ${oS},${oP} ${cutRect(footSize, materialThickness)} m ${-oS},${-oP}`;

      const footW = `m ${-oP},${-oS} ${cutRect(materialThickness, footSize)} m ${oP},${oS} m ${-oP},${oS} ${cutRect(materialThickness, footSize)} m ${oP},${-oS}`;
      const footE = `m ${oP},${-oS} ${cutRect(materialThickness, footSize)} m ${-oP},${oS} m ${oP},${oS} ${cutRect(materialThickness, footSize)} m ${-oP},${-oS}`;

      if (footLayout === FOOT_LAYOUT.DENSE) {
         for (let x = 0; x < cellX; x++) {
            for (let y = 0; y < cellY; y++) {
               feet.push(`m ${gridSize * x},${gridSize * y}`, footN, footS, footW, footE, `m ${-(gridSize * x)},${-(gridSize * y)}`);
            }
         }
      } else if (footLayout === FOOT_LAYOUT.SPARSE) {
         for (let x = 0; x < cellX; x++) {
            feet.push(`m ${gridSize * x},0`, footN, `m ${-(gridSize * x)},0`);
            feet.push(`m ${gridSize * x},${gridSize * (cellY - 1)}`, footS, `m ${-(gridSize * x)},${-(gridSize * (cellY - 1))}`);
         }
         for (let y = 0; y < cellY; y++) {
            feet.push(`m 0,${gridSize * y}`, footW, `m 0,${-(gridSize * y)}`);
            feet.push(`m ${gridSize * (cellX - 1)},${gridSize * y}`, footE, `m ${-(gridSize * (cellX - 1))},${-(gridSize * y)}`);
         }
      } else if (footLayout === FOOT_LAYOUT.MINIMAL) {
         feet.push(`m 0,0 ${footW} ${footN} m 0,0`);
         feet.push(`m ${(cellX - 1) * gridSize},0 ${footE} ${cellX > 1 ? footN : ""} m ${-((cellX - 1) * gridSize)},0`);
         feet.push(`m 0,${(cellY - 1) * gridSize} ${cellY > 1 ? footW : ""} ${footS} m 0,${-((cellY - 1) * gridSize)}`);
         feet.push(`m ${(cellX - 1) * gridSize},${(cellY - 1) * gridSize} ${cellY > 1 ? footE : ""} ${cellX > 1 ? footS : ""} m ${-((cellX - 1) * gridSize)},${-((cellY - 1) * gridSize)}`);
      }

      feet.push(`m ${-(gridSize / 2)},${-(gridSize / 2)}`);
   }

   return [
      //Main
      drawTabbedRect(
         cellX * gridSize,
         cellY * gridSize,
         {
            tabs: cellX,
            margin: gridClearance,
            size: gridTab,
            thickness: materialThickness,
         },
         {
            tabs: cellY,
            margin: gridClearance,
            size: gridTab,
            thickness: materialThickness,
         },
         {
            tabs: cellX,
            margin: gridClearance,
            size: gridTab,
            thickness: materialThickness,
         },
         {
            tabs: cellY,
            margin: gridClearance,
            size: gridTab,
            thickness: materialThickness,
         }
      ),
      `m ${-((gridSize * cellX) / 2)},${-((gridSize * cellY) / 2)}`,
      ...feet,
      `m ${(gridSize * cellX) / 2},${(gridSize * cellY) / 2}`,
   ].join(" ");
};
