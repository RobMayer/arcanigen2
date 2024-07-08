import { FC, ReactNode } from "react";
import { PhysicalLength } from "../../utility/types/units";
import { BoxDefinition } from "./items/box";
import { GridDefinition } from "./items/grid";

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

export type Enum<T extends Record<any, any>> = T[keyof T];

export const SortStrategies = {
    AREA: "AREA",
    SHORT: "SHORT",
    LONG: "LONG",
    PERIMETER: "PERIMETER",
    DIFFERENCE: "DIFFERENCE",
    RATIO: "RATIO",
} as const;

export type SortStrategy = Enum<typeof SortStrategies>;

export const SortDirections = {
    ASC: "ASC",
    DESC: "DESC",
} as const;

export type SortDirection = Enum<typeof SortDirections>;

export const SplitStrategies = {
    LONG_LEFTOVER: "LONG_LEFTOVER",
    SHORT_LEFTOVER: "SHORT_LEFTOVER",
    LONG: "LONG",
    SHORT: "SHORT",
} as const;

export type SplitStrategy = Enum<typeof SplitStrategies>;

export const SelectionStrategies = {
    SHORT: "SHORT",
    LONG: "LONG",
    AREA: "AREA",
} as const;

export type SelectionStrategy = Enum<typeof SelectionStrategies>;

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

// ITEM ENUMERATION
export const ITEM_DEFINITIONS = {
    BOX: BoxDefinition,
    GRID: GridDefinition,
} as const;

export type ItemType = keyof typeof ITEM_DEFINITIONS;

type ItemParams<D> = D extends ItemDefinition<infer P> ? P : never;

export type ItemDefinition<P> = {
    // getLayout: (item: P, globals: GlobalSettings) => { width: number; height: number; path: string }[];
    // getLabel: (item: P) => ReactNode;
    Controls: FC<ItemControlProps<P>>;
    describe: (v: P) => ReactNode;
    getInitial: () => P;
    title: ReactNode;
    description: ReactNode;
    draw: (item: P, globals: GlobalSettings) => Shape[];
};

export type ItemControlProps<P> = {
    globals: GlobalSettings;
    value: P;
    setValue: CurriedSetter<P>;
};

export type ItemInstance<T extends ItemType> = {
    type: T;
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

export type Comparator<T> = (a: T, b: T) => number;
