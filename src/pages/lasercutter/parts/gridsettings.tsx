import { useGridState } from "../systemstate";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import ToggleList from "../../../components/selectors/ToggleList";
import { FOOT_STYLE_OPTIONS } from "../types";
import { Label, Wide, ControlPanel } from "./common";
import { ControlledFoldout } from "../../../components/containers/Foldout";

import styled from "styled-components";
import useUIState from "../../../utility/hooks/useUIState";

export const GridSettings = () => {
    const [value, setValue] = useGridState();
    const [isOpen, setIsOpen] = useUIState("lasercutter.gridFoldout", true);

    return (
        <ControlledFoldout label={"Grid Settings"} isOpen={isOpen} onToggle={setIsOpen}>
            <ControlPanel>
                <Label>Grid Size</Label>
                <PhysicalLengthInput value={value.gridSize} onValidCommit={(v) => setValue("gridSize", v)} />
                <Label>Stack Size</Label>
                <PhysicalLengthInput value={value.stackSize} onValidCommit={(v) => setValue("stackSize", v)} />
                <Label>Grid Clr.</Label>
                <PhysicalLengthInput value={value.gridClearance} onValidCommit={(v) => setValue("gridClearance", v)} />
                <Spacer />
                <Label>Grid Tab</Label>
                <PhysicalLengthInput value={value.gridTab} onValidCommit={(v) => setValue("gridTab", v)} />
                <Label>Stack Tab</Label>
                <PhysicalLengthInput value={value.stackTab} onValidCommit={(v) => setValue("stackTab", v)} />
                <Label>Foot Style</Label>
                <Wide>
                    <ToggleList
                        options={FOOT_STYLE_OPTIONS}
                        value={value.footStyle}
                        onSelect={(v) => {
                            setValue("footStyle", v);
                        }}
                    />
                </Wide>
                <Label>Foot Size</Label>
                <PhysicalLengthInput value={value.footSize} onValidCommit={(v) => setValue("footSize", v)} />
                <Label>Foot Clr.</Label>
                <PhysicalLengthInput value={value.footClearance} onValidCommit={(v) => setValue("footClearance", v)} />
            </ControlPanel>
        </ControlledFoldout>
    );
};

const Spacer = styled.div`
    grid-column-end: span 2;
`;
