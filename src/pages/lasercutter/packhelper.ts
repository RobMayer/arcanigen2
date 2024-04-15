/* UTIL */

const debug = (...stuff: any[]) => {};

const f = (a: any[], b: any[]) => ([] as any[]).concat(...a.map((d) => b.map((e) => [].concat(d, e))));
export const cartesian = (a: any[], b?: any[], ...c: any): any[] => (b ? cartesian(f(a, b), ...c) : a);

/* TYPES */

export type Rectangle = {
   width: number;
   height: number;
   x: number;
   y: number;
   bin: number;
   id: string;
   splitFrom?: string;
};

export interface Item {
   width: number;
   height: number;
   [others: string]: any;
}

/* SPLIT STRATEGY */

const createSplitRectangle = (rectangle: Rectangle) => ({ ...rectangle, splitFrom: rectangle.id });

abstract class Splitter {
   constructor(public kerfSize: number) {}
   abstract split(rectangle: Rectangle, item: Item): Rectangle[];
   protected splitHorizontally(rectangle: Rectangle, item: Item): Rectangle[] {
      debug(`splitting ${rectangle.id} horizontally`);
      const rectangle1 = {
         ...createSplitRectangle(rectangle),
         x: rectangle.x + item.width + this.kerfSize,
         width: rectangle.width - item.width - this.kerfSize,
         height: item.height,
         id: "sh-r1",
      };
      const rectangle2 = {
         ...createSplitRectangle(rectangle),
         y: rectangle.y + item.height + this.kerfSize,
         height: rectangle.height - item.height - this.kerfSize,
         id: "sh-r2",
      };
      return [rectangle1, rectangle2];
   }
   protected splitVertically(rectangle: Rectangle, item: Item): Rectangle[] {
      debug(`splitting ${rectangle.id} vertically`);
      const rectangle1 = {
         ...createSplitRectangle(rectangle),
         y: rectangle.y + item.height + this.kerfSize,
         width: item.width,
         height: rectangle.height - item.height - this.kerfSize,
         id: "sh-r1",
      };
      const rectangle2 = {
         ...createSplitRectangle(rectangle),
         x: rectangle.x + item.width + this.kerfSize,
         y: rectangle.y,
         width: rectangle.width - item.width - this.kerfSize,
         id: "sh-r2",
      };
      return [rectangle1, rectangle2];
   }
}

class ShortAxisSplit extends Splitter {
   split(rectangle: Rectangle, item: Item) {
      if (rectangle.width < rectangle.height) {
         return this.splitHorizontally(rectangle, item);
      } else {
         return this.splitVertically(rectangle, item);
      }
   }
}

class LongAxisSplit extends Splitter {
   split(rectangle: Rectangle, item: Item) {
      if (rectangle.width > rectangle.height) {
         return this.splitHorizontally(rectangle, item);
      } else {
         return this.splitVertically(rectangle, item);
      }
   }
}

class ShorterLeftoverAxisSplit extends Splitter {
   split(rectangle: Rectangle, item: Item) {
      if (rectangle.width - item.width < rectangle.height - item.height) {
         return this.splitHorizontally(rectangle, item);
      } else {
         return this.splitVertically(rectangle, item);
      }
   }
}

class LongerLeftoverAxisSplit extends Splitter {
   split(rectangle: Rectangle, item: Item) {
      if (rectangle.width - item.width >= rectangle.height - item.height) {
         return this.splitHorizontally(rectangle, item);
      } else {
         return this.splitVertically(rectangle, item);
      }
   }
}

export enum SplitStrategy {
   LongLeftoverAxisSplit,
   ShortLeftoverAxisSplit,
   LongAxisSplit,
   ShortAxisSplit,
}

export function GetSplitImplementation(strategy: SplitStrategy, kerfSize: number): Splitter {
   switch (strategy) {
      case SplitStrategy.LongAxisSplit:
         return new LongAxisSplit(kerfSize);
      case SplitStrategy.ShortAxisSplit:
         return new ShortAxisSplit(kerfSize);
      case SplitStrategy.LongLeftoverAxisSplit:
         return new LongerLeftoverAxisSplit(kerfSize);
      case SplitStrategy.ShortLeftoverAxisSplit:
         return new ShorterLeftoverAxisSplit(kerfSize);
   }
}

/* SORT STRATEGY */

const area = (item: Item) => item.height * item.width;
const perimeter = (item: Item) => item.height * 2 + item.width * 2;

const sides = (item: Item) => ({
   short: Math.min(item.width, item.height),
   long: Math.max(item.width, item.height),
});

abstract class Sorter {
   constructor(public direction: SortDirection) {}
   protected abstract comparer(a: Item, b: Item): number;
   sort(items: Item[]) {
      const sortedItems = [...items].sort(this.comparer);
      return this.direction === SortDirection.DESC ? sortedItems.reverse() : sortedItems;
   }
}

class Area extends Sorter {
   comparer(a: Item, b: Item) {
      return area(a) < area(b) ? -1 : 1;
   }
}

class ShortSide extends Sorter {
   comparer(a: Item, b: Item) {
      const aSides = sides(a);
      const bSides = sides(b);

      if (aSides.short === bSides.short) {
         return aSides.long < bSides.long ? -1 : 1;
      } else {
         return aSides.short < bSides.short ? -1 : 1;
      }
   }
}

class LongSide extends Sorter {
   comparer(a: Item, b: Item) {
      const aSides = sides(a);
      const bSides = sides(b);
      if (aSides.long === bSides.long) {
         return aSides.short < bSides.short ? -1 : 1;
      } else {
         return aSides.long < bSides.long ? -1 : 1;
      }
   }
}

class Perimeter extends Sorter {
   comparer(a: Item, b: Item) {
      return perimeter(a) < perimeter(b) ? -1 : 1;
   }
}

class Differences extends Sorter {
   comparer(a: Item, b: Item) {
      return Math.abs(a.width - a.height) < Math.abs(b.width - b.height) ? -1 : 1;
   }
}

class Ratio extends Sorter {
   comparer(a: Item, b: Item) {
      return a.width / a.height < b.width / b.height ? -1 : 1;
   }
}

export enum SortStrategy {
   Area,
   ShortSide,
   LongSide,
   Perimeter,
   Differences,
   Ratio,
}

export enum SortDirection {
   ASC,
   DESC,
}

export function GetSortImplementation(strategy: SortStrategy, direction: SortDirection): Sorter {
   let impl;
   switch (strategy) {
      case SortStrategy.Area:
         impl = Area;
         break;
      case SortStrategy.Differences:
         impl = Differences;
         break;
      case SortStrategy.LongSide:
         impl = LongSide;
         break;
      case SortStrategy.Perimeter:
         impl = Perimeter;
         break;
      case SortStrategy.Ratio:
         impl = Ratio;
         break;
      case SortStrategy.ShortSide:
         impl = ShortSide;
         break;
   }
   return new impl(direction);
}

/* SELECT STRATEGY */

export enum SelectionStrategy {
   BEST_SHORT_SIDE_FIT,
   BEST_LONG_SIDE_FIT,
   BEST_AREA_FIT,
}

abstract class SelectionImplementation {
   abstract generateSortValue(freeRectangle: Rectangle, itemToPlace: Item): number;
   select(freeRectangles: Rectangle[], itemToPlace: Item): Rectangle | null {
      const [bestRect] = freeRectangles
         .filter((freeRect) => freeRect.width - itemToPlace.width >= 0 && freeRect.height - itemToPlace.height >= 0)
         .map((r) => ({ rectangle: r, sortValue: this.generateSortValue(r, itemToPlace) }))
         .sort((a, b) => (a.sortValue > b.sortValue ? 1 : -1));

      return bestRect ? bestRect.rectangle : null;
   }
}

class BestShortSideFit extends SelectionImplementation {
   generateSortValue(freeRectangle: Rectangle, itemToPlace: Item) {
      const { width, height } = itemToPlace;
      return Math.min(freeRectangle.width - width, freeRectangle.height - height);
   }
}

class BestLongSideFit extends SelectionImplementation {
   generateSortValue(freeRectangle: Rectangle, itemToPlace: Item) {
      const { width, height } = itemToPlace;
      return Math.max(freeRectangle.width - width, freeRectangle.height - height);
   }
}

class BestAreaFit extends SelectionImplementation {
   generateSortValue(freeRectangle: Rectangle) {
      return freeRectangle.width * freeRectangle.height;
   }
}

export function GetSelectionImplementation(strategy: SelectionStrategy): SelectionImplementation {
   switch (strategy) {
      case SelectionStrategy.BEST_AREA_FIT:
         return new BestAreaFit();
      case SelectionStrategy.BEST_LONG_SIDE_FIT:
         return new BestLongSideFit();
      case SelectionStrategy.BEST_SHORT_SIDE_FIT:
         return new BestShortSideFit();
   }
}

/* PACK STRATEGY */

export type PackStrategyOptions = {
   binHeight: number;
   binWidth: number;
   items: Item[];
   selectionStrategy: SelectionStrategy;
   splitStrategy: SplitStrategy;
   sortStrategy: SortStrategy;
   sortOrder: SortDirection;
   kerfSize: number;
   allowRotation: boolean;
};

export type PackedItem = {
   item: any;
   width: number;
   height: number;
   x: number;
   y: number;
   bin: number;
};

export function PackStrategy({ binHeight, binWidth, items, selectionStrategy, splitStrategy, sortStrategy, sortOrder, kerfSize, allowRotation }: PackStrategyOptions) {
   debug(`Executing! split strategy: ${splitStrategy}, selection strategy: ${selectionStrategy}, sortStrategy: ${sortStrategy}, sortOrder: ${sortOrder}`);
   let binCount = 0;
   const freeRectangles: Rectangle[] = [];

   const createBin = () => {
      binCount++;
      debug(`creating bin ${binCount}`);
      freeRectangles.push({
         width: binWidth,
         height: binHeight,
         x: 0,
         y: 0,
         bin: binCount,
         id: "root",
      });
   };
   const splitter = GetSplitImplementation(splitStrategy, kerfSize);
   const selector = GetSelectionImplementation(selectionStrategy);
   const sorter = GetSortImplementation(sortStrategy, sortOrder);

   const sortedItems = sorter.sort(items);

   const rotateItem = (item: Item) => {
      return { ...item, height: item.width, width: item.height };
   };

   const splitRectangle = ({ rectangle, item }: { rectangle: Rectangle; item: Item }) => {
      return splitter.split(rectangle, item).filter((r) => r.width > 0 && r.height > 0);
   };

   const getSelectionOption = (item: Item) => {
      const rectangle = selector.select(freeRectangles, item);
      debug(`for item ${JSON.stringify(item)}, selected ${JSON.stringify(rectangle)}`);
      if (!rectangle) {
         return null;
      }
      const splitRectangles = splitRectangle({ rectangle: rectangle, item });
      return {
         rectangle,
         splitRectangles,
         item,
      };
   };

   const selectRectangleOption = (item: Item) => {
      const originalOption = getSelectionOption(item);
      let rotatedOption = null;
      let rotatedItem;
      if (allowRotation) {
         rotatedItem = rotateItem(item);
         rotatedOption = getSelectionOption(rotatedItem);
      }
      if (originalOption === null && rotatedOption === null) {
         debug(`No free rectangles found for`, item);
         return null;
      } else if (originalOption === null) {
         debug(`Original item didn't fit, using rotated`, item);
         return rotatedOption;
      } else if (rotatedOption === null) {
         debug(`Rotated item didn't fit, using original option`, item);
         return originalOption;
      } else {
         const getBiggestSplitRectangle = ({ splitRectangles }: { splitRectangles: Rectangle[] }) => Math.max(...splitRectangles.map((split) => split.height * split.width));
         const originalMax = getBiggestSplitRectangle(originalOption);
         const rotatedMax = getBiggestSplitRectangle(rotatedOption);
         debug(`Original max area ${originalMax}, rotated max area ${rotatedMax}`);
         if (getBiggestSplitRectangle(originalOption) >= getBiggestSplitRectangle(rotatedOption)) {
            debug(`Going with original placement option`);
            return originalOption;
         } else {
            debug(`Going with rotated placement option`);
            return rotatedOption;
         }
      }
   };

   const unallocated: Set<Item> = new Set<Item>();

   const packedItems = sortedItems
      .map((item, idx) => {
         debug("packing item", item);
         let selectedOption = selectRectangleOption(item);
         if (!selectedOption) {
            createBin();
            selectedOption = selectRectangleOption(item);
         }
         if (!selectedOption) {
            unallocated.add(item);
            //throw new Error(`item at index ${idx} with dimensions ${item.width}x${item.height} exceeds bin dimensions of ${binWidth}x${binHeight}`);
            return null;
         }
         const { rectangle, splitRectangles } = selectedOption;
         debug("selected rectangle", rectangle);
         const { width, height, ...otherItemProps } = selectedOption.item;
         const packedItem = {
            item: otherItemProps,
            width,
            height,
            x: rectangle.x,
            y: rectangle.y,
            bin: rectangle.bin,
         };
         debug("packed item", packedItem);
         debug("free rectangles pre split", freeRectangles);
         const rectIndex = freeRectangles.findIndex((r) => r === rectangle);
         freeRectangles.splice(rectIndex, 1, ...splitRectangles);
         debug("free rectangles post split", freeRectangles);
         return packedItem;
      })
      .reduce((bins, item) => {
         if (item) {
            if (bins.length >= item.bin) {
               bins[item.bin - 1].push(item);
            } else {
               bins.push([item]);
            }
         }
         return bins;
      }, [] as PackedItem[][]);

   return {
      sortStrategy,
      sortOrder,
      packedItems,
      splitStrategy,
      selectionStrategy,
      unallocated: Array.from(unallocated),
   };
}

/* PACKER */

type PackerInputs = { binHeight: number; binWidth: number; items: Item[] };
type PackerConfig = {
   selectionStrategy?: SelectionStrategy;
   splitStrategy?: SplitStrategy;
   sortStrategy?: SortStrategy;
   kerfSize?: number;
   allowRotation?: boolean;
};

type PackerResult = PackedItem[][] | null;

function Packer({ binHeight, binWidth, items }: PackerInputs, { selectionStrategy, splitStrategy, sortStrategy, kerfSize = 0, allowRotation = true }: PackerConfig = {}) {
   function enumToArray<T>(enumVariable: T) {
      return Object.values(enumVariable)
         .filter((value) => parseInt(value, 10) >= 0)
         .map((value) => value as keyof T);
   }

   const selectionStrategies = selectionStrategy !== undefined ? [selectionStrategy] : enumToArray(SelectionStrategy);

   const splitStrategies = splitStrategy !== undefined ? [splitStrategy] : enumToArray(SplitStrategy);
   const sortStrategies = sortStrategy !== undefined ? [sortStrategy] : enumToArray(SortStrategy);

   const allStrategies = cartesian(selectionStrategies, splitStrategies, sortStrategies, [SortDirection.ASC, SortDirection.DESC]);

   return allStrategies
      .map(([selectionStrategy, splitStrategy, sortStrategy, sortOrder]) =>
         PackStrategy({
            binWidth,
            binHeight,
            items,
            splitStrategy,
            selectionStrategy,
            sortStrategy,
            sortOrder,
            kerfSize,
            allowRotation,
         })
      )
      .reduce<PackerResult | null>((bestCompressed, packResult) => {
         const { splitStrategy, sortStrategy, selectionStrategy, sortOrder, packedItems, unallocated } = packResult;
         debug(`Result for split strategy: ${splitStrategy}, selection strategy: ${selectionStrategy}, sortStrategy: ${sortStrategy}, sortOrder: ${sortOrder} - ${packedItems.length} bin(s)`);
         if (!bestCompressed || packedItems.length < bestCompressed.length) {
            return packedItems;
         } else {
            return bestCompressed;
         }
      }, null);
}

export { Packer as packer };
