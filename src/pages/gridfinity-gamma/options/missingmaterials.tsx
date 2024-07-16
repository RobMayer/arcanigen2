import { useMemo } from "react";
import styled from "styled-components";
import { useItemList, useMaterialList, useGlobalSettings } from "../state";
import { ItemDefinition } from "../types";
import { WarningBox } from "../widgets";
import { ITEM_DEFINITIONS } from "../definitions";

export const MissingMaterials = () => {
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
            const parts = (ITEM_DEFINITIONS[type] as ItemDefinition<unknown>).render(props, globals);
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
    }, [globals, itemList, materialList]);

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
