import { FC, ReactNode } from "react";
import { Color, PhysicalLength } from "../../utility/types/units";
import { ItemParams } from "./definitions";

export const OBJ_TYPES = {
   BOX: "BOX",
   DRAWER: "DRAWER",
} as const;

export type ObjType = (typeof OBJ_TYPES)[keyof typeof OBJ_TYPES];

export const FOOT_STYLES = {
   RUNNER: "RUNNER",
   BLOCK: "BLOCK",
   BRACKET: "BRACKET",
} as const;

export type FootStyle = (typeof FOOT_STYLES)[keyof typeof FOOT_STYLES];

export const FOOT_STYLE_OPTIONS: { [key in FootStyle]: ReactNode } = {
   RUNNER: "Runner",
   BLOCK: "Block",
   BRACKET: "Bracket",
} as const;

export const FOOT_LAYOUT = {
   NONE: "NONE",
   DENSE: "SLOT_DENSE",
   SPARSE: "SLOT_SPARSE",
   MINIMAL: "SLOT_MINIMAL",
} as const;

export type FootLayout = (typeof FOOT_LAYOUT)[keyof typeof FOOT_LAYOUT];

export const FOOT_LAYOUT_OPTIONS: { [key in FootLayout]: ReactNode } = {
   [FOOT_LAYOUT.MINIMAL]: "Minimal",
   [FOOT_LAYOUT.SPARSE]: "Sparse",
   [FOOT_LAYOUT.DENSE]: "Dense",
   [FOOT_LAYOUT.NONE]: "None",
};

export const TOP_STYLES = {
   NONE: "NONE",
   GRID: "GRID",
   FLUSH: "FLUSH",
   INSET: "INSET",
} as const;

export type TopStyle = (typeof TOP_STYLES)[keyof typeof TOP_STYLES];

export const TOP_STYLE_OPTIONS: { [key in TopStyle]: ReactNode } = {
   [TOP_STYLES.NONE]: "None",
   [TOP_STYLES.GRID]: "Grid",
   [TOP_STYLES.FLUSH]: "Flush",
   [TOP_STYLES.INSET]: "Inset",
};

export type FourWay<T> = T | [x: T, y: T] | [x: T, n: T, s: T] | [n: T, e: T, s: T, w: T];

export const parseFourWay = <T>(v: FourWay<T>): [n: T, e: T, s: T, w: T] => {
   if (Array.isArray(v)) {
      if (v.length === 2) {
         return [v[1], v[0], v[1], v[0]];
      }
      if (v.length === 3) {
         return [v[1], v[0], v[2], v[0]];
      }
      if (v.length === 4) {
         return v;
      }
   }
   return [v, v, v, v];
};

export type ItemDefinition<P extends ItemParams> = {
   getLayout: (item: P, material: Material, grid: GridSystem) => { width: number; height: number; path: string }[];
   getLabel: (item: P) => ReactNode;
   Controls: FC<ItemControlProps<P>>;
   getInitial: () => P;
   getTitle: () => ReactNode;
   getDescription: () => ReactNode;
};

type ExtraItemProps = {
   quantity: number;
   color: Color;
};

export type ItemControlProps<T extends ItemParams> = {
   grid: GridSystem;
   value: T & ExtraItemProps;
   setValue: (key: keyof (T & ExtraItemProps), value: (T & ExtraItemProps)[keyof (T & ExtraItemProps)]) => void;
};

export type GridSystem = {
   gridSize: PhysicalLength;
   gridClearance: PhysicalLength;
   stackSize: PhysicalLength;
   stackClearance: PhysicalLength;

   gridTab: PhysicalLength;
   stackTab: PhysicalLength;
   footSize: PhysicalLength;
   slideClearance: PhysicalLength;

   footStyle: FootStyle;
};

export type Material = {
   width: PhysicalLength;
   height: PhysicalLength;
   thickness: PhysicalLength;
   margin: PhysicalLength;
   gap: PhysicalLength;
};
