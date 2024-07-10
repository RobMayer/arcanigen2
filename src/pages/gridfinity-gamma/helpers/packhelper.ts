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

export const packDynamic = <P>(items: RectOf<P>[], kerf: number = 0): [PackedOf<P>[][], RectOf<P>[]] => {
    if (items.length === 0) {
        return [[], []];
    }

    const strategies = cartesian(Object.keys(SELECT_METHODS), Object.keys(SPLIT_METHODS), [true, false]);
    const packed = strategies.map(([selection, split, rotate]) => doDynamicPack(items, split, selection, kerf, rotate));

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
            const bestPerimeter = getSheetUsage(best[best.length - 1]).boundingSquareness;
            const toCheckPerimeter = getSheetUsage(toCheck[toCheck.length - 1]).boundingSquareness;

            if (toCheckPerimeter < bestPerimeter) {
                return toCheck;
            }
            return best;
        }
        return best;
    }, null)!;

    return [best, []];
};

export const packFixed = <P>(binWidth: number, binHeight: number, items: RectOf<P>[], kerf: number = 0): [PackedOf<P>[][], RectOf<P>[]] => {
    if (items.length === 0) {
        return [[], []];
    }

    // Todo: Move this into doPack so I can adjust for "allow rotation"
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

const SORT_DIRS = {
    ASC: (fn: (...args: any[]) => number) => fn,
    DESC:
        (fn: (...args: any[]) => number) =>
        (...args: any[]) =>
            fn(...args) * -1,
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

const SPLIT_METHODS = {
    HORIZONTALLY: (rectangle: Box, width: number, height: number, kerf: number) => {
        return splitHorizontally(rectangle, width, height, kerf);
    },
    VERTICALLY: (rectangle: Box, width: number, height: number, kerf: number) => {
        return splitVertically(rectangle, width, height, kerf);
    },
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
    SHORT_SIDE: (rect: Box, width: number, height: number) => Math.min(rect.w - width, rect.h - height),
    LONG_SIDE: (rect: Box, width: number, height: number) => Math.max(rect.w - width, rect.h - height),
    AREA: (rect: Box, width: number, height: number) => rect.w * rect.h,
} as const;

const doDynamicPack = <P>(items: RectOf<P>[], splitStrategy: keyof typeof SPLIT_METHODS, selectionStrategy: keyof typeof SELECT_METHODS, kerfSize: number, allowRotation: boolean) => {
    if (items.length === 0) {
        return [];
    }

    let runningWidth = 0;
    let runningHeight = 0;

    const freeRectangles: Box[] = [];

    const sortedItems = items.toSorted(SORT_DIRS["DESC"](SORT_METHODS["AREA"])).map((each) => {
        return { ...each, rotated: false };
    });

    const start = sortedItems[0];

    freeRectangles.push({
        w: start.width,
        h: start.height,
        x: 0,
        y: 0,
        b: 0,
    });

    runningWidth += start.width;
    runningHeight += start.height;

    const grow = (dir: "RIGHT" | "DOWN", w: number, h: number) => {
        if (dir === "RIGHT") {
            freeRectangles.push({
                w: w,
                h: runningHeight,
                x: runningWidth + kerfSize,
                y: 0,
                b: 0,
            });

            runningWidth += w + kerfSize;
        } else {
            freeRectangles.push({
                w: runningWidth,
                h: h,
                x: 0,
                y: runningHeight + kerfSize,
                b: 0,
            });
            runningHeight += h + kerfSize;
        }
    };

    const createBin = (w: number, h: number) => {
        const resIfRight = getSquareness({ width: runningWidth + w, height: runningHeight });
        const resIfDown = getSquareness({ width: runningWidth, height: runningHeight + h });

        const method = resIfDown > resIfRight ? "DOWN" : "RIGHT";
        grow(method, w, h);
    };

    const getSelectionOption = (item: RectOf<P> & { rotated: boolean }) => {
        const rectangle = runSelect(freeRectangles, item.width, item.height, SELECT_METHODS[selectionStrategy]);
        if (!rectangle) {
            return null;
        }
        //const splitRectangles = splitRectangle({ rectangle: rectangle, item });
        const splitRectangles = SPLIT_METHODS[splitStrategy](rectangle, item.width, item.height, kerfSize).filter((r) => r.w > 0 && r.h > 0);
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
            rotatedItem = { ...item, height: item.width, width: item.height, rotated: !item.rotated };
            rotatedOption = getSelectionOption(rotatedItem);
        }
        if (originalOption === null && rotatedOption === null) {
            return null;
        } else if (originalOption === null) {
            return rotatedOption;
        } else if (rotatedOption === null) {
            return originalOption;
        } else {
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
                createBin(item.width, item.height);
                selectedOption = selectRectangleOption(item);
            }
            if (!selectedOption) {
                console.error("ERM");
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
        .reduce<PackedOf<P>[][]>(
            (bins, item) => {
                if (item) {
                    bins[0].push(item);
                }
                return bins;
            },
            [[]]
        );

    return sheets;
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

    // TODO: Can I hook into this with a growing thing?
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

    const getSelectionOption = (item: RectOf<P> & { rotated: boolean }) => {
        const rectangle = runSelect(freeRectangles, item.width, item.height, SELECT_METHODS[selectionStrategy]);
        if (!rectangle) {
            return null;
        }
        //const splitRectangles = splitRectangle({ rectangle: rectangle, item });
        const splitRectangles = SPLIT_METHODS[splitStrategy](rectangle, item.width, item.height, kerfSize).filter((r) => r.w > 0 && r.h > 0);
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
            rotatedItem = { ...item, height: item.width, width: item.height, rotated: !item.rotated };
            rotatedOption = getSelectionOption(rotatedItem);
        }
        if (originalOption === null && rotatedOption === null) {
            return null;
        } else if (originalOption === null) {
            return rotatedOption;
        } else if (rotatedOption === null) {
            return originalOption;
        } else {
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

/* Utility */

const runSelect = (rectangles: Box[], width: number, height: number, method: (rect: Box, width: number, height: number) => number) => {
    const [best] = rectangles
        .filter((fr) => {
            return fr.w - width >= 0 && fr.h - height >= 0;
        })
        .map((r) => {
            return { rectangle: r, sortValue: method(r, width, height) };
        })
        .sort((a, b) => {
            return a.sortValue > b.sortValue ? 1 : -1;
        });

    return best ? best.rectangle : null;
};

const getBiggestSplitRectangle = ({ splitRectangles }: { splitRectangles: Box[] }) => Math.max(...splitRectangles.map((split) => split.h * split.w));

/* Analysis */

const getArea = (item: Rect) => item.height * item.width;
const getPerimeter = (item: Rect) => item.height * 2 + item.width * 2;

const getSides = (item: Rect) => ({
    short: Math.min(item.width, item.height),
    long: Math.max(item.width, item.height),
});

const getSquareness = (item: Rect) => Math.min(item.width / item.height, item.height / item.width);

const bunchOfConcats = (a: any[], b: any[]) => ([] as any[]).concat(...a.map((d) => b.map((e) => [].concat(d, e))));
const cartesian = (a: any[], b?: any[], ...c: any): any[] => (b ? cartesian(bunchOfConcats(a, b), ...c) : a);

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
