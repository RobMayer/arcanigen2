import { Comparator } from "../types";

type Rect = { width: number; height: number };

type RectOf<P> = Rect & { payload: P };
export type PackedOf<P> = Rect & { rotated: boolean; x: number; y: number; payload: P };

type Box = {
    x: number;
    y: number;
    w: number;
    h: number;
    r?: Box;
    d?: Box;
};

const DEFAULT_METHOD = (a: Rect, b: Rect) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;

    if (areaA > areaB) {
        return -1;
    } else if (areaA < areaB) {
        return 1;
    } else {
        return 0;
    }
};

// TODO: add Margin and Spacing
// TODO: be more descripinating about which box subbox you find during findBox

export const packFixed = <P>(width: number, height: number, items: RectOf<P>[], sorter: Comparator<Rect> = DEFAULT_METHOD): [PackedOf<P>[][], RectOf<P>[]] => {
    items = items.toSorted(sorter);
    const result: PackedOf<P>[][] = [];

    const sheets: Box[] = [{ x: 0, y: 0, w: width, h: height }];

    const findBox = (box: Box, w: number, h: number): Box | null => {
        if ("r" in box && "d" in box) {
            //TODO: the find order is significant here - endeavour to make this more balanced based on... something
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

    const [canFit, cannotFit] = items.reduce<[RectOf<P>[], RectOf<P>[]]>(
        (acc, each) => {
            const idx = each.width > width || each.height > height ? 1 : 0;
            acc[idx].push(each);
            return acc;
        },
        [[], []]
    );

    canFit.forEach((rect) => {
        let sheetIndex = sheets.findIndex((rootBox, i) => {
            const fBox = findBox(rootBox, rect.width, rect.height);
            console.log({ fBox });
            return fBox !== null;
        });
        if (sheetIndex === -1) {
            sheetIndex = sheets.length;
            sheets.push({ x: 0, y: 0, w: width, h: height });
        }
        console.log({ sheetIndex });
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

export const packDynamic = <P>(items: RectOf<P>[], sorter: Comparator<Rect> = DEFAULT_METHOD) => {
    items = items.toSorted(sorter);
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
