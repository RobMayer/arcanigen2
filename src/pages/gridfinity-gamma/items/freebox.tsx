import { ReactNode } from "react";
import { Enum, GlobalSettings, ItemCategories, ItemControlProps, ItemDefinition, LayoutPart, Shape } from "../types";
import { ControlPanel, Input, Section, Sep } from "../widgets";
import { NumericInput } from "../../../components/inputs/NumericInput";
import ToggleList from "../../../components/selectors/ToggleList";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import useUIState from "../../../utility/hooks/useUIState";
import { PhysicalLength } from "../../../utility/types/units";
import Checkbox from "../../../components/buttons/Checkbox";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import { convertLength } from "../../../utility/mathhelper";
import { Draw } from "../utility/drawhelper";

const Datums = {
    INSIDE: "INSIDE",
    OUTSIDE: "OUTSIDE",
} as const;

type Datum = Enum<typeof Datums>;

const DATUM_OPTIONS: { [key in Datum]: ReactNode } = {
    [Datums.INSIDE]: "Inside",
    [Datums.OUTSIDE]: "Outside",
};

export const TopStyles = {
    NONE: "NONE",
    FLUSH: "FLUSH",
    INSET: "INSET",
} as const;

type TopStyle = Enum<typeof TopStyles>;

export const TOP_STYLE_OPTIONS: { [key in TopStyle]: ReactNode } = {
    [TopStyles.NONE]: "None",
    [TopStyles.FLUSH]: "Flush",
    [TopStyles.INSET]: "Inset",
};

const Controls = ({ value, setValue }: ItemControlProps<FreeBoxParams>) => {
    const [isThicknessOpen, setIsThicknessOpen] = useUIState("gridfinity.items.freebox.thickness", false);

    return (
        <>
            <ControlPanel>
                <Section>X-Axis</Section>
                <Input label={"Length"}>
                    <PhysicalLengthInput value={value.sizeX} onValidValue={setValue("sizeX")} min={0} minExclusive />
                </Input>
                <Input label={"Measured From"}>
                    <ToggleList value={value.datumX} options={DATUM_OPTIONS} onSelect={setValue("datumX")} />
                </Input>
                <Input label={"Clearance"}>
                    <PhysicalLengthInput value={value.clearanceX} onValidValue={setValue("clearanceX")} min={0} />
                </Input>
                <Input label="Tab Count">
                    <NumericInput value={value.tabXCount} onValidValue={setValue("tabXCount")} min={1} step={1} />
                </Input>
                <Input label={"Tab Size"}>
                    <PhysicalLengthInput value={value.tabXSize} onValidValue={setValue("tabXSize")} min={0} minExclusive />
                </Input>
                <Section>Y-Axis</Section>
                <Input label={"Length"}>
                    <PhysicalLengthInput value={value.sizeY} onValidValue={setValue("sizeY")} min={0} minExclusive />
                </Input>
                <Input label={"Measured From"}>
                    <ToggleList value={value.datumY} options={DATUM_OPTIONS} onSelect={setValue("datumY")} />
                </Input>
                <Input label={"Clearance"}>
                    <PhysicalLengthInput value={value.clearanceY} onValidValue={setValue("clearanceY")} min={0} />
                </Input>
                <Input label="Tab Count">
                    <NumericInput value={value.tabYCount} onValidValue={setValue("tabYCount")} min={1} step={1} />
                </Input>
                <Input label={"Tab Size"}>
                    <PhysicalLengthInput value={value.tabYSize} onValidValue={setValue("tabYSize")} min={0} minExclusive />
                </Input>
                <Section>Z-Axis</Section>
                <Input label={"Length"}>
                    <PhysicalLengthInput value={value.sizeZ} onValidValue={setValue("sizeZ")} min={0} minExclusive />
                </Input>
                <Input label={"Measured From"}>
                    <ToggleList value={value.datumZ} options={DATUM_OPTIONS} onSelect={setValue("datumZ")} />
                </Input>
                <Input label={"Clearance"}>
                    <PhysicalLengthInput value={value.clearanceZ} onValidValue={setValue("clearanceZ")} min={0} />
                </Input>

                <Input label="Tab Count">
                    <NumericInput value={value.tabZCount} onValidValue={setValue("tabZCount")} min={1} step={1} />
                </Input>
                <Input label={"Tab Size"}>
                    <PhysicalLengthInput value={value.tabZSize} onValidValue={setValue("tabZSize")} min={0} minExclusive />
                </Input>

                <Sep />
                <Input label={"Thickness"}>
                    <PhysicalLengthInput value={value.thickness} onValidValue={setValue("thickness")} min={0} minExclusive />
                </Input>
                <Input label={"Top Style"}>
                    <ToggleList value={value.topStyle} options={TOP_STYLE_OPTIONS} onSelect={setValue("topStyle")} />
                </Input>
                <Input label={"Inset Depth"}>
                    <PhysicalLengthInput value={value.insetDepth} onValidCommit={setValue("insetDepth")} min={0} />
                </Input>

                <Section>Dividers</Section>
                <Input label={"Dividers X"}>
                    <NumericInput value={value.divX} onValidCommit={setValue("divX")} min={0} step={1} />
                </Input>
                <Input label={"Dividers Y"}>
                    <NumericInput value={value.divY} onValidCommit={setValue("divY")} min={0} step={1} />
                </Input>
                <Input label={"Divider Depth"}>
                    <PhysicalLengthInput value={value.divDepth} onValidCommit={setValue("divDepth")} min={0} />
                </Input>
                <Input label={"Divider Tab Size"}>
                    <PhysicalLengthInput value={value.tabDivSize} onValidCommit={setValue("tabDivSize")} min={0} minExclusive />
                </Input>
                <Input label={"Divider Tab Count"}>
                    <NumericInput value={value.tabDivCount} onValidCommit={setValue("tabDivCount")} min={0} minExclusive />
                </Input>
                <Sep />
            </ControlPanel>

            <ControlledFoldout isOpen={isThicknessOpen} onToggle={setIsThicknessOpen} label={"Thickness Overrides"}>
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
                </ControlPanel>
            </ControlledFoldout>
        </>
    );
};

const draw = (item: FreeBoxParams, globals: GlobalSettings): LayoutPart[] => {
    const resBottomThickness = item.hasBottomThickness ? item.bottomThickness : item.thickness;
    const resWallThickness = item.hasWallThickness ? item.wallThickness : item.thickness;
    const resTopThickness = item.hasTopThickness ? item.topThickness : item.thickness;
    const resDivThickness = item.hasDivThickness ? item.divThickness : item.thickness;

    const bottomThickness = convertLength(resBottomThickness, "mm").value;
    const wallThickness = convertLength(resWallThickness, "mm").value;
    const topThickness = convertLength(resTopThickness, "mm").value;
    const divThickness = convertLength(resDivThickness, "mm").value;

    const insetDepth = convertLength(item.insetDepth, "mm").value;
    const divDepth = convertLength(item.divDepth, "mm").value;

    const clearanceX = convertLength(item.clearanceX, "mm").value;
    const clearanceY = convertLength(item.clearanceY, "mm").value;
    const clearanceZ = convertLength(item.clearanceZ, "mm").value;

    let boxTopOffset = 0;
    let divTopOffset = 0;
    if (item.topStyle === TopStyles.NONE) {
        divTopOffset = divDepth;
        boxTopOffset = 0;
    }
    if (item.topStyle === TopStyles.FLUSH) {
        divTopOffset = topThickness;
        boxTopOffset = topThickness;
    }
    if (item.topStyle === TopStyles.INSET) {
        divTopOffset = insetDepth + topThickness;
        boxTopOffset = insetDepth + topThickness;
    }

    const targetX = convertLength(item.sizeX, "mm").value;
    const targetY = convertLength(item.sizeY, "mm").value;
    const targetZ = convertLength(item.sizeZ, "mm").value;

    const externalX = targetX + (item.datumX === "OUTSIDE" ? clearanceX * -2 : clearanceX * 2 + wallThickness * 2);
    const externalY = targetY + (item.datumY === "OUTSIDE" ? clearanceY * -2 : clearanceY * 2 + wallThickness * 2);
    const externalZ = targetZ + (item.datumZ === "OUTSIDE" ? clearanceZ * -2 : clearanceZ * 2 + bottomThickness + boxTopOffset);

    const divHeight = externalZ - bottomThickness - divTopOffset;

    const tabXSpacing = targetX / item.tabXCount;
    const tabYSpacing = targetY / item.tabYCount;
    const tabZSpacing = targetZ / item.tabZCount;

    const tabDivSpacing = divHeight / item.tabDivCount;

    const divXSpacing = (externalX - wallThickness * 2 + divThickness) / (item.divX + 1);
    const divYSpacing = (externalY - wallThickness * 2 + divThickness) / (item.divY + 1);

    const calculatedParams = {
        sizeX: externalX,
        sizeY: externalY,
        sizeZ: externalZ,
        divY: item.divY,
        divX: item.divX,
        divHeight,

        tabXSize: convertLength(item.tabXSize, "mm").value,
        tabXSpacing,
        tabXCount: item.tabXCount,

        tabYSize: convertLength(item.tabYSize, "mm").value,
        tabYSpacing,
        tabYCount: item.tabYCount,

        tabZSize: convertLength(item.tabZSize, "mm").value,
        tabZSpacing,
        tabZCount: item.tabZCount,

        tabDivSize: convertLength(item.tabDivSize, "mm").value,
        tabDivCount: item.tabDivCount,
        tabDivSpacing,

        wallThickness,
        bottomThickness,
        topThickness,
        insetDepth,
        divThickness,
        hasTop: item.topStyle === TopStyles.FLUSH,
        divXSpacing,
        divYSpacing,
        topSquat: 0,
    };

    const shapes: Shape[] = [];

    shapes.push({
        name: "Bottom",
        thickness: resBottomThickness,
        width: calculatedParams.sizeX,
        height: calculatedParams.sizeY,
        path: Draw.Box.bottom(calculatedParams),
    });

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
            name: "FreeformBox",
            copies: 1,
            shapes,
        },
    ];
};

export type FreeBoxParams = {
    sizeX: PhysicalLength;
    datumX: Datum;
    clearanceX: PhysicalLength;
    tabXSize: PhysicalLength;
    tabXCount: number;

    sizeY: PhysicalLength;
    datumY: Datum;
    clearanceY: PhysicalLength;
    tabYSize: PhysicalLength;
    tabYCount: number;

    sizeZ: PhysicalLength;
    datumZ: Datum;
    clearanceZ: PhysicalLength;
    tabZSize: PhysicalLength;
    tabZCount: number;

    thickness: PhysicalLength;

    divX: number;
    divY: number;
    divDepth: PhysicalLength;
    tabDivSize: PhysicalLength;
    tabDivCount: number;

    topStyle: TopStyle;
    insetDepth: PhysicalLength;

    hasWallThickness: boolean;
    wallThickness: PhysicalLength;
    hasBottomThickness: boolean;
    bottomThickness: PhysicalLength;
    hasTopThickness: boolean;
    topThickness: PhysicalLength;
    hasDivThickness: boolean;
    divThickness: PhysicalLength;
};

export const FreeBoxDefinition: ItemDefinition<FreeBoxParams> = {
    title: "Freeform Box",
    snippet: "A Freeform box. Has provisions for dividers.",
    category: ItemCategories.FREE,
    draw,
    image: "box.png",
    Controls,
    getSummary: (p) => {
        const n = `Freeform Box ${p.sizeX.value}${p.sizeX.unit} x ${p.sizeY.value}${p.sizeY.unit} x ${p.sizeZ.value}${p.sizeZ.unit}`;
        if (p.divX > 0 || p.divY > 0) {
            return `${n} (div ${p.divX + 1}x${p.divY + 1})`;
        }
        return n;
    },
    getInitial: () => {
        return {
            sizeX: { value: 48, unit: "mm" },
            datumX: Datums.OUTSIDE,
            clearanceX: { value: 0, unit: "mm" },
            tabXSize: { value: 12, unit: "mm" },
            tabXCount: 1,
            sizeY: { value: 48, unit: "mm" },
            datumY: Datums.OUTSIDE,
            clearanceY: { value: 0, unit: "mm" },
            tabYSize: { value: 12, unit: "mm" },
            tabYCount: 1,
            sizeZ: { value: 48, unit: "mm" },
            datumZ: Datums.OUTSIDE,
            clearanceZ: { value: 0, unit: "mm" },
            tabZSize: { value: 12, unit: "mm" },
            tabZCount: 1,
            divX: 0,
            divY: 0,
            tabDivSize: { value: 12, unit: "mm" },
            tabDivCount: 1,
            topStyle: TopStyles.NONE,
            insetDepth: { value: 0.125, unit: "in" },

            thickness: { value: 0.125, unit: "in" },
            divDepth: { value: 0.125, unit: "in" },

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
        };
    },
};
