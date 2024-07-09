import { FC, ReactNode } from "react";
import { PhysicalLength } from "../../utility/types/units";
import { BoxDefinition } from "./items/box";
import { BaseplateDefinition } from "./items/baseplate";
import { FootJigDefinition } from "./items/footjig";
import { SortMethod, SplitMethod, PickMethod, SortDirection } from "./helpers/packhelper";

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

    packSortMethod: SortMethod;
    packSortDirection: SortDirection;
    packSplitMethod: SplitMethod;
    packPickMethod: PickMethod;
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

export type Enum<T extends Record<any, any>> = T[keyof T];

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
    BASEPLATE: BaseplateDefinition,
    FOOTJIG: FootJigDefinition,
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
    draw: (item: P, globals: GlobalSettings) => LayoutPart[];
};

export type ItemControlProps<P> = {
    globals: GlobalSettings;
    value: P & { quantity: number };
    setValue: CurriedSetter<P & { quantity: number }>;
};

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
