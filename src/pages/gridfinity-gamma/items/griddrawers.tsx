import { ReactNode } from "react";
import { PhysicalLength } from "../../../utility/types/units";
import { Enum, FOOT_LAYOUT_OPTIONS, FootLayout, FootLayouts, FootStyles, GlobalSettings, ItemCategories, ItemControlProps, ItemDefinition, LayoutPart, Shape } from "../types";
import { ControlPanel, Input, Section, Sep } from "../widgets";
import { NumericInput } from "../../../components/inputs/NumericInput";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import ToggleList from "../../../components/selectors/ToggleList";
import { FootOverrideControls, FootOverrides, initialFootOverrides, initialSystemOverrides, SystemOverrideControls, SystemOverrides } from "../utility/overridehelper";
import { convertLength } from "../../../utility/mathhelper";
import { Draw } from "../utility/drawhelper";
import Checkbox from "../../../components/buttons/Checkbox";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import useUIState from "../../../utility/hooks/useUIState";

const TopStyles = {
    GRID: "GRID",
    FLUSH: "FLUSH",
} as const;

type TopStyle = Enum<typeof TopStyles>;

const TOP_STYLE_OPTIONS: { [key in TopStyle]: ReactNode } = {
    [TopStyles.GRID]: "Grid",
    [TopStyles.FLUSH]: "Flush",
};

const DrawerPullStyles = {
    SINGLE: "SINGLE",
    DOUBLE: "DOUBLE",
    NONE: "NONE",
} as const;

type DrawerPullStyle = Enum<typeof DrawerPullStyles>;

const DRAWERPULL_STYLE_OPTIONS: { [key in DrawerPullStyle]: ReactNode } = {
    [DrawerPullStyles.SINGLE]: "Single",
    [DrawerPullStyles.DOUBLE]: "Double",
    [DrawerPullStyles.NONE]: "None",
};

export type GridDrawerParams = {
    cellX: number;
    cellY: number;
    cellZ: number;

    drawerCount: number;
    horizontalClearance: PhysicalLength;
    verticalClearance: PhysicalLength;

    topStyle: TopStyle;
    footLayout: FootLayout;
    drawerPullStyle: DrawerPullStyle;
    drawerPullDiameter: PhysicalLength;
    drawerPullSpacing: PhysicalLength;
    includeDrawerStops: boolean;
    drawerStopDepth: PhysicalLength;

    hasDrawerStopThickness: boolean;
    drawerStopThickness: PhysicalLength;

    hasCarcassWallThickness: boolean;
    carcassWallThickness: PhysicalLength;
    hasCarcassBottomThickness: boolean;
    carcassBottomThickness: PhysicalLength;
    hasCarcassTopThickness: boolean;
    carcassTopThickness: PhysicalLength;
    hasCarcassDivThickness: boolean;
    carcassDivThickness: PhysicalLength;

    hasDrawerWallThickness: boolean;
    drawerWallThickness: PhysicalLength;
    hasDrawerBottomThickness: boolean;
    drawerBottomThickness: PhysicalLength;

    hasGridThickness: boolean;
    gridThickness: PhysicalLength;
} & FootOverrides &
    SystemOverrides;

const Controls = ({ value, setValue }: ItemControlProps<GridDrawerParams>) => {
    const [isOpen, setIsOpen] = useUIState("gridfinity.items.griddrawers.thickness", false);

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
                <Input label={"Drawer Count"}>
                    <NumericInput value={value.drawerCount} onValidCommit={setValue("drawerCount")} min={1} step={1} />
                </Input>
                <Input label={"Vertical Clearance"}>
                    <PhysicalLengthInput value={value.verticalClearance} onValidValue={setValue("verticalClearance")} />
                </Input>
                <Input label={"Horiz. Clearance"}>
                    <PhysicalLengthInput value={value.horizontalClearance} onValidValue={setValue("horizontalClearance")} />
                </Input>
                <Sep />
                <Input label={"Foot Layout"}>
                    <ToggleList value={value.footLayout} options={FOOT_LAYOUT_OPTIONS} onSelect={setValue("footLayout")} />
                </Input>
                <Input label={"Top Style"}>
                    <ToggleList value={value.topStyle} options={TOP_STYLE_OPTIONS} onSelect={setValue("topStyle")} />
                </Input>
                <Sep />
                <Input label={"Pull Hole Style"}>
                    <ToggleList value={value.drawerPullStyle} options={DRAWERPULL_STYLE_OPTIONS} onSelect={setValue("drawerPullStyle")} />
                </Input>
                <Input label={"Pull Hole Diameter"}>
                    <PhysicalLengthInput value={value.drawerPullDiameter} onValidValue={setValue("drawerPullDiameter")} min={0} minExclusive />
                </Input>
                <Input label={"Pull Hole Spacing"}>
                    <PhysicalLengthInput value={value.drawerPullSpacing} onValidValue={setValue("drawerPullSpacing")} min={0} minExclusive />
                </Input>
                <Sep />
                <Input label={"Drawer Stops"}>
                    <Checkbox checked={value.includeDrawerStops} onToggle={setValue("includeDrawerStops")}>
                        Include Drawer Stops
                    </Checkbox>
                </Input>
                <Input label={"Stop Depth"}>
                    <PhysicalLengthInput value={value.drawerStopDepth} onValidValue={setValue("drawerStopDepth")} min={0} minExclusive />
                </Input>
            </ControlPanel>
            <ControlledFoldout isOpen={isOpen} onToggle={setIsOpen} label={"Thickness Overrides"}>
                <ControlPanel>
                    <Section>Carcass</Section>
                    <Input label={"Wall Thickness"}>
                        <Checkbox checked={value.hasCarcassWallThickness} onToggle={setValue("hasCarcassWallThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.carcassWallThickness} onValidValue={setValue("carcassWallThickness")} disabled={!value.hasCarcassWallThickness} />
                    </Input>
                    <Input label={"Bottom Thickness"}>
                        <Checkbox checked={value.hasCarcassBottomThickness} onToggle={setValue("hasCarcassBottomThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.carcassBottomThickness} onValidValue={setValue("carcassBottomThickness")} disabled={!value.hasCarcassBottomThickness} />
                    </Input>
                    <Input label={"Top Thickness"}>
                        <Checkbox checked={value.hasCarcassTopThickness} onToggle={setValue("hasCarcassTopThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.carcassTopThickness} onValidValue={setValue("carcassTopThickness")} disabled={!value.hasCarcassTopThickness} />
                    </Input>
                    <Input label={"Divider Thickness"}>
                        <Checkbox checked={value.hasCarcassDivThickness} onToggle={setValue("hasCarcassDivThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.carcassDivThickness} onValidValue={setValue("carcassDivThickness")} disabled={!value.hasCarcassDivThickness} />
                    </Input>
                    <Section>Drawers</Section>
                    <Input label={"Wall Thickness"}>
                        <Checkbox checked={value.hasDrawerWallThickness} onToggle={setValue("hasDrawerWallThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.drawerWallThickness} onValidValue={setValue("drawerWallThickness")} disabled={!value.hasDrawerWallThickness} />
                    </Input>
                    <Input label={"Bottom Thickness"}>
                        <Checkbox checked={value.hasDrawerBottomThickness} onToggle={setValue("hasDrawerBottomThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.drawerBottomThickness} onValidValue={setValue("drawerBottomThickness")} disabled={!value.hasDrawerBottomThickness} />
                    </Input>
                    <Sep />
                    <Input label={"Grid Thickness"}>
                        <Checkbox checked={value.hasGridThickness} onToggle={setValue("hasGridThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.gridThickness} onValidValue={setValue("gridThickness")} disabled={!value.hasGridThickness} />
                    </Input>
                    <Input label={"Stop Thickness"}>
                        <Checkbox checked={value.hasDrawerStopThickness} onToggle={setValue("hasDrawerStopThickness")} tooltip="Override Global Thickness?" />
                        <PhysicalLengthInput value={value.drawerStopThickness} onValidValue={setValue("drawerStopThickness")} min={0} minExclusive disabled={!value.hasDrawerStopThickness} />
                    </Input>
                </ControlPanel>
            </ControlledFoldout>
            <FootOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.griddrawers.footOverrides"} />
            <SystemOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.griddrawers.systemOverrides"} />
        </>
    );
};

const draw = (item: GridDrawerParams, globals: GlobalSettings): LayoutPart[] => {
    const gridSize = convertLength(item.hasGridSize ? item.gridSize : globals.gridSize, "mm").value;
    const stackSize = convertLength(item.hasStackSize ? item.stackSize : globals.stackSize, "mm").value;

    const resCarcassBottomThickness = item.hasCarcassBottomThickness ? item.carcassBottomThickness : globals.thickness;
    const resCarcassWallThickness = item.hasCarcassWallThickness ? item.carcassWallThickness : globals.thickness;
    const resCarcassTopThickness = item.hasCarcassTopThickness ? item.carcassTopThickness : globals.thickness;
    const resCarcassDivThickness = item.hasCarcassDivThickness ? item.carcassDivThickness : globals.thickness;

    const resDrawerBottomThickness = item.hasDrawerBottomThickness ? item.drawerBottomThickness : globals.thickness;
    const resDrawerWallThickness = item.hasDrawerWallThickness ? item.drawerWallThickness : globals.thickness;
    const resDrawerStopThickness = item.hasDrawerStopThickness ? item.drawerStopThickness : globals.thickness;

    const gridThickness = convertLength(item.hasGridThickness ? item.gridThickness : globals.thickness, "mm").value;
    const gridClearance = convertLength(item.hasGridClearance ? item.gridClearance : globals.gridClearance, "mm").value;
    const gridTab = convertLength(item.hasGridTab ? item.gridTab : globals.gridTab, "mm").value;
    const stackTab = convertLength(item.hasStackTab ? item.stackTab : globals.stackTab, "mm").value;

    const gridInset = convertLength(item.hasGridInset ? item.gridInset : globals.gridInset, "mm").value;

    const footStyle = item.hasFootStyle ? item.footStyle : globals.footStyle;
    const footLayout = item.footLayout;

    const footClearance = convertLength(item.hasFootClearance ? item.footClearance : globals.footClearance, "mm").value;
    const footRunnerWidth = convertLength(item.hasFootRunnerWidth ? item.footRunnerWidth : globals.hasFootRunnerWidth ? globals.footRunnerWidth : globals.thickness, "mm").value;
    const footRunnerTab = convertLength(item.hasFootRunnerTab ? item.footRunnerTab : globals.footRunnerTab, "mm").value;
    const footRunnerGap = convertLength(item.hasFootRunnerGap ? item.footRunnerGap : globals.footRunnerGap, "mm").value;

    const horizontalClearance = convertLength(item.horizontalClearance, "mm").value;
    const verticalClearance = convertLength(item.verticalClearance, "mm").value;

    const carcassBottomThickness = convertLength(resCarcassBottomThickness, "mm").value;
    const carcassWallThickness = convertLength(resCarcassWallThickness, "mm").value;
    const carcassTopThickness = convertLength(resCarcassTopThickness, "mm").value;
    const carcassDivThickness = convertLength(resCarcassDivThickness, "mm").value;

    const drawerBottomThickness = convertLength(resDrawerBottomThickness, "mm").value;
    const drawerWallThickness = convertLength(resDrawerWallThickness, "mm").value;

    const targetX = gridSize * item.cellX;
    const targetY = gridSize * item.cellY;
    const targetZ = stackSize * item.cellZ;

    const topSquat = item.topStyle === TopStyles.FLUSH ? 0 : gridThickness;

    const externalX = targetX + gridClearance * -2;
    const externalY = targetY + gridClearance * -2;
    const externalZ = targetZ - topSquat;

    const carcassShapes: Shape[] = [];

    const drawerSpacing = (externalZ - carcassBottomThickness - carcassTopThickness + carcassDivThickness) / item.drawerCount;

    const drawerExternalX = externalX - carcassWallThickness * 2 - horizontalClearance * 2;
    const drawerExternalY = externalY - carcassWallThickness - horizontalClearance;
    const drawerExternalZ = drawerSpacing - carcassDivThickness - verticalClearance * 2;

    const drawerPullSpacing = convertLength(item.drawerPullSpacing, "mm").value;
    const drawerPullDiameter = convertLength(item.drawerPullDiameter, "mm").value;
    const drawerStopThickness = convertLength(item.hasDrawerStopThickness ? item.drawerStopThickness : globals.thickness, "mm").value;
    const drawerStopDepth = convertLength(item.drawerStopDepth, "mm").value;

    //Carcass

    //Bottom
    {
        const path = Draw.tabbedRect(externalX, externalY, {
            north: {
                count: item.cellX,
                spacing: gridSize,
                depth: -carcassWallThickness,
                width: gridTab,
            },
            west: {
                count: item.cellY,
                spacing: gridSize,
                depth: -carcassWallThickness,
                width: gridTab,
            },
            east: {
                count: item.cellY,
                spacing: gridSize,
                depth: -carcassWallThickness,
                width: gridTab,
            },
        });

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

        carcassShapes.push({
            name: "Bottom",
            thickness: resCarcassBottomThickness,
            width: externalX,
            height: externalY,
            path: `${path} ${footSlots}`,
        });
    }

    //Top
    {
        const path = Draw.tabbedRect(externalX, externalY, {
            north: {
                count: item.cellX,
                spacing: gridSize,
                depth: -carcassWallThickness,
                width: gridTab,
            },
            west: {
                count: item.cellY,
                spacing: gridSize,
                depth: -carcassWallThickness,
                width: gridTab,
            },
            east: {
                count: item.cellY,
                spacing: gridSize,
                depth: -carcassWallThickness,
                width: gridTab,
            },
        });
        const [set, reset] = Draw.offsetOrigin(externalX / 2, externalY - drawerWallThickness);
        const stops = !item.includeDrawerStops
            ? ""
            : [set, Draw.array({ count: item.cellX, spacing: gridSize }, { count: 1, spacing: 0 }, Draw.cutRect(gridTab, drawerStopThickness, "BOTTOM CENTER"), "BOTTOM CENTER"), reset].join(" ");
        carcassShapes.push({
            name: "Top",
            thickness: resCarcassTopThickness,
            width: externalX,
            height: externalY,
            path: `${path} ${stops}`,
        });
    }

    //Back
    {
        // todo: Div Holes
        const path = Draw.tabbedRect(externalX, externalZ, {
            south: {
                count: item.cellX,
                spacing: gridSize,
                depth: carcassBottomThickness,
                width: gridTab,
            },
            west: {
                count: item.cellZ,
                spacing: stackSize,
                depth: -carcassWallThickness,
                width: stackTab,
            },
            east: {
                count: item.cellZ,
                spacing: stackSize,
                depth: -carcassWallThickness,
                width: stackTab,
            },
            north: {
                count: item.cellX,
                spacing: gridSize,
                depth: carcassTopThickness,
                width: gridTab,
            },
        });

        const [set, reset] = Draw.offsetOrigin(externalX / 2, externalZ / 2);

        const cutouts = [
            set,
            Draw.array({ count: item.cellX, spacing: gridSize }, { count: item.drawerCount - 1, spacing: drawerSpacing }, Draw.cutRect(gridTab, carcassDivThickness, "MIDDLE CENTER"), "MIDDLE CENTER"),
            reset,
        ].join(" ");

        carcassShapes.push({
            name: "Back",
            thickness: resCarcassWallThickness,
            width: externalX,
            height: externalZ,
            path: `${path} ${cutouts}`,
        });
    }

    //Sides
    {
        const [set, reset] = Draw.offsetOrigin(externalY / 2, externalZ / 2);

        const cutouts = [
            set,
            Draw.array({ count: item.cellY, spacing: gridSize }, { count: item.drawerCount - 1, spacing: drawerSpacing }, Draw.cutRect(gridTab, carcassDivThickness, "MIDDLE CENTER"), "MIDDLE CENTER"),
            reset,
        ].join(" ");

        carcassShapes.push({
            name: "Left",
            thickness: resCarcassWallThickness,
            width: externalY,
            height: externalZ,
            path: `${Draw.tabbedRect(externalY, externalZ, {
                west: {
                    count: item.cellZ,
                    spacing: stackSize,
                    depth: carcassWallThickness,
                    width: stackTab,
                },
                north: {
                    count: item.cellY,
                    spacing: gridSize,
                    depth: carcassWallThickness,
                    width: gridTab,
                },
                south: {
                    count: item.cellY,
                    spacing: gridSize,
                    depth: carcassWallThickness,
                    width: gridTab,
                },
            })} ${cutouts}`,
        });
        carcassShapes.push({
            name: "Right",
            thickness: resCarcassWallThickness,
            width: externalY,
            height: externalZ,
            path: `${Draw.tabbedRect(externalY, externalZ, {
                east: {
                    count: item.cellZ,
                    spacing: stackSize,
                    depth: carcassWallThickness,
                    width: stackTab,
                },
                north: {
                    count: item.cellY,
                    spacing: gridSize,
                    depth: carcassWallThickness,
                    width: gridTab,
                },
                south: {
                    count: item.cellY,
                    spacing: gridSize,
                    depth: carcassWallThickness,
                    width: gridTab,
                },
            })} ${cutouts}`,
        });
    }

    if (item.includeDrawerStops) {
        for (let i = 0; i < item.cellX; i++) {
            carcassShapes.push({
                name: "Drawer Stop",
                thickness: resDrawerStopThickness,
                width: gridTab,
                height: carcassTopThickness + drawerStopDepth,
                path: Draw.rect(gridTab, carcassTopThickness + drawerStopDepth),
            });
        }

        for (let i = 0; i < item.cellX * (item.drawerCount - 1); i++) {
            carcassShapes.push({
                name: "Drawer Stop",
                thickness: resDrawerStopThickness,
                width: gridTab,
                height: carcassDivThickness + drawerStopDepth,
                path: Draw.rect(gridTab, carcassDivThickness + drawerStopDepth),
            });
        }
    }

    if (item.drawerCount > 1) {
        for (let dZ = 1; dZ < item.drawerCount; dZ++) {
            const path = Draw.tabbedRect(externalX, externalY, {
                north: {
                    count: item.cellX,
                    spacing: gridSize,
                    depth: carcassWallThickness,
                    width: gridTab,
                },
                west: {
                    count: item.cellY,
                    spacing: gridSize,
                    depth: carcassWallThickness,
                    width: gridTab,
                },
                east: {
                    count: item.cellY,
                    spacing: gridSize,
                    depth: carcassWallThickness,
                    width: gridTab,
                },
            });
            const [set, reset] = Draw.offsetOrigin(externalX / 2, externalY - drawerWallThickness);
            const stops = !item.includeDrawerStops
                ? ""
                : [set, Draw.array({ count: item.cellX, spacing: gridSize }, { count: 1, spacing: 0 }, Draw.cutRect(gridTab, drawerStopThickness, "BOTTOM CENTER"), "BOTTOM CENTER"), reset].join(" ");
            carcassShapes.push({
                name: "Drawer Divider",
                thickness: resCarcassDivThickness,
                width: externalX,
                height: externalY,
                path: `${path} ${stops}`,
            });
        }
    }

    const drawerShapes: Shape[] = [];

    drawerShapes.push({
        name: "Bottom",
        width: drawerExternalX,
        height: drawerExternalY,
        thickness: resDrawerBottomThickness,
        path: Draw.Box.bottom({
            sizeX: drawerExternalX,
            sizeY: drawerExternalY,
            tabXSize: gridTab,
            tabXCount: item.cellX,
            tabXSpacing: gridSize,
            tabYSize: gridTab,
            tabYCount: item.cellY,
            tabYSpacing: gridSize,
            wallThickness: drawerWallThickness,
        }),
    });

    const [set, reset] = Draw.offsetOrigin(drawerExternalX / 2, drawerExternalZ / 2);
    const drawerPull = [
        set,
        Draw.array(
            { count: item.drawerPullStyle === DrawerPullStyles.DOUBLE ? 2 : 1, spacing: drawerPullSpacing },
            { count: 1, spacing: 0 },
            Draw.cutCircle(drawerPullDiameter / 2, "MIDDLE CENTER"),
            "MIDDLE CENTER"
        ),
        reset,
    ].join(" ");

    drawerShapes.push({
        name: "Front",
        width: drawerExternalX,
        height: drawerExternalZ,
        thickness: resDrawerWallThickness,
        path: `${Draw.Box.end({
            sizeX: drawerExternalX,
            sizeZ: drawerExternalZ,
            tabXSize: gridTab,
            tabXCount: item.cellX,
            tabXSpacing: gridSize,
            tabZSize: stackTab,
            tabZCount: 2,
            tabZSpacing: (drawerExternalZ - stackTab) / 2,
            wallThickness: drawerWallThickness,
            bottomThickness: drawerBottomThickness,
            topSquat: 0,
            hasTop: false,
            topThickness: 0,
        })} ${item.drawerPullStyle !== DrawerPullStyles.NONE ? drawerPull : ""}`,
    });

    drawerShapes.push({
        name: "Back",
        width: drawerExternalX,
        height: drawerExternalZ,
        thickness: resDrawerWallThickness,
        path: Draw.Box.end({
            sizeX: drawerExternalX,
            sizeZ: drawerExternalZ,
            tabXSize: gridTab,
            tabXCount: item.cellX,
            tabXSpacing: gridSize,
            tabZSize: stackTab,
            tabZCount: 2,
            tabZSpacing: (drawerExternalZ - stackTab) / 2,
            wallThickness: drawerWallThickness,
            bottomThickness: drawerBottomThickness,
            topSquat: 0,
            hasTop: false,
            topThickness: 0,
        }),
    });

    drawerShapes.push({
        name: "Left",
        width: drawerExternalY,
        height: drawerExternalZ,
        thickness: resDrawerWallThickness,
        path: Draw.Box.side({
            sizeY: drawerExternalY,
            sizeZ: drawerExternalZ,
            tabYSize: gridTab,
            tabYCount: item.cellY,
            tabYSpacing: gridSize,
            tabZSize: stackTab,
            tabZCount: 2,
            tabZSpacing: (drawerExternalZ - stackTab) / 2,
            wallThickness: drawerWallThickness,
            bottomThickness: drawerBottomThickness,
            topSquat: 0,
            hasTop: false,
            topThickness: 0,
        }),
    });

    drawerShapes.push({
        name: "Right",
        width: drawerExternalY,
        height: drawerExternalZ,
        thickness: resDrawerWallThickness,
        path: Draw.Box.side({
            sizeY: drawerExternalY,
            sizeZ: drawerExternalZ,
            tabYSize: gridTab,
            tabYCount: item.cellY,
            tabYSpacing: gridSize,
            tabZSize: stackTab,
            tabZCount: 2,
            tabZSpacing: (drawerExternalZ - stackTab) / 2,
            wallThickness: drawerWallThickness,
            bottomThickness: drawerBottomThickness,
            topSquat: 0,
            hasTop: false,
            topThickness: 0,
        }),
    });

    return [
        {
            name: "Carcass",
            copies: 1,
            shapes: carcassShapes,
        },
        {
            name: "Drawers",
            copies: item.drawerCount,
            shapes: drawerShapes,
        },
    ];
};

export const GridDrawerDefinition: ItemDefinition<GridDrawerParams> = {
    title: "Grid Drawer",
    snippet: "A set of drawers whose carcass fits within a grid.",
    category: ItemCategories.GRID,
    draw,
    image: "drawer.png",
    Controls,
    getSummary: (p) => {
        return `Grid Drawers ${p.cellX}x${p.cellY}x${p.cellZ} (${p.drawerCount} drawer(s))`;
    },
    getInitial: () => {
        return {
            cellX: 2,
            cellY: 3,
            cellZ: 4,
            drawerCount: 2,
            horizontalClearance: { value: 0.5, unit: "mm" },
            verticalClearance: { value: 0.5, unit: "mm" },
            footLayout: FootLayouts.SPARSE,
            topStyle: TopStyles.GRID,
            drawerPullDiameter: { value: 5, unit: "mm" },
            drawerPullSpacing: { value: 12, unit: "mm" },
            drawerPullStyle: DrawerPullStyles.SINGLE,
            includeDrawerStops: true,
            drawerStopDepth: { value: 0.125, unit: "in" },
            hasDrawerStopThickness: false,
            drawerStopThickness: { value: 0.125, unit: "in" },

            hasCarcassWallThickness: false,
            carcassWallThickness: { value: 0.125, unit: "in" },
            hasCarcassBottomThickness: false,
            carcassBottomThickness: { value: 0.125, unit: "in" },
            hasCarcassTopThickness: false,
            carcassTopThickness: { value: 0.125, unit: "in" },
            hasCarcassDivThickness: false,
            carcassDivThickness: { value: 0.125, unit: "in" },
            hasGridThickness: false,
            gridThickness: { value: 0.125, unit: "in" },

            hasDrawerWallThickness: false,
            drawerWallThickness: { value: 0.125, unit: "in" },
            hasDrawerBottomThickness: false,
            drawerBottomThickness: { value: 0.125, unit: "in" },

            ...initialFootOverrides(),
            ...initialSystemOverrides(),
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
