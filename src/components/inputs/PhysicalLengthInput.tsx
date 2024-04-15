import { PhysicalLength } from "!/utility/types/units";
import { ForwardedRef, forwardRef, HTMLAttributes, ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import AbstractInputs from "./abstract";

type IProps = {
   onValue?: (value: PhysicalLength) => void;
   onValidValue?: (value: PhysicalLength) => void;
   onCommit?: (value: PhysicalLength) => void;
   onValidCommit?: (value: PhysicalLength) => void;
   value?: PhysicalLength;
   autoFocus?: boolean;
   disabled?: boolean;
   min?: number;
   max?: number;
   step?: number | "any";
};

const PhysicalLengthInput = styled(
   forwardRef(({ autoFocus, className, disabled = false, onCommit, onValidCommit, onValue, onValidValue, value, min, max, step, ...props }: IProps & Omit<HTMLAttributes<HTMLDivElement>, "onChange">, fRef: ForwardedRef<HTMLDivElement>) => {
      const inputRef = useRef<HTMLInputElement>(null);

      const [cache, setCache] = useState<PhysicalLength>({ value: value?.value ?? 1, unit: value?.unit ?? "mm" });
      const valueRef = useRef<PhysicalLength>(cache);

      useEffect(() => {
         setCache((p) => {
            if (value) {
               if (value.unit !== p.unit || value.value !== p.value) {
                  return value;
               }
            }
            return p;
         });
         if (value) {
            valueRef.current.value = value.value;
            valueRef.current.unit = value.unit;
         }
      }, [value]);

      const handleValueFinish = useCallback(
         (e: ChangeEvent<HTMLInputElement>) => {
            setCache((p) => {
               return {
                  unit: p.unit,
                  value: Number(e.target.value),
               };
            });
            valueRef.current = {
               ...valueRef.current,
               value: Number(e.currentTarget.value),
            };
            onCommit && onCommit(valueRef.current);
            if (e.currentTarget.validity.valid) {
               onValidCommit && onValidCommit(valueRef.current);
            }
         },
         [onCommit, onValidCommit]
      );

      const handleValueChange = useCallback(
         (e: ChangeEvent<HTMLInputElement>) => {
            setCache((p) => {
               return {
                  unit: p.unit,
                  value: Number(e.target.value),
               };
            });
            valueRef.current = {
               ...valueRef.current,
               value: Number(e.currentTarget.value),
            };
            onValue && onValue(valueRef.current);
            if (e.currentTarget.validity.valid) {
               onValidValue && onValidValue(valueRef.current);
            }
         },
         [onValue, onValidValue]
      );

      const handleUnitChange = useCallback(
         (e: ChangeEvent<HTMLSelectElement>) => {
            setCache((p) => {
               return {
                  value: p.value,
                  unit: e.target.value as PhysicalLength["unit"],
               };
            });
            valueRef.current = {
               ...valueRef.current,
               unit: e.target.value as PhysicalLength["unit"],
            };
            onValue && onValue(valueRef.current);
            onCommit && onCommit(valueRef.current);
            if (inputRef.current?.validity.valid) {
               onValidValue && onValidValue(valueRef.current);
               onValidCommit && onValidCommit(valueRef.current);
            }
         },
         [onValue, onCommit, onValidValue, onValidCommit]
      );

      useEffect(() => {
         if (autoFocus) {
            inputRef.current?.focus();
         }
      }, [autoFocus]);
      return (
         <div className={`${className ?? ""} ${disabled ? "state-disabled" : ""}`} ref={fRef} {...props}>
            <AbstractInputs.Number
               className={"textinput"}
               ref={inputRef}
               disabled={disabled}
               value={`${cache.value}`}
               onChange={onValue ? handleValueChange : undefined}
               onValidChange={onValidValue ? handleValueChange : undefined}
               onFinish={onCommit ? handleValueFinish : undefined}
               onValidFinish={onValidCommit ? handleValueFinish : undefined}
               min={min}
               max={max}
               step={step ?? "any"}
            />
            <select className={"dropdown"} disabled={disabled} value={cache.unit} onChange={handleUnitChange}>
               <option value="in">in</option>
               <option value="mm">mm</option>
               <option value="cm">cm</option>
            </select>
         </div>
      );
   })
)`
   width: auto;
   background: var(--input-background);
   display: grid;
   padding: 0.125em 0.25em;
   border-radius: 0.125em;
   border: 1px solid var(--effect-border-highlight);
   grid-template-columns: 1fr auto;
   & > .textinput {
      padding-inline: 0.25em;
      min-width: 100%;
      max-width: 0;
      width: auto;
   }
   & > .textinput,
   & > .dropdown {
      background-color: transparent;
   }
   & > .dropdown:focus {
      background-color: var(--input-text-selection);
   }
   & > .dropdown option {
      background-color: var(--input-dropdown-option);
   }
   &.monospace {
      font-family: monospace;
   }
   &:has(:focus) {
      outline: none;
      border: 1px solid var(--effect-border-focus);
   }
   & > .textinput::placeholder {
      color: var(--input-placeholder);
   }
   & > .textinput::-webkit-outer-spin-button,
   & > .textinput::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
   }
   & > .textinput::selection {
      background-color: var(--input-text-selection);
   }
   &:is(.slim) {
      padding: 0 0.125em;
   }
   &:is(.medium) {
      width: 12em;
   }
   &:is(.small) {
      width: 9em;
   }
   &:is(.tiny) {
      width: 6em;
   }
   &:is(.inline) {
      display: inline-grid;
   }
   &:is(.fancy) {
      border: 1px solid transparent;
      outline: none;
      display: inline-grid;
      border-radius: none;
      padding: 0 0.125em;
      background: var(--flavour-button);
      color: var(--flavour-button-text);
      &:has(:focus) {
         background: var(--flavour-button-highlight);
      }
      & > .textinput::placeholder {
         color: var(--flavour-button-text-muted);
      }
      & > .textinput::selection {
         background: var(--flavour-button-overlight);
      }
   }
   &.state-disabled {
      background: var(--disabled-input-background);
      color: var(--disabled-input-text);
      & > .textinput::placeholder {
         color: var(--disabled-input-placeholder);
      }
   }
   &:has(:not(:placeholder-shown):invalid) {
      background: var(--invalid-input-background);
      color: var(--invalid-input-text);
      border: 1px solid var(--invalid-input-border);
   }
   &:has(:not(:placeholder-shown):invalid::selection) {
      color: var(--invalid-input-selection);
   }
`;

export default PhysicalLengthInput;
