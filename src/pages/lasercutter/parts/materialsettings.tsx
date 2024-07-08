import { useMaterialState } from "../systemstate";
import { ControlledFoldout } from "../../../components/containers/Foldout";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import { ControlPanel, Label } from "./common";
import useUIState from "../../../utility/hooks/useUIState";

export const MaterialSettings = ({ material }: { material: number }) => {
    const [value, setValue] = useMaterialState(material);

    const [isOpen, setIsOpen] = useUIState("lasercutter.materialFoldout", true);

    return (
        <ControlledFoldout label={"Material Settings"} isOpen={isOpen} onToggle={setIsOpen}>
            <ControlPanel>
                <Label>Width</Label>
                <PhysicalLengthInput value={value.width} onValidCommit={(v) => setValue("width", v)} />
                <Label>Height</Label>
                <PhysicalLengthInput value={value.height} onValidCommit={(v) => setValue("height", v)} />
                <Label>Margin</Label>
                <PhysicalLengthInput value={value.margin} onValidCommit={(v) => setValue("margin", v)} />
                <Label>Gap</Label>
                <PhysicalLengthInput value={value.gap} onValidCommit={(v) => setValue("gap", v)} />
                <Label>Thickness</Label>
                <PhysicalLengthInput value={value.thickness} onValidCommit={(v) => setValue("thickness", v)} />
            </ControlPanel>
        </ControlledFoldout>
    );
};
