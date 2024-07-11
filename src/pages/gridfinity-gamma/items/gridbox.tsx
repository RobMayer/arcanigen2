import { ReactNode } from "react";
import { FootStyle, FootStyles, GlobalSettings, ItemCategories, ItemControlProps, ItemDefinition, LayoutPart, Shape } from "../types";
import { ControlPanel, Input, Sep } from "../widgets";
import { NumericInput } from "../../../components/inputs/NumericInput";
import ToggleList from "../../../components/selectors/ToggleList";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import useUIState from "../../../utility/hooks/useUIState";
import { PhysicalLength } from "../../../utility/types/units";
import Checkbox from "../../../components/buttons/Checkbox";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import { FootOverrideControls, FootOverrides, initialFootOverrides, initialSystemOverrides, SystemOverrideControls, SystemOverrides } from "../utility/overridehelper";
import { convertLength } from "../../../utility/mathhelper";
import { Draw } from "../utility/drawhelper";

export const FootLayouts = {
    DENSE: "SLOT_DENSE",
    SPARSE: "SLOT_SPARSE",
    MINIMAL: "SLOT_MINIMAL",
    NONE: "NONE",
} as const;

export type FootLayout = (typeof FootLayouts)[keyof typeof FootLayouts];

export const FOOT_LAYOUT_OPTIONS: { [key in FootLayout]: ReactNode } = {
    [FootLayouts.DENSE]: "Dense",
    [FootLayouts.SPARSE]: "Sparse",
    [FootLayouts.MINIMAL]: "Minimal",
    [FootLayouts.NONE]: "None",
};

export const TopStyles = {
    NONE: "NONE",
    GRID: "GRID",
    FLUSH: "FLUSH",
    INSET: "INSET",
} as const;

export type TopStyle = (typeof TopStyles)[keyof typeof TopStyles];

export const TOP_STYLE_OPTIONS: { [key in TopStyle]: ReactNode } = {
    [TopStyles.NONE]: "None",
    [TopStyles.GRID]: "Grid",
    [TopStyles.FLUSH]: "Flush",
    [TopStyles.INSET]: "Inset",
};

const Controls = ({ value, setValue }: ItemControlProps<GridBoxParams>) => {
    const [isOpen, setIsOpen] = useUIState("gridfinity.items.box.thickness", false);

    return (
        <>
            <ControlPanel>
                <Input label={"Cell X"}>
                    <NumericInput value={value.cellX} onValidValue={setValue("cellX")} min={1} step={1} />
                </Input>
                <Input label={"Cell Y"}>
                    <NumericInput value={value.cellY} onValidValue={setValue("cellY")} min={1} step={1} />
                </Input>
                <Input label={"Cell Z"}>
                    <NumericInput value={value.cellZ} onValidValue={setValue("cellZ")} min={1} step={1} />
                </Input>
                <Sep />
                <Input label={"Dividers X"}>
                    <NumericInput value={value.divX} onValidCommit={setValue("divX")} min={0} step={1} />
                </Input>
                <Input label={"Dividers Y"}>
                    <NumericInput value={value.divY} onValidCommit={setValue("divY")} min={0} step={1} />
                </Input>
                <Input label={"Foot Layout"}>
                    <ToggleList value={value.footLayout} options={FOOT_LAYOUT_OPTIONS} onSelect={setValue("footLayout")} />
                </Input>
                <Input label={"Top Style"}>
                    <ToggleList value={value.topStyle} options={TOP_STYLE_OPTIONS} onSelect={setValue("topStyle")} />
                </Input>
                <Input label={"Inset Depth"}>
                    <Checkbox checked={value.hasInsetDepth} onToggle={setValue("hasInsetDepth")} tooltip={"Override Foot Depth?"} />
                    <PhysicalLengthInput value={value.insetDepth} onValidValue={setValue("insetDepth")} disabled={!value.hasInsetDepth} />
                </Input>
            </ControlPanel>
            <ControlledFoldout isOpen={isOpen} onToggle={setIsOpen} label={"Thickness Overrides"}>
                <ControlPanel>
                    <Input label={"Wall Thickness"}>
                        <Checkbox checked={value.hasWallThickness} onToggle={setValue("hasWallThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.wallThickness} onValidValue={setValue("wallThickness")} disabled={!value.hasWallThickness} />
                    </Input>
                    <Input label={"Bottom Thickness"}>
                        <Checkbox checked={value.hasBottomThickness} onToggle={setValue("hasBottomThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.bottomThickness} onValidValue={setValue("bottomThickness")} disabled={!value.hasBottomThickness} />
                    </Input>
                    <Input label={"Top Thickness"}>
                        <Checkbox checked={value.hasTopThickness} onToggle={setValue("hasTopThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.topThickness} onValidValue={setValue("topThickness")} disabled={!value.hasTopThickness} />
                    </Input>
                    <Input label={"Divider Thickness"}>
                        <Checkbox checked={value.hasDivThickness} onToggle={setValue("hasDivThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.divThickness} onValidValue={setValue("divThickness")} disabled={!value.hasDivThickness} />
                    </Input>
                    <Input label={"Grid Thickness"}>
                        <Checkbox checked={value.hasGridThickness} onToggle={setValue("hasGridThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.gridThickness} onValidValue={setValue("gridThickness")} disabled={!value.hasGridThickness} />
                    </Input>
                </ControlPanel>
            </ControlledFoldout>
            <FootOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.box.footOverrides"} />
            <SystemOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.box.systemOverrides"} />
        </>
    );
};

const draw = (item: GridBoxParams, globals: GlobalSettings): LayoutPart[] => {
    const gridSize = convertLength(item.hasGridSize ? item.gridSize : globals.gridSize, "mm").value;
    const stackSize = convertLength(item.hasStackSize ? item.stackSize : globals.stackSize, "mm").value;

    const resBottomThickness = item.hasBottomThickness ? item.bottomThickness : globals.thickness;
    const resWallThickness = item.hasWallThickness ? item.wallThickness : globals.thickness;
    const resTopThickness = item.hasTopThickness ? item.topThickness : globals.thickness;
    const resDivThickness = item.hasDivThickness ? item.divThickness : globals.thickness;

    const gridThickness = convertLength(item.hasGridThickness ? item.gridThickness : globals.thickness, "mm").value;
    const gridClearance = convertLength(item.hasGridClearance ? item.gridClearance : globals.gridClearance, "mm").value;
    const gridTab = convertLength(item.hasGridTab ? item.gridTab : globals.gridTab, "mm").value;
    const stackTab = convertLength(item.hasStackTab ? item.stackTab : globals.stackTab, "mm").value;

    const gridInset = convertLength(item.hasGridInset ? item.gridInset : globals.gridInset, "mm").value;

    const footStyle = item.hasFootStyle ? item.footStyle : globals.footStyle;
    const footLayout = item.footLayout;
    const footDepth = convertLength(item.hasFootDepth ? item.footDepth : globals.hasFootDepth ? globals.footDepth : globals.thickness, "mm").value;
    const insetDepth = convertLength(item.hasInsetDepth ? item.insetDepth : item.hasFootDepth ? item.footDepth : globals.hasFootDepth ? globals.footDepth : globals.thickness, "mm").value;
    const footClearance = convertLength(item.hasFootClearance ? item.footClearance : globals.footClearance, "mm").value;
    const footRunnerWidth = convertLength(item.hasFootRunnerWidth ? item.footRunnerWidth : globals.hasFootRunnerWidth ? globals.footRunnerWidth : globals.thickness, "mm").value;
    const footRunnerTab = convertLength(item.hasFootRunnerTab ? item.footRunnerTab : globals.footRunnerTab, "mm").value;
    const footRunnerGap = convertLength(item.hasFootRunnerGap ? item.footRunnerGap : globals.footRunnerGap, "mm").value;

    const bottomThickness = convertLength(resBottomThickness, "mm").value;
    const wallThickness = convertLength(resWallThickness, "mm").value;
    const topThickness = convertLength(resTopThickness, "mm").value;
    const divThickness = convertLength(resDivThickness, "mm").value;

    let divTopOffset = 0;
    if (item.topStyle === TopStyles.NONE) {
        divTopOffset = footDepth;
    }
    if (item.topStyle === TopStyles.GRID) {
        divTopOffset = gridThickness + topThickness;
    }
    if (item.topStyle === TopStyles.FLUSH) {
        divTopOffset = topThickness;
    }
    if (item.topStyle === TopStyles.INSET) {
        divTopOffset = insetDepth + topThickness;
    }

    const targetX = gridSize * item.cellX;
    const targetY = gridSize * item.cellY;
    const targetZ = stackSize * item.cellZ;

    const externalX = targetX + gridClearance * -2;
    const externalY = targetY + gridClearance * -2;
    const externalZ = targetZ;

    const divHeight = externalZ - bottomThickness - divTopOffset;

    const tabDivSpacing = divHeight / item.cellZ;

    const divXSpacing = (externalX - wallThickness * 2 + divThickness) / (item.divX + 1);
    const divYSpacing = (externalY - wallThickness * 2 + divThickness) / (item.divY + 1);

    const calculatedParams = {
        sizeX: externalX,
        sizeY: externalY,
        sizeZ: externalZ,
        divY: item.divY,
        divX: item.divX,
        divHeight,

        cellX: item.cellX,
        cellY: item.cellY,
        gridSize: gridSize,

        tabXSize: gridTab,
        tabXSpacing: gridSize,
        tabXCount: item.cellX,

        tabYSize: gridTab,
        tabYSpacing: gridSize,
        tabYCount: item.cellY,

        tabZSize: stackTab,
        tabZSpacing: stackSize,
        tabZCount: item.cellZ,

        tabDivSize: stackTab,
        tabDivCount: item.cellZ,
        tabDivSpacing,

        wallThickness,
        bottomThickness,
        topThickness,
        divThickness,
        topStyle: item.topStyle,
        divXSpacing,
        divYSpacing,
        topSquat: item.topStyle === TopStyles.GRID ? gridThickness : 0,
        insetDepth,

        gridInset,
        stackSize,
        gridClearance,
        gridTab,
        stackTab,
        footStyle,
        footLayout,
        footClearance,
        footRunnerGap,
        footRunnerWidth,
        footRunnerTab,
    };

    const shapes: Shape[] = [
        { name: "Bottom", thickness: resBottomThickness, ...drawBottom(calculatedParams) },
        { name: "Front", thickness: resWallThickness, ...drawEnd(calculatedParams) },
        { name: "Back", thickness: resWallThickness, ...drawEnd(calculatedParams) },
        { name: "Left", thickness: resWallThickness, ...drawSide(calculatedParams) },
        { name: "Right", thickness: resWallThickness, ...drawSide(calculatedParams) },
    ];

    if (item.topStyle !== TopStyles.NONE) {
        shapes.push({ name: "Top", thickness: resTopThickness, ...drawTop(calculatedParams) });
    }

    if (item.divY > 0) {
        for (let dX = 1; dX <= item.divY; dX++) {
            shapes.push({
                name: "X-Axis Divider",
                thickness: resDivThickness,
                ...drawDivX(calculatedParams),
            });
        }
    }

    if (item.divX > 0) {
        for (let dY = 1; dY <= item.divX; dY++) {
            shapes.push({
                name: "Y-Axis Divider",
                thickness: resDivThickness,
                ...drawDivY(calculatedParams),
            });
        }
    }

    return [
        {
            name: "GridBox",
            copies: 1,
            shapes,
        },
    ];
};

export type GridBoxParams = {
    cellX: number;
    cellY: number;
    cellZ: number;

    divX: number;
    divY: number;

    footLayout: FootLayout;
    topStyle: TopStyle;
    hasInsetDepth: boolean;
    insetDepth: PhysicalLength;

    hasWallThickness: boolean;
    wallThickness: PhysicalLength;
    hasBottomThickness: boolean;
    bottomThickness: PhysicalLength;
    hasTopThickness: boolean;
    topThickness: PhysicalLength;
    hasDivThickness: boolean;
    divThickness: PhysicalLength;
    hasGridThickness: boolean;
    gridThickness: PhysicalLength;
} & FootOverrides &
    SystemOverrides;

export const GridboxDefinition: ItemDefinition<GridBoxParams> = {
    title: "Grid Box",
    snippet: "A Grid-aligned box. Has provisions for dividers.",
    category: ItemCategories.GRID,
    draw,
    image: "box.png",
    Controls,
    getSummary: (p) => {
        if (p.divX > 0 || p.divY > 0) {
            return `Grid-Box ${p.cellX}x${p.cellY}x${p.cellZ} (Divided ${p.divX + 1}x${p.divY + 1})`;
        }
        return `Grid-Box ${p.cellX}x${p.cellY}x${p.cellZ}`;
    },
    getInitial: () => {
        return {
            cellX: 2,
            cellY: 2,
            cellZ: 2,
            divX: 2,
            divY: 2,
            footLayout: FootLayouts.SPARSE,
            topStyle: TopStyles.NONE,

            hasInsetDepth: false,
            insetDepth: { value: 0.125, unit: "in" },

            hasWallThickness: false,
            wallThickness: { value: 0.125, unit: "in" },
            hasGridThickness: false,
            gridThickness: { value: 0.125, unit: "in" },
            hasBottomThickness: false,
            bottomThickness: { value: 0.125, unit: "in" },
            hasTopThickness: false,
            topThickness: { value: 0.125, unit: "in" },
            hasDivThickness: false,
            divThickness: { value: 0.125, unit: "in" },

            ...initialSystemOverrides(),
            ...initialFootOverrides(),
        };
    },
};

const drawBottom = ({
    sizeX,
    tabXCount,
    tabXSize,
    tabXSpacing,
    sizeY,
    tabYCount,
    tabYSize,
    tabYSpacing,
    wallThickness,

    cellX,
    cellY,
    gridSize,
    footStyle,
    footLayout,
    footClearance,
    footRunnerWidth,
    footRunnerTab,
    footRunnerGap,
    gridInset,
}: {
    sizeX: number;
    tabXSize: number;
    tabXCount: number;
    tabXSpacing: number;
    sizeY: number;
    tabYSize: number;
    tabYCount: number;
    tabYSpacing: number;
    wallThickness: number;

    cellX: number;
    cellY: number;
    gridSize: number;

    footStyle: FootStyle;
    footLayout: FootLayout;
    footClearance: number;
    footRunnerWidth: number;
    footRunnerTab: number;
    footRunnerGap: number;
    gridInset: number;
}): { width: number; height: number; path: string } => {
    const width = sizeX;
    const height = sizeY;

    const path: string[] = [
        Draw.tabbedRect(width, height, {
            north: {
                count: tabXCount,
                spacing: tabXSpacing,
                depth: -wallThickness,
                width: tabXSize,
            },
            east: {
                count: tabYCount,
                spacing: tabYSpacing,
                depth: -wallThickness,
                width: tabYSize,
            },
            south: {
                count: tabXCount,
                spacing: tabXSpacing,
                depth: -wallThickness,
                width: tabXSize,
            },
            west: {
                count: tabYCount,
                spacing: tabYSpacing,
                depth: -wallThickness,
                width: tabYSize,
            },
        }),
    ];

    if (footLayout !== FootLayouts.NONE && footStyle === FootStyles.RUNNER) {
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
    }

    return {
        width,
        height,
        path: path.join(" "),
    };
};

const drawEnd = ({
    sizeX,
    tabXCount,
    tabXSize,
    tabXSpacing,
    sizeZ,
    tabZCount,
    tabZSize,
    tabZSpacing,
    divX,
    wallThickness,
    bottomThickness,
    topThickness,
    divThickness,
    tabDivSize,
    tabDivCount,
    topStyle,
    tabDivSpacing,
    insetDepth,
    divHeight,
    divXSpacing,
    topSquat,
}: {
    sizeX: number;
    tabXCount: number;
    tabXSize: number;
    tabXSpacing: number;
    sizeZ: number;
    tabZCount: number;
    tabZSize: number;
    tabZSpacing: number;
    divX: number;
    tabDivSize: number;
    tabDivCount: number;

    wallThickness: number;
    bottomThickness: number;
    topThickness: number;
    divThickness: number;
    topStyle: TopStyle;
    tabDivSpacing: number;
    insetDepth: number;
    divHeight: number;
    divXSpacing: number;
    topSquat: number;
}): { width: number; height: number; path: string } => {
    const path: string[] = [
        Draw.tabbedRect(sizeX, sizeZ - topSquat, {
            north:
                topStyle === TopStyles.NONE || topStyle === TopStyles.INSET
                    ? null
                    : {
                          width: tabXSize,
                          spacing: tabXSpacing,
                          count: tabXCount,
                          depth: -topThickness,
                      },
            east: {
                width: tabZSize,
                spacing: tabZSpacing,
                count: tabZCount,
                depth: -wallThickness,
                offset: -topSquat / 2,
            },
            south: {
                width: tabXSize,
                spacing: tabXSpacing,
                count: tabXCount,
                depth: bottomThickness,
            },
            west: {
                width: tabZSize,
                spacing: tabZSpacing,
                count: tabZCount,
                depth: -wallThickness,
                offset: topSquat / 2,
            },
        }),
    ];

    if (topStyle === TopStyles.INSET) {
        const [set, reset] = Draw.offsetOrigin(sizeX / 2, insetDepth);
        path.push(set);
        path.push(Draw.array({ count: tabXCount, spacing: tabXSpacing }, { count: 1, spacing: 0 }, Draw.cutRect(tabXSize, topThickness, "TOP CENTER"), "TOP CENTER"));
        path.push(reset);
    }

    if (divX > 0) {
        const [set, reset] = Draw.offsetOrigin(sizeX / 2, sizeZ - topSquat - divHeight - bottomThickness + divHeight / 2);
        path.push(set);
        path.push(Draw.array({ count: divX, spacing: divXSpacing }, { count: tabDivCount, spacing: tabDivSpacing }, Draw.cutRect(divThickness, tabDivSize, "MIDDLE CENTER"), "MIDDLE CENTER"));
        path.push(reset);
    }

    return {
        width: sizeX,
        height: sizeZ - topSquat,
        path: path.join(" "),
    };
};

const drawSide = ({
    sizeY,
    tabYCount,
    tabYSize,
    tabYSpacing,
    sizeZ,
    tabZCount,
    tabZSize,
    tabZSpacing,
    divY,
    wallThickness,
    bottomThickness,
    topThickness,
    divThickness,
    tabDivSize,
    tabDivCount,
    topStyle,
    insetDepth,
    divHeight,
    tabDivSpacing,
    divYSpacing,
    topSquat,
}: {
    sizeY: number;
    tabYCount: number;
    tabYSize: number;
    tabYSpacing: number;
    sizeZ: number;
    tabZCount: number;
    tabZSize: number;
    tabZSpacing: number;
    divY: number;
    tabDivSize: number;
    tabDivCount: number;
    tabDivSpacing: number;

    wallThickness: number;
    bottomThickness: number;
    topThickness: number;
    divThickness: number;

    topStyle: TopStyle;
    insetDepth: number;
    divHeight: number;
    divYSpacing: number;
    topSquat: number;
}): { width: number; height: number; path: string } => {
    const path: string[] = [];

    path.push(
        Draw.tabbedRect(sizeY, sizeZ - topSquat, {
            north:
                topStyle === TopStyles.NONE || topStyle === TopStyles.INSET
                    ? null
                    : {
                          width: tabYSize,
                          spacing: tabYSpacing,
                          count: tabYCount,
                          depth: -topThickness,
                      },
            east: {
                width: tabZSize,
                spacing: tabZSpacing,
                count: tabZCount,
                depth: wallThickness,
                offset: -topSquat / 2,
            },
            south: {
                width: tabYSize,
                spacing: tabYSpacing,
                count: tabYCount,
                depth: bottomThickness,
            },
            west: {
                width: tabZSize,
                spacing: tabZSpacing,
                count: tabZCount,
                depth: wallThickness,
                offset: -topSquat / 2,
            },
        })
    );

    if (topStyle === TopStyles.INSET) {
        const [set, reset] = Draw.offsetOrigin(sizeY / 2, insetDepth);
        path.push(set);
        path.push(Draw.array({ count: tabYCount, spacing: tabYSpacing }, { count: 1, spacing: 0 }, Draw.cutRect(tabYSize, topThickness, "TOP CENTER"), "TOP CENTER"));
        path.push(reset);
    }

    if (divY > 0) {
        const [set, reset] = Draw.offsetOrigin(sizeY / 2, sizeZ - topSquat - divHeight - bottomThickness + divHeight / 2);
        path.push(set);
        path.push(Draw.array({ count: divY, spacing: divYSpacing }, { count: tabDivCount, spacing: tabDivSpacing }, Draw.cutRect(divThickness, tabDivSize, "MIDDLE CENTER"), "MIDDLE CENTER"));
        path.push(reset);
    }

    return {
        width: sizeY,
        height: sizeZ - topSquat,
        path: path.join(" "),
    };
};

const drawTop = ({
    sizeX,
    tabXSize,
    tabXCount,
    tabXSpacing,
    sizeY,
    tabYSize,
    tabYCount,
    tabYSpacing,
    wallThickness,
}: {
    sizeX: number;
    tabXSize: number;
    tabXCount: number;
    tabXSpacing: number;
    sizeY: number;
    tabYSize: number;
    tabYCount: number;
    tabYSpacing: number;
    wallThickness: number;
}): { width: number; height: number; path: string } => {
    const width = sizeX;
    const height = sizeY;

    return {
        width,
        height,
        path: Draw.tabbedRect(width, height, {
            north: {
                count: tabXCount,
                spacing: tabXSpacing,
                depth: wallThickness,
                width: tabXSize,
            },
            east: {
                count: tabYCount,
                spacing: tabYSpacing,
                depth: wallThickness,
                width: tabYSize,
            },
            south: {
                count: tabXCount,
                spacing: tabXSpacing,
                depth: wallThickness,
                width: tabXSize,
            },
            west: {
                count: tabYCount,
                spacing: tabYSpacing,
                depth: wallThickness,
                width: tabYSize,
            },
        }),
    };
};

const drawDivX = ({
    sizeX,
    tabDivSize,
    tabDivCount,
    divX,
    wallThickness,
    divThickness,
    divHeight,
    divXSpacing,
    tabDivSpacing,
}: {
    sizeX: number;
    tabDivSize: number;
    tabDivCount: number;
    divX: number;
    wallThickness: number;
    bottomThickness: number;
    topThickness: number;
    divThickness: number;
    divHeight: number;
    divXSpacing: number;
    tabDivSpacing: number;
}): { width: number; height: number; path: string } => {
    return {
        width: sizeX,
        height: divHeight,
        path: Draw.tabbedRect(sizeX, divHeight, {
            east: {
                count: tabDivCount,
                width: tabDivSize,
                spacing: tabDivSpacing,
                depth: wallThickness,
                // offset: -zOffset,
            },
            south: {
                count: divX,
                width: divThickness,
                depth: -divHeight / 2,
                spacing: divXSpacing,
            },
            west: {
                count: tabDivCount,
                width: tabDivSize,
                spacing: tabDivSpacing,
                depth: wallThickness,
                // offset: zOffset,
            },
        }),
    };
};

const drawDivY = ({
    sizeY,
    tabDivSize,
    tabDivCount,
    divY,
    wallThickness,
    divThickness,
    divHeight,
    divYSpacing,
    tabDivSpacing,
}: {
    sizeY: number;
    tabDivSize: number;
    tabDivCount: number;
    divY: number;
    wallThickness: number;
    divThickness: number;
    divHeight: number;
    divYSpacing: number;
    tabDivSpacing: number;
}) => {
    return {
        width: sizeY,
        height: divHeight,
        path: Draw.tabbedRect(sizeY, divHeight, {
            east: {
                count: tabDivCount,
                width: tabDivSize,
                spacing: tabDivSpacing,
                depth: wallThickness,
            },
            north: {
                count: divY,
                width: divThickness,
                depth: -divHeight / 2,
                spacing: divYSpacing,
            },
            west: {
                count: tabDivCount,
                width: tabDivSize,
                spacing: tabDivSpacing,
                depth: wallThickness,
            },
        }),
    };
};
