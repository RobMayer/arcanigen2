import { Enum } from "../types";

export const drawRect = (w: number, h: number, anchor: Anchor = "MIDDLE CENTER") => {
    const [start, end] = offsetAnchor(w, h, anchor);
    return [start, `h ${w} v ${h} h ${-w} z`, end].join(" ");
};

export const cutRect = (w: number, h: number, anchor: Anchor = "MIDDLE CENTER") => {
    const [start, end] = offsetAnchor(w, h, anchor);
    return [start, `m ${w},${h}`, `v ${-h} h ${-w} v ${h} z`, `m ${-w},${-h}`, end].join(" ");
};

type Tabbed = {
    size: number;
    margin?: number;
    inset?: number | [number, number];
    thickness: number;
} & ({ tabs: number } | { divs: number });

const DIRECTIONS = {
    north: {
        primary: "h",
        secondary: "v",
        polarity: 1,
        concavity: 1,
        start: "west",
        end: "east",
        axis: "w",
    },
    east: {
        primary: "v",
        secondary: "h",
        polarity: 1,
        concavity: -1,
        start: "north",
        end: "south",
        axis: "h",
    },
    south: {
        primary: "h",
        secondary: "v",
        polarity: -1,
        concavity: -1,
        start: "east",
        end: "west",
        axis: "w",
    },
    west: {
        primary: "v",
        secondary: "h",
        polarity: -1,
        concavity: 1,
        start: "south",
        end: "north",
        axis: "h",
    },
} as const;

type Tab = {
    width: number;
    depth: number;
    spacing: number;
    count: number;
    offset?: number;
    // margin?: number;
};

type TabSet = {
    north: Tab | null;
    east: Tab | null;
    south: Tab | null;
    west: Tab | null;
};

export const drawNewTabRect = (w: number, h: number, { north, east, south, west }: Partial<TabSet> = {}): string => {
    const res: string[] = [];

    // res.push(`h ${w}`);
    // res.push(`v ${h}`);
    // res.push(`h ${-w}`);
    // res.push(`v ${-h}`);

    // offset starting point from origin based on weather north or south is convex or concave.
    const nComp = Math.max(north?.depth ?? 0, 0);
    const eComp = Math.max(east?.depth ?? 0, 0);
    const sComp = Math.max(south?.depth ?? 0, 0);
    const wComp = Math.max(west?.depth ?? 0, 0);

    res.push(`m ${wComp},${nComp}`);

    if (!north || north.count <= 0) {
        res.push(`h ${w - wComp - eComp}`);
    } else {
        const offset = north?.offset ?? 0;
        const gutter = w - north.spacing * (north.count - 1);
        const span = north.spacing - north.width;

        //draw to center of first tab
        res.push(`h ${gutter / 2 - wComp + offset - north.width / 2}`);
        res.push(`v ${-north.depth}`);
        res.push(`h ${north.width / 2}`);

        for (let i = 1; i <= Math.max(north.count - 1, 0); i++) {
            res.push(`h ${north.width / 2}`);
            res.push(`v ${north.depth}`);
            res.push(`h ${span}`);
            res.push(`v ${-north.depth}`);
            res.push(`h ${north.width / 2}`);
        }

        //draw from center of last tab to end
        res.push(`h ${north.width / 2}`);
        res.push(`v ${north.depth}`);
        res.push(`h ${gutter / 2 - eComp - offset - north.width / 2}`);
    }

    if (!east || east.count <= 0) {
        res.push(`v ${h - nComp - sComp}`);
    } else {
        const offset = east?.offset ?? 0;
        const gutter = h - east.spacing * (east.count - 1);
        const span = east.spacing - east.width;

        // from start to center of first tab
        res.push(`v ${gutter / 2 - east.width / 2 - nComp + offset}`);
        res.push(`h ${east.depth}`);
        res.push(`v ${east.width / 2}`);

        // for each tab count, go from center of tab to cent of next tab
        for (let i = 1; i <= Math.max(east.count - 1, 0); i++) {
            res.push(`v ${east.width / 2}`);
            res.push(`h ${-east.depth}`);
            res.push(`v ${span}`);
            res.push(`h ${east.depth}`);
            res.push(`v ${east.width / 2}`);
        }

        // from center of first tab to end
        res.push(`v ${east.width / 2}`);
        res.push(`h ${-east.depth}`);
        res.push(`v ${gutter / 2 - east.width / 2 - sComp - offset}`);
    }

    if (!south || south.count <= 0) {
        res.push(`h ${-(w - wComp - eComp)}`);
    } else {
        const offset = south?.offset ?? 0;
        const gutter = w - south.spacing * (south.count - 1);
        const span = south.spacing - south.width;

        // from start to center of first tab
        res.push(`h ${-(gutter / 2 - south.width / 2 - eComp + offset)}`);
        res.push(`v ${-(-south.depth)}`);
        res.push(`h ${-(south.width / 2)}`);

        // for each tab count, go from center of tab to cent of next tab
        for (let i = 1; i <= Math.max(south.count - 1, 0); i++) {
            res.push(`h ${-(south.width / 2)}`);
            res.push(`v ${-south.depth}`);
            res.push(`h ${-span}`);
            res.push(`v ${-(-south.depth)}`);
            res.push(`h ${-(south.width / 2)}`);
        }

        // from center of first tab to end
        res.push(`h ${-(south.width / 2)}`);
        res.push(`v ${-south.depth}`);
        res.push(`h ${-(gutter / 2 - south.width / 2 - wComp - offset)}`);
    }

    if (!west || west.count <= 0) {
        res.push(`v ${-(h - nComp - sComp)}`);
    } else {
        const offset = west?.offset ?? 0;
        const gutter = h - west.spacing * (west.count - 1);
        const span = west.spacing - west.width;

        // from start to center of first tab
        res.push(`v ${-(gutter / 2 - west.width / 2 - sComp + offset)}`);
        res.push(`h ${-west.depth}`);
        res.push(`v ${-(west.width / 2)}`);

        // for each tab count, go from center of tab to cent of next tab
        for (let i = 1; i <= Math.max(west.count - 1, 0); i++) {
            res.push(`v ${-(west.width / 2)}`);
            res.push(`h ${-(-west.depth)}`);
            res.push(`v ${-span}`);
            res.push(`h ${-west.depth}`);
            res.push(`v ${-(west.width / 2)}`);
        }

        // from center of first tab to end
        res.push(`v ${-(west.width / 2)}`);
        res.push(`h ${-(-west.depth)}`);
        res.push(`v ${-(gutter / 2 - west.width / 2 - nComp - offset)}`);
    }

    // res.push("z");

    res.push(`m ${-wComp},${-nComp}`);

    return res.join(" ");
};

export const drawTabbedRect = (w: number, h: number, north: Tabbed | null, east: Tabbed | null, south: Tabbed | null, west: Tabbed | null) => {
    const sizeOptions = {
        w,
        h,
    } as const;

    const tabOptions = {
        north,
        east,
        south,
        west,
    } as const;

    const lines = (["north", "east", "south", "west"] as const).reduce<string[]>((res, direction) => {
        const data = tabOptions[direction];
        const sData = tabOptions[DIRECTIONS[direction].start];
        const eData = tabOptions[DIRECTIONS[direction].end];
        const axis = sizeOptions[DIRECTIONS[direction].axis];
        const dirP = DIRECTIONS[direction].primary;
        const dirS = DIRECTIONS[direction].secondary;
        const polarity = DIRECTIONS[direction].polarity;
        const concavity = DIRECTIONS[direction].concavity;

        const mS = (sData?.margin ?? 0) + (!sData ? 0 : (("tabs" in sData && sData.tabs !== 0) || ("divs" in sData && sData.divs !== 0)) && sData.thickness < 0 ? -sData.thickness : 0);
        const mE = (eData?.margin ?? 0) + (!eData ? 0 : (("tabs" in eData && eData.tabs !== 0) || ("divs" in eData && eData.divs !== 0)) && eData.thickness < 0 ? -eData.thickness : 0);

        if (data && data.thickness !== 0 && (("tabs" in data && data.tabs !== 0) || ("divs" in data && data.divs !== 0))) {
            const [iS, iE] = data.inset ? (Array.isArray(data.inset) ? data.inset : [data.inset, data.inset]) : [0, 0];
            const thickness = data.thickness;
            const tabWidth = data.size;
            if ("tabs" in data) {
                const span = (axis - iS - iE) / data.tabs;
                const tabCount = data.tabs;

                for (let i = 1; i <= tabCount; i++) {
                    res.push(
                        i === 1 ? `${dirP} ${(span / 2 - tabWidth / 2 - mS + iS) * polarity}` : `${dirP} ${(span / 2 - tabWidth / 2) * polarity}`,
                        `${dirS} ${thickness * concavity}`,
                        `${dirP} ${tabWidth * polarity}`,
                        `${dirS} ${thickness * -concavity}`,
                        i === tabCount ? `${dirP} ${(span / 2 - tabWidth / 2 - mE + iE) * polarity}` : `${dirP} ${(span / 2 - tabWidth / 2) * polarity}`
                    );
                }
            }
            if ("divs" in data) {
                const span = (axis - iS - iE) / (data.divs + 1);
                const divCount = data.divs;

                for (let i = 1; i <= divCount; i++) {
                    res.push(
                        i === 1 ? `${dirP} ${(span - tabWidth / 2 - mS + iS) * polarity}` : `${dirP} ${(span / 2 - tabWidth / 2) * polarity}`,
                        `${dirS} ${thickness * concavity}`,
                        `${dirP} ${tabWidth * polarity}`,
                        `${dirS} ${thickness * -concavity}`,
                        i === divCount ? `${dirP} ${(span - tabWidth / 2 - mE + iE) * polarity}` : `${dirP} ${(span / 2 - tabWidth / 2) * polarity}`
                    );
                }
            }
        } else {
            res.push(`${dirP} ${(axis - mS - mE) * DIRECTIONS[direction].polarity}`);
        }
        return res;
    }, []);

    const mW = !west ? 0 : (("tabs" in west && west.tabs !== 0) || ("divs" in west && west.divs !== 0)) && west.thickness < 0 ? -west.thickness : 0;
    const mN = !north ? 0 : (("tabs" in north && north.tabs !== 0) || ("divs" in north && north.divs !== 0)) && north.thickness < 0 ? -north.thickness : 0;

    return [
        //
        `m ${-(w / 2)},${-(h / 2)}`,
        `m ${west?.margin ?? 0},${north?.margin ?? 0}`,
        `m ${mW},${mN}`,
        ...lines,
        "z",
        `m ${-mW},${-mN}`,
        `m ${-(west?.margin ?? 0)},${-(north?.margin ?? 0)}`,
        `m ${w / 2},${h / 2}`,
    ].join(" ");
};

type DrawArrayOptions = {
    count: number;
    spacing: number;
    offset?: number;
};

export const drawArray = (x: DrawArrayOptions, y: DrawArrayOptions, shape: string, anchor: Anchor = "MIDDLE CENTER") => {
    if (x.count === 0 || y.count === 0) {
        return "";
    }

    const w = (x.count - 1) * x.spacing;
    const h = (y.count - 1) * y.spacing;

    const [begin, end] = offsetAnchor(w, h, anchor);

    const shapes: string[] = [];

    for (let i = 0; i < x.count; i++) {
        for (let j = 0; j < y.count; j++) {
            shapes.push(
                //
                `m ${x.spacing * i},${y.spacing * j}`,
                shape,
                `m ${-x.spacing * i},${-y.spacing * j}`
            );
        }
    }

    return [
        //
        begin,
        `m ${x.offset ?? 0},${y.offset ?? 0}`,
        ...shapes,
        `m ${-(x.offset ?? 0)},${-(y.offset ?? 0)}`,
        end,
    ].join(" ");
};

export const drawFootBlock = ({ gridSize, gridInset, footClearance }: { gridSize: number; gridInset: number; footClearance: number }) => {
    const d = gridSize - gridInset * 2 - footClearance * 2;
    return drawRect(d, d);
};

export const drawFootBracket = ({ footBracketWidth }: { footBracketWidth: number }, gap: number = 3) => {
    const chamfer = footBracketWidth / 2;
    const offset = gap / 2;
    const SW = [
        `h ${footBracketWidth}`,
        `v ${footBracketWidth}`,
        `h ${-footBracketWidth}`,
        `h ${-(footBracketWidth - chamfer)}`,
        `l ${-chamfer},${-chamfer}`,
        `v ${-(footBracketWidth - chamfer)}`,
        `v ${-footBracketWidth}`,
        `h ${footBracketWidth}`,
        `z`,
    ].join(" ");

    const NE = [
        `h ${-footBracketWidth}`,
        `v ${-footBracketWidth}`,
        `h ${footBracketWidth}`,
        `h ${footBracketWidth - chamfer}`,
        `l ${chamfer},${chamfer}`,
        `v ${footBracketWidth - chamfer}`,
        `v ${footBracketWidth}`,
        `h ${-footBracketWidth}`,
        `z`,
    ].join(" ");

    const NW = [
        `v ${footBracketWidth}`,
        `h ${-footBracketWidth}`,
        `v ${-footBracketWidth}`,
        `v ${-(footBracketWidth - chamfer)}`,
        `l ${chamfer},${-chamfer}`,
        `h ${footBracketWidth - chamfer}`,
        `h ${footBracketWidth}`,
        `v ${footBracketWidth}`,
        `z`,
    ].join(" ");

    const SE = [
        `v ${-footBracketWidth}`,
        `h ${footBracketWidth}`,
        `v ${footBracketWidth}`,
        `v ${footBracketWidth - chamfer}`,
        `l ${-chamfer},${chamfer}`,
        `h ${-(footBracketWidth - chamfer)}`,
        `h ${-footBracketWidth}`,
        `v ${-footBracketWidth}`,
        `z`,
    ].join(" ");

    const pAxis = footBracketWidth + offset * 3;
    const sAxis = footBracketWidth * 1.5 + offset;

    const pOffset = footBracketWidth / 2 + offset;
    const sOffset = offset;

    //prettier-ignore
    return [
      // bottomleft

      `m ${-sAxis},${-pAxis}`,
         `m ${-sOffset},${-pOffset}`,
            NW,
         `m ${sOffset},${pOffset}`,

         `m ${sOffset},${pOffset}`,
            SE,
         `m ${-sOffset},${-pOffset}`,
      `m ${sAxis},${pAxis}`,

      `m ${pAxis},${-sAxis}`,
         `m ${pOffset},${-sOffset}`,
            NE,
         `m ${-pOffset},${sOffset}`,
         `m ${-pOffset},${sOffset}`,
            SW,
         `m ${pOffset},${-sOffset}`,
      `m ${-pAxis},${sAxis}`,

      `m ${sAxis},${pAxis}`,
         `m ${-sOffset},${-pOffset}`,
            NW,
         `m ${sOffset},${pOffset}`,

         `m ${sOffset},${pOffset}`,
            SE,
         `m ${-sOffset},${-pOffset}`,
      `m ${-sAxis},${-pAxis}`,

      `m ${-pAxis},${sAxis}`,
         `m ${pOffset},${-sOffset}`,
            NE,
         `m ${-pOffset},${sOffset}`,
         `m ${-pOffset},${sOffset}`,
            SW,
         `m ${pOffset},${-sOffset}`,
      `m ${pAxis},${-sAxis}`,
   ].join(" ");
};

export const drawFootRunner = ({ footRunnerGap, footRunnerTab, footDepth, gridThickness }: { footRunnerGap: number; footRunnerTab: number; footDepth: number; gridThickness: number }) => {
    const overallWidth = footRunnerGap + footRunnerTab * 2;
    const overallHeight = gridThickness + footDepth;
    const southLength = footRunnerGap + footRunnerTab * 2 - footDepth * 2;

    return [
        `m ${-(overallWidth / 2)},${-overallHeight / 2}`,
        `h ${footRunnerTab}`,
        `v ${gridThickness}`,
        `h ${footRunnerGap}`,
        `v ${-gridThickness}`,
        `h ${footRunnerTab}`,
        `v ${gridThickness}`,
        `l ${-footDepth},${footDepth}`,
        `h ${-southLength}`,
        `l ${-footDepth},${-footDepth}`,
        `z`,
        `m ${overallWidth / 2},${overallHeight / 2}`,
    ].join(" ");
};

/* ANCHOR WIP */
// TODO: Is this even needed?

const VerticalAnchors = {
    TOP: "TOP",
    MIDDLE: "MIDDLE",
    BOTTOM: "BOTTOM",
} as const;

type VerticalAnchor = Enum<typeof VerticalAnchors>;

const HorizontalAnchors = {
    LEFT: "LEFT",
    CENTER: "CENTER",
    RIGHT: "RIGHT",
} as const;

type HorizontalAnchor = Enum<typeof HorizontalAnchors>;

type Anchor = `${VerticalAnchor} ${HorizontalAnchor}`;

const ANCHOR_MUL: { [key in VerticalAnchor | HorizontalAnchor]: number } = {
    TOP: 0,
    MIDDLE: 0.5,
    BOTTOM: 1,
    LEFT: 0,
    CENTER: 0.5,
    RIGHT: 1,
} as const;

const offsetAnchor = (w: number, h: number, anchor: Anchor = "TOP LEFT"): [string, string] => {
    const [vertical, horizontal] = anchor.split(" ") as [VerticalAnchor, HorizontalAnchor];

    const x = ANCHOR_MUL[horizontal] * w;
    const y = ANCHOR_MUL[vertical] * h;

    return [`m ${-x},${-y}`, `m ${x},${y}`];
};

export const offsetOrigin = (x: number, y: number): [string, string] => {
    return [`m ${x},${y}`, `m ${-x},${-y}`];
};
