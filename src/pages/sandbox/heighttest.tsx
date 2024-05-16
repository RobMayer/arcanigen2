import styled from "styled-components";
import ActionButton from "../../components/buttons/ActionButton";
import { NullableNumericInput } from "../../components/inputs/NullableNumericInput";
import { NumericInput } from "../../components/inputs/NumericInput";
import { TextInput } from "../../components/inputs/TextInput";
import { iconActionSearch } from "../../components/icons/action/search";
import { LengthInput } from "../../components/inputs/LengthInput";
import ToggleList from "../../components/selectors/ToggleList";
import CheckBox from "../../components/buttons/Checkbox";
import { useState } from "react";
import { Icon } from "../../components/icons";
import HexColorInput from "../../components/inputs/colorHexInput";
import NativeDropdown from "../../components/selectors/NativeDropdown";

const NOP = () => {};

const OPTIONS = {
    alpha: "Alpha",
    bravo: "Bravo",
};

export const HeightTest = styled(() => {
    const [showBreak, setShowBreak] = useState<boolean>(true);

    return (
        <>
            <div>
                <CheckBox checked={showBreak} onToggle={setShowBreak}>
                    Line-Height Test
                </CheckBox>
            </div>
            <div>
                <ActionButton>Test</ActionButton>
                <TextInput />
                <TextInput icon={iconActionSearch} onClear={NOP} />
                <NumericInput value={0} />
                <NumericInput value={0} icon={iconActionSearch} />
                <NullableNumericInput value={null} />
                <NullableNumericInput value={null} icon={iconActionSearch} />
                <LengthInput />
                <HexColorInput value={null} nullable alpha />
                <LengthInput icon={iconActionSearch} />
                <ToggleList options={OPTIONS} />
                <NativeDropdown options={OPTIONS} />
                <CheckBox checked={false}>Test</CheckBox>
                <CheckBox checked={false} />
            </div>
            <div>Break</div>
            <div>Break {showBreak ? <CheckBox checked={true} /> : null}</div>
            <div>Break</div>
            <div>Break {showBreak ? <Icon value={iconActionSearch} /> : null}</div>
            <div>Break</div>
        </>
    );
})`
    display: block;
`;
