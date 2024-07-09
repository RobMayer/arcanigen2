import { Enum } from "../types";

type Rect = { width: number; height: number };

export type RectOf<P> = Rect & { payload: P };
export type PackedOf<P> = Rect & { rotated: boolean; x: number; y: number; payload: P };

const doHorizontalSplit = (box: Box, w: number, h: number) => {
    box.d = {
        x: box.x,
        y: box.y + h,
        w: box.w,
        h: box.h - h,
    };
    box.r = {
        x: box.x + w,
        y: box.y,
        w: box.w - w,
        h: h,
    };
    return box;
};

const doVerticalSplit = (box: Box, w: number, h: number) => {
    box.d = {
        x: box.x,
        y: box.y + h,
        w: w,
        h: box.h - h,
    };
    box.r = {
        x: box.x + w,
        y: box.y,
        w: box.w - w,
        h: box.h,
    };
    return box;
};

type Box = {
    x: number;
    y: number;
    w: number;
    h: number;
    r?: Box;
    d?: Box;
};

export const SortMethods = {
    AREA: "AREA",
    LONGEST: "LONGEST",
    SHORTEST: "SHORTEST",
    PERIMETER: "PERIMETER",
    SQUAREMESS: "SQUARENESS",
} as const;

export type SortMethod = Enum<typeof SortMethods>;

const SORT_METHODS: { [key in SortMethod]: (a: Rect, b: Rect) => number } = {
    AREA: (a: Rect, b: Rect) => (a.width * a.height < b.width * b.height ? 1 : -1),
    LONGEST: (a: Rect, b: Rect) => (Math.max(a.width, a.height) < Math.max(b.width, b.height) ? 1 : -1),
    SHORTEST: (a: Rect, b: Rect) => (Math.min(a.width, a.height) < Math.min(b.width, b.height) ? 1 : -1),
    PERIMETER: (a: Rect, b: Rect) => (a.width + a.height < b.width + b.height ? 1 : -1),
    SQUARENESS: (a: Rect, b: Rect) => (Math.abs(1 - a.width / a.height) > Math.abs(1 - b.width / b.height) ? 1 : -1),
} as const;

export const SortDirections = {
    ASC: "ASC",
    DESC: "DESC",
} as const;

export type SortDirection = Enum<typeof SortDirections>;

const SORT_DIRETIONS = {
    DESC: (fn: (...args: any[]) => number) => fn,
    ASC:
        (fn: (...args: any[]) => number) =>
        (...args: any[]) =>
            fn(...args) * -1,
} as const;

const PICK_METHODS: { [key in PickMethod]: (w: number, h: number) => (a: Box, b: Box) => number } = {
    AREA: (w: number, h: number) => (a: Box, b: Box) => a.w * a.h > b.w * b.h ? 1 : -1,
    LONG: (w: number, h: number) => (a: Box, b: Box) => Math.max(a.w - w, a.h - h) > Math.max(b.w - w, b.h - h) ? 1 : -1,
    SHORT: (w: number, h: number) => (a: Box, b: Box) => Math.min(a.w - w, a.h - h) > Math.min(b.w - w, b.h - h) ? 1 : -1,
};

export const PickMethods = {
    AREA: "AREA",
    LONG: "LONG",
    SHORT: "SHORT",
} as const;
export type PickMethod = Enum<typeof PickMethods>;

const SPLIT_METHODS: { [key in SplitMethod]: (box: Box, w: number, h: number) => Box } = {
    SHORTEST: (box: Box, w: number, h: number) => (box.w < box.h ? doHorizontalSplit(box, w, h) : doVerticalSplit(box, w, h)),
    LONGEST: (box: Box, w: number, h: number) => (box.w > box.h ? doHorizontalSplit(box, w, h) : doVerticalSplit(box, w, h)),
    SHORTEST_REMAIN: (box: Box, w: number, h: number) => (box.w - w < box.h - h ? doHorizontalSplit(box, w, h) : doVerticalSplit(box, w, h)),
    LONGEST_REMAIN: (box: Box, w: number, h: number) => (box.w - w >= box.h - h ? doHorizontalSplit(box, w, h) : doVerticalSplit(box, w, h)),
} as const;

export const SplitMethods = {
    SHORTEST: "SHORTEST",
    LONGEST: "LONGEST",
    SHORTEST_REMAIN: "SHORTEST_REMAIN",
    LONGEST_REMAIN: "LONGEST_REMAIN",
} as const;
export type SplitMethod = Enum<typeof SplitMethods>;

export type PackOptions = {
    sortMethod: SortMethod;
    sortDirection: SortDirection;
    splitMethod: SplitMethod;
    pickMethod: PickMethod;
};

const DEFAULT_OPTIONS: PackOptions = {
    sortMethod: "AREA",
    sortDirection: "ASC",
    splitMethod: "SHORTEST_REMAIN",
    pickMethod: "AREA",
};

export const packFixed = <P>(width: number, height: number, items: RectOf<P>[], options: Partial<PackOptions> = {}): [PackedOf<P>[][], RectOf<P>[]] => {
    const opt = { ...DEFAULT_OPTIONS, ...options } as PackOptions;

    items = items.toSorted(SORT_DIRETIONS[opt.sortDirection](SORT_METHODS[opt.sortMethod]));

    const sheets: Box[] = [{ x: 0, y: 0, w: width, h: height }];

    const findBox = (box: Box, w: number, h: number): Box | null => {
        if ("r" in box && "d" in box) {
            const [first, second] = [box.r!, box.d!].toSorted(PICK_METHODS[opt.pickMethod](w, h));

            // const [first, second] = [box.r!, box.d!].toSorted(PickMethods[opt.pickMethod]);
            return findBox(first, w, h) || findBox(second, w, h);
        } else if (w <= box.w && h <= box.h) {
            return box;
        } else {
            return null;
        }
    };

    const splitBox = (box: Box, w: number, h: number): Box => SPLIT_METHODS[opt.splitMethod](box, w, h);

    const [canFit, cannotFit] = items.reduce<[RectOf<P>[], RectOf<P>[]]>(
        (acc, each) => {
            const idx = each.width > width || each.height > height ? 1 : 0;
            acc[idx].push(each);
            return acc;
        },
        [[], []]
    );

    const result: PackedOf<P>[][] = [];

    canFit.forEach((rect) => {
        let sheetIndex = sheets.findIndex((rootBox, i) => {
            const fBox = findBox(rootBox, rect.width, rect.height);
            return fBox !== null;
        });
        if (sheetIndex === -1) {
            sheetIndex = sheets.length;
            sheets.push({ x: 0, y: 0, w: width, h: height });
        }
        const foundBox = findBox(sheets[sheetIndex], rect.width, rect.height);
        if (foundBox) {
            result[sheetIndex] = result[sheetIndex] ?? [];
            result[sheetIndex].push({
                width: rect.width,
                height: rect.height,
                payload: rect.payload,
                x: foundBox.x,
                y: foundBox.y,
                rotated: false,
            });
            splitBox(foundBox, rect.width, rect.height);
        }
    });

    return [result, cannotFit];
};

export const packDynamic = <P>(items: RectOf<P>[]) => {
    items = items.toSorted(SORT_DIRETIONS.DESC(SORT_METHODS.AREA));
    const result: PackedOf<P>[] = [];

    let root: Box = { x: 0, y: 0, w: items[0].width, h: items[0].height };

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
        box.d = { x: box.x, y: box.y + h, w: box.w, h: box.h - h };
        box.r = { x: box.x + w, y: box.y, w: box.w - w, h };
        return box;
    };

    const growDown = (w: number, h: number) => {
        const r = root;
        root = {
            x: 0,
            y: 0,
            w: r.w,
            h: r.h + h,
            d: { x: 0, y: r.h, w: r.w, h: h },
            r: r,
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
            w: r.w + w,
            h: r.h,
            d: r,
            r: { x: r.w, y: 0, w: w, h: r.h },
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
            return growRight(w, h);
        }
        if (shouldGrowDown) {
            return growDown(w, h);
        }
        if (canGrowRight) {
            return growRight(w, h);
        }
        if (canGrowDown) {
            return growDown(w, h);
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
