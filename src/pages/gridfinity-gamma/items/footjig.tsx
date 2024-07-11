import { NumericInput } from "../../../components/inputs/NumericInput";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import { convertLength } from "../../../utility/mathhelper";
import { PhysicalLength } from "../../../utility/types/units";
import { Draw } from "../utility/drawhelper";
import { FootOverrideControls, FootOverrides, initialFootOverrides, initialSystemOverrides, SystemOverrideControls, SystemOverrides } from "../utility/overridehelper";
import { GlobalSettings, ItemCategories, ItemControlProps, ItemDefinition, LayoutPart } from "../types";
import { ControlPanel, Input } from "../widgets";

type FootJigParams = {
    cellX: number;
    cellY: number;
    frameWidth: PhysicalLength;
    tolerance: PhysicalLength;
} & FootOverrides &
    SystemOverrides;

const Controls = ({ value, globals, setValue }: ItemControlProps<FootJigParams>) => {
    return (
        <>
            <ControlPanel>
                <Input label={"Cell X"}>
                    <NumericInput value={value.cellX} onValidValue={setValue("cellX")} min={1} step={1} />
                </Input>
                <Input label={"Cell Y"}>
                    <NumericInput value={value.cellY} onValidValue={setValue("cellY")} min={1} step={1} />
                </Input>
                <Input label={"Frame Width"}>
                    <PhysicalLengthInput value={value.frameWidth} onValidValue={setValue("frameWidth")} />
                </Input>
                <Input label={"Tolerance Adj."}>
                    <PhysicalLengthInput value={value.tolerance} onValidValue={setValue("tolerance")} />
                </Input>
            </ControlPanel>
            <FootOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.footjig.footOverrides"} />
            <SystemOverrideControls value={value} setValue={setValue} foldout={"gridfinity.items.footjig.systemOverrides"} />
        </>
    );
};

const draw = (item: FootJigParams, globals: GlobalSettings): LayoutPart[] => {
    const gridSize = convertLength(item.hasGridSize ? item.gridSize : globals.gridSize, "mm").value;
    const gridClearance = convertLength(item.hasGridClearance ? item.gridClearance : globals.gridClearance, "mm").value;

    const footStyle = item.hasFootStyle ? item.footStyle : globals.footStyle;
    const footClearance = convertLength(item.hasFootClearance ? item.footClearance : globals.footClearance, "mm").value;
    const footRunnerWidth = convertLength(item.hasFootRunnerWidth ? item.footRunnerWidth : globals.hasFootRunnerWidth ? globals.footRunnerWidth : globals.thickness, "mm").value;
    const footRunnerTab = convertLength(item.hasFootRunnerTab ? item.footRunnerTab : globals.footRunnerTab, "mm").value;
    const footRunnerGap = convertLength(item.hasFootRunnerGap ? item.footRunnerGap : globals.footRunnerGap, "mm").value;
    const footBracketWidth = convertLength(item.hasFootBracketWidth ? item.footBracketWidth : globals.footBracketWidth, "mm").value;
    const gridInset = convertLength(item.hasGridInset ? item.gridInset : globals.hasGridInset ? globals.gridInset : globals.thickness, "mm").value;

    const frameWidth = convertLength(item.frameWidth, "mm").value;
    const tolerance = convertLength(item.tolerance, "mm").value;

    const runnerOffset = gridSize / 2 - footClearance - gridInset - footRunnerWidth / 2;

    let footBit = "";
    switch (footStyle) {
        case "RUNNER":
            footBit = [
                `m 0,${runnerOffset}`,
                Draw.cutRect(footRunnerGap + footRunnerTab * 2 + tolerance * 2, footRunnerWidth + tolerance * 2, "MIDDLE CENTER"),
                `m 0,${-runnerOffset}`,
                `m 0,${-runnerOffset}`,
                Draw.cutRect(footRunnerGap + footRunnerTab * 2 + tolerance * 2, footRunnerWidth + tolerance * 2, "MIDDLE CENTER"),
                `m 0,${runnerOffset}`,

                `m ${runnerOffset},0`,
                Draw.cutRect(footRunnerWidth + tolerance * 2, footRunnerGap + footRunnerTab * 2 + tolerance * 2, "MIDDLE CENTER"),
                `m ${-runnerOffset},0`,
                `m ${-runnerOffset},0`,
                Draw.cutRect(footRunnerWidth + tolerance * 2, footRunnerGap + footRunnerTab * 2 + tolerance * 2, "MIDDLE CENTER"),
                `m ${runnerOffset},0`,
            ].join(" ");
            break;
        case "BLOCK":
            footBit = Draw.cutRect(gridSize - gridInset * 2 - footClearance * 2 + tolerance * 2, gridSize - gridInset * 2 - footClearance * 2 + tolerance * 2, "MIDDLE CENTER");
            break;
        case "BRACKET":
            footBit = [
                Draw.cutRect(gridSize - gridInset * 2 - footClearance * 2 + tolerance * 2, gridSize - gridInset * 2 - footClearance * 2 + tolerance * 2, "MIDDLE CENTER"),
                Draw.rect(
                    gridSize - gridInset * 2 - footClearance * 2 - tolerance * 2 - footBracketWidth * 2,
                    gridSize - gridInset * 2 - footClearance * 2 - tolerance * 2 - footBracketWidth * 2,
                    "MIDDLE CENTER"
                ),
            ].join(" ");
            break;
    }

    return [
        {
            name: "Foot Jig",
            copies: 1,
            shapes: [
                {
                    width: item.cellX * gridSize + frameWidth * 2,
                    height: item.cellY * gridSize + frameWidth * 2,
                    path: Draw.offsetOrigin((item.cellX * gridSize + frameWidth * 2) / 2, (item.cellY * gridSize + frameWidth * 2) / 2, [
                        Draw.rect(item.cellX * gridSize + frameWidth * 2, item.cellY * gridSize + frameWidth * 2, "MIDDLE CENTER"),
                        Draw.cutRect(item.cellX * gridSize - gridClearance * 2 + tolerance * 2, item.cellY * gridSize - gridClearance * 2 + tolerance * 2, "MIDDLE CENTER"),
                    ]),
                    name: "Alignment Frame",
                    thickness: globals.thickness,
                },
                {
                    width: item.cellX * gridSize + frameWidth * 2,
                    height: item.cellY * gridSize + frameWidth * 2,
                    path: Draw.offsetOrigin((item.cellX * gridSize + frameWidth * 2) / 2, (item.cellY * gridSize + frameWidth * 2) / 2, [
                        Draw.rect(item.cellX * gridSize + frameWidth * 2, item.cellY * gridSize + frameWidth * 2, "MIDDLE CENTER"),
                        //Draw.cutRect(item.cellX * gridSize - gridClearance * 2 - tolerance, item.cellY * gridSize - gridClearance * 2 - tolerance, "MIDDLE CENTER"),
                        Draw.array({ count: item.cellX, spacing: gridSize }, { count: item.cellY, spacing: gridSize }, footBit, "MIDDLE CENTER"),
                    ]),
                    name: "Alignment Jig",
                    thickness: globals.thickness,
                },
            ],
        },
    ];
};

export const FootJigDefinition: ItemDefinition<FootJigParams> = {
    title: "Foot Jig",
    snippet: "For aligning feet for gluing",
    image: "footjig.png",
    category: ItemCategories.TOOL,
    draw,
    Controls,
    getSummary: (p) => `Foot Jig ${p.cellX}x${p.cellY}`,
    getInitial: () => ({
        cellX: 1,
        cellY: 1,
        frameWidth: { value: 6, unit: "mm" },
        tolerance: { value: 0, unit: "mm" },
        ...initialFootOverrides(),
        ...initialSystemOverrides(),
    }),
};
