import { Dispatch, SetStateAction, useMemo } from "react";
import styled from "styled-components";
import ActionButton from "../../../components/buttons/ActionButton";
import { useItemList } from "../state";
import { ITEM_DEFINITIONS, ItemType } from "../types";
import Modal, { useModal } from "../../../components/popups/Modal";
import { ArraySelect } from "../../../components/selectors/ArraySelect";
import { Section } from "../widgets";

export const ItemList = ({ selected, setSelected }: { selected: number | null; setSelected: Dispatch<SetStateAction<null | number>> }) => {
    const [list, listMethods] = useItemList();
    const controls = useModal();

    const existingItems = useMemo(() => {
        return list.map((each) => {
            return ITEM_DEFINITIONS[each.type].describe(each as any);
        });
    }, [list]);

    return (
        <>
            <Modal controls={controls} label={"Add Item"}>
                {Object.keys(ITEM_DEFINITIONS).map((type: ItemType) => {
                    return (
                        <ActionButton
                            key={type}
                            onAction={() => {
                                listMethods.add({ type, quantity: 1, ...ITEM_DEFINITIONS[type].getInitial() });
                                setSelected(list.length);
                                controls.close();
                            }}
                        >
                            {ITEM_DEFINITIONS[type].title}
                        </ActionButton>
                    );
                })}
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
