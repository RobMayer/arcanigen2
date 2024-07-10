export namespace Pack {
    /* Types */

    type Rect = { width: number; height: number };

    export type RectOf<P> = Rect & { payload: P };
    export type PackedOf<P> = Rect & { rotated: boolean; x: number; y: number; payload: P; bin: number };
    export type SheetOf<P> = Rect & { items: PackedOf<P>[] };
    type Box = {
        x: number;
        y: number;
        w: number;
        h: number;
        r?: Box;
        d?: Box;
        b: number;
    };

    type Proc<P> = Rect & { payload: P } & { rotated: boolean };

    /* Main */

    const doPack = <P>(
        width: number,
        height: number,
        items: RectOf<P>[],
        kerf: number,
        allowRotation: boolean,
        splitStrategy: keyof typeof SPLIT_METHODS,
        selectionStrategy: keyof typeof SELECT_METHODS,
        sortStrategy: keyof typeof SORT_METHODS,
        sortOrder: keyof typeof SORT_DIRS
    ): [SheetOf<P>[], RectOf<P>[]] => {
        const dynamicWidth = width === 0;
        const dynamicHeight = height === 0;
        const dynamicBoth = dynamicWidth && dynamicHeight;

        // This shouldn't really be here - this should be hoisted up to the other place, otherwise: it's a duplication of work.

        if (dynamicHeight) {
            sortOrder = "DESC";
            sortStrategy = "WIDTH";
            if (allowRotation) {
                sortStrategy = "LONG_SIDE";
            }
        }
        if (dynamicWidth) {
            sortOrder = "DESC";
            sortStrategy = "HEIGHT";
            if (allowRotation) {
                sortStrategy = "LONG_SIDE";
            }
        }
        if (dynamicBoth) {
            sortOrder = "DESC";
            sortStrategy = "AREA";
        }

        let sheetCount = 0;
        const freeRectangles: Box[] = [];
        let runningWidth = 0;
        let runningHeight = 0;

        const createSheet = () => {
            freeRectangles.push({
                w: width + kerf,
                h: height + kerf,
                x: 0,
                y: 0,
                b: sheetCount,
            });
            sheetCount++;
        };

        const growSheet = (dir: "RIGHT" | "DOWN", w: number, h: number) => {
            if (dir === "RIGHT") {
                freeRectangles.push({
                    w: w,
                    h: runningHeight,
                    x: runningWidth + kerf,
                    y: 0,
                    b: 0,
                });

                runningWidth += w + kerf;
            } else {
                freeRectangles.push({
                    w: runningWidth,
                    h: h,
                    x: 0,
                    y: runningHeight + kerf,
                    b: 0,
                });
                runningHeight += h + kerf;
            }
        };

        const [sortedItems, discarded]: [Proc<P>[], RectOf<P>[]] = items.sort(SORT_DIRS[sortOrder](SORT_METHODS[sortStrategy])).reduce<[Proc<P>[], RectOf<P>[]]>(
            (acc, each) => {
                const item = { ...each, rotated: false };
                if (dynamicBoth) {
                    acc[0].push(item);
                    return acc;
                }
                if (dynamicHeight) {
                    if (width >= each.width) {
                        acc[0].push(item);
                        return acc;
                    }
                    if (allowRotation && width >= each.height) {
                        acc[0].push(item);
                        return acc;
                    }
                    acc[1].push(item);
                    return acc;
                }
                if (dynamicWidth) {
                    if (height >= each.height) {
                        acc[0].push(item);
                        return acc;
                    }
                    if (allowRotation && height >= each.width) {
                        acc[0].push(item);
                        return acc;
                    }
                    acc[1].push(item);
                    return acc;
                }
                if (width >= each.width && height >= each.height) {
                    acc[0].push(item);
                    return acc;
                }
                if (allowRotation && height >= each.width && width >= each.height) {
                    acc[0].push(item);
                    return acc;
                }
                acc[1].push(each);
                return acc;
            },
            [[], []]
        );

        if (dynamicHeight || dynamicWidth) {
            // set up first box for first item...
            const start = sortedItems[0];
            freeRectangles.push({
                w: dynamicWidth ? start.width : width,
                h: dynamicHeight ? start.height : height,
                x: 0,
                y: 0,
                b: 0,
            });
            runningWidth += dynamicWidth ? start.width : width;
            runningHeight += dynamicHeight ? start.height : height;
        }

        const sheets = sortedItems
            .map((item, idx) => {
                let selectedOption = selectRectangleOption(freeRectangles, item, kerf, allowRotation, selectionStrategy, splitStrategy);
                if (!selectedOption) {
                    if (dynamicWidth || dynamicHeight) {
                        if (dynamicWidth && dynamicHeight) {
                            const resIfRight = getSquareness({ width: runningWidth + item.width, height: runningHeight });
                            const resIfDown = getSquareness({ width: runningWidth, height: runningHeight + item.height });
                            if (resIfDown > resIfRight) {
                                growSheet("DOWN", item.width, item.height);
                            } else {
                                growSheet("RIGHT", item.width, item.height);
                            }
                        } else if (dynamicHeight) {
                            growSheet("DOWN", item.width, item.height);
                        } else if (dynamicWidth) {
                            growSheet("RIGHT", item.width, item.height);
                        }
                    } else {
                        createSheet();
                    }
                    selectedOption = selectRectangleOption(freeRectangles, item, kerf, allowRotation, selectionStrategy, splitStrategy);
                }
                if (!selectedOption) {
                    //throw new Error(`item at index ${idx} with dimensions ${item.width}x${item.height} exceeds bin dimensions of ${binWidth}x${binHeight}`);
                    return null;
                }
                const { rectangle, splitRectangles } = selectedOption;
                const { width, height, rotated, payload } = selectedOption.item;
                const packedItem: PackedOf<P> = {
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
            .reduce<SheetOf<P>[]>((acc, item) => {
                if (item) {
                    if (!(item.bin in acc)) {
                        acc[item.bin] = {
                            height: -Infinity,
                            width: -Infinity,
                            items: [],
                        };
                    }
                    acc[item.bin].width = dynamicWidth ? Math.max(item.width + item.x, acc[item.bin].width) : width;
                    acc[item.bin].height = dynamicHeight ? Math.max(item.height + item.y, acc[item.bin].height) : height;
                    acc[item.bin].items.push(item);
                }
                return acc;
            }, []);

        return [sheets, discarded];
    };

    export const pack = <P>(width: number, height: number, items: RectOf<P>[], kerf: number = 0): [SheetOf<P>[], RectOf<P>[]] => {
        if (items.length === 0) {
            return [[], []];
        }

        const dynamicWidth = width === 0;
        const dynamicHeight = height === 0;

        let sortStrats: (keyof typeof SORT_METHODS)[] = Object.keys(SORT_METHODS) as (keyof typeof SORT_METHODS)[];

        if (dynamicWidth) {
            sortStrats = ["HEIGHT"];
        }
        if (dynamicWidth) {
            sortStrats = ["WIDTH"];
        }
        if (dynamicHeight && dynamicWidth) {
            sortStrats = ["AREA"];
        }

        const strategies = cartesian(Object.keys(SELECT_METHODS), Object.keys(SPLIT_METHODS), sortStrats, dynamicHeight || dynamicWidth ? ["DESC"] : Object.keys(SORT_DIRS), [true, false]);

        const results = strategies.map(([selection, split, sort, order, rotate]) => doPack(width, height, items, kerf, rotate, split, selection, sort, order));

        // find best solution...
        const done = results.reduce<[SheetOf<P>[], RectOf<P>[]] | null>((best, toCheck) => {
            if (!best) {
                return toCheck;
            }
            if (best[0].length === 0) {
                return toCheck;
            }
            // fewer missed items are better
            if (toCheck[1].length < best[1].length) {
                return toCheck;
            }
            // fewer pages are better
            if (toCheck[0].length < best[0].length) {
                return toCheck;
            }
            if (toCheck[0].length === best[0].length) {
                const bestUsage = getSheetUsage(best[0][best[0].length - 1].items);
                const toCheckUesage = getSheetUsage(best[0][best[0].length - 1].items);

                //more unused area is better
                if (toCheckUesage.unusedArea > bestUsage.unusedArea) {
                    return toCheck;
                }
                //more square-ish is better
                if (toCheckUesage.boundingPerimeter > bestUsage.boundingPerimeter) {
                    return toCheck;
                }
                return best;
            }
            return best;
        }, null)!;
        return done;
    };

    /* Options */

    const SORT_DIRS = {
        ASC: (fn: (...args: any[]) => number) => fn,
        DESC:
            (fn: (...args: any[]) => number) =>
            (...args: any[]) =>
                fn(...args) * -1,
    } as const;

    const SORT_METHODS = {
        AREA: (a: RectOf<unknown>, b: RectOf<unknown>) => (getArea(a) < getArea(b) ? -1 : 1),
        WIDTH: (a: Rect, b: Rect) => (a.width > b.width ? -1 : 1),
        HEIGHT: (a: Rect, b: Rect) => (a.height > b.height ? -1 : 1),
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

    /* Utility */

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

    const bunchOfConcats = (a: any[], b: any[]) => ([] as any[]).concat(...a.map((d) => b.map((e) => [].concat(d, e))));
    const cartesian = (a: any[], b?: any[], ...c: any): any[] => (b ? cartesian(bunchOfConcats(a, b), ...c) : a);

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

    const getSelectionOption = <P>(freeRectangles: Box[], item: Proc<P>, kerf: number, selectionStrategy: keyof typeof SELECT_METHODS, splitStrategy: keyof typeof SPLIT_METHODS) => {
        const rectangle = runSelect(freeRectangles, item.width, item.height, SELECT_METHODS[selectionStrategy]);
        if (!rectangle) {
            return null;
        }
        //const splitRectangles = splitRectangle({ rectangle: rectangle, item });
        const splitRectangles = SPLIT_METHODS[splitStrategy](rectangle, item.width, item.height, kerf).filter((r) => r.w > 0 && r.h > 0);
        return {
            rectangle,
            splitRectangles,
            item,
        };
    };

    const selectRectangleOption = <P>(
        freeRectangles: Box[],
        item: Proc<P>,
        kerf: number,
        allowRotation: boolean,
        selectionStrategy: keyof typeof SELECT_METHODS,
        splitStrategy: keyof typeof SPLIT_METHODS
    ) => {
        const originalOption = getSelectionOption(freeRectangles, item, kerf, selectionStrategy, splitStrategy);
        let rotatedOption = null;
        let rotatedItem;
        if (allowRotation) {
            rotatedItem = { ...item, height: item.width, width: item.height, rotated: !item.rotated };
            rotatedOption = getSelectionOption(freeRectangles, rotatedItem, kerf, selectionStrategy, splitStrategy);
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

    /* Analysis */

    const getArea = (item: Rect) => item.height * item.width;
    const getPerimeter = (item: Rect) => item.height * 2 + item.width * 2;

    const getSides = (item: Rect) => ({
        short: Math.min(item.width, item.height),
        long: Math.max(item.width, item.height),
    });

    const getSquareness = (item: Rect) => Math.min(item.width / item.height, item.height / item.width);

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
}
