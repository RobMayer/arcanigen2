import styled from "styled-components";
import Page from "../../components/content/Page";
import { HTMLAttributes, useMemo, useState } from "react";
import { GlobalFeetSettings, GlobalLayoutSettings, GlobalSystemSettings } from "./options/globalitemsettings";
import { ItemList } from "./options/itemlist";
import { useGlobalSettings, useItemList, useItemState, useMaterialList, useMaterialState } from "./state";
import { ITEM_DEFINITIONS } from "./types";
import { PerItemLayout } from "./layout/peritem";
import RadioButton from "../../components/buttons/RadioButton";
import { MaterialList } from "./options/materiallist";
import { ControlPanel, Input, Section, WarningBox } from "./widgets";
import { PhysicalLengthInput } from "../../components/inputs/PhysicalLengthInput";
import CheckBox from "../../components/buttons/Checkbox";
import useUIState from "../../utility/hooks/useUIState";
import { PerMaterialLayout } from "./layout/permaterial";

export const GridfinityGamma = styled(({ ...props }: HTMLAttributes<HTMLDivElement>) => {
    const [mode, setMode] = useUIState("gridfinitygamma.mode", "ITEM");

    return (
        <Page {...props}>
            <Menu>
                <RadioButton value={mode} target={"ITEM"} onSelect={setMode}>
                    Item Setup
                </RadioButton>
                <RadioButton value={mode} target={"MATERIAL"} onSelect={setMode}>
                    Material Layout
                </RadioButton>
            </Menu>
            {mode === "ITEM" ? <ItemMode /> : null}
            {mode === "MATERIAL" ? <MaterialMode /> : null}
        </Page>
    );
})`
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: minmax(440px, min-content) minmax(440px, min-content) 5fr;
    padding: 0.5em;
    gap: 0.5em;
    grid-template-areas:
        "menu menu menu"
        "lists options layout";
`;

const ItemMode = () => {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <>
            <ListPane>
                <GlobalSystemSettings />
                <GlobalFeetSettings />
                <GlobalLayoutSettings />
                <ItemList selected={selected} setSelected={setSelected} />
            </ListPane>
            {selected === null ? (
                <NoneSelected>Select or Add an Item</NoneSelected>
            ) : (
                <OptionsPane>
                    <ItemControls selected={selected} />
                </OptionsPane>
            )}
            <LayoutPane>
                <PerItemLayout />
            </LayoutPane>
        </>
    );
};

const MaterialMode = () => {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <>
            <ListPane>
                <GlobalLayoutSettings />
                <MissingMaterials />
                <MaterialList selected={selected} setSelected={setSelected} />
            </ListPane>
            {selected === null ? (
                <NoneSelected>Select or Add a Material</NoneSelected>
            ) : (
                <OptionsPane>
                    <MaterialControls selected={selected} />
                </OptionsPane>
            )}
            <LayoutPane>
                <PerMaterialLayout />
            </LayoutPane>
        </>
    );
};

const Menu = styled.div`
    grid-area: menu;
    display: flex;
    gap: 0.25em;
`;

const ListPane = styled.div`
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    border: 1px solid #fff2;
    padding: 0.5em;
    grid-area: lists;
`;

const OptionsPane = styled.div`
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    border: 1px solid #fff2;
    padding: 0.5em;
    grid-area: options;
`;

const LayoutPane = styled.div`
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    border: 1px solid #fff2;
    padding: 0.5em;
    grid-area: layout;
`;

const NoneSelected = styled.div`
    overflow-y: none;
    display: grid;
    gap: 0.25em;
    padding: 0.5em;
    align-items: center;
    justify-items: center;
    color: #fff8;
    border: 1px solid #fff2;
    grid-area: options;
`;

const ItemControls = ({ selected }: { selected: number }) => {
    const [value, setValue] = useItemState(selected);
    const [globals] = useGlobalSettings();

    const Comp = ITEM_DEFINITIONS[value.type].Controls;

    return <Comp value={value as any} setValue={setValue as any} globals={globals} />;
};

const MaterialControls = ({ selected }: { selected: number }) => {
    const [value, setValue] = useMaterialState(selected);

    return (
        <>
            <ControlPanel>
                <Input label={"Width"}>
                    <PhysicalLengthInput value={value.width} onValidValue={setValue("width")} min={0} minExclusive />
                </Input>
                <Input label={"Height"}>
                    <PhysicalLengthInput value={value.height} onValidValue={setValue("height")} min={0} minExclusive />
                </Input>
                <Input label={"Thickness"}>
                    <PhysicalLengthInput value={value.thickness} onValidValue={setValue("thickness")} min={0} minExclusive />
                </Input>
                <Input label={"Margin"}>
                    <CheckBox checked={value.hasLayoutMargin} onToggle={setValue("hasLayoutMargin")} tooltip={"Override global Margin?"} />
                    <PhysicalLengthInput value={value.layoutMargin} onValidValue={setValue("layoutMargin")} min={0} disabled={!value.hasLayoutMargin} />
                </Input>
                <Input label={"Spacing"}>
                    <CheckBox checked={value.hasLayoutSpacing} onToggle={setValue("hasLayoutSpacing")} tooltip={"Override global Spacing?"} />
                    <PhysicalLengthInput value={value.layoutSpacing} onValidValue={setValue("layoutSpacing")} min={0} disabled={!value.hasLayoutSpacing} />
                </Input>
            </ControlPanel>
        </>
    );
};

const MissingMaterials = () => {
    const [itemList] = useItemList();
    const [materialList] = useMaterialList();
    const [globals] = useGlobalSettings();

    const missing = useMemo(() => {
        const materialThicknesses = new Set<string>();
        const missingThicknesses = new Set<string>();

        materialList.forEach((mat) => {
            materialThicknesses.add(`${mat.thickness.value}${mat.thickness.unit}`);
        });

        itemList.forEach(({ type, ...props }) => {
            const parts = ITEM_DEFINITIONS[type].draw(props as any, globals);
            parts.forEach((part) => {
                part.shapes.forEach(({ thickness }) => {
                    const theThickness = `${thickness.value}${thickness.unit}`;
                    if (!materialThicknesses.has(theThickness)) {
                        missingThicknesses.add(theThickness);
                    }
                });
            });
        });

        return Array.from(missingThicknesses);
    }, [itemList, materialList]);

    if (missing.length === 0) {
        return <></>;
    }

    return (
        <WarningBox>
            Missing Materials of Thickness:
            <MissingList>
                {missing.map((each) => {
                    return <li key={each}>{each}</li>;
                })}
            </MissingList>
        </WarningBox>
    );
};

const MissingList = styled.ul`
    padding-left: 0.25em;
    & > li {
        &:before {
            display: inline-block;
            margin-right: 0.5em;
            content: "»";
        }
    }
`;
