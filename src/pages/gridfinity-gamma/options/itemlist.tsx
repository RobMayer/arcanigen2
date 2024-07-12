import { Dispatch, SetStateAction, useMemo } from "react";
import styled from "styled-components";
import ActionButton from "../../../components/buttons/ActionButton";
import { useItemList, useItemState } from "../state";
import { ItemDefinition, ItemInstance, ItemType } from "../types";
import Modal, { useModal } from "../../../components/popups/Modal";
import { ArraySelect } from "../../../components/selectors/ArraySelect";
import { Section } from "../widgets";
import { AddItem } from "./additem";
import { ITEM_DEFINITIONS } from "../definitions";
import saveAs from "file-saver";

export const ItemList = ({ selected, setSelected }: { selected: number | null; setSelected: Dispatch<SetStateAction<null | number>> }) => {
    const [list, listMethods] = useItemList();
    const controls = useModal();

    const existingItems = useMemo(() => {
        return list.map((each) => {
            return (ITEM_DEFINITIONS[each.type] as ItemDefinition<unknown>).getSummary(each);
        });
    }, [list]);

    return (
        <>
            <Modal controls={controls} label={"Add Item"}>
                <AddItem
                    onPick={(type: ItemType) => {
                        listMethods.add({ type, quantity: 1, ...ITEM_DEFINITIONS[type].getInitial() });
                        setSelected(list.length);
                        controls.close();
                    }}
                />
            </Modal>
            <Section>Items</Section>
            <Options>
                <ActionButton
                    onAction={() => {
                        controls.open();
                    }}
                >
                    Add
                </ActionButton>
                <LoadButton />
                {selected === null ? <ActionButton disabled>Save</ActionButton> : <SaveButton selected={selected} />}
                <ActionButton
                    onAction={() => {
                        listMethods.delete(selected);
                        setSelected(null);
                    }}
                    disabled={selected === null}
                    flavour={"danger"}
                >
                    Remove
                </ActionButton>
                <ActionButton
                    onAction={() => {
                        listMethods.clear();
                        setSelected(null);
                    }}
                    disabled={list.length === 0}
                    flavour={"danger"}
                >
                    Clear
                </ActionButton>
            </Options>
            <List className={"list"} onSelect={setSelected} value={selected} options={existingItems} />
        </>
    );
};

const List = styled(ArraySelect)`
    flex: 1 0 50%;
`;

const Options = styled.div`
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 0.5em;
`;

const SaveButton = ({ selected }: { selected: number }) => {
    const [value] = useItemState(selected);

    return (
        <ActionButton
            onAction={() => {
                const definition = ITEM_DEFINITIONS[value.type];
                const { type, quantity, ...props } = value;
                const blob = new Blob([JSON.stringify({ type, ...props })], { type: "application/json;charset=utf-8" });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                saveAs(blob, `${definition.getSummary(value as any)}.ggo`);
            }}
        >
            Save
        </ActionButton>
    );
};

const LoadButton = () => {
    const [, listMethods] = useItemList();

    return (
        <ActionButton>
            Load
            <input
                type="file"
                onChange={(e) => {
                    const thing = e.target.files?.[0];
                    if (thing) {
                        handleUpload(e.target, thing, ({ type, quantity, ...props }) => {
                            listMethods.add({
                                type,
                                quantity: 1,
                                ...props,
                            });
                        });
                    }
                }}
                accept=".ggo"
            />
        </ActionButton>
    );
};

const handleUpload = (element: HTMLInputElement, file: File, dispatch: (value: ItemInstance<ItemType>) => void) => {
    if (file) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (evt) => {
            if (evt?.target?.result && typeof evt.target.result === "string") {
                try {
                    const json = JSON.parse(evt.target.result) as ItemInstance<ItemType>;
                    if (json) {
                        dispatch(json);
                    } else {
                        console.error("problem parsing uploaded file");
                    }
                } catch (e) {
                    console.error("problem parsing json");
                } finally {
                    element.value = "";
                }
            }
        };
        reader.onerror = (evt) => {
            console.error("problem reading file");
            element.value = "";
        };
    }
};
