import CheckBox from "../../../components/buttons/Checkbox";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";
import { useMaterialState } from "../state";
import { ControlPanel, Input } from "../widgets";

export const MaterialControls = ({ selected }: { selected: number }) => {
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
