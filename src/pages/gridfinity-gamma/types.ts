import { FC, ReactNode } from "react";
import { PhysicalLength } from "../../utility/types/units";
import { ITEM_DEFINITIONS } from "./definitions";

// ITEM ENUMERATION
export type ItemType = keyof typeof ITEM_DEFINITIONS;

export const ItemCategories = {
    GRID: "GRID",
    FREE: "FREE",
    TOOL: "TOOL",
    OTHER: "OTHER",
} as const;
export type ItemCategory = Enum<typeof ItemCategories>;

export type GlobalSettings = {
    layoutMargin: PhysicalLength;
    layoutSpacing: PhysicalLength;
    gridSize: PhysicalLength;
    gridClearance: PhysicalLength;
    stackSize: PhysicalLength;
    footClearance: PhysicalLength;

    gridTab: PhysicalLength;
    stackTab: PhysicalLength;

    footStyle: FootStyle;
    thickness: PhysicalLength;

    hasFootDepth: boolean;
    footDepth: PhysicalLength;

    hasFootRunnerWidth: boolean;
    footRunnerWidth: PhysicalLength;

    footRunnerGap: PhysicalLength;
    footRunnerTab: PhysicalLength;
    footBracketWidth: PhysicalLength;

    hasGridInset: boolean;
    gridInset: PhysicalLength;
};

export type Material = {
    width: PhysicalLength;
    height: PhysicalLength;
    thickness: PhysicalLength;
    hasLayoutMargin: boolean;
    layoutMargin: PhysicalLength;
    hasLayoutSpacing: boolean;
    layoutSpacing: PhysicalLength;
};

export type Enum<T extends Record<string | number | symbol, unknown>> = T[keyof T];

export const FootStyles = {
    BLOCK: "BLOCK",
    BRACKET: "BRACKET",
    RUNNER: "RUNNER",
} as const;

export type FootStyle = Enum<typeof FootStyles>;

export const FOOT_STYLE_OPTIONS: { [key in FootStyle]: ReactNode } = {
    BLOCK: "Block",
    BRACKET: "Bracket",
    RUNNER: "Runner",
} as const;

export const FootLayouts = {
    DENSE: "SLOT_DENSE",
    SPARSE: "SLOT_SPARSE",
    MINIMAL: "SLOT_MINIMAL",
    NONE: "NONE",
} as const;

export type FootLayout = (typeof FootLayouts)[keyof typeof FootLayouts];

export const FOOT_LAYOUT_OPTIONS: { [key in FootLayout]: ReactNode } = {
    [FootLayouts.DENSE]: "Dense",
    [FootLayouts.SPARSE]: "Sparse",
    [FootLayouts.MINIMAL]: "Minimal",
    [FootLayouts.NONE]: "None",
};

type ItemParams<D> = D extends ItemDefinition<infer P> ? P : never;

export type ItemDefinition<P> = {
    // getLayout: (item: P, globals: GlobalSettings) => { width: number; height: number; path: string }[];
    // getLabel: (item: P) => ReactNode;
    Controls: ItemControls<P>;
    getSummary: (v: P) => string;
    getInitial: () => P;
    title: string;
    image?: string;
    snippet: ReactNode;
    render: ItemRenderer<P>;
    category: ItemCategory;
};

export type ItemControls<P> = FC<{
    globals: GlobalSettings;
    value: P;
    setValue: CurriedSetter<P>;
}>;

export type ItemRenderer<P> = (item: P, globals: GlobalSettings) => LayoutPart[];

export type ItemInstance<T extends ItemType> = {
    type: T;
    quantity: number;
} & ItemParams<(typeof ITEM_DEFINITIONS)[T]>;

export type Setter<T> = T | ((v: T) => T);

export type CurriedSetter<T> = {
    <K extends keyof T>(key: K, value: Setter<T[K]>): void;
    <K extends keyof T>(key: K): (v: Setter<T[K]>) => void;
};

export type Shape = {
    width: number;
    height: number;
    path: string;
    name: string;
    thickness: PhysicalLength;
};

export type LayoutPart = {
    shapes: Shape[];
    name: string;
    copies: number;
};

export type Comparator<T> = (a: T, b: T) => number;
