import { Length } from "!/utility/types/units";
import { ForwardedRef, forwardRef, HTMLAttributes, ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import AbstractInputs from "./abstract";

type IProps = {
   onChange?: (value: Length) => void;
   value?: Length;
   autoFocus?: boolean;
   disabled?: boolean;
};

const LengthInput = styled(
   forwardRef(
      (
         { autoFocus, className, disabled = false, onChange, value, ...props }: IProps & Omit<HTMLAttributes<HTMLDivElement>, "onChange">,
         fRef: ForwardedRef<HTMLDivElement>
      ) => {
         const inputRef = useRef<HTMLInputElement>(null);

         const [cache, setCache] = useState<Length>(value ?? { value: 0, unit: "px" });

         useEffect(() => {
            setCache((p) => {
               if (value) {
                  if (value.unit !== p.unit || value.value !== p.value) {
                     return value;
                  }
               }
               return p;
            });
         }, [value]);

         useEffect(() => {
            if (!isNaN(cache.value) && (cache.value !== value?.value || cache.unit !== value?.unit)) {
               onChange && onChange(cache);
            }
         }, [cache, value, onChange]);

         const handleValueChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
            setCache((p) => {
               return {
                  unit: p.unit,
                  value: Number(e.target.value),
               };
            });
         }, []);

         const handleUnitChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
            setCache((p) => {
               return {
                  value: p.value,
                  unit: e.target.value as Length["unit"],
               };
            });
         }, []);

         useEffect(() => {
            if (autoFocus) {
               inputRef.current?.focus();
            }
         }, [autoFocus]);
         return (
            <div className={`${className ?? ""} ${disabled ? "state-disabled" : ""}`} ref={fRef} {...props}>
               <AbstractInputs.Number className={"textinput"} ref={inputRef} disabled={disabled} value={`${cache.value}`} onChange={handleValueChange} />
               <select className={"dropdown"} disabled={disabled} value={cache.unit} onChange={handleUnitChange}>
                  <option value="px">px</option>
                  <option value="pt">pt</option>
                  <option value="in">in</option>
                  <option value="mm">mm</option>
                  <option value="cm">cm</option>
               </select>
            </div>
         );
      }
   )
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
   &:is(.small) > .textinput {
      width: 6em;
   }
   &:is(.tiny) > .textinput {
      width: 3em;
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

export default LengthInput;
