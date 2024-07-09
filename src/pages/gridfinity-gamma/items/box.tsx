import { ReactNode } from "react";
import { FootStyle, FootStyles, GlobalSettings, ItemControlProps, ItemDefinition, LayoutPart, Shape } from "../types";
import { ControlPanel, Input, Section, Sep } from "../widgets";
import { NumericInput } from "../../../components/inputs/NumericInput";
import ToggleList from "../../../components/selectors/ToggleList";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import useUIState from "../../../utility/hooks/useUIState";
import { PhysicalLength } from "../../../utility/types/units";
import Checkbox from "../../../components/buttons/Checkbox";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import { FootOverrideControls, FootOverrides, initialFootOverrides, initialSystemOverrides, SystemOverrideControls, SystemOverrides } from "../helpers/overridehelper";
import { convertLength } from "../../../utility/mathhelper";
import { Draw } from "../helpers/drawhelper";

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

const Controls = ({ value, setValue }: ItemControlProps<BoxParams>) => {
    const [isOpen, setIsOpen] = useUIState("gridfinity.items.box.thickness", false);

    return (
        <>
            <ControlPanel>
                <Input label={"Quantity"}>
                    <NumericInput value={value.quantity} onValidValue={setValue("quantity")} min={1} step={1} />
                </Input>
                <Sep />
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

const draw = (item: BoxParams, globals: GlobalSettings): LayoutPart[] => {
    const gridSize = convertLength(item.hasGridSize ? item.gridSize : globals.gridSize, "mm").value;
    const stackSize = convertLength(item.hasStackSize ? item.stackSize : globals.stackSize, "mm").value;

    const resBottomThickness = item.hasBottomThickness ? item.bottomThickness : globals.thickness;
    const resWallThickness = item.hasWallThickness ? item.wallThickness : globals.thickness;
    const resTopThickness = item.hasTopThickness ? item.topThickness : globals.thickness;
    const resDivThickness = item.hasDivThickness ? item.divThickness : globals.thickness;

    const bottomThickness = convertLength(resBottomThickness, "mm").value;
    const wallThickness = convertLength(resWallThickness, "mm").value;
    const gridInset = convertLength(item.hasGridInset ? item.gridInset : globals.hasGridInset ? globals.gridInset : globals.thickness, "mm").value;
    const topThickness = convertLength(resTopThickness, "mm").value;
    const gridThickness = convertLength(item.hasGridThickness ? item.gridThickness : globals.thickness, "mm").value;
    const divThickness = convertLength(resDivThickness, "mm").value;
    const gridClearance = convertLength(item.hasGridClearance ? item.gridClearance : globals.gridClearance, "mm").value;
    const gridTab = convertLength(item.hasGridTab ? item.gridTab : globals.gridTab, "mm").value;
    const stackTab = convertLength(item.hasStackTab ? item.stackTab : globals.stackTab, "mm").value;

    const footStyle = item.hasFootStyle ? item.footStyle : globals.footStyle;
    const footLayout = item.footLayout;
    const footDepth = convertLength(item.hasFootDepth ? item.footDepth : globals.hasFootDepth ? globals.footDepth : globals.thickness, "mm").value;
    const footClearance = convertLength(item.hasFootClearance ? item.footClearance : globals.footClearance, "mm").value;
    const footRunnerWidth = convertLength(item.hasFootRunnerWidth ? item.footRunnerWidth : globals.hasFootRunnerWidth ? globals.footRunnerWidth : globals.thickness, "mm").value;
    const footRunnerTab = convertLength(item.hasFootRunnerTab ? item.footRunnerTab : globals.footRunnerTab, "mm").value;
    const footRunnerGap = convertLength(item.hasFootRunnerGap ? item.footRunnerGap : globals.footRunnerGap, "mm").value;

    const calculatedParams = {
        cellX: item.cellX,
        cellY: item.cellY,
        cellZ: item.cellZ,
        divY: item.divY,
        divX: item.divX,
        gridSize,
        stackSize,
        gridClearance,
        gridTab,
        stackTab,
        wallThickness,
        bottomThickness,
        topThickness,
        gridThickness,
        divThickness,
        footDepth,
        topStyle: item.topStyle,
        footStyle,
        footLayout,
        footClearance,
        footRunnerGap,
        footRunnerWidth,
        footRunnerTab,
        gridInset,
    };

    const shapes: Shape[] = [
        { name: "Bottom", thickness: resBottomThickness, ...drawBottom(calculatedParams) },
        { name: "Front", thickness: resWallThickness, ...drawEnd(calculatedParams) },
        { name: "Bottom", thickness: resWallThickness, ...drawEnd(calculatedParams) },
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
            name: "Box",
            copies: 1,
            shapes,
        },
    ];
};

export type BoxParams = {
    cellX: number;
    cellY: number;
    cellZ: number;

    divX: number;
    divY: number;

    footLayout: FootLayout;
    topStyle: TopStyle;

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

    hasGridTab: boolean;
    gridTab: PhysicalLength;
    hasStackTab: boolean;
    stackTab: PhysicalLength;
} & FootOverrides &
    SystemOverrides;

export const BoxDefinition: ItemDefinition<BoxParams> = {
    title: "Box",
    description: "it's a box...",
    draw,
    Controls,
    describe: (p) => {
        if (p.divX > 0 || p.divY > 0) {
            return `Box (${p.cellX}x${p.cellY}x${p.cellZ} | divided ${p.divX + 1}x${p.divY + 1})`;
        }
        return `Box (${p.cellX}x${p.cellY}x${p.cellZ})`;
    },
    getInitial: () => {
        return {
            cellX: 1,
            cellY: 1,
            cellZ: 2,
            divX: 0,
            divY: 0,
            footLayout: FootLayouts.SPARSE,
            topStyle: TopStyles.NONE,

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
    cellX,
    cellY,
    wallThickness,
    gridSize,
    gridClearance,
    gridTab,
    footStyle,
    footLayout,
    footClearance,
    footRunnerWidth,
    footRunnerTab,
    footRunnerGap,
    gridInset,
}: {
    cellX: number;
    cellY: number;
    wallThickness: number;
    gridSize: number;
    gridClearance: number;
    gridTab: number;
    footStyle: FootStyle;
    footLayout: FootLayout;
    footClearance: number;
    footRunnerWidth: number;
    footRunnerTab: number;
    footRunnerGap: number;
    gridInset: number;
}): { width: number; height: number; path: string } => {
    const width = gridSize * cellX - gridClearance * 2;
    const height = gridSize * cellY - gridClearance * 2;

    const path: string[] = [
        Draw.tabbedRect(width, height, {
            north: {
                count: cellX,
                spacing: gridSize,
                depth: -wallThickness,
                width: gridTab,
            },
            east: {
                count: cellY,
                spacing: gridSize,
                depth: -wallThickness,
                width: gridTab,
            },
            south: {
                count: cellX,
                spacing: gridSize,
                depth: -wallThickness,
                width: gridTab,
            },
            west: {
                count: cellY,
                spacing: gridSize,
                depth: -wallThickness,
                width: gridTab,
            },
        }),
    ];

    //TODO: WTF is even going on here?
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
    cellX,
    cellZ,
    divX,
    gridSize,
    stackSize,
    gridClearance,
    gridTab,
    stackTab,
    wallThickness,
    bottomThickness,
    topThickness,
    gridThickness,
    divThickness,
    footDepth,
    topStyle,
}: {
    cellX: number;
    cellZ: number;
    divX: number;
    gridSize: number;
    stackSize: number;
    gridClearance: number;
    gridTab: number;
    stackTab: number;
    wallThickness: number;
    gridThickness: number;
    bottomThickness: number;
    topThickness: number;
    divThickness: number;
    footDepth: number;
    topStyle: TopStyle;
}): { width: number; height: number; path: string } => {
    const divSpacing = (gridSize * cellX - gridClearance * 2 - wallThickness) / (divX + 1);

    const gridModeHeightAdjust = topStyle === TopStyles.GRID ? gridThickness : 0;

    const width = gridSize * cellX - gridClearance * 2;
    const height = stackSize * cellZ - gridModeHeightAdjust;

    const path: string[] = [
        Draw.tabbedRect(width, height, {
            north:
                topStyle === TopStyles.NONE || topStyle === TopStyles.INSET
                    ? null
                    : {
                          width: gridTab,
                          spacing: gridSize,
                          count: cellX,
                          depth: -topThickness,
                      },
            east: {
                width: stackTab,
                spacing: stackSize,
                count: cellZ,
                depth: -wallThickness,
                offset: -gridModeHeightAdjust / 2,
            },
            south: {
                width: gridTab,
                spacing: gridSize,
                count: cellX,
                depth: bottomThickness,
            },
            west: {
                width: stackTab,
                spacing: stackSize,
                count: cellZ,
                depth: -wallThickness,
                offset: gridModeHeightAdjust / 2,
            },
        }),
    ];

    if (topStyle === TopStyles.INSET) {
        const [set, reset] = Draw.offsetOrigin(width / 2, footDepth);
        path.push(set);
        path.push(Draw.array({ count: cellX, spacing: gridSize }, { count: 1, spacing: 0 }, Draw.cutRect(gridTab, topThickness, "TOP CENTER"), "TOP CENTER"));
        path.push(reset);
    }

    if (divX > 0) {
        const [set, reset] = Draw.offsetOrigin(width / 2, height / 2);
        path.push(set);
        path.push(
            Draw.array(
                { count: divX, spacing: divSpacing },
                { count: cellZ, spacing: stackSize, offset: -gridModeHeightAdjust / 2 },
                Draw.cutRect(divThickness, stackTab, "MIDDLE CENTER"),
                "MIDDLE CENTER"
            )
        );
        path.push(reset);
    }

    return {
        width,
        height,
        path: path.join(" "),
    };
};

const drawSide = ({
    cellY,
    cellZ,
    divY,
    gridSize,
    stackSize,
    gridClearance,
    gridTab,
    stackTab,
    wallThickness,
    bottomThickness,
    topThickness,
    gridThickness,
    divThickness,
    footDepth,
    topStyle,
}: {
    cellY: number;
    cellZ: number;
    divY: number;
    gridSize: number;
    stackSize: number;
    gridClearance: number;
    gridTab: number;
    stackTab: number;
    wallThickness: number;
    gridThickness: number;
    bottomThickness: number;
    topThickness: number;
    divThickness: number;
    footDepth: number;
    topStyle: TopStyle;
}): { width: number; height: number; path: string } => {
    const divSpacing = (gridSize * cellY - gridClearance * 2 - wallThickness) / (divY + 1);

    const gridModeHeightAdjust = topStyle === TopStyles.GRID ? gridThickness : 0;

    const width = gridSize * cellY - gridClearance * 2;
    const height = stackSize * cellZ - gridModeHeightAdjust;

    const path: string[] = [];

    path.push(
        Draw.tabbedRect(width, height, {
            north:
                topStyle === TopStyles.NONE || topStyle === TopStyles.INSET
                    ? null
                    : {
                          width: gridTab,
                          spacing: gridSize,
                          count: cellY,
                          depth: -topThickness,
                      },
            east: {
                width: stackTab,
                spacing: stackSize,
                count: cellZ,
                depth: wallThickness,
                offset: -gridModeHeightAdjust / 2,
            },
            south: {
                width: gridTab,
                spacing: gridSize,
                count: cellY,
                depth: bottomThickness,
            },
            west: {
                width: stackTab,
                spacing: stackSize,
                count: cellZ,
                depth: wallThickness,
                offset: gridModeHeightAdjust / 2,
            },
        })
    );

    if (topStyle === TopStyles.INSET) {
        const [set, reset] = Draw.offsetOrigin(width / 2, footDepth);
        path.push(set);
        path.push(Draw.array({ count: cellY, spacing: gridSize }, { count: 1, spacing: 0 }, Draw.cutRect(gridTab, topThickness, "TOP CENTER"), "TOP CENTER"));
        path.push(reset);
    }

    if (divY > 0) {
        const [set, reset] = Draw.offsetOrigin(width / 2, height / 2);
        path.push(set);
        path.push(
            Draw.array(
                { count: divY, spacing: divSpacing },
                { count: cellZ, spacing: stackSize, offset: -gridModeHeightAdjust / 2 },
                Draw.cutRect(divThickness, stackTab, "MIDDLE CENTER"),
                "MIDDLE CENTER"
            )
        );
        path.push(reset);
    }

    return {
        width,
        height,
        path: path.join(" "),
    };
};

const drawTop = ({
    cellY,
    cellX,
    gridSize,
    gridClearance,
    gridTab,
    wallThickness,
}: {
    cellY: number;
    cellX: number;
    gridSize: number;
    gridClearance: number;
    gridTab: number;
    wallThickness: number;
}): { width: number; height: number; path: string } => {
    const width = cellX * gridSize - gridClearance * 2;
    const height = cellY * gridSize - gridClearance * 2;

    return {
        width,
        height,
        path: Draw.tabbedRect(width, height, {
            north: {
                width: gridTab,
                count: cellX,
                depth: wallThickness,
                spacing: gridSize,
            },
            east: {
                width: gridTab,
                count: cellY,
                depth: wallThickness,
                spacing: gridSize,
            },
            south: {
                width: gridTab,
                count: cellX,
                depth: wallThickness,
                spacing: gridSize,
            },
            west: {
                width: gridTab,
                count: cellY,
                depth: wallThickness,
                spacing: gridSize,
            },
        }),
    };
};

const drawDivX = ({
    topStyle,
    cellX,
    cellZ,
    divX,
    gridSize,
    stackSize,
    gridClearance,
    stackTab,
    footDepth,
    wallThickness,
    bottomThickness,
    gridThickness,
    topThickness,
    divThickness,
}: {
    topStyle: TopStyle;
    cellX: number;
    cellZ: number;
    divX: number;
    gridSize: number;
    stackSize: number;
    gridClearance: number;
    gridThickness: number;
    stackTab: number;
    footDepth: number;
    wallThickness: number;
    bottomThickness: number;
    topThickness: number;
    divThickness: number;
}): { width: number; height: number; path: string } => {
    const width = gridSize * cellX - gridClearance * 2;

    let topOffset = footDepth;
    switch (topStyle) {
        case "FLUSH":
            topOffset = topThickness;
            break;
        case "GRID":
            topOffset = gridThickness + topThickness;
            break;
        case "INSET":
            topOffset = topThickness + footDepth;
            break;
        case "NONE":
            topOffset = footDepth;
            break;
    }

    const zOffset = (topOffset - bottomThickness) / 2;
    const height = stackSize * cellZ - topOffset - bottomThickness;

    return {
        width,
        height,
        path: Draw.tabbedRect(width, height, {
            east: {
                count: cellZ,
                width: stackTab,
                spacing: stackSize,
                depth: wallThickness,
                offset: -zOffset,
            },
            south: {
                count: divX,
                width: divThickness,
                depth: -height / 2,
                spacing: (gridSize * cellX - gridClearance * 2 - wallThickness) / (divX + 1),
            },
            west: {
                count: cellZ,
                width: stackTab,
                spacing: stackSize,
                depth: wallThickness,
                offset: zOffset,
            },
        }),
    };
};

const drawDivY = ({
    topStyle,
    cellY,
    cellZ,
    divY,
    gridSize,
    stackSize,
    gridClearance,
    gridThickness,
    stackTab,
    footDepth,
    wallThickness,
    bottomThickness,
    topThickness,
    divThickness,
}: {
    topStyle: TopStyle;
    cellY: number;
    cellZ: number;
    divY: number;
    gridSize: number;
    stackSize: number;
    gridClearance: number;
    gridTab: number;
    stackTab: number;
    footDepth: number;
    wallThickness: number;
    bottomThickness: number;
    topThickness: number;
    divThickness: number;
    gridThickness: number;
}) => {
    const width = gridSize * cellY - gridClearance * 2;

    let topOffset = footDepth;
    switch (topStyle) {
        case "FLUSH":
            topOffset = topThickness;
            break;
        case "GRID":
            topOffset = gridThickness + topThickness;
            break;
        case "INSET":
            topOffset = topThickness + footDepth;
            break;
        case "NONE":
            topOffset = footDepth;
            break;
    }

    const zOffset = (topOffset - bottomThickness) / 2;
    const height = stackSize * cellZ - topOffset - bottomThickness;

    return {
        width,
        height,
        path: Draw.tabbedRect(width, height, {
            north: {
                count: divY,
                width: divThickness,
                depth: -height / 2,
                spacing: (gridSize * cellY - gridClearance * 2 - wallThickness) / (divY + 1),
            },
            east: {
                count: cellZ,
                width: stackTab,
                spacing: stackSize,
                depth: wallThickness,
                offset: -zOffset,
            },
            west: {
                count: cellZ,
                width: stackTab,
                spacing: stackSize,
                depth: wallThickness,
                offset: zOffset,
            },
        }),
    };
};
