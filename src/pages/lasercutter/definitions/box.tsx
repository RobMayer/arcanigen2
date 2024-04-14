import { useCallback, useMemo, useState } from "react";
import NumberInput from "../../../components/inputs/NumberInput";
import { PhysicalLength } from "../../../utility/types/units";
import { TOP_STYLES, TOP_STYLE_OPTIONS, TopStyle, FOOT_STYLES, FOOT_STYLE_OPTIONS, FootStyle } from "../types";
import styled from "styled-components";
import ToggleList from "../../../components/selectors/ToggleList";
import { convertLength } from "../../../utility/mathhelper";
import PhysicalLengthInput from "../../../components/inputs/PhysicalLengthInput";
import { cutRect, drawRect } from "../cuthelper";
import { packer } from "../packhelper";
import Checkbox from "../../../components/buttons/Checkbox";

type Schema = {
   gridSize: PhysicalLength;
   gridClearance: PhysicalLength;
   stackSize: PhysicalLength;
   stackClearance: PhysicalLength;

   gridTab: PhysicalLength;
   stackTab: PhysicalLength;

   footSize: PhysicalLength;

   matX: PhysicalLength;
   matY: PhysicalLength;
   matZ: PhysicalLength;
   matMargin: PhysicalLength;
   matGap: PhysicalLength;

   cellX: number;
   cellY: number;
   cellZ: number;
   footStyle: FootStyle;

   divX: number;
   divY: number;

   topStyle: TopStyle;
   feetPack: boolean;
};

type SchemaSetter = (key: keyof Schema, value: Schema[typeof key]) => void;

const Controls = styled(({ value, setValue, className }: { value: Schema; setValue: SchemaSetter; className?: string }) => {
   return (
      <div className={className}>
         <Section>Material</Section>
         <Label>Width</Label>
         <PhysicalLengthInput
            value={value.matX}
            onValidCommit={(v) => {
               setValue("matX", v);
            }}
         />
         <Label>Height</Label>
         <PhysicalLengthInput
            value={value.matY}
            onValidCommit={(v) => {
               setValue("matY", v);
            }}
         />
         <Label>Thickness</Label>
         <PhysicalLengthInput
            value={value.matZ}
            onValidCommit={(v: PhysicalLength) => {
               setValue("matZ", v);
            }}
         />
         <Label>Margin</Label>
         <PhysicalLengthInput
            value={value.matMargin}
            onValidCommit={(v) => {
               setValue("matMargin", v);
            }}
         />
         <Label>Gap</Label>
         <PhysicalLengthInput
            value={value.matGap}
            onValidCommit={(v) => {
               setValue("matGap", v);
            }}
         />
         <Section>Grid System</Section>
         <Label>Grid Size</Label>
         <PhysicalLengthInput
            value={value.gridSize}
            onValidCommit={(v) => {
               setValue("gridSize", v);
            }}
         />
         <Label>Grid Clearance</Label>
         <PhysicalLengthInput
            value={value.gridClearance}
            onValidCommit={(v) => {
               setValue("gridClearance", v);
            }}
         />
         <Label>Grid Tabs</Label>
         <PhysicalLengthInput
            value={value.gridTab}
            onValidCommit={(v) => {
               setValue("gridTab", v);
            }}
         />
         <Label>Stack Size</Label>
         <PhysicalLengthInput
            value={value.stackSize}
            onValidCommit={(v) => {
               setValue("stackSize", v);
            }}
         />
         <Label>Stack Clearance</Label>
         <PhysicalLengthInput
            value={value.stackClearance}
            onValidCommit={(v) => {
               setValue("stackClearance", v);
            }}
         />
         <Label>Stack Tabs</Label>
         <PhysicalLengthInput
            value={value.stackTab}
            onValidCommit={(v) => {
               setValue("stackTab", v);
            }}
         />
         <Label>Foot Size</Label>
         <PhysicalLengthInput
            value={value.footSize}
            onValidCommit={(v) => {
               setValue("footSize", v);
            }}
         />
         <Section>Basics</Section>
         <Label>X-Count</Label>
         <NumberInput
            value={value.cellX}
            onValidCommit={(v: number) => {
               setValue("cellX", v);
            }}
            step={1}
            min={1}
         />
         <Label>Y-Count</Label>
         <NumberInput
            value={value.cellY}
            onValidCommit={(v: number) => {
               setValue("cellY", v);
            }}
            step={1}
            min={1}
         />
         <Label>Z-Count</Label>
         <NumberInput
            value={value.cellZ}
            onValidCommit={(v: number) => {
               setValue("cellZ", v);
            }}
            step={1}
            min={1}
         />
         <Label>Feet Style</Label>
         <Full>
            <ToggleList
               value={value.footStyle}
               onValue={(r) => {
                  setValue("footStyle", r);
               }}
               options={FOOT_STYLE_OPTIONS}
            />
         </Full>
         <Section>Divisions</Section>
         <Label>Divisions X</Label>
         <NumberInput value={value.divX} onValue={(v) => setValue("divX", v)} min={1} step={1} max={value.cellX * 4} />
         <Label>Divisions Y</Label>
         <NumberInput value={value.divY} onValue={(v) => setValue("divY", v)} min={1} step={1} max={value.cellY * 4} />
         <Section>Top</Section>
         <Label>Top Style</Label>
         <Full>
            <ToggleList
               value={value.topStyle}
               onValue={(r) => {
                  setValue("topStyle", r);
               }}
               options={TOP_STYLE_OPTIONS}
            />
            <Checkbox checked={value.feetPack} onToggle={(r) => setValue("feetPack", r)} disabled={value.topStyle !== TOP_STYLES.GRID}>
               Pack Grid with Feet
            </Checkbox>
         </Full>
      </div>
   );
})`
   display: grid;
   gap: 8px;
   grid-template-columns: max-content 1fr max-content 1fr max-content 1fr;
   align-content: start;
`;

const Section = styled.div`
   grid-column: 1 / -1;
   font-size: 1.25em;
   border-bottom: 1px solid #444;
   margin: 0.25em;
   text-align: right;
`;

const Label = styled.div`
   text-align: right;
`;

const Full = styled.div`
   grid-column: 2 / -1;
   justify-self: stretch;
   display: grid;
   grid-auto-flow: column;
   grid-template-columns: auto;
   grid-auto-columns: max-content;
   gap: 8px;
`;

const DPMM = 283.5 / 100;

const GRID_CLEARANCE = 0.25;
const GRID_SIZE = 48;
const STACK_SIZE = 24;
const STACK_CLEARANCE = 0.5;

const STACK_TAB = 8;
const GRID_TAB = 14;
const FOOT_SIZE = 6;

const drawBottom = (value: Schema) => {
   const t = convertLength(value.matZ, "mm").value;

   const nLines: string[] = [];
   const sLines: string[] = [];
   const wLines: string[] = [];
   const eLines: string[] = [];
   const feet: string[] = [];

   for (let x = 1; x <= value.cellX; x++) {
      const oS = x === 1 ? GRID_CLEARANCE : 0;
      const oE = x === value.cellX ? GRID_CLEARANCE : 0;

      nLines.push(`h ${GRID_SIZE / 2 - GRID_TAB / 2 - oS} v ${t} h ${GRID_TAB} v ${-t} h ${GRID_SIZE / 2 - GRID_TAB / 2 - oE}`);
      sLines.push(`h ${-(GRID_SIZE / 2 - GRID_TAB / 2 - oS)} v ${-t} h ${-GRID_TAB} v ${t} h ${-(GRID_SIZE / 2 - GRID_TAB / 2 - oE)}`);
   }

   for (let y = 1; y <= value.cellY; y++) {
      const oS = y === 1 ? GRID_CLEARANCE : 0;
      const oE = y === value.cellY ? GRID_CLEARANCE : 0;

      eLines.push(`v ${GRID_SIZE / 2 - GRID_TAB / 2 - oS} h ${-t} v ${GRID_TAB} h ${t} v ${GRID_SIZE / 2 - GRID_TAB / 2 - oE}`);
      wLines.push(`v ${-(GRID_SIZE / 2 - GRID_TAB / 2 - oS)} h ${t} v ${-GRID_TAB} h ${-t} v ${-(GRID_SIZE / 2 - GRID_TAB / 2 - oE)}`);
   }

   if (value.footStyle !== FOOT_STYLES.NONE) {
      feet.push(`m ${GRID_SIZE / 2},${GRID_SIZE / 2}`);

      const offsetP = GRID_SIZE / 2 - t * 1.5 - STACK_CLEARANCE;
      const offsetS = GRID_SIZE / 2 - t * 1.5 - GRID_TAB / 2;

      const fN = `m ${-offsetS},${-offsetP} ${cutRect(FOOT_SIZE, t)} m ${offsetS},${offsetP} m ${offsetS},${-offsetP} ${cutRect(FOOT_SIZE, t)} m ${-offsetS},${offsetP}`;
      const fS = `m ${-offsetS},${offsetP} ${cutRect(FOOT_SIZE, t)} m ${offsetS},${-offsetP} m ${offsetS},${offsetP} ${cutRect(FOOT_SIZE, t)} m ${-offsetS},${-offsetP}`;

      const fW = `m ${-offsetP},${-offsetS} ${cutRect(t, FOOT_SIZE)} m ${offsetP},${offsetS} m ${-offsetP},${offsetS} ${cutRect(t, FOOT_SIZE)} m ${offsetP},${-offsetS}`;
      const fE = `m ${offsetP},${-offsetS} ${cutRect(t, FOOT_SIZE)} m ${-offsetP},${offsetS} m ${offsetP},${offsetS} ${cutRect(t, FOOT_SIZE)} m ${-offsetP},${-offsetS}`;

      if (value.footStyle === FOOT_STYLES.DENSE) {
         for (let x = 0; x < value.cellX; x++) {
            for (let y = 0; y < value.cellY; y++) {
               feet.push(`m ${GRID_SIZE * x},${GRID_SIZE * y}`, fN, fS, fW, fE, `m ${-(GRID_SIZE * x)},${-(GRID_SIZE * y)}`);
            }
         }
      } else if (value.footStyle === FOOT_STYLES.SPARSE) {
         for (let x = 0; x < value.cellX; x++) {
            feet.push(`m ${GRID_SIZE * x},0`, fN, `m ${-(GRID_SIZE * x)},0`);
            feet.push(`m ${GRID_SIZE * x},${GRID_SIZE * (value.cellY - 1)}`, fS, `m ${-(GRID_SIZE * x)},${-(GRID_SIZE * (value.cellY - 1))}`);
         }
         for (let y = 0; y < value.cellY; y++) {
            feet.push(`m 0,${GRID_SIZE * y}`, fW, `m 0,${-(GRID_SIZE * y)}`);
            feet.push(`m ${GRID_SIZE * (value.cellX - 1)},${GRID_SIZE * y}`, fE, `m ${-(GRID_SIZE * (value.cellX - 1))},${-(GRID_SIZE * y)}`);
            //feet.push(`m ${GRID_SIZE * x},${GRID_SIZE * y}`, fN, fS, fW, fE, `m ${-(GRID_SIZE * x)},${-(GRID_SIZE * y)}`);
         }
      } else if (value.footStyle === FOOT_STYLES.MINIMAL) {
         feet.push(`m 0,0 ${fW} ${fN} m 0,0`);
         feet.push(`m ${(value.cellX - 1) * GRID_SIZE},0 ${fE} ${value.cellX > 1 ? fN : ""} m ${-((value.cellX - 1) * GRID_SIZE)},0`);
         feet.push(`m 0,${(value.cellY - 1) * GRID_SIZE} ${value.cellY > 1 ? fW : ""} ${fS} m 0,${-((value.cellY - 1) * GRID_SIZE)}`);
         feet.push(`m ${(value.cellX - 1) * GRID_SIZE},${(value.cellY - 1) * GRID_SIZE} ${value.cellY > 1 ? fE : ""} ${value.cellX > 1 ? fS : ""} m ${-((value.cellX - 1) * GRID_SIZE)},${-((value.cellY - 1) * GRID_SIZE)}`);
      }

      feet.push(`m ${-(GRID_SIZE / 2)},${-(GRID_SIZE / 2)}`);
   }

   return [
      // OUTLINE
      `m ${GRID_CLEARANCE},${GRID_CLEARANCE}`,
      ...nLines,
      ...eLines,
      ...sLines,
      ...wLines,
      `z`,
      `m ${-GRID_CLEARANCE},${-GRID_CLEARANCE}`,
      // FEET
      ...feet,
   ].join(" ");
};

const drawEnd = (value: Schema) => {
   const t = convertLength(value.matZ, "mm").value;

   const nLines: string[] = [];
   const sLines: string[] = [];
   const wLines: string[] = [];
   const eLines: string[] = [];
   const inset: string[] = [];
   const divs: string[] = [];

   for (let x = 1; x <= value.cellX; x++) {
      const oS = GRID_CLEARANCE;
      const oE = GRID_CLEARANCE;

      nLines.push(
         `h ${GRID_SIZE / 2 - GRID_TAB / 2 - (x === 1 ? oS : 0)}`,
         value.topStyle === TOP_STYLES.FLUSH || value.topStyle === TOP_STYLES.GRID ? `v ${t}` : "",
         `h ${GRID_TAB}`,
         value.topStyle === TOP_STYLES.FLUSH || value.topStyle === TOP_STYLES.GRID ? `v ${-t}` : "",
         `h ${GRID_SIZE / 2 - GRID_TAB / 2 - (x === value.cellX ? oE : 0)}`
      );

      sLines.push(`h ${-(GRID_SIZE / 2 - GRID_TAB / 2 - (x === 1 ? oE : 0))} v ${t} h ${-GRID_TAB} v ${-t} h ${-(GRID_SIZE / 2 - GRID_TAB / 2 - (x === value.cellX ? oS : 0))}`);
   }

   for (let z = 1; z <= value.cellZ; z++) {
      const oS = value.topStyle === TOP_STYLES.GRID ? t : 0;
      const oE = t;
      eLines.push(`v ${STACK_SIZE / 2 - STACK_TAB / 2 - (z === 1 ? oS : 0)} h ${-t} v ${STACK_TAB} h ${t} v ${STACK_SIZE / 2 - STACK_TAB / 2 - (z === value.cellZ ? oE : 0)}`);
      wLines.push(`v ${-(STACK_SIZE / 2 - STACK_TAB / 2 - (z === 1 ? oE : 0))} h ${t} v ${-STACK_TAB} h ${-t} v ${-(STACK_SIZE / 2 - STACK_TAB / 2 - (z === value.cellZ ? oS : 0))}`);
   }

   if (value.topStyle === TOP_STYLES.INSET) {
      inset.push(`m ${-(GRID_SIZE / 2)},${t * 1.5}`);
      for (let x = 1; x <= value.cellX; x++) {
         inset.push(`m ${GRID_SIZE * x},0`, cutRect(GRID_TAB, t), `m ${-(GRID_SIZE * x)},0`);
      }
      inset.push(`m ${GRID_SIZE / 2},${-(t * 1.5)}`);
   }

   if (value.divX > 1) {
      divs.push(`m 0,${-(STACK_SIZE / 2)}`);
      if (value.topStyle === TOP_STYLES.GRID) {
         divs.push(`m 0,${-t}`);
      }
      const span = (GRID_SIZE * value.cellX) / value.divX;

      for (let x = 1; x < value.divX; x++) {
         for (let z = 1; z <= value.cellZ; z++) {
            divs.push(`m ${span * x},${z * STACK_SIZE}`, cutRect(t, STACK_TAB), `m ${-(span * x)},${-(z * STACK_SIZE)}`);
         }
      }
      if (value.topStyle === TOP_STYLES.GRID) {
         divs.push(`m 0,${t}`);
      }
      divs.push(`m 0,${STACK_SIZE / 2}`);
   }

   return [
      //OUTLINE
      `m ${GRID_CLEARANCE},0`,
      ...nLines,
      ...eLines,
      ...sLines,
      ...wLines,
      `z`,
      `m ${-GRID_CLEARANCE},0`,
      ...inset,
      ...divs,
   ].join(" ");
};

const drawSide = (value: Schema) => {
   const t = convertLength(value.matZ, "mm").value;

   const nLines: string[] = [];
   const sLines: string[] = [];
   const wLines: string[] = [];
   const eLines: string[] = [];
   const inset: string[] = [];
   const divs: string[] = [];

   for (let y = 1; y <= value.cellY; y++) {
      const oS = GRID_CLEARANCE + t;
      const oE = GRID_CLEARANCE + t;

      nLines.push(
         `h ${GRID_SIZE / 2 - GRID_TAB / 2 - (y === 1 ? oS : 0)}`,
         value.topStyle === TOP_STYLES.FLUSH || value.topStyle === TOP_STYLES.GRID ? `v ${t}` : "",
         `h ${GRID_TAB}`,
         value.topStyle === TOP_STYLES.FLUSH || value.topStyle === TOP_STYLES.GRID ? `v ${-t}` : "",
         `h ${GRID_SIZE / 2 - GRID_TAB / 2 - (y === value.cellY ? oE : 0)}`
      );

      sLines.push(`h ${-(GRID_SIZE / 2 - GRID_TAB / 2 - (y === 1 ? oE : 0))} v ${t} h ${-GRID_TAB} v ${-t} h ${-(GRID_SIZE / 2 - GRID_TAB / 2 - (y === value.cellY ? oS : 0))}`);
   }

   for (let z = 1; z <= value.cellZ; z++) {
      const oS = value.topStyle === TOP_STYLES.GRID ? t : 0;
      const oE = t;
      eLines.push(`v ${STACK_SIZE / 2 - STACK_TAB / 2 - (z === 1 ? oS : 0)} h ${t} v ${STACK_TAB} h ${-t} v ${STACK_SIZE / 2 - STACK_TAB / 2 - (z === value.cellZ ? oE : 0)}`);
      wLines.push(`v ${-(STACK_SIZE / 2 - STACK_TAB / 2 - (z === 1 ? oE : 0))} h ${-t} v ${-STACK_TAB} h ${t} v ${-(STACK_SIZE / 2 - STACK_TAB / 2 - (z === value.cellZ ? oS : 0))}`);
   }

   if (value.topStyle === TOP_STYLES.INSET) {
      inset.push(`m ${-(GRID_SIZE / 2)},${t * 1.5}`);
      for (let x = 1; x <= value.cellY; x++) {
         inset.push(`m ${GRID_SIZE * x},0`, cutRect(GRID_TAB, t), `m ${-(GRID_SIZE * x)},0`);
      }
      inset.push(`m ${GRID_SIZE / 2},${-(t * 1.5)}`);
   }

   if (value.divY > 1) {
      divs.push(`m 0,${-(STACK_SIZE / 2)}`);
      if (value.topStyle === TOP_STYLES.GRID) {
         divs.push(`m 0,${-t}`);
      }
      const span = (GRID_SIZE * value.cellY) / value.divY;

      for (let y = 1; y < value.divY; y++) {
         for (let z = 1; z <= value.cellZ; z++) {
            divs.push(`m ${span * y},${z * STACK_SIZE}`, cutRect(t, STACK_TAB), `m ${-(span * y)},${-(z * STACK_SIZE)}`);
         }
      }
      if (value.topStyle === TOP_STYLES.GRID) {
         divs.push(`m 0,${t}`);
      }
      divs.push(`m 0,${STACK_SIZE / 2}`);
   }

   return [
      //OUTLINE
      `m ${GRID_CLEARANCE + t},0`,
      ...nLines,
      ...eLines,
      ...sLines,
      ...wLines,
      `z`,
      `m ${-(GRID_CLEARANCE + t)},0`,
      ...inset,
      ...divs,
   ].join(" ");
};

const drawDivX = (value: Schema) => {
   const t = convertLength(value.matZ, "mm").value;

   const nLines: string[] = [];
   const sLines: string[] = [];
   const wLines: string[] = [];
   const eLines: string[] = [];

   const oS = GRID_CLEARANCE + t;
   const oE = GRID_CLEARANCE + t;

   nLines.push(`h ${GRID_SIZE * value.cellX - oS - oE}`);

   for (let z = 1; z <= value.cellZ; z++) {
      const oS = value.topStyle === TOP_STYLES.GRID || value.topStyle === TOP_STYLES.INSET ? t * 2 : t;
      const oE = t;
      eLines.push(`v ${STACK_SIZE / 2 - STACK_TAB / 2 - (z === 1 ? oS : 0)} h ${t} v ${STACK_TAB} h ${-t} v ${STACK_SIZE / 2 - STACK_TAB / 2 - (z === value.cellZ ? oE : 0)}`);
      wLines.push(`v ${-(STACK_SIZE / 2 - STACK_TAB / 2 - (z === 1 ? oE : 0))} h ${-t} v ${-STACK_TAB} h ${t} v ${-(STACK_SIZE / 2 - STACK_TAB / 2 - (z === value.cellZ ? oS : 0))}`);
   }

   if (value.divX > 1) {
      const j = (STACK_SIZE * value.cellZ) / 2 - t;
      const span = (GRID_SIZE * value.cellX) / value.divX;

      for (let x = 1; x < value.divX; x++) {
         sLines.push(
            //
            x === 1 ? `h ${-(span / 2) + oS}` : "",
            `h ${-(span - t) / 2}`,
            `v ${-j}`,
            `h ${-t}`,
            `v ${j}`,
            `h ${-(span - t) / 2}`,
            x === value.divX - 1 ? `h ${-(span / 2) + oE}` : ""
         );
      }
   } else {
      sLines.push(`h ${-(GRID_SIZE * value.cellX - oS - oE)}`);
   }

   return [
      //OUTLINE
      `m ${GRID_CLEARANCE + t},0`,
      ...nLines,
      ...eLines,
      ...sLines,
      ...wLines,
      `z`,
      `m ${-(GRID_CLEARANCE + t)},0`,
   ].join(" ");
};

const drawDivY = (value: Schema) => {
   const t = convertLength(value.matZ, "mm").value;

   const nLines: string[] = [];
   const sLines: string[] = [];
   const wLines: string[] = [];
   const eLines: string[] = [];

   const oS = GRID_CLEARANCE + t;
   const oE = GRID_CLEARANCE + t;

   sLines.push(`h ${-(GRID_SIZE * value.cellY - oS - oE)}`);

   for (let z = 1; z <= value.cellZ; z++) {
      const oS = value.topStyle === TOP_STYLES.GRID || value.topStyle === TOP_STYLES.INSET ? t * 2 : t;
      const oE = t;
      eLines.push(`v ${STACK_SIZE / 2 - STACK_TAB / 2 - (z === 1 ? oS : 0)} h ${t} v ${STACK_TAB} h ${-t} v ${STACK_SIZE / 2 - STACK_TAB / 2 - (z === value.cellZ ? oE : 0)}`);
      wLines.push(`v ${-(STACK_SIZE / 2 - STACK_TAB / 2 - (z === 1 ? oE : 0))} h ${-t} v ${-STACK_TAB} h ${t} v ${-(STACK_SIZE / 2 - STACK_TAB / 2 - (z === value.cellZ ? oS : 0))}`);
   }

   if (value.divY > 1) {
      const j = (STACK_SIZE * value.cellZ) / 2 - t;
      const span = (GRID_SIZE * value.cellY) / value.divY;

      for (let y = 1; y < value.divY; y++) {
         nLines.push(
            //
            y === 1 ? `h ${span / 2 - oS}` : "",
            `h ${(span - t) / 2}`,
            `v ${j}`,
            `h ${t}`,
            `v ${-j}`,
            `h ${(span - t) / 2}`,
            y === value.divY - 1 ? `h ${span / 2 - oE}` : ""
         );
      }
   } else {
      nLines.push(`h ${GRID_SIZE * value.cellY - oS - oE}`);
   }

   return [
      //OUTLINE
      `m ${GRID_CLEARANCE + t},0`,
      ...nLines,
      ...eLines,
      ...sLines,
      ...wLines,
      `z`,
      `m ${-(GRID_CLEARANCE + t)},0`,
   ].join(" ");
};

const drawTop = (value: Schema) => {
   const t = convertLength(value.matZ, "mm").value;

   const nLines: string[] = [];
   const sLines: string[] = [];
   const wLines: string[] = [];
   const eLines: string[] = [];

   for (let x = 1; x <= value.cellX; x++) {
      const oS = x === 1 ? GRID_CLEARANCE + t : 0;
      const oE = x === value.cellX ? GRID_CLEARANCE + t : 0;

      nLines.push(`h ${GRID_SIZE / 2 - GRID_TAB / 2 - oS} v ${-t} h ${GRID_TAB} v ${t} h ${GRID_SIZE / 2 - GRID_TAB / 2 - oE}`);
      sLines.push(`h ${-(GRID_SIZE / 2 - GRID_TAB / 2 - oS)} v ${t} h ${-GRID_TAB} v ${-t} h ${-(GRID_SIZE / 2 - GRID_TAB / 2 - oE)}`);
   }

   for (let y = 1; y <= value.cellY; y++) {
      const oS = y === 1 ? GRID_CLEARANCE + t : 0;
      const oE = y === value.cellY ? GRID_CLEARANCE + t : 0;

      eLines.push(`v ${GRID_SIZE / 2 - GRID_TAB / 2 - oS} h ${t} v ${GRID_TAB} h ${-t} v ${GRID_SIZE / 2 - GRID_TAB / 2 - oE}`);
      wLines.push(`v ${-(GRID_SIZE / 2 - GRID_TAB / 2 - oS)} h ${-t} v ${-GRID_TAB} h ${t} v ${-(GRID_SIZE / 2 - GRID_TAB / 2 - oE)}`);
   }

   return [
      // OUTLINE
      `m ${GRID_CLEARANCE + t},${GRID_CLEARANCE + t}`,
      ...nLines,
      ...eLines,
      ...sLines,
      ...wLines,
      `z`,
      `m ${-GRID_CLEARANCE - t},${-GRID_CLEARANCE - t}`,
   ].join(" ");
};

const drawGrid = (value: Schema) => {
   const t = convertLength(value.matZ, "mm").value;

   const bigBox = [drawRect(GRID_SIZE * value.cellX - GRID_CLEARANCE * 2, GRID_SIZE * value.cellY - GRID_CLEARANCE * 2)];

   const littleBoxes: string[] = [];
   const packFeet: string[] = [];

   for (let x = 0; x < value.cellX; x++) {
      for (let y = 0; y < value.cellY; y++) {
         littleBoxes.push(
            //
            `m ${GRID_SIZE * x},${GRID_SIZE * y}`,
            drawRect(GRID_SIZE - t * 2, GRID_SIZE - t * 2),
            `m ${-GRID_SIZE * x},${-GRID_SIZE * y}`
         );
      }
   }

   if (value.feetPack) {
   }

   return [
      // OUTLINE
      `m ${GRID_CLEARANCE},${GRID_CLEARANCE}`,
      `m ${(GRID_SIZE * value.cellX) / 2}, ${(GRID_SIZE * value.cellY) / 2}`,
      ...bigBox,
      `z`,
      `m ${-(GRID_SIZE * value.cellX) / 2}, ${-(GRID_SIZE * value.cellY) / 2}`,
      `m ${GRID_SIZE / 2},${GRID_SIZE / 2}`,
      ...littleBoxes,
      `m ${-GRID_SIZE / 2},${-GRID_SIZE / 2}`,
      `m ${GRID_SIZE / 2},${GRID_SIZE / 2}`,
      ...packFeet,
      `m ${-GRID_SIZE / 2},${-GRID_SIZE / 2}`,
      `m ${-GRID_CLEARANCE},${-GRID_CLEARANCE}`,
   ].join(" ");
};

const Output = ({ value }: { value: Schema }) => {
   const cX = useMemo(() => convertLength(value.matX, "mm").value, [value.matX]);
   const cY = useMemo(() => convertLength(value.matY, "mm").value, [value.matY]);
   const cM = useMemo(() => convertLength(value.matMargin, "mm").value, [value.matMargin]);

   const [canvases] = useMemo(() => {
      const cG = convertLength(value.matGap, "mm").value;
      const t = convertLength(value.matZ, "mm").value;

      const tX = value.cellX * GRID_SIZE;
      const tY = value.cellY * GRID_SIZE;
      const tZ = value.cellZ * STACK_SIZE;

      const inputs = [
         { width: tX, height: tY, name: "Bottom", path: drawBottom(value) },
         { width: tX, height: value.topStyle === TOP_STYLES.GRID ? tZ - t : tZ, name: "front", path: drawEnd(value) },
         { width: tX, height: value.topStyle === TOP_STYLES.GRID ? tZ - t : tZ, name: "back", path: drawEnd(value) },
         { width: tY, height: value.topStyle === TOP_STYLES.GRID ? tZ - t : tZ, name: "left", path: drawSide(value) },
         { width: tY, height: value.topStyle === TOP_STYLES.GRID ? tZ - t : tZ, name: "right", path: drawSide(value) },
      ];

      const oD = value.topStyle === TOP_STYLES.GRID || value.topStyle === TOP_STYLES.INSET ? t * 3 : t * 2;

      if (value.topStyle !== TOP_STYLES.NONE) {
         inputs.push({ width: tX, height: tY, name: "TOP", path: drawTop(value) });
         if (value.topStyle === TOP_STYLES.GRID) {
            inputs.push({ width: tX, height: tY, name: "GRID", path: drawGrid(value) });
         }
      }

      if (value.divY > 1) {
         for (let dX = 1; dX < value.divY; dX++) {
            inputs.push({ width: tX, height: tZ - oD, name: `divX_${dX}`, path: drawDivX(value) });
         }
      }

      if (value.divX > 1) {
         for (let dY = 1; dY < value.divX; dY++) {
            inputs.push({ width: tY, height: tZ - oD, name: `divY_${dY}`, path: drawDivY(value) });
         }
      }

      const [r, u] = packer({ binWidth: cX - cM * 2, binHeight: cY - cM * 2, items: inputs }, { allowRotation: false, kerfSize: cG });

      if (!r) {
         return [[], u];
      }

      return [r, u];
   }, [value, cX, cY, cM]);

   return (
      <>
         {canvases.map((canvas, i) => {
            return (
               <svg key={i} width={cX * DPMM} height={cY * DPMM} viewBox={`0 0 ${cX} ${cY}`}>
                  {canvas.map((box, i) => {
                     return <path key={box.item.name} d={`M ${box.x},${box.y} m ${cM},${cM} ${box.item.path}`} stroke={"blue"} />;
                  })}
               </svg>
            );
         })}
      </>
   );
};

const Editor = () => {
   const [value, setValue] = useState<Schema>({
      gridSize: { value: 48, unit: "mm" },
      gridClearance: { value: 0.5, unit: "mm" },
      gridTab: { value: 14, unit: "mm" },

      stackSize: { value: 24, unit: "mm" },
      stackClearance: { value: 0.5, unit: "mm" },
      stackTab: { value: 8, unit: "mm" },

      footSize: { value: 6, unit: "mm" },

      matX: { value: 450, unit: "mm" },
      matY: { value: 300, unit: "mm" },
      matGap: { value: 2, unit: "mm" },
      matMargin: { value: 4, unit: "mm" },
      cellX: 2,
      cellY: 3,
      cellZ: 2,
      matZ: { value: 3, unit: "mm" },
      footStyle: FOOT_STYLES.DENSE,
      divX: 2,
      divY: 3,
      topStyle: TOP_STYLES.INSET,
      feetPack: true,
   });

   const updateValue = useCallback<SchemaSetter>((k, v) => {
      setValue((p) => {
         return {
            ...p,
            [k]: v,
         };
      });
   }, []);

   return (
      <>
         <Canvas>
            <Output value={value} />
         </Canvas>
         <Controls value={value} setValue={updateValue} />
      </>
   );
};

export const BoxBuilder = {
   Editor,
};

const Canvas = styled.div`
   background: #000;
   & > svg {
      background: white;
   }
   & > svg > * {
      vector-effect: non-scaling-stroke;
   }
   fill: none;
   stroke: black;
   overflow: scroll;
   align-self: stretch;
   justify-self: stretch;
`;
