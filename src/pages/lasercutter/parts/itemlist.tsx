import styled from "styled-components";
import { useItemList } from "../systemstate";
import { Fragment, useMemo } from "react";
import { Section } from "./common";
import ActionButton from "../../../components/buttons/ActionButton";
import Modal, { useModal } from "../../../components/popups/Modal";
import { ITEM_DEFINITIONS } from "../definitions";
import { colorToHex } from "../../../utility/mathhelper";
import { Color } from "../../../utility/types/units";

export const ItemList = styled(({ className, material, selected, onSelect }: { className?: string; material: number; selected: number | null; onSelect: (idx: number | null) => void }) => {
    const [items, methods] = useItemList(material);

    const createModalControls = useModal();

    return (
        <>
            <Modal controls={createModalControls} label={"Add Item"} noBackdropClose>
                <AddList>
                    {Object.entries(ITEM_DEFINITIONS).map(([type, def]) => {
                        return (
                            <Fragment key={type}>
                                <ActionButton
                                    onAction={() => {
                                        methods.add({ quantity: 1, color: { r: 0, g: 0, b: 0, a: 1 }, ...def.getInitial() });
                                        onSelect(items.length);
                                        createModalControls.close();
                                    }}
                                >
                                    {def.getTitle()}
                                </ActionButton>
                                <div>{def.getDescription()}</div>
                            </Fragment>
                        );
                    })}
                </AddList>
                <ModalButtons>
                    <ActionButton
                        flavour={"danger"}
                        onAction={() => {
                            createModalControls.close();
                        }}
                    >
                        Cancel
                    </ActionButton>
                </ModalButtons>
            </Modal>
            <div className={className}>
                <Section className={"span"}>Item List</Section>
                <ArraySelect className={"span"}>
                    {items.map(({ color, quantity, ...item }, i) => {
                        const { getLabel } = ITEM_DEFINITIONS[item.type];
                        return (
                            <Item
                                key={i}
                                className={i === selected ? "state-selected" : ""}
                                onClick={() => {
                                    onSelect(i === selected ? null : i);
                                }}
                            >
                                <Swatch value={color} />
                                <div>{getLabel(item)}</div>
                                <div>x{quantity}</div>
                            </Item>
                        );
                    })}
                </ArraySelect>
                <ActionButton
                    onAction={() => {
                        createModalControls.open();
                    }}
                >
                    Add Item
                </ActionButton>
                <ActionButton
                    flavour="danger"
                    disabled={selected === null}
                    onAction={() => {
                        methods.delete(selected);
                        onSelect(null);
                    }}
                >
                    Delete Item
                </ActionButton>
            </div>
        </>
    );
})`
    display: grid;
    grid-template-rows: auto minmax(200px, 1fr) auto;
    grid-template-columns: 1fr 1fr;

    & > .span {
        grid-column: 1 / -1;
    }
`;

const AddList = styled.div`
    display: grid;
    grid-template-columns: max-content 1fr;
    align-items: center;
    gap: 0.25em 0.5em;
    overflow-y: auto;
`;

const ArraySelect = styled.div`
    background: var(--theme-area-bg);
    border: 1px solid var(--theme-area-border);
    padding: 1px;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
`;

const Item = styled.div`
    cursor: pointer;
    padding: 1px 0.5em;
    &.state-selected {
        background: var(--theme-option_selected-bg);
    }
    display: grid;
    align-items: center;
    grid-auto-flow: column;
    grid-auto-columns: auto;
    grid-template-columns: auto 1fr;
    gap: 0.25em;
`;

const ModalButtons = styled.div`
    display: grid;
`;

const Swatch = styled(({ value, className }: { value: Color; className?: string }) => {
    const style = useMemo(
        () => ({
            backgroundColor: colorToHex(value) ?? "none",
        }),
        [value]
    );
    return <div className={className} style={style} />;
})`
    outline: 1px solid var(--effect-border-highlight);
    width: 1.25em;
    height: 1.25em;
`;
