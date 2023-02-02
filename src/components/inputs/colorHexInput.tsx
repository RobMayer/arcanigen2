import { hexToColor, colorToHex } from "!/utility/mathhelper";
import { Color } from "!/utility/types/units";
import { HTMLAttributes, useMemo } from "react";
import styled from "styled-components";
import AbstractInputs, { AbstractInputProps } from "./abstract";

const HexColorInput = styled((props: AbstractInputProps<Color, HTMLInputElement> & HTMLAttributes<HTMLDivElement>) => {
   const { value, handlers, className, disabled, revertInvalid, ...rest } = AbstractInputs.useAbstractProps<
      Color,
      AbstractInputProps<Color, HTMLInputElement> & HTMLAttributes<HTMLDivElement>
   >(props);
   const inputProps = AbstractInputs.useAbstractHandlers<Color, HTMLInputElement>(value, handlers, hexToColor, colorToHex);

   return (
      <div {...rest} className={`${className ?? ""} ${disabled ? "state-disabled" : ""}`}>
         <Swatch value={inputProps.value} />
         <AbstractInputs.Text
            className={"input"}
            pattern={"^(#+([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6,8})|transparent)$"}
            {...inputProps}
            disabled={disabled}
            revertInvalid={revertInvalid}
         />
      </div>
   );
})`
   width: auto;
   background: var(--input-background);
   display: inline-grid;
   align-items: center;
   padding: 0 0.125em;
   gap: 0.25em;
   border-radius: 0.125em;
   border: 1px solid var(--effect-border-highlight);
   grid-template-columns: auto 1fr;
   & > .input {
      min-width: 100%;
      max-width: 0;
      width: auto;
      padding-inline: 0.25em;
      background-color: transparent;
   }
   &.monospace {
      font-family: monospace;
   }
   &:has(:focus) {
      outline: none;
      border: 1px solid var(--effect-border-focus);
   }
   & > .input::placeholder {
      color: var(--input-placeholder);
   }
   & > .input::-webkit-outer-spin-button,
   & > .input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
   }
   & > .input::selection {
      background-color: var(--input-text-selection);
   }
   &:is(.slim) > .input {
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
      & > .input::placeholder {
         color: var(--flavour-button-text-muted);
      }
      & > .input::selection {
         background: var(--flavour-button-overlight);
      }
   }
   &.state-disabled {
      background: var(--disabled-input-background);
      color: var(--disabled-input-text);
      & > .input::placeholder {
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

export default HexColorInput;

const Swatch = styled(({ value, className }: { value?: string; className?: string }) => {
   const style = useMemo(
      () => ({
         color: value,
      }),
      [value]
   );
   return <div className={className} style={style} />;
})`
   outline: 1px solid var(--effect-border-highlight);
   width: 1.25em;
   height: 1.25em;
   background: currentColor;
`;
