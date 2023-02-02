import { DetailedHTMLProps, SelectHTMLAttributes, ChangeEvent, useCallback, ReactNode } from "react";
import styled from "styled-components";
import { Flavour } from "..";

type IProps<T> = {
   options: T;
   onValue?: (key: keyof T) => void;
   flavour?: Flavour;
} & DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;

const Dropdown = styled(<T extends Record<any, ReactNode>>({ options, onChange, onValue, className, flavour = "accent", ...props }: IProps<T>) => {
   const handleChange = useCallback(
      (e: ChangeEvent<HTMLSelectElement>) => {
         onChange && onChange(e);
         onValue && onValue(e.currentTarget.value as keyof T);
      },
      [onChange, onValue]
   );

   return (
      <select className={`${className ?? ""} flavour-${flavour}`} {...props} onChange={handleChange}>
         {Object.entries(options).map(([k, v]) => (
            <option value={k} key={k}>
               {v}
            </option>
         ))}
      </select>
   );
})`
   width: auto;
   background: var(--input-background);
   display: flex;
   padding: 0.125em 0.25em;
   border-radius: 0.125rem;
   & > option {
      background: var(--input-dropdown-option);
   }
   & > option::selection {
      background: var(--accent-effect-bg-highlight);
   }
   border: 1px solid var(--effect-border-highlight);
   &:focus {
      outline: none;
      border: 1px solid var(--effect-border-focus);
   }
   &::placeholder {
      color: var(--input-placeholder);
   }
   &::-webkit-outer-spin-button,
   &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
   }
   &::selection {
      background-color: var(--input-text-selection);
   }
   &:is(.slim) {
      padding: 0 0.125rem;
   }
   &:is(.inline) {
      border: 1px solid transparent;
      outline: none;
      display: inline-flex;
      border-radius: none;
      padding: 0 0.125rem;
      background: var(--flavour-button);
      color: var(--flavour-button-text);
      &:focus {
         background: var(--flavour-button-highlight);
      }
      &::placeholder {
         color: var(--flavour-button-text-muted);
      }
      &::selection {
         background: var(--flavour-button-overlight);
      }
      & > option {
         background: var(--flavour-button-muted);
      }
   }
   &:disabled {
      background: var(--disabled-input-background);
      color: var(--disabled-input-text);
   }
   &:invalid {
      background: var(--invalid-input-background);
      color: var(--invalid-input-text);
      border: 1px solid var(--invalid-input-border);
   }
`;

export default Dropdown;
