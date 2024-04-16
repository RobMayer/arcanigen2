import { proxy, useSnapshot } from "valtio";
import { FOOT_STYLES, GridSystem, Material } from "./types";
import { useCallback, useMemo } from "react";
import { colorToHex, convertLength } from "../../utility/mathhelper";
import { packer } from "./packhelper";
import { ITEM_DEFINITIONS, ItemParams } from "./definitions";
import { Color } from "../../utility/types/units";

type Store = {
   grid: GridSystem;
   media: {
      material: Material;
      contents: (ItemParams & {
         quantity: number;
         color: Color;
      })[];
   }[];
};

const laserstore = proxy<{ store: Store }>({
   store: {
      grid: {
         gridSize: { value: 48, unit: "mm" },
         gridClearance: { value: 0.25, unit: "mm" },
         gridTab: { value: 12, unit: "mm" },

         stackSize: { value: 24, unit: "mm" },
         stackClearance: { value: 0.25, unit: "mm" },
         stackTab: { value: 6, unit: "mm" },

         footSize: { value: 6, unit: "mm" },
         slideClearance: { value: 0.5, unit: "mm" },
         footStyle: FOOT_STYLES.RUNNER,
      },
      media: [],
   },
});

type GridSetter = <const T extends keyof Store["grid"]>(key: T, value: Store["grid"][T]) => void;

export const useGridState = () => {
   const grid = useSnapshot(laserstore).store.grid;

   const setValue = useCallback<GridSetter>((key, value) => {
      laserstore.store.grid[key] = value;
   }, []);

   return [grid, setValue] as [typeof grid, GridSetter];
};

type MaterialSetter = <const T extends keyof Store["media"][number]["material"]>(key: T, value: Store["media"][number]["material"][T]) => void;

export const useMaterialState = (idx: number) => {
   const media = useSnapshot(laserstore).store.media;

   const setValue = useCallback<MaterialSetter>(
      (key, value) => {
         laserstore.store.media[idx].material[key] = value;
      },
      [idx]
   );

   return [media[idx].material, setValue] as [(typeof media)[number]["material"], MaterialSetter];
};

export const useItemState = (mat: number, idx: number) => {
   const state = useSnapshot(laserstore).store.media[mat].contents[idx];

   const setValue = useCallback(
      (key: keyof (ItemParams & { quantity: number }), value: any) => {
         (laserstore.store.media[mat].contents[idx][key] as any) = value;
      },
      [mat, idx]
   );

   return [state, setValue] as [typeof state, typeof setValue];
};

export const useMaterialList = () => {
   const media = useSnapshot(laserstore).store.media;

   const methods = useMemo(() => {
      return {
         add: (material: Material) => {
            laserstore.store.media.push({
               material,
               contents: [],
            });
         },
         delete: (idx: number | null) => {
            if (idx !== null) {
               laserstore.store.media.splice(idx, 1);
            }
         },
      };
   }, []);

   return [media, methods] as [typeof media, typeof methods];
};

export const useItemList = (matIdx: number) => {
   const contents = useSnapshot(laserstore).store.media[matIdx].contents;

   const methods = useMemo(() => {
      return {
         add: (item: ItemParams) => {
            laserstore.store.media[matIdx].contents.push({
               ...item,
               quantity: 1,
               color: { r: 0, g: 0, b: 0, a: 1 },
            });
         },
         delete: (idx: number | null) => {
            if (idx !== null) {
               laserstore.store.media[matIdx].contents.splice(idx, 1);
            }
         },
      };
   }, [matIdx]);

   return [contents, methods] as [typeof contents, typeof methods];
};

export const useCutsheet = () => {
   const store = useSnapshot(laserstore).store;

   return useMemo(() => {
      return store.media.map(({ contents, material }) => {
         const width = convertLength(material.width, "mm").value;
         const height = convertLength(material.height, "mm").value;
         const gap = convertLength(material.gap, "mm").value;
         const margin = convertLength(material.margin, "mm").value;
         const binWidth = width - margin * 2;
         const binHeight = height - margin * 2;

         const [input, unallocated] = bisectArray(
            contents.reduce<{ color: string; width: number; height: number; path: string }[]>((acc, { color, quantity, ...item }) => {
               for (let i = 0; i < quantity; i++) {
                  const res = ITEM_DEFINITIONS[item.type].getLayout(item, material, store.grid).map((r) => ({ ...r, color: colorToHex(color) }));
                  acc.push(...res);
               }
               return acc;
            }, []),
            (each) => each.height < binHeight && each.width < binWidth
         );

         const result = packer({ binWidth, binHeight, items: input }, { allowRotation: false, kerfSize: gap });

         return { result, unallocated, width, height, margin };
      });
   }, [store.media, store.grid]);
};

const bisectArray = <T>(input: T[], fn: (item: T) => boolean): [kept: T[], discarded: T[]] => {
   const a: T[] = [];
   const b: T[] = [];

   input.forEach((each) => {
      if (fn(each)) {
         a.push(each);
      } else {
         b.push(each);
      }
   });

   return [a, b];
};

export const usePersistence = () => {
   const save = useCallback(() => {
      return JSON.stringify({ ...laserstore.store, version: VERSION });
   }, []);

   const load = useCallback(({ version, ...item }: any) => {
      laserstore.store = item;
   }, []);

   const reset = useCallback(() => {
      laserstore.store = {
         grid: {
            gridSize: { value: 48, unit: "mm" },
            gridClearance: { value: 0.25, unit: "mm" },
            gridTab: { value: 12, unit: "mm" },

            stackSize: { value: 24, unit: "mm" },
            stackClearance: { value: 0.25, unit: "mm" },
            stackTab: { value: 6, unit: "mm" },

            footSize: { value: 6, unit: "mm" },
            footStyle: FOOT_STYLES.RUNNER,
            slideClearance: { value: 0.5, unit: "mm" },
         },
         media: [],
      };
   }, []);

   return { save, load, reset };
};

const VERSION = 0;
