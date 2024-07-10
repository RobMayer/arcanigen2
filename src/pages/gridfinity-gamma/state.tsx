import { proxy, useSnapshot } from "valtio";
import { FootStyles, GlobalSettings, ItemInstance, ItemType, Material } from "./types";
import { useCallback, useMemo } from "react";

type Store = {
    global: GlobalSettings;
    items: ItemInstance<ItemType>[];
    materials: any[];
};

const state = proxy<{ store: Store }>({
    store: {
        global: {
            layoutMargin: { value: 2, unit: "mm" },
            layoutSpacing: { value: 2, unit: "mm" },
            gridSize: { value: 48, unit: "mm" },
            gridClearance: { value: 0.25, unit: "mm" },
            gridTab: { value: 12, unit: "mm" },

            stackSize: { value: 24, unit: "mm" },
            footClearance: { value: 0.5, unit: "mm" },
            stackTab: { value: 6, unit: "mm" },

            footStyle: FootStyles.BLOCK,
            thickness: { value: 0.125, unit: "in" },

            hasFootDepth: false,
            footDepth: { value: 0.125, unit: "in" },

            hasFootRunnerWidth: false,
            footRunnerWidth: { value: 0.125, unit: "in" },
            footRunnerGap: { value: 18, unit: "mm" },
            footRunnerTab: { value: 6, unit: "mm" },
            footBracketWidth: { value: 6, unit: "mm" },
            hasGridInset: false,
            gridInset: { value: 0.125, unit: "in" },
        },
        items: [],
        materials: [],
    },
});

export const useGlobalSettings = () => {
    const grid = useSnapshot(state).store.global;

    const setValue = useCallback(setGridValue, []);

    return [grid, setValue] as [typeof grid, typeof setValue];
};

type Setter<T> = T | ((v: T) => T);

const setGridValue = <K extends keyof Store["global"]>(key: K, value?: Setter<Store["global"][K]>) => {
    if (value === undefined) {
        return (v: Setter<Store["global"][K]>) => {
            const v2 = typeof v === "function" ? v(state.store.global[key]) : v;
            state.store.global[key] = v2;
        };
    }
    const v2 = typeof value === "function" ? value(state.store.global[key]) : value;
    state.store.global[key] = v2;
};

export type ItemListMethods<T> = {
    add: (item: T) => void;
    delete: (idx: number | null) => void;
    clear: () => void;
};

export const useItemList = (): [ItemInstance<ItemType>[], ItemListMethods<ItemInstance<ItemType>>] => {
    const list = useSnapshot(state).store.items as ItemInstance<ItemType>[];

    const methods = useMemo(() => {
        return {
            add: (item: ItemInstance<ItemType>) => {
                state.store.items.push(item);
            },
            delete: (idx: number | null) => {
                if (idx !== null) {
                    state.store.items.splice(idx, 1);
                }
            },
            clear: () => {
                state.store.items.splice(0, state.store.items.length);
            },
        };
    }, []);

    return [list, methods];
};

export const useMaterialList = (): [Material[], ItemListMethods<Material>] => {
    const list = useSnapshot(state).store.materials as Material[];

    const methods = useMemo(() => {
        return {
            add: (item: Material) => {
                state.store.materials.push(item);
            },
            delete: (idx: number | null) => {
                if (idx !== null) {
                    state.store.materials.splice(idx, 1);
                }
            },
            clear: () => {
                state.store.materials.splice(0, state.store.materials.length);
            },
        };
    }, []);

    return [list, methods];
};

export const useItemState = (idx: number) => {
    const value = useSnapshot(state).store.items[idx];

    const setValue = useCallback(
        <K extends keyof Omit<ItemInstance<typeof value.type>, "type">>(key: K, v?: Setter<Omit<ItemInstance<typeof value.type>, "type">[K]>) => {
            if (v === undefined) {
                return (v2: Setter<Omit<ItemInstance<typeof value.type>, "type">[K]>) => {
                    const v3 = typeof v2 === "function" ? v2(state.store.items[idx][key]) : v2;
                    (state.store.items[idx][key] as any) = v3;
                };
            }
            const v2 = typeof v === "function" ? v(state.store.items[idx][key]) : v;
            (state.store.items[idx][key] as any) = v2;
        },
        [idx]
    );

    return [value, setValue] as [ItemInstance<typeof value.type>, typeof setValue];
};

export const useItemQuantity = (idx: number) => {
    const value = useSnapshot(state).store.items[idx].quantity;

    const setValue = useCallback(
        (n: number) => {
            state.store.items[idx].quantity = n;
        },
        [idx]
    );

    return [value, setValue] as [number, (n: number) => void];
};

export const useMaterialState = (idx: number) => {
    const value = useSnapshot(state).store.materials[idx] as Material;

    const setValue = useCallback(
        <K extends keyof Material>(key: K, v?: Setter<Material[K]>) => {
            if (v === undefined) {
                return (v2: Setter<Material[K]>) => {
                    const v3 = typeof v2 === "function" ? v2(state.store.materials[idx][key]) : v2;
                    state.store.materials[idx][key] = v3;
                };
            }
            const v2 = typeof v === "function" ? v(state.store.materials[idx][key]) : v;
            state.store.materials[idx][key] = v2;
        },
        [idx]
    );

    return [value, setValue] as [Material, typeof setValue];
};
