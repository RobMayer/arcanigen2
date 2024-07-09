type Rect = { width: number; height: number };

export type RectOf<P> = Rect & { payload: P };
export type PackedOf<P> = Rect & { rotated: boolean; x: number; y: number; payload: P; bin: number };
type Box = {
    x: number;
    y: number;
    w: number;
    h: number;
    r?: Box;
    d?: Box;
    b: number;
};

const AREA_DESCENDING = (a: Rect, b: Rect) => (a.width * a.height < b.width * b.height ? 1 : -1);

export const packDynamic = <P>(items: RectOf<P>[], kerf: number = 0) => {
    return doDynamicPack(items, kerf, "LONG_AXIS");
};

const doDynamicPack = <P>(items: RectOf<P>[], kerf: number, splitStrategy: keyof typeof SPLIT_METHODS) => {
    items = items.toSorted(AREA_DESCENDING);
    const result: PackedOf<P>[] = [];

    let root: Box = { b: 0, x: 0, y: 0, w: items[0].width, h: items[0].height };

    const findBox = (box: Box, w: number, h: number): Box | null => {
        if ("r" in box && "d" in box) {
            return findBox(box.r!, w, h) || findBox(box.d!, w, h);
        } else if (w <= box.w && h <= box.h) {
            return box;
        } else {
            return null;
        }
    };

    const splitBox = (box: Box, w: number, h: number): Box => {
        const [rect1, rect2] = SPLIT_METHODS[splitStrategy](box, w, h, kerf);
        box.d = rect1;
        box.r = rect2;
        return box;
    };

    const growDown = (w: number, h: number) => {
        const r = root;
        root = {
            x: 0,
            y: 0,
            w: r.w,
            h: r.h + h + kerf,
            d: { x: 0, y: r.h + kerf, w: r.w, h: h, b: 0 },
            r: r,
            b: 0,
        };
        const n = findBox(root, w, h);
        if (n) {
            return splitBox(n, w, h);
        }
        return null;
    };

    const growRight = (w: number, h: number) => {
        const r = root;
        root = {
            x: 0,
            y: 0,
            w: r.w + w + kerf,
            h: r.h,
            d: r,
            b: 0,
            r: { x: r.w + kerf, y: 0, w: w, h: r.h, b: 0 },
        };
        const n = findBox(root, w, h);
        if (n) {
            return splitBox(n, w, h);
        }
        return null;
    };

    const growBox = (w: number, h: number) => {
        const canGrowDown = w <= root.w;
        const canGrowRight = h <= root.h;

        const shouldGrowRight = canGrowRight && root.h >= root.w + w;
        const shouldGrowDown = canGrowDown && root.w >= root.h + h;

        if (shouldGrowRight) {
            console.log("should grow right", w, h);
            return growRight(w, h);
        }
        if (shouldGrowDown) {
            console.log("should grow down", w, h);
            return growDown(w, h);
        }
        if (canGrowDown) {
            console.log("can grow down", w, h);
            return growDown(w, h);
        }
        if (canGrowRight) {
            console.log("can grow right", w, h);
            return growRight(w, h);
        }
        return null;
    };

    items.forEach((rect) => {
        let foundBox = findBox(root, rect.width, rect.height);
        if (foundBox) {
            const n = splitBox(foundBox, rect.width, rect.height);
            result.push({
                width: rect.width,
                height: rect.height,
                payload: rect.payload,
                x: n.x,
                y: n.y,
                rotated: false,
                bin: 0,
            });
            return;
        } else {
            const n = growBox(rect.width, rect.height);
            if (n) {
                result.push({
                    width: rect.width,
                    height: rect.height,
                    payload: rect.payload,
                    x: n.x,
                    y: n.y,
                    rotated: false,
                    bin: 0,
                });
            } else {
                console.error("ERM");
            }
        }
    });

    const bounds = result.reduce<{ width: number; height: number }>(
        (acc, each) => {
            acc.width = Math.max(acc.width, each.x + each.width);
            acc.height = Math.max(acc.height, each.y + each.height);
            return acc;
        },
        { width: -Infinity, height: -Infinity }
    );

    return { result, ...bounds };
};

export const packFixed = <P>(binWidth: number, binHeight: number, items: RectOf<P>[], kerf: number = 0): [PackedOf<P>[][], RectOf<P>[]] => {
    if (items.length === 0) {
        return [[], []];
    }
    const [canFit, discarded] = items.reduce<[RectOf<P>[], RectOf<P>[]]>(
        (acc, each) => {
            if (each.width <= binWidth && each.height <= binHeight) {
                acc[0].push(each);
                return acc;
            }
            if (each.width <= binHeight && each.height <= binWidth) {
                acc[0].push(each);
                return acc;
            }
            //can't fit
            acc[1].push(each);
            return acc;
        },
        [[], []]
    );

    const strategies = cartesian(Object.keys(SELECT_METHODS), Object.keys(SPLIT_METHODS), Object.keys(SORT_METHODS), Object.keys(SORT_DIRS), [true, false]);

    const packed = strategies.map(([selection, split, sort, order, rotate]) => doFixedPack(binWidth, binHeight, canFit, split, selection, sort, order, kerf, rotate));

    const best = packed.reduce<PackedOf<P>[][] | null>((best, toCheck) => {
        if (best === null) {
            return toCheck;
        }
        if (toCheck.length < best.length) {
            return toCheck;
        }
        if (best.length === 0 && toCheck.length === 0) {
            return toCheck;
        }
        if (toCheck.length === best.length) {
            const bestPerimeter = getSheetUsage(best[best.length - 1]).boundingPerimeter;
            const toCheckPerimeter = getSheetUsage(toCheck[toCheck.length - 1]).boundingPerimeter;

            if (toCheckPerimeter < bestPerimeter) {
                return toCheck;
            }
            return best;
        }
        return best;
    }, null)!;

    return [best, discarded];
};

const getSheetUsage = (box: PackedOf<unknown>[]) => {
    const res = box.reduce<{ width: number; height: number; x: number; y: number; usedArea: number }>(
        (acc, each) => {
            acc.x = Math.min(acc.x, each.x);
            acc.y = Math.min(acc.y, each.x);
            acc.width = Math.max(acc.width, each.width + each.x);
            acc.height = Math.max(acc.height, each.height + each.x);
            acc.usedArea += each.width * each.height;
            return acc;
        },
        { width: -Infinity, height: -Infinity, usedArea: 0, x: Infinity, y: Infinity }
    );

    return {
        ...res,
        boundingArea: res.height * res.width,
        unusedArea: res.height * res.width - res.usedArea,
        boundingPerimeter: res.height * 2 + res.width * 2,
        boundingSquareness: Math.min(res.width / res.height, res.height / res.width),
    };
};

const SORT_DIRS = {
    ASC: (fn: (...args: any[]) => number) => fn,
    DESC:
        (fn: (...args: any[]) => number) =>
        (...args: any[]) =>
            fn(...args) * 1,
} as const;

const SORT_METHODS = {
    AREA: (a: RectOf<unknown>, b: RectOf<unknown>) => (getArea(a) < getArea(b) ? -1 : 1),
    SHORT_SIDE: (a: RectOf<unknown>, b: RectOf<unknown>) => {
        const aS = getSides(a);
        const bS = getSides(b);
        if (aS.short === bS.short) {
            return aS.long < bS.long ? -1 : 1;
        }
        return aS.short < bS.short ? -1 : 1;
    },
    LONG_SIDE: (a: RectOf<unknown>, b: RectOf<unknown>) => {
        const aS = getSides(a);
        const bS = getSides(b);
        if (aS.long === bS.long) {
            return aS.short < bS.short ? -1 : 1;
        }
        return aS.long < bS.long ? -1 : 1;
    },
    PERIMETER: (a: RectOf<unknown>, b: RectOf<unknown>) => (getPerimeter(a) < getPerimeter(b) ? -1 : 1),
    DIFFERENCES: (a: RectOf<unknown>, b: RectOf<unknown>) => (Math.abs(a.width - a.height) < Math.abs(b.width - b.height) ? -1 : 1),
    RATIO: (a: RectOf<unknown>, b: RectOf<unknown>) => (a.width / a.height < b.width / b.height ? -1 : 1),
} as const;

const splitHorizontally = (rectangle: Box, width: number, height: number, kerf: number): [Box, Box] => {
    const rectangle1 = {
        y: rectangle.y,
        x: rectangle.x + width + kerf,
        w: rectangle.w - width - kerf,
        h: height,
        b: rectangle.b,
    };
    const rectangle2 = {
        b: rectangle.b,
        x: rectangle.x,
        w: rectangle.w,
        y: rectangle.y + height + kerf,
        h: rectangle.h - height - kerf,
    };
    return [rectangle1, rectangle2];
};
const splitVertically = (rectangle: Box, width: number, height: number, kerf: number): [Box, Box] => {
    const rectangle1 = {
        x: rectangle.x,
        y: rectangle.y + height + kerf,
        w: width,
        h: rectangle.h - height - kerf,
        b: rectangle.b,
    };
    const rectangle2 = {
        h: rectangle.h,
        b: rectangle.b,
        x: rectangle.x + width + kerf,
        y: rectangle.y,
        w: rectangle.w - width - kerf,
    };
    return [rectangle1, rectangle2];
};

const SPLIT_METHODS = {
    SHORT_AXIS: (rectangle: Box, width: number, height: number, kerf: number) => {
        return rectangle.w < rectangle.h ? splitHorizontally(rectangle, width, height, kerf) : splitVertically(rectangle, width, height, kerf);
    },
    LONG_AXIS: (rectangle: Box, width: number, height: number, kerf: number) => {
        return rectangle.w > rectangle.h ? splitHorizontally(rectangle, width, height, kerf) : splitVertically(rectangle, width, height, kerf);
    },
    SHORT_REMAIN: (rectangle: Box, width: number, height: number, kerf: number) => {
        return rectangle.w - width < rectangle.h - height ? splitHorizontally(rectangle, width, height, kerf) : splitVertically(rectangle, width, height, kerf);
    },
    LONG_REMAIN: (rectangle: Box, width: number, height: number, kerf: number) => {
        return rectangle.w - width >= rectangle.h - height ? splitHorizontally(rectangle, width, height, kerf) : splitVertically(rectangle, width, height, kerf);
    },
} as const;

const SELECT_METHODS = {
    SHORT_SIDE: (rect: Box, item: RectOf<unknown>) => Math.min(rect.w - item.width, rect.h - item.height),
    LONG_SIDE: (rect: Box, item: RectOf<unknown>) => Math.max(rect.w - item.width, rect.h - item.height),
    AREA: (rect: Box, item: RectOf<unknown>) => rect.w * rect.h,
} as const;

const runSelect = (rectangles: Box[], item: RectOf<unknown>, method: (rect: Box, item: RectOf<unknown>) => number) => {
    const [best] = rectangles
        .filter((fr) => {
            return fr.w - item.width >= 0 && fr.h - item.height >= 0;
        })
        .map((r) => {
            return { rectangle: r, sortValue: method(r, item) };
        })
        .sort((a, b) => {
            return a.sortValue > b.sortValue ? 1 : -1;
        });

    return best ? best.rectangle : null;
};

const doFixedPack = <P>(
    binWidth: number,
    binHeight: number,
    items: RectOf<P>[],
    splitStrategy: keyof typeof SPLIT_METHODS,
    selectionStrategy: keyof typeof SELECT_METHODS,
    sortStrategy: keyof typeof SORT_METHODS,
    sortOrder: "DESC" | "ASC",
    kerfSize: number,
    allowRotation: boolean
) => {
    let binCount = 0;
    const freeRectangles: Box[] = [];

    const createBin = () => {
        binCount++;
        freeRectangles.push({
            w: binWidth,
            h: binHeight,
            x: 0,
            y: 0,
            b: binCount,
        });
    };

    const sortedItems = items.sort(SORT_DIRS[sortOrder](SORT_METHODS[sortStrategy])).map((each) => {
        return { ...each, rotated: false };
    });

    const rotateItem = (item: RectOf<P> & { rotated: boolean }) => {
        return { ...item, height: item.width, width: item.height, rotated: !item.rotated };
    };

    const splitRectangle = ({ rectangle, item }: { rectangle: Box; item: RectOf<P> }) => {
        return SPLIT_METHODS[splitStrategy](rectangle, item.width, item.height, kerfSize).filter((r) => r.w > 0 && r.h > 0);
    };

    const getSelectionOption = (item: RectOf<P> & { rotated: boolean }) => {
        const rectangle = runSelect(freeRectangles, item, SELECT_METHODS[selectionStrategy]);
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

    const selectRectangleOption = (item: RectOf<P> & { rotated: boolean }) => {
        const originalOption = getSelectionOption(item);
        let rotatedOption = null;
        let rotatedItem;
        if (allowRotation) {
            rotatedItem = rotateItem(item);
            rotatedOption = getSelectionOption(rotatedItem);
        }
        if (originalOption === null && rotatedOption === null) {
            return null;
        } else if (originalOption === null) {
            return rotatedOption;
        } else if (rotatedOption === null) {
            return originalOption;
        } else {
            const getBiggestSplitRectangle = ({ splitRectangles }: { splitRectangles: Box[] }) => Math.max(...splitRectangles.map((split) => split.h * split.w));
            if (getBiggestSplitRectangle(originalOption) >= getBiggestSplitRectangle(rotatedOption)) {
                return originalOption;
            } else {
                return rotatedOption;
            }
        }
    };

    const sheets = sortedItems
        .map((item, idx) => {
            let selectedOption = selectRectangleOption(item);
            if (!selectedOption) {
                createBin();
                selectedOption = selectRectangleOption(item);
            }
            if (!selectedOption) {
                //throw new Error(`item at index ${idx} with dimensions ${item.width}x${item.height} exceeds bin dimensions of ${binWidth}x${binHeight}`);
                return null;
            }
            const { rectangle, splitRectangles } = selectedOption;
            const { width, height, rotated, payload } = selectedOption.item;
            const packedItem = {
                payload,
                width,
                height,
                rotated: !!rotated,
                x: rectangle.x,
                y: rectangle.y,
                bin: rectangle.b,
            };
            const rectIndex = freeRectangles.findIndex((r) => r === rectangle);
            freeRectangles.splice(rectIndex, 1, ...splitRectangles);
            return packedItem;
        })
        .reduce<PackedOf<P>[][]>((bins, item) => {
            if (item) {
                if (bins.length >= item.bin) {
                    bins[item.bin - 1].push(item);
                } else {
                    bins.push([item]);
                }
            }
            return bins;
        }, []);

    return sheets;
};

const getArea = (item: RectOf<unknown>) => item.height * item.width;
const getPerimeter = (item: RectOf<unknown>) => item.height * 2 + item.width * 2;

const getSides = (item: RectOf<unknown>) => ({
    short: Math.min(item.width, item.height),
    long: Math.max(item.width, item.height),
});

const bunchOfConcats = (a: any[], b: any[]) => ([] as any[]).concat(...a.map((d) => b.map((e) => [].concat(d, e))));
const cartesian = (a: any[], b?: any[], ...c: any): any[] => (b ? cartesian(bunchOfConcats(a, b), ...c) : a);
