import { ReactNode } from "react";
import { PhysicalLength } from "../../../utility/types/units";
import { Enum, FOOT_LAYOUT_OPTIONS, FootLayout, FootLayouts, FootStyles, ItemCategories, ItemControls, ItemDefinition, ItemRenderer, Shape } from "../types";
import { FootOverrides, SystemOverrides, initialSystemOverrides, initialFootOverrides, FootOverrideControls, SystemOverrideControls } from "../utility/overridehelper";
import { convertLength } from "../../../utility/mathhelper";
import { Draw } from "../utility/drawhelper";
import useUIState from "../../../utility/hooks/useUIState";
import Checkbox from "../../../components/buttons/Checkbox";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import { NumericInput } from "../../../components/inputs/NumericInput";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import ToggleList from "../../../components/selectors/ToggleList";
import { ControlPanel, Input, Sep } from "../widgets";

const SlotModes = {
    COUNT: "COUNT",
    SPACING: "SPACING",
} as const;

type SlotMode = Enum<typeof SlotModes>;

const SLOT_MODE_OPTIONS: { [key in SlotMode]: ReactNode } = {
    [SlotModes.COUNT]: "By Count",
    [SlotModes.SPACING]: "By Spacing",
};

type GridRackParams = {
    cellX: number;
    cellY: number;
    legHeight: PhysicalLength;
    legWidth: PhysicalLength;

    rackDepth: PhysicalLength;

    slotMode: SlotMode;
    slotCount: number;
    slotSpacing: PhysicalLength;
    slotWidth: PhysicalLength;
    slotDepth: PhysicalLength;
    footLayout: FootLayout;

    includeFootwell: boolean;
    footwellDepth: PhysicalLength;

    restAngle: number;

    doubleUpRack: boolean;
    doubleUpLegs: boolean;
    doubleUpFootwell: boolean;

    hasPlatformThickness: boolean;
    platformThickness: PhysicalLength;
    hasLegThickness: boolean;
    legThickness: PhysicalLength;
    hasRackThickness: boolean;
    rackThickness: PhysicalLength;
    hasFootwellThickness: boolean;
    footwellThickness: PhysicalLength;
} & FootOverrides &
    SystemOverrides;

const Controls: ItemControls<GridRackParams> = ({ value, setValue }) => {
    const [isOpen, setIsOpen] = useUIState("gridfinity.items.gridrack.thickness", false);
    return (
        <>
            <ControlPanel>
                <Input label={"Cell X"}>
                    <NumericInput value={value.cellX} onValidValue={setValue("cellX")} min={1} step={1} />
                </Input>
                <Input label={"Cell Y"}>
                    <NumericInput value={value.cellY} onValidValue={setValue("cellY")} min={1} step={1} />
                </Input>
                <Sep />
                <Input label={"Foot Layout"}>
                    <ToggleList value={value.footLayout} options={FOOT_LAYOUT_OPTIONS} onSelect={setValue("footLayout")} />
                </Input>
            </ControlPanel>
            <ControlledFoldout isOpen={isOpen} onToggle={setIsOpen} label={"Thickness Overrides"}>
                <ControlPanel>
                    <Input label={"Platform Thickness"}>
                        <Checkbox checked={value.hasPlatformThickness} onToggle={setValue("hasPlatformThickness")} tooltip={"Override Global Thickness?"} />
                        <PhysicalLengthInput value={value.platformThickness} onValidValue={setValue("platformThickness")} disabled={!value.hasPlatformThickness} />
                    </Input>
                </ControlPanel>
            </ControlledFoldout>
            <FootOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.gridrack.footOverrides"} />
            <SystemOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.gridrack.systemOverrides"} />
        </>
    );
};

const render: ItemRenderer<GridRackParams> = (item, globals) => {
    const gridSize = convertLength(item.hasGridSize ? item.gridSize : globals.gridSize, "mm").value;
    const gridClearance = convertLength(item.hasGridClearance ? item.gridClearance : globals.gridClearance, "mm").value;

    const resPlatformThickness = item.hasPlatformThickness ? item.platformThickness : globals.thickness;
    const resRackThickness = item.hasRackThickness ? item.rackThickness : globals.thickness;
    const resLegThickness = item.hasLegThickness ? item.legThickness : globals.thickness;

    const targetX = gridSize * item.cellX;
    const targetY = gridSize * item.cellY;
    const externalX = targetX + gridClearance * -2;
    const externalY = targetY + gridClearance * -2;
    const footLayout = item.footLayout;
    const legHeight = convertLength(item.legHeight, "mm").value;
    const legWidth = convertLength(item.legWidth, "mm").value;

    const gridInset = convertLength(item.hasGridInset ? item.gridInset : globals.gridInset, "mm").value;

    const footStyle = item.hasFootStyle ? item.footStyle : globals.footStyle;
    const footClearance = convertLength(item.hasFootClearance ? item.footClearance : globals.footClearance, "mm").value;
    const footRunnerWidth = convertLength(item.hasFootRunnerWidth ? item.footRunnerWidth : globals.hasFootRunnerWidth ? globals.footRunnerWidth : globals.thickness, "mm").value;
    const footRunnerTab = convertLength(item.hasFootRunnerTab ? item.footRunnerTab : globals.footRunnerTab, "mm").value;
    const footRunnerGap = convertLength(item.hasFootRunnerGap ? item.footRunnerGap : globals.footRunnerGap, "mm").value;

    const rackThickness = convertLength(resRackThickness, "mm").value;
    const legThickness = convertLength(resLegThickness, "mm").value;
    const platformThickness = convertLength(resPlatformThickness, "mm").value;

    const rackMul = item.doubleUpRack ? 2 : 1;
    const legMul = item.doubleUpLegs ? 2 : 1;

    const shapes: Shape[] = [];

    // platform
    {
        const path = Draw.rect(externalX, externalY);
        const footSlots =
            footLayout !== FootLayouts.NONE && footStyle === FootStyles.RUNNER
                ? Draw.Feet.runnerSlots({
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
            name: "Platform",
            thickness: resPlatformThickness,
            width: externalX,
            height: externalY,
            path: `${path} ${footSlots}`,
        });
    }

    // legs
    {
        const notch = legWidth / 2;

        const innerLegHeight = legHeight - rackThickness * rackMul - notch * 4;

        const path = [
            //
            `m ${notch + legWidth / 2},0`,
            `h ${legWidth / 2}`,
            `v ${rackThickness * rackMul}`,
            `h ${notch}`,
            `v ${notch}`,
            `l ${-notch},${notch}`,
            `v ${innerLegHeight}`,
            `l ${notch},${notch}`,
            `v ${notch}`,
            `h ${-notch}`,
            `v ${platformThickness}`,
            `h ${-legWidth}`,
            `v ${-platformThickness}`,
            `h ${-notch}`,
            `v ${-notch}`,
            `l ${notch},${-notch}`,
            `v ${-innerLegHeight}`,
            `l ${-notch},${-notch}`,
            `v ${-notch}`,
            `h ${notch}`,
            `v ${-rackThickness * rackMul}`,
            `z`,
        ].join(" ");

        for (let i = 0; i < 2 * legMul; i++) {
            shapes.push({
                name: "Leg",
                thickness: resLegThickness,
                width: legWidth * 2,
                height: legHeight + platformThickness,
                path: `${path}`,
            });
        }
    }

    return [
        {
            name: "GridRack",
            copies: 1,
            shapes,
        },
    ];
};

export const GridRackDefinition: ItemDefinition<GridRackParams> = {
    title: "Grid Rack",
    snippet: "A grid-aligned rack for holding long spindly things. Consider using tire weights.",
    category: ItemCategories.GRID,
    render,
    image: "rack.png",
    Controls,
    getSummary: (v) => {
        return `Grid Rack`;
    },
    getInitial: () => {
        return {
            cellX: 3,
            cellY: 1,
            legHeight: { value: 72, unit: "mm" },
            legWidth: { value: 12, unit: "mm" },

            rackDepth: { value: 18, unit: "mm" },
            slotMode: SlotModes.COUNT,
            slotCount: 3,
            slotSpacing: { value: 24, unit: "mm" },
            slotWidth: { value: 6, unit: "mm" },
            slotDepth: { value: 12, unit: "mm" },

            includeFootwell: true,
            footwellDepth: { value: 18, unit: "mm" },
            restAngle: 30,
            footLayout: FootLayouts.SPARSE,

            doubleUpRack: true,
            doubleUpFootwell: false,
            doubleUpLegs: true,

            hasPlatformThickness: false,
            platformThickness: { value: 0.125, unit: "in" },
            hasLegThickness: false,
            legThickness: { value: 0.125, unit: "in" },
            hasRackThickness: false,
            rackThickness: { value: 0.125, unit: "in" },
            hasFootwellThickness: false,
            footwellThickness: { value: 0.125, unit: "in" },

            ...initialSystemOverrides(),
            ...initialFootOverrides(),
        };
    },
};
