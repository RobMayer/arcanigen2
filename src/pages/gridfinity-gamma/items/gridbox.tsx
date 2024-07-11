import { ReactNode } from "react";
import { FootStyles, GlobalSettings, ItemCategories, ItemControlProps, ItemDefinition, LayoutPart, Shape } from "../types";
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
        hasTop: item.topStyle === TopStyles.GRID || item.topStyle === TopStyles.FLUSH,

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

    const shapes: Shape[] = [];

    {
        const path = Draw.Box.bottom(calculatedParams);
        const footSlots =
            footLayout !== FootLayouts.NONE && footStyle === FootStyles.RUNNER
                ? drawRunnerFeetSlots({
                      gridSize,
                      cellX: item.cellX,
                      cellY: item.cellY,
                      gridInset,
                      footClearance,
                      footLayout,
                      footRunnerGap,
                      footRunnerTab,
                      footRunnerWidth,
                  })
                : "";

        shapes.push({
            name: "Bottom",
            thickness: resBottomThickness,
            width: calculatedParams.sizeX,
            height: calculatedParams.sizeY,
            path: `${path} ${footSlots}`,
        });
    }

    {
        const path = Draw.Box.end.withDividers(calculatedParams);
        const insetSlots =
            item.topStyle === TopStyles.INSET
                ? Draw.Box.insetTopSlots({
                      width: calculatedParams.sizeX,
                      count: calculatedParams.tabXCount,
                      depth: calculatedParams.insetDepth,
                      spacing: calculatedParams.tabXSpacing,
                      thickness: calculatedParams.topThickness,
                      size: calculatedParams.tabXSize,
                  })
                : "";

        shapes.push({
            name: "Front",
            thickness: resWallThickness,
            width: calculatedParams.sizeX,
            height: calculatedParams.sizeZ - (calculatedParams?.topSquat ?? 0),
            path: `${path} ${insetSlots}`,
        });
        shapes.push({
            name: "Back",
            thickness: resWallThickness,
            width: calculatedParams.sizeX,
            height: calculatedParams.sizeZ - (calculatedParams?.topSquat ?? 0),
            path: `${path} ${insetSlots}`,
        });
    }

    {
        const path = Draw.Box.side.withDividers(calculatedParams);
        const insetSlots =
            item.topStyle === TopStyles.INSET
                ? Draw.Box.insetTopSlots({
                      width: calculatedParams.sizeY,
                      count: calculatedParams.tabYCount,
                      depth: calculatedParams.insetDepth,
                      spacing: calculatedParams.tabYSpacing,
                      thickness: calculatedParams.topThickness,
                      size: calculatedParams.tabYSize,
                  })
                : "";

        shapes.push({
            name: "Left",
            thickness: resWallThickness,
            width: calculatedParams.sizeY,
            height: calculatedParams.sizeZ - (calculatedParams?.topSquat ?? 0),
            path: `${path} ${insetSlots}`,
        });
        shapes.push({
            name: "Right",
            thickness: resWallThickness,
            width: calculatedParams.sizeY,
            height: calculatedParams.sizeZ - (calculatedParams?.topSquat ?? 0),
            path: `${path} ${insetSlots}`,
        });
    }

    if (item.topStyle !== TopStyles.NONE) {
        shapes.push({ name: "Top", thickness: resTopThickness, width: calculatedParams.sizeX, height: calculatedParams.sizeY, path: Draw.Box.top(calculatedParams) });
    }

    if (item.divY > 0) {
        for (let dX = 1; dX <= item.divX; dX++) {
            shapes.push({
                name: "X-Axis Divider",
                thickness: resDivThickness,
                width: calculatedParams.sizeY,
                height: calculatedParams.divHeight,
                path: Draw.Box.divY(calculatedParams),
            });
        }
    }

    if (item.divX > 0) {
        for (let dY = 1; dY <= item.divY; dY++) {
            shapes.push({
                name: "Y-Axis Divider",
                thickness: resDivThickness,
                width: calculatedParams.sizeX,
                height: calculatedParams.divHeight,
                path: Draw.Box.divX(calculatedParams),
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
            return `Grid Box ${p.cellX}x${p.cellY}x${p.cellZ} (div ${p.divX + 1}x${p.divY + 1})`;
        }
        return `Grid Box ${p.cellX}x${p.cellY}x${p.cellZ}`;
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

const drawRunnerFeetSlots = ({
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
