import styled from "styled-components";
import { TextInput } from "!/components/inputs/TextInput";
import { NumericInput } from "!/components/inputs/NumericInput";
import { flavours } from "../util";
import { iconActionSearch } from "../../../components/icons/action/search";
import RotaryInput from "../../../components/inputs/RotaryInput";
import { LengthInput } from "../../../components/inputs/LengthInput";
import { useCallback, useMemo, useState } from "react";
import { Color, Length, PhysicalLength } from "../../../utility/types/units";
import HexColorInput from "../../../components/inputs/colorHexInput";
import { NullableNumericInput } from "../../../components/inputs/NullableNumericInput";
import { Route, Routes } from "react-router-dom";
import SliderInput from "../../../components/inputs/SliderInput";
import { AreaInput } from "../../../components/inputs/AreaInput";
import { PhysicalLengthInput } from "../../../components/inputs/PhysicalLengthInput";

export const InputDemo = styled(({ disabled = false, invalid = false, className }: { disabled?: boolean; invalid?: boolean; className?: string }) => {
    return (
        <div className={className}>
            <Routes>
                <Route path={"text"} element={<TextInputs disabled={disabled} invalid={invalid} />} />
                <Route path={"numeric"} element={<NumericInputs disabled={disabled} invalid={invalid} />} />
                <Route path={"rotary"} element={<RotaryInputs disabled={disabled} invalid={invalid} />} />
                <Route path={"color"} element={<ColorInputs disabled={disabled} invalid={invalid} />} />
                <Route path={"length"} element={<LengthInputs disabled={disabled} invalid={invalid} />} />
                <Route path={"slider"} element={<SliderInputs disabled={disabled} invalid={invalid} />} />
                <Route path={"area"} element={<AreaInputs disabled={disabled} invalid={invalid} />} />
            </Routes>
        </div>
    );
})`
    display: grid;
    grid-template-columns: auto;
`;

const TextInputs = ({ disabled = false, invalid = false }: { disabled?: boolean; invalid?: boolean }) => {
    const [state, setState] = useState<string>("");

    const fired = useCallback((val: string) => {
        console.log("fired", val);
        setState(val);
    }, []);

    const validate = useMemo(() => {
        return invalid ? () => [{ code: "WRONG", message: "Got it wrong" }] : () => [];
    }, [invalid]);

    return (
        <>
            <h2>Text Inputs</h2>
            <div>using onValue</div>
            <div>
                {flavours.map((f) => (
                    <TextInput key={f} icon={iconActionSearch} value={state} onValue={fired} disabled={disabled} flavour={f} max={10} placeholder={f} tooltip={f} onClear={fired} validate={validate} />
                ))}
            </div>
            <div>using onCommit</div>
            <div>
                {flavours.map((f) => (
                    <TextInput
                        key={f}
                        icon={iconActionSearch}
                        value={state}
                        onCommit={fired}
                        disabled={disabled}
                        flavour={f}
                        max={10}
                        placeholder={f}
                        tooltip={f}
                        onClear={fired}
                        validate={validate}
                    />
                ))}
            </div>
            <div>using onValidValue</div>
            <div>
                {flavours.map((f) => (
                    <TextInput
                        key={f}
                        icon={iconActionSearch}
                        value={state}
                        onValidValue={fired}
                        disabled={disabled}
                        flavour={f}
                        max={10}
                        placeholder={f}
                        tooltip={f}
                        onClear={fired}
                        validate={validate}
                    />
                ))}
            </div>
            <div>using onValidCommit</div>
            <div>
                {flavours.map((f) => (
                    <TextInput
                        key={f}
                        icon={iconActionSearch}
                        value={state}
                        onValidCommit={fired}
                        disabled={disabled}
                        flavour={f}
                        max={10}
                        placeholder={f}
                        tooltip={f}
                        onClear={fired}
                        validate={validate}
                    />
                ))}
            </div>
        </>
    );
};

const NumericInputs = ({ disabled = false, invalid = false }: { disabled?: boolean; invalid?: boolean }) => {
    const [state, setState] = useState<number>(0);
    const [nullableState, setNullableState] = useState<number | null>(null);

    const validate = useMemo(() => {
        return invalid ? () => [{ code: "WRONG", message: "Got it wrong" }] : () => [];
    }, [invalid]);

    return (
        <>
            <h2>Numeric Inputs</h2>
            <div>using onValue</div>
            <div>
                {flavours.map((f) => (
                    // <TextInput key={f} icon={iconActionSearch} value={""} onCommit={() => {}} disabled={disabled} flavour={f} max={10} placeholder={f} onClear={() => {}} />
                    <NumericInput key={f} icon={iconActionSearch} value={state} onValue={setState} disabled={disabled} flavour={f} step={1} tooltip={f} validate={validate} />
                ))}
            </div>
            <div>using onCommit</div>
            <div>
                {flavours.map((f) => (
                    // <TextInput key={f} icon={iconActionSearch} value={""} onCommit={() => {}} disabled={disabled} flavour={f} max={10} placeholder={f} onClear={() => {}} />
                    <NumericInput key={f} icon={iconActionSearch} value={state} onCommit={setState} disabled={disabled} flavour={f} step={1} tooltip={f} validate={validate} />
                ))}
            </div>
            <div>using onValidValue</div>
            <div>
                {flavours.map((f) => (
                    // <TextInput key={f} icon={iconActionSearch} value={""} onCommit={() => {}} disabled={disabled} flavour={f} max={10} placeholder={f} onClear={() => {}} />
                    <NumericInput key={f} icon={iconActionSearch} value={state} onValidValue={setState} disabled={disabled} flavour={f} step={1} tooltip={f} validate={validate} />
                ))}
            </div>
            <div>using onValidCommit</div>
            <div>
                {flavours.map((f) => (
                    // <TextInput key={f} icon={iconActionSearch} value={""} onCommit={() => {}} disabled={disabled} flavour={f} max={10} placeholder={f} onClear={() => {}} />
                    <NumericInput key={f} icon={iconActionSearch} value={state} onValidCommit={setState} disabled={disabled} flavour={f} step={1} tooltip={f} validate={validate} />
                ))}
            </div>

            <h2>Nullable Numeric Inputs</h2>
            <div>using onValue</div>
            <div>
                {flavours.map((f) => (
                    // <TextInput key={f} icon={iconActionSearch} value={""} onCommit={() => {}} disabled={disabled} flavour={f} max={10} placeholder={f} onClear={() => {}} />
                    <NullableNumericInput
                        key={f}
                        icon={iconActionSearch}
                        value={nullableState}
                        onValue={setNullableState}
                        disabled={disabled}
                        flavour={f}
                        step={1}
                        tooltip={f}
                        onClear={setNullableState}
                        validate={validate}
                    />
                ))}
            </div>
            <div>using onCommit</div>
            <div>
                {flavours.map((f) => (
                    // <TextInput key={f} icon={iconActionSearch} value={""} onCommit={() => {}} disabled={disabled} flavour={f} max={10} placeholder={f} onClear={() => {}} />
                    <NullableNumericInput
                        key={f}
                        icon={iconActionSearch}
                        value={nullableState}
                        onCommit={setNullableState}
                        disabled={disabled}
                        flavour={f}
                        step={1}
                        tooltip={f}
                        onClear={setNullableState}
                        validate={validate}
                    />
                ))}
            </div>
            <div>using onValidValue</div>
            <div>
                {flavours.map((f) => (
                    // <TextInput key={f} icon={iconActionSearch} value={""} onCommit={() => {}} disabled={disabled} flavour={f} max={10} placeholder={f} onClear={() => {}} />
                    <NullableNumericInput
                        key={f}
                        icon={iconActionSearch}
                        value={nullableState}
                        onValidValue={setNullableState}
                        disabled={disabled}
                        flavour={f}
                        step={1}
                        tooltip={f}
                        onClear={setNullableState}
                        validate={validate}
                    />
                ))}
            </div>
            <div>using onValidCommit</div>
            <div>
                {flavours.map((f) => (
                    // <TextInput key={f} icon={iconActionSearch} value={""} onCommit={() => {}} disabled={disabled} flavour={f} max={10} placeholder={f} onClear={() => {}} />
                    <NullableNumericInput
                        key={f}
                        icon={iconActionSearch}
                        value={nullableState}
                        onValidCommit={setNullableState}
                        disabled={disabled}
                        flavour={f}
                        step={1}
                        tooltip={f}
                        onClear={setNullableState}
                        validate={validate}
                    />
                ))}
            </div>
        </>
    );
};

const RotaryInputs = ({ disabled = false, invalid = false }: { disabled?: boolean; invalid?: boolean }) => {
    const [state, setState] = useState<number>(0);

    const validate = useMemo(() => {
        return invalid ? () => [{ code: "WRONG", message: "Got it wrong" }] : () => [];
    }, [invalid]);

    return (
        <>
            <h2>Rotary Inputs</h2>
            <div>using onValue</div>
            <div>
                {flavours.map((f) => (
                    <RotaryInput key={f} icon={iconActionSearch} value={state} onValue={setState} disabled={disabled} step={15} flavour={f} tooltip={f} validate={validate} />
                ))}
            </div>
            <div>using onCommit</div>
            <div>
                {flavours.map((f) => (
                    <RotaryInput key={f} value={state} onCommit={setState} disabled={disabled} step={15} flavour={f} tooltip={f} validate={validate} />
                ))}
            </div>
            <div>using onValidValue</div>
            <div>
                {flavours.map((f) => (
                    <RotaryInput key={f} value={state} onValidValue={setState} disabled={disabled} step={15} flavour={f} tooltip={f} validate={validate} />
                ))}
            </div>
            <div>using onValidCommit</div>
            <div>
                {flavours.map((f) => (
                    <RotaryInput key={f} value={state} onValidCommit={setState} disabled={disabled} step={15} flavour={f} tooltip={f} validate={validate} />
                ))}
            </div>
        </>
    );
};

const ColorInputs = ({ disabled = false, invalid = false }: { disabled?: boolean; invalid?: boolean }) => {
    const [state, setState] = useState<Color>({ r: 1, g: 1, b: 1, a: 1 });

    const validate = useMemo(() => {
        return invalid ? () => [{ code: "WRONG", message: "Got it wrong" }] : () => [];
    }, [invalid]);

    return (
        <>
            <h2>Color Inputs</h2>
            <div>using onValue</div>
            <div>
                {flavours.map((f) => (
                    <HexColorInput key={f} value={state} onValue={setState} disabled={disabled} flavour={f} tooltip={f} validate={validate} />
                ))}
            </div>
            <div>using onCommit</div>
            <div>
                {flavours.map((f) => (
                    <HexColorInput key={f} value={state} onCommit={setState} disabled={disabled} flavour={f} tooltip={f} validate={validate} />
                ))}
            </div>
            <div>using onValidValue</div>
            <div>
                {flavours.map((f) => (
                    <HexColorInput key={f} value={state} onValidValue={setState} disabled={disabled} flavour={f} tooltip={f} validate={validate} />
                ))}
            </div>
            <div>using onValidCommit</div>
            <div>
                {flavours.map((f) => (
                    <HexColorInput key={f} value={state} onValidCommit={setState} disabled={disabled} flavour={f} tooltip={f} validate={validate} />
                ))}
            </div>
        </>
    );
};

const SliderInputs = ({ disabled = false, invalid = false }: { disabled?: boolean; invalid?: boolean }) => {
    const [state, setState] = useState<number>(0);

    return (
        <>
            <h2>Slider Inputs</h2>
            <div>using onValue</div>
            <div>
                {flavours.map((f) => (
                    <SliderInput key={f} icon={iconActionSearch} value={state} onValue={setState} disabled={disabled} flavour={f} placeholder={f} tooltip={f} step={0.25} />
                ))}
            </div>
        </>
    );
};

const LengthInputs = ({ disabled = false, invalid = false }: { disabled?: boolean; invalid?: boolean }) => {
    const [lengthState, setLengthState] = useState<Length>({ value: 0, unit: "mm" });
    const [physicalState, setPhysicalState] = useState<PhysicalLength>({ value: 0, unit: "mm" });

    const validate = useMemo(() => {
        return invalid ? () => [{ code: "WRONG", message: "Got it wrong" }] : () => [];
    }, [invalid]);

    return (
        <>
            <h2>Length Inputs</h2>
            <div>using onValue</div>
            <div>
                {flavours.map((f) => (
                    <LengthInput
                        key={f}
                        icon={iconActionSearch}
                        value={lengthState}
                        onValue={setLengthState}
                        disabled={disabled}
                        flavour={f}
                        max={10}
                        placeholder={f}
                        tooltip={f}
                        validate={validate}
                    />
                ))}
            </div>
            <div>using onCommit</div>
            <div>
                {flavours.map((f) => (
                    <LengthInput
                        key={f}
                        icon={iconActionSearch}
                        value={lengthState}
                        onCommit={setLengthState}
                        disabled={disabled}
                        flavour={f}
                        max={10}
                        placeholder={f}
                        tooltip={f}
                        validate={validate}
                    />
                ))}
            </div>
            <div>using onValidValue</div>
            <div>
                {flavours.map((f) => (
                    <LengthInput
                        key={f}
                        icon={iconActionSearch}
                        value={lengthState}
                        onValidValue={setLengthState}
                        disabled={disabled}
                        flavour={f}
                        max={10}
                        placeholder={f}
                        tooltip={f}
                        validate={validate}
                    />
                ))}
            </div>
            <div>using onValidCommit</div>
            <div>
                {flavours.map((f) => (
                    <LengthInput
                        key={f}
                        icon={iconActionSearch}
                        value={lengthState}
                        onValidCommit={setLengthState}
                        disabled={disabled}
                        flavour={f}
                        max={10}
                        placeholder={f}
                        tooltip={f}
                        validate={validate}
                    />
                ))}
            </div>
            <h2>Physical Length Inputs</h2>
            <div>using onValue</div>
            <div>
                {flavours.map((f) => (
                    <PhysicalLengthInput
                        key={f}
                        icon={iconActionSearch}
                        value={physicalState}
                        onValue={setPhysicalState}
                        disabled={disabled}
                        flavour={f}
                        max={10}
                        placeholder={f}
                        tooltip={f}
                        validate={validate}
                    />
                ))}
            </div>
            <div>using onCommit</div>
            <div>
                {flavours.map((f) => (
                    <PhysicalLengthInput
                        key={f}
                        icon={iconActionSearch}
                        value={physicalState}
                        onCommit={setPhysicalState}
                        disabled={disabled}
                        flavour={f}
                        max={10}
                        placeholder={f}
                        tooltip={f}
                        validate={validate}
                    />
                ))}
            </div>
            <div>using onValidValue</div>
            <div>
                {flavours.map((f) => (
                    <PhysicalLengthInput
                        key={f}
                        icon={iconActionSearch}
                        value={physicalState}
                        onValidValue={setPhysicalState}
                        disabled={disabled}
                        flavour={f}
                        max={10}
                        placeholder={f}
                        tooltip={f}
                        validate={validate}
                    />
                ))}
            </div>
            <div>using onValidCommit</div>
            <div>
                {flavours.map((f) => (
                    <PhysicalLengthInput
                        key={f}
                        icon={iconActionSearch}
                        value={physicalState}
                        onValidCommit={setPhysicalState}
                        disabled={disabled}
                        flavour={f}
                        max={10}
                        placeholder={f}
                        tooltip={f}
                        validate={validate}
                    />
                ))}
            </div>
        </>
    );
};

const AreaInputs = ({ disabled = false, invalid = false }: { disabled?: boolean; invalid?: boolean }) => {
    const [state, setState] = useState<string>("");

    return (
        <>
            <h2>Area Inputs</h2>
            <div>using onValue</div>
            <div>
                {flavours.map((f) => (
                    <AreaInput key={f} value={state} onValue={setState} disabled={disabled} flavour={f} placeholder={f} tooltip={f} />
                ))}
            </div>
        </>
    );
};
