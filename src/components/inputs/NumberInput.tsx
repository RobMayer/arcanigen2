import { ForwardedRef, forwardRef } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import AbstractInputs, { SimpleInputProps } from "./abstract";

const XFORM = (a: string) => Number(a);
const DFORM = (a: number) => `${a}`;

const NumberInput = styled(
   forwardRef((props: SimpleInputProps<number>, fRef: ForwardedRef<HTMLInputElement>) => {
      const {
         value,
         min,
         max,
         step,
         flavour = "accent",
         className,
         handlers,
         disabled,
         revertInvalid,
         ...rest
      } = AbstractInputs.useAbstractProps<number, SimpleInputProps<number> & { flavour?: Flavour }>(props);

      const inputProps = AbstractInputs.useAbstractHandlers<number, HTMLInputElement>(value, handlers, XFORM, DFORM);

      return (
         <AbstractInputs.Number
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={`${className ?? ""} flavour-${flavour}`}
            {...inputProps}
            {...rest}
            ref={fRef}
         />
      );
   })
)`
   width: auto;
   background: var(--input-background);
   display: flex;
   padding: 0.125em 0.5em;
   border-radius: 0.125em;
   border: 1px solid var(--effect-border-highlight);
   &.monospace {
      font-family: monospace;
   }
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
      padding: 0 0.125em;
   }
   &:is(.small) {
      width: 6em;
   }
   &:is(.tiny) {
      width: 3em;
   }
   &:is(.inline) {
      display: inline-flex;
   }
   &:is(.fancy) {
      border: 1px solid transparent;
      outline: none;
      display: inline-flex;
      border-radius: none;
      padding: 0 0.125em;
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
   }
   &:disabled {
      background: var(--disabled-input-background);
      color: var(--disabled-input-text);
      &::placeholder {
         color: var(--disabled-input-placeholder);
      }
   }
   &:not(:placeholder-shown):invalid {
      background: var(--invalid-input-background);
      color: var(--invalid-input-text);
      border: 1px solid var(--invalid-input-border);
   }
   &:not(:placeholder-shown):invalid::selection {
      color: var(--invalid-input-selection);
   }
`;

export default NumberInput;
