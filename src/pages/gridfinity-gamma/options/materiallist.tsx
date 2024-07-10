import { Dispatch, SetStateAction, useMemo } from "react";
import { useMaterialList } from "../state";
import styled from "styled-components";
import ActionButton from "../../../components/buttons/ActionButton";
import { ArraySelect } from "../../../components/selectors/ArraySelect";
import { Section } from "../widgets";

export const MaterialList = ({ selected, setSelected }: { selected: number | null; setSelected: Dispatch<SetStateAction<null | number>> }) => {
    const [list, listMethods] = useMaterialList();

    const existingList = useMemo(() => {
        return list.map((material) => `${material.width.value}${material.width.unit} x ${material.height.value}${material.height.unit} @ ${material.thickness.value}${material.thickness.unit}`);
    }, [list]);

    return (
        <>
            <Section>Materials</Section>
            <Options>
                <ActionButton
                    onAction={() => {
                        listMethods.add({
                            width: { value: 450, unit: "mm" },
                            height: { value: 300, unit: "mm" },
                            thickness: { value: 0.125, unit: "in" },
                            hasLayoutMargin: false,
                            layoutMargin: { value: 2, unit: "mm" },
                            hasLayoutSpacing: false,
                            layoutSpacing: { value: 2, unit: "mm" },
                        });
                        setSelected(list.length);
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
            <List className={"list"} onSelect={setSelected} value={selected} options={existingList} />
        </>
    );
};

const List = styled(ArraySelect)`
    flex: 1 0 30%;
`;

const Options = styled.div`
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 0.5em;
`;
