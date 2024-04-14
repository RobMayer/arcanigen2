import { ReactNode } from "react";

export const OBJ_TYPES = {
   BOX: "BOX",
   DRAWER: "DRAWER",
} as const;

export type ObjType = (typeof OBJ_TYPES)[keyof typeof OBJ_TYPES];

export const FOOT_STYLES = {
   NONE: "NONE",
   DENSE: "SLOT_DENSE",
   SPARSE: "SLOT_SPARSE",
   MINIMAL: "SLOT_MINIMAL",
} as const;

export type FootStyle = (typeof FOOT_STYLES)[keyof typeof FOOT_STYLES];

export const FOOT_STYLE_OPTIONS: { [key in FootStyle]: ReactNode } = {
   [FOOT_STYLES.NONE]: "None/Bracket",
   [FOOT_STYLES.DENSE]: "Dense",
   [FOOT_STYLES.SPARSE]: "Sparse",
   [FOOT_STYLES.MINIMAL]: "Minimal",
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
