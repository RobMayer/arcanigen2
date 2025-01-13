import { Enum, FootLayout, FootLayouts } from "../types";

export namespace Draw {
    /* SHAPES */

    export const rect = (w: number, h: number, anchor: Anchor = "TOP LEFT"): string => {
        const [start, end] = offsetAnchor(w, h, anchor);
        return [start, `h ${w} v ${h} h ${-w} z`, end].join(" ");
    };

    export const cutRect = (w: number, h: number, anchor: Anchor = "TOP LEFT"): string => {
        const [start, end] = offsetAnchor(w, h, anchor);
        return [start, `m ${w},${h}`, `v ${-h} h ${-w} v ${h} z`, `m ${-w},${-h}`, end].join(" ");
    };

    export const circle = (r: number, anchor: Anchor = "MIDDLE CENTER"): string => {
        const [start, end] = offsetAnchor(r * 2, r * 2, anchor);
        return [start, `m 0,${r} a ${r},${r} 0 0,1 ${r * 2},0 a ${r},${r} 0 0,1 ${-r * 2},0 m 0,${-r}`, end].join(" ");
    };

    export const cutCircle = (r: number, anchor: Anchor = "MIDDLE CENTER"): string => {
        const [start, end] = offsetAnchor(r * 2, r * 2, anchor);
        return [start, `m 0,${r} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${-r * 2},0 m 0,${-r}`, end].join(" ");
    };

    export const hHex = (r: number, mode: "INSCRIBE" | "CIRCUMSCRIBE" = "INSCRIBE", anchor: Anchor = "MIDDLE CENTER") => {
        const w = (mode === "INSCRIBE" ? r : r * Math.sqrt(3 / 2)) * 2;
        const h = (mode === "INSCRIBE" ? r : r * Math.sqrt(3 / 2)) * Math.sqrt(3);
        const s = (w - r) / 2;

        const [start, end] = offsetAnchor(w, h, anchor);

        return [
            //
            start,
            `m 0,${h / 2}`,
            `l ${s},${-h / 2}`,
            `l ${r},0`,
            `l ${s},${h / 2}`,
            `l ${-s},${h / 2}`,
            `l ${-r},0`,
            `l ${-s},${-h / 2}`,
            `z`,
            `m 0,${-h / 2}`,
            end,
        ].join(" ");
    };

    export const cutHHex = (r: number, mode: "INSCRIBE" | "CIRCUMSCRIBE" = "CIRCUMSCRIBE", anchor: Anchor = "MIDDLE CENTER") => {
        const w = (mode === "INSCRIBE" ? r : r * Math.sqrt(3 / 2)) * 2;
        const h = (mode === "INSCRIBE" ? r : r * Math.sqrt(3 / 2)) * Math.sqrt(3);
        const s = (w - r) / 2;

        const [start, end] = offsetAnchor(w, h, anchor);

        return [
            //
            start,
            `m 0,${h / 2}`,

            `l ${s},${h / 2}`,
            `l ${r},0`,
            `l ${s},${-h / 2}`,
            `l ${-s},${-h / 2}`,
            `l ${-r},0`,
            `l ${-s},${h / 2}`,

            `z`,
            `m 0,${-h / 2}`,
            end,
        ].join(" ");
    };

    export const vHex = (r: number, mode: "INSCRIBE" | "CIRCUMSCRIBE" = "INSCRIBE", anchor: Anchor = "MIDDLE CENTER") => {
        const w = (mode === "INSCRIBE" ? r : r * Math.sqrt(3 / 2)) * Math.sqrt(3);
        const h = (mode === "INSCRIBE" ? r : r * Math.sqrt(3 / 2)) * 2;
        const s = (h - r) / 2;

        const [start, end] = offsetAnchor(w, h, anchor);

        return [
            //
            start,
            `m ${w / 2},0`,

            `l ${w / 2},${s}`,
            `l 0,${r}`,
            `l ${-w / 2},${s}`,
            `l ${-w / 2},${-s}`,
            `l 0,${-r}`,
            `l ${w / 2},${-s}`,

            `z`,
            `m ${-w / 2},0`,
            end,
        ].join(" ");
    };

    export const cutVHex = (r: number, mode: "INSCRIBE" | "CIRCUMSCRIBE" = "INSCRIBE", anchor: Anchor = "MIDDLE CENTER") => {
        const w = (mode === "INSCRIBE" ? r : r * Math.sqrt(3 / 2)) * Math.sqrt(3);
        const h = (mode === "INSCRIBE" ? r : r * Math.sqrt(3 / 2)) * 2;
        const s = (h - r) / 2;

        const [start, end] = offsetAnchor(w, h, anchor);

        return [
            //
            start,
            `m ${w / 2},0`,

            `l ${-w / 2},${s}`,
            `l 0,${r}`,
            `l ${w / 2},${s}`,
            `l ${w / 2},${-s}`,
            `l 0,${-r}`,
            `l ${-w / 2},${-s}`,

            `z`,
            `m ${-w / 2},0`,
            end,
        ].join(" ");
    };

    export const tabbedRect = (w: number, h: number, { north, east, south, west }: Partial<TabSet> = {}, anchor: Anchor = "TOP LEFT"): string => {
        const res: string[] = [];

        const [start, end] = offsetAnchor(w, h, anchor);
        res.push(start);

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

        res.push("z");

        res.push(`m ${-wComp},${-nComp}`);

        res.push(end);

        return res.join(" ");
    };

    /* UTILITY */

    export function offsetOrigin(x: number, y: number): [string, string];
    export function offsetOrigin(x: number, y: number, path: string | string[]): string;

    export function offsetOrigin(x: number, y: number, path?: string | string[]) {
        if (path !== undefined) {
            const paths = Array.isArray(path) ? path : [path];
            return [`m ${x},${y}`, ...paths, `m ${-x},${-y}`].join(" ");
        }
        return [`m ${x},${y}`, `m ${-x},${-y}`] as [string, string];
    }

    export const array = (x: DrawArrayOptions, y: DrawArrayOptions, shape: string, anchor: Anchor = "MIDDLE CENTER") => {
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

    type Tab = {
        width: number;
        depth: number;
        spacing: number;
        count: number;
        offset?: number;
    };

    type TabSet = {
        north: Tab | null;
        east: Tab | null;
        south: Tab | null;
        west: Tab | null;
    };

    type DrawArrayOptions = {
        count: number;
        spacing: number;
        offset?: number;
    };

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

    export namespace Feet {
        export const block = ({ gridSize, gridInset, footClearance }: { gridSize: number; gridInset: number; footClearance: number }) => {
            const d = gridSize - gridInset * 2 - footClearance * 2;
            return rect(d, d, "MIDDLE CENTER");
        };

        export const bracket = ({ footBracketWidth }: { footBracketWidth: number }, gap: number = 2) => {
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

        export const runner = ({ footRunnerGap, footRunnerTab, footDepth, gridThickness }: { footRunnerGap: number; footRunnerTab: number; footDepth: number; gridThickness: number }) => {
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

        export const runnerSlots = ({
            gridSize,
            cellX,
            cellY,
            gridInset,
            footClearance,
            footLayout,
            footRunnerGap,
            footRunnerTab,
            footRunnerWidth,
        }: {
            gridSize: number;
            cellX: number;
            cellY: number;
            gridInset: number;
            footClearance: number;
            footLayout: FootLayout;
            footRunnerGap: number;
            footRunnerTab: number;
            footRunnerWidth: number;
        }) => {
            const path: string[] = [];

            const [start, end] = Draw.offsetOrigin(gridSize / 2, gridSize / 2);

            path.push(start);

            const offsetPrimary = gridSize / 2 - gridInset - footClearance - footRunnerWidth / 2;
            const offsetSecondary = footRunnerGap / 2 + footRunnerTab / 2;

            const footN = `m ${-offsetSecondary},${-offsetPrimary} ${Draw.cutRect(
                footRunnerTab,
                footRunnerWidth,
                "MIDDLE CENTER"
            )} m ${offsetSecondary},${offsetPrimary} m ${offsetSecondary},${-offsetPrimary} ${Draw.cutRect(footRunnerTab, footRunnerWidth, "MIDDLE CENTER")} m ${-offsetSecondary},${offsetPrimary}`;
            const footS = `m ${-offsetSecondary},${offsetPrimary} ${Draw.cutRect(
                footRunnerTab,
                footRunnerWidth,
                "MIDDLE CENTER"
            )} m ${offsetSecondary},${-offsetPrimary} m ${offsetSecondary},${offsetPrimary} ${Draw.cutRect(footRunnerTab, footRunnerWidth, "MIDDLE CENTER")} m ${-offsetSecondary},${-offsetPrimary}`;

            const footW = `m ${-offsetPrimary},${-offsetSecondary} ${Draw.cutRect(
                footRunnerWidth,
                footRunnerTab,
                "MIDDLE CENTER"
            )} m ${offsetPrimary},${offsetSecondary} m ${-offsetPrimary},${offsetSecondary} ${Draw.cutRect(footRunnerWidth, footRunnerTab, "MIDDLE CENTER")} m ${offsetPrimary},${-offsetSecondary}`;
            const footE = `m ${offsetPrimary},${-offsetSecondary} ${Draw.cutRect(
                footRunnerWidth,
                footRunnerTab,
                "MIDDLE CENTER"
            )} m ${-offsetPrimary},${offsetSecondary} m ${offsetPrimary},${offsetSecondary} ${Draw.cutRect(footRunnerWidth, footRunnerTab, "MIDDLE CENTER")} m ${-offsetPrimary},${-offsetSecondary}`;

            if (footLayout === FootLayouts.DENSE) {
                for (let x = 0; x < cellX; x++) {
                    for (let y = 0; y < cellY; y++) {
                        path.push(`m ${gridSize * x},${gridSize * y}`, footN, footS, footW, footE, `m ${-(gridSize * x)},${-(gridSize * y)}`);
                    }
                }
            } else if (footLayout === FootLayouts.SPARSE) {
                for (let x = 0; x < cellX; x++) {
                    path.push(`m ${gridSize * x},0`, footN, `m ${-(gridSize * x)},0`);
                    path.push(`m ${gridSize * x},${gridSize * (cellY - 1)}`, footS, `m ${-(gridSize * x)},${-(gridSize * (cellY - 1))}`);
                }
                for (let y = 0; y < cellY; y++) {
                    path.push(`m 0,${gridSize * y}`, footW, `m 0,${-(gridSize * y)}`);
                    path.push(`m ${gridSize * (cellX - 1)},${gridSize * y}`, footE, `m ${-(gridSize * (cellX - 1))},${-(gridSize * y)}`);
                }
            } else if (footLayout === FootLayouts.MINIMAL) {
                path.push(`m 0,0 ${footW} ${footN} m 0,0`);
                path.push(`m ${(cellX - 1) * gridSize},0 ${footE} ${cellX > 1 ? footN : ""} m ${-((cellX - 1) * gridSize)},0`);
                path.push(`m 0,${(cellY - 1) * gridSize} ${cellY > 1 ? footW : ""} ${footS} m 0,${-((cellY - 1) * gridSize)}`);
                path.push(`m ${(cellX - 1) * gridSize},${(cellY - 1) * gridSize} ${cellY > 1 ? footE : ""} ${cellX > 1 ? footS : ""} m ${-((cellX - 1) * gridSize)},${-((cellY - 1) * gridSize)}`);
            }

            path.push(end);

            return path.join(" ");
        };
    }

    export namespace Box {
        type BottomArgs = {
            sizeX: number;
            tabXSize: number;
            tabXCount: number;
            tabXSpacing: number;
            sizeY: number;
            tabYSize: number;
            tabYCount: number;
            tabYSpacing: number;
            wallThickness: number;
        };

        type TopArgs = {
            sizeX: number;
            tabXSize: number;
            tabXCount: number;
            tabXSpacing: number;
            sizeY: number;
            tabYSize: number;
            tabYCount: number;
            tabYSpacing: number;
            wallThickness: number;
        };

        type EdgeArgs<D extends "X" | "Y"> = {
            sizeZ: number;
            tabZCount: number;
            tabZSize: number;
            tabZSpacing: number;

            wallThickness: number;
            bottomThickness: number;
            topThickness: number;
            hasTop?: boolean;
            topSquat?: number;
        } & (D extends "X"
            ? {
                  sizeX: number;
                  tabXCount: number;
                  tabXSize: number;
                  tabXSpacing: number;
              }
            : {
                  sizeY: number;
                  tabYCount: number;
                  tabYSize: number;
                  tabYSpacing: number;
              });

        type WithDivArgs<D extends "X" | "Y"> = {
            divThickness: number;
            tabDivSize: number;
            tabDivCount: number;
            tabDivSpacing: number;
            divHeight: number;
        } & (D extends "X"
            ? {
                  divX: number;
                  divXSpacing: number;
              }
            : {
                  divY: number;
                  divYSpacing: number;
              });

        type DivArgs<D extends "X" | "Y"> = {
            tabDivSize: number;
            tabDivCount: number;
            wallThickness: number;
            topThickness: number;
            divThickness: number;
            divHeight: number;
            tabDivSpacing: number;
        } & (D extends "X"
            ? {
                  divXSpacing: number;
                  divX: number;
                  sizeX: number;
              }
            : {
                  divYSpacing: number;
                  divY: number;
                  sizeY: number;
              });

        export const bottom = (args: BottomArgs) => {
            return Draw.tabbedRect(args.sizeX, args.sizeY, {
                north: {
                    count: args.tabXCount,
                    spacing: args.tabXSpacing,
                    depth: -args.wallThickness,
                    width: args.tabXSize,
                },
                east: {
                    count: args.tabYCount,
                    spacing: args.tabYSpacing,
                    depth: -args.wallThickness,
                    width: args.tabYSize,
                },
                south: {
                    count: args.tabXCount,
                    spacing: args.tabXSpacing,
                    depth: -args.wallThickness,
                    width: args.tabXSize,
                },
                west: {
                    count: args.tabYCount,
                    spacing: args.tabYSpacing,
                    depth: -args.wallThickness,
                    width: args.tabYSize,
                },
            });
        };

        export const end = (args: EdgeArgs<"X">) => {
            return Draw.tabbedRect(args.sizeX, args.sizeZ - (args?.topSquat ?? 0), {
                north: !(args?.hasTop ?? false)
                    ? null
                    : {
                          width: args.tabXSize,
                          spacing: args.tabXSpacing,
                          count: args.tabXCount,
                          depth: -args.topThickness,
                      },
                east: {
                    width: args.tabZSize,
                    spacing: args.tabZSpacing,
                    count: args.tabZCount,
                    depth: -args.wallThickness,
                    offset: -(args?.topSquat ?? 0) / 2,
                },
                south: {
                    width: args.tabXSize,
                    spacing: args.tabXSpacing,
                    count: args.tabXCount,
                    depth: args.bottomThickness,
                },
                west: {
                    width: args.tabZSize,
                    spacing: args.tabZSpacing,
                    count: args.tabZCount,
                    depth: -args.wallThickness,
                    offset: (args?.topSquat ?? 0) / 2,
                },
            });
        };

        end.withDividers = (args: EdgeArgs<"X"> & WithDivArgs<"X">) => {
            const path = [end(args)];

            if (args.divX > 0) {
                const [set, reset] = Draw.offsetOrigin(args.sizeX / 2, args.sizeZ - (args?.topSquat ?? 0) - args.divHeight - args.bottomThickness + args.divHeight / 2);
                path.push(set);
                path.push(
                    Draw.array(
                        { count: args.divX, spacing: args.divXSpacing },
                        { count: args.tabDivCount, spacing: args.tabDivSpacing },
                        Draw.cutRect(args.divThickness, args.tabDivSize, "MIDDLE CENTER"),
                        "MIDDLE CENTER"
                    )
                );
                path.push(reset);
            }

            return path.join(" ");
        };

        export const side = (args: EdgeArgs<"Y">) => {
            return Draw.tabbedRect(args.sizeY, args.sizeZ - (args?.topSquat ?? 0), {
                north: !(args?.hasTop ?? false)
                    ? null
                    : {
                          width: args.tabYSize,
                          spacing: args.tabYSpacing,
                          count: args.tabYCount,
                          depth: -args.topThickness,
                      },
                east: {
                    width: args.tabZSize,
                    spacing: args.tabZSpacing,
                    count: args.tabZCount,
                    depth: args.wallThickness,
                    offset: -(args?.topSquat ?? 0) / 2,
                },
                south: {
                    width: args.tabYSize,
                    spacing: args.tabYSpacing,
                    count: args.tabYCount,
                    depth: args.bottomThickness,
                },
                west: {
                    width: args.tabZSize,
                    spacing: args.tabZSpacing,
                    count: args.tabZCount,
                    depth: args.wallThickness,
                    offset: (args?.topSquat ?? 0) / 2,
                },
            });
        };

        side.withDividers = (args: EdgeArgs<"Y"> & WithDivArgs<"Y">) => {
            const path = [side(args)];

            if (args.divY > 0) {
                const [set, reset] = Draw.offsetOrigin(args.sizeY / 2, args.sizeZ - (args?.topSquat ?? 0) - args.divHeight - args.bottomThickness + args.divHeight / 2);
                path.push(set);
                path.push(
                    Draw.array(
                        { count: args.divY, spacing: args.divYSpacing },
                        { count: args.tabDivCount, spacing: args.tabDivSpacing },
                        Draw.cutRect(args.divThickness, args.tabDivSize, "MIDDLE CENTER"),
                        "MIDDLE CENTER"
                    )
                );
                path.push(reset);
            }

            return path.join(" ");
        };

        export const top = (args: TopArgs) => {
            return Draw.tabbedRect(args.sizeX, args.sizeY, {
                north: {
                    count: args.tabXCount,
                    spacing: args.tabXSpacing,
                    depth: args.wallThickness,
                    width: args.tabXSize,
                },
                east: {
                    count: args.tabYCount,
                    spacing: args.tabYSpacing,
                    depth: args.wallThickness,
                    width: args.tabYSize,
                },
                south: {
                    count: args.tabXCount,
                    spacing: args.tabXSpacing,
                    depth: args.wallThickness,
                    width: args.tabXSize,
                },
                west: {
                    count: args.tabYCount,
                    spacing: args.tabYSpacing,
                    depth: args.wallThickness,
                    width: args.tabYSize,
                },
            });
        };

        export const divX = (args: DivArgs<"X">) => {
            return Draw.tabbedRect(args.sizeX, args.divHeight, {
                east: {
                    count: args.tabDivCount,
                    width: args.tabDivSize,
                    spacing: args.tabDivSpacing,
                    depth: args.wallThickness,
                },
                south: {
                    count: args.divX,
                    width: args.divThickness,
                    depth: -args.divHeight / 2,
                    spacing: args.divXSpacing,
                },
                west: {
                    count: args.tabDivCount,
                    width: args.tabDivSize,
                    spacing: args.tabDivSpacing,
                    depth: args.wallThickness,
                },
            });
        };

        export const divY = (args: DivArgs<"Y">) => {
            return Draw.tabbedRect(args.sizeY, args.divHeight, {
                east: {
                    count: args.tabDivCount,
                    width: args.tabDivSize,
                    spacing: args.tabDivSpacing,
                    depth: args.wallThickness,
                },
                north: {
                    count: args.divY,
                    width: args.divThickness,
                    depth: -args.divHeight / 2,
                    spacing: args.divYSpacing,
                },
                west: {
                    count: args.tabDivCount,
                    width: args.tabDivSize,
                    spacing: args.tabDivSpacing,
                    depth: args.wallThickness,
                },
            });
        };

        export const insetTopSlots = ({ width, depth, count, spacing, thickness, size }: { width: number; depth: number; count: number; spacing: number; thickness: number; size: number }) => {
            const [set, reset] = Draw.offsetOrigin(width / 2, depth);

            return `${set} ${Draw.array({ count, spacing }, { count: 1, spacing: 0 }, Draw.cutRect(size, thickness, "TOP CENTER"), "TOP CENTER")} ${reset}`;
        };
    }
}
