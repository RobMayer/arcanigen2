import styled from "styled-components";
import CheckBox from "../../../components/buttons/Checkbox";
import { NumericInput } from "../../../components/inputs/NumericInput";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import { convertLength } from "../../../utility/mathhelper";
import { PhysicalLength } from "../../../utility/types/units";
import { drawRect, cutRect, drawArray } from "../cuthelper";
import { Wide, ItemPanel, Label, Section } from "../parts/common";
import { ItemControlProps, ItemDefinition, GridSystem, Material, FOOT_STYLES } from "../types";

export type FootJigParams = {
    type: "FOOTJIG";
    cellX: number;
    cellY: number;
    slotClearance: PhysicalLength;
    hasFrame: boolean;
    frameSize: PhysicalLength;
    frameClearance: PhysicalLength;
};

const Controls = ({ value, setValue, grid }: ItemControlProps<FootJigParams>) => {
    return (
        <ItemPanel value={value} setValue={setValue} label={FootJigDef.getTitle()}>
            <Section>Size</Section>
            <Label>Cells X</Label>
            <NumericInput value={value.cellX} onValidCommit={(v) => setValue("cellX", v)} min={1} step={1} />
            <Label>Cells Y</Label>
            <NumericInput value={value.cellY} onValidCommit={(v) => setValue("cellY", v)} min={1} step={1} />
            <Label>Slot Clr.</Label>
            <PhysicalLengthInput value={value.slotClearance} onValidCommit={(v) => setValue("slotClearance", v)} />
            <Spacer />
            <Label>Use Frame</Label>
            <Wide>
                <CheckBox checked={value.hasFrame} onToggle={(v) => setValue("hasFrame", v)}>
                    (useful for aligning feet on a box)
                </CheckBox>
            </Wide>
            <Label>Frame Size</Label>
            <PhysicalLengthInput value={value.frameSize} onValidCommit={(v) => setValue("frameSize", v)} />
            <Label>Frame Clr.</Label>
            <PhysicalLengthInput value={value.frameClearance} onValidCommit={(v) => setValue("frameClearance", v)} />
        </ItemPanel>
    );
};

const getLayout = (item: FootJigParams, material: Material, grid: GridSystem) => {
    const materialThickness = convertLength(material.thickness, "mm").value;
    const footSize = convertLength(grid.footSize, "mm").value;
    const gridTab = convertLength(grid.gridTab, "mm").value;

    const gridSize = convertLength(grid.gridSize, "mm").value;
    const footClearance = convertLength(grid.footClearance, "mm").value;
    const gridClearance = convertLength(grid.gridClearance, "mm").value;
    const slotClearance = convertLength(item.slotClearance, "mm").value;
    const frameClearance = convertLength(item.frameClearance, "mm").value;

    const hasFrame = item.hasFrame ?? false;
    const frameSize = convertLength(item.frameSize, "mm").value;

    const runnerOffset = gridSize / 2 - materialThickness * 1.5 - footClearance;

    const runnerInner = [
        `m 0,${runnerOffset}`,
        cutRect((gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize + slotClearance * 2, materialThickness + slotClearance * 2),
        `m 0,${-runnerOffset}`,
        `m 0,${-runnerOffset}`,
        cutRect((gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize + slotClearance * 2, materialThickness + slotClearance * 2),
        `m 0,${runnerOffset}`,

        `m ${runnerOffset},0`,
        cutRect(materialThickness + slotClearance * 2, (gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize + slotClearance * 2),
        `m ${-runnerOffset},0`,
        `m ${-runnerOffset},0`,
        cutRect(materialThickness + slotClearance * 2, (gridTab / 2 + footSize / 2 + materialThickness) * 2 + footSize + slotClearance * 2),
        `m ${runnerOffset},0`,
        "",
    ].join(" ");

    // const bOffset = gridSize / 2 - materialThickness - footSize - stackClearance - gridClearance;

    const blockInner = cutRect(gridSize - materialThickness * 2 - footClearance * 2 + slotClearance * 2, gridSize - materialThickness * 2 - footClearance * 2 + slotClearance * 2);

    const bracketInner = [
        cutRect(gridSize - materialThickness * 2 - footClearance * 2 + slotClearance * 2, gridSize - materialThickness * 2 - footClearance * 2 + slotClearance * 2),
        cutRect(gridSize - materialThickness * 2 - footClearance * 2 - footSize * 2 + slotClearance * 2, gridSize - materialThickness * 2 - footClearance * 2 - footSize * 2 + slotClearance * 2),
    ].join(" ");

    let theJig = "";
    switch (grid.footStyle) {
        case "RUNNER":
            theJig = runnerInner;
            break;
        case "BLOCK":
            theJig = blockInner;
            break;
        case "BRACKET":
            theJig = bracketInner;
            break;
    }

    const borderPath = [
        drawRect(gridSize * item.cellX - gridClearance * 2 + frameSize * 2, gridSize * item.cellY - gridClearance * 2 + frameSize * 2),
        cutRect(gridSize * item.cellX - gridClearance * 2 + frameClearance * 2, gridSize * item.cellY + frameClearance * 2),
    ];

    const jigPath: string[] = [
        hasFrame
            ? drawRect(gridSize * item.cellX - gridClearance * 2 + frameSize * 2, gridSize * item.cellY - gridClearance * 2 + frameSize * 2)
            : drawRect(gridSize * item.cellX - gridClearance * 2, gridSize * item.cellY - gridClearance * 2),
        drawArray({ count: item.cellX, spacing: gridSize }, { count: item.cellY, spacing: gridSize }, theJig),
    ];

    return hasFrame
        ? [
              {
                  width: item.cellX * gridSize - gridClearance * 2 + frameSize * 2,
                  height: item.cellY * gridSize - gridClearance * 2 + frameSize * 2,
                  path: jigPath.join(" "),
              },
              {
                  width: item.cellX * gridSize - gridClearance * 2 + (hasFrame ? frameSize * 2 : 0),
                  height: item.cellY * gridSize - gridClearance * 2 + (hasFrame ? frameSize * 2 : 0),
                  path: borderPath.join(" "),
              },
          ]
        : [
              {
                  width: item.cellX * gridSize - gridClearance * 2,
                  height: item.cellY * gridSize - gridClearance * 2,
                  path: jigPath.join(" "),
              },
          ];
};

export const FootJigDef: ItemDefinition<FootJigParams> = {
    getLayout,
    Controls,
    getInitial: () => ({
        type: "FOOTJIG",
        cellX: 1,
        cellY: 1,
        slotClearance: { value: 0, unit: "mm" },
        hasFrame: true,
        frameSize: { value: 8, unit: "mm" },
        frameClearance: { value: -0.125, unit: "mm" },
    }),
    getLabel: (item) => `Foot Jig`,
    getTitle: () => `Foot Jig`,
    getDescription: () => "Use this to help align the feet on a box.",
};

const Spacer = styled.div`
    grid-column-end: span 2;
`;
