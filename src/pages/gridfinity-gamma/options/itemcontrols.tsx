/* eslint-disable @typescript-eslint/no-explicit-any */
import ActionButton from "../../../components/buttons/ActionButton";
import { ITEM_DEFINITIONS } from "../definitions";
import { useItemState, useGlobalSettings } from "../state";
import { ItemDefinition, ItemInstance } from "../types";
import saveAs from "file-saver";

export const ItemControls = ({ selected }: { selected: number }) => {
    const [value, setValue] = useItemState(selected);
    const [globals] = useGlobalSettings();

    const Def = ITEM_DEFINITIONS[value.type];

    return (
        <>
            <SaveButton value={value} definition={Def} />
            <Def.Controls value={value as any} setValue={setValue as any} globals={globals} />
        </>
    );
};

const SaveButton = ({ value, definition }: { value: ItemInstance<any>; definition: ItemDefinition<any> }) => {
    return (
        <ActionButton
            onAction={() => {
                const { type, quantity, ...props } = value;
                const blob = new Blob([JSON.stringify({ type, ...props })], { type: "application/json;charset=utf-8" });
                saveAs(blob, `${definition.getSummary(value)}.ggo`);
            }}
        >
            Save
        </ActionButton>
    );
};
