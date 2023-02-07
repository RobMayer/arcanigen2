import { colorToHex, hexToColor } from "!/utility/mathhelper";
import { Color } from "!/utility/types/units";
import { ChangeEvent, HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

type IProps = {
   value: Color;
   onValue?: (v: Color) => void;
   onCommit?: (v: Color) => void;
   disabled?: boolean;
};

const HexColorInput = styled(({ className, value, disabled, onValue, onCommit, ...props }: IProps & HTMLAttributes<HTMLDivElement>) => {
   const [stringCache, setStringCache] = useState<string>(colorToHex(value));

   const heldRef = useRef<Color>(value);

   useEffect(() => {
      const h = heldRef.current;
      if (h?.r !== value?.r || h?.g !== value?.g || h?.b !== value?.b || h?.a !== value?.a) {
         heldRef.current = value;
         setStringCache(colorToHex(value));
      }
   }, [value]);

   const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
         setStringCache(e.currentTarget.value);
         if (e.currentTarget.validity.valid) {
            const res = hexToColor(e.currentTarget.value);
            heldRef.current = res;
            onValue && onValue(res);
         }
      },
      [onValue]
   );

   const handleCommit = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
         if (e.currentTarget.validity.valid) {
            const res = hexToColor(e.currentTarget.value);
            heldRef.current = res;
            onCommit && onCommit(res);
         }
         setStringCache(colorToHex(heldRef.current));
      },
      [onCommit]
   );

   const inputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      const n = inputRef.current;
      if (n && handleCommit) {
         const cb = (e: Event) => {
            let hasStopped = false;
            const se: ChangeEvent<HTMLInputElement> = {
               ...e,
               nativeEvent: e,
               persist: () => {},
               target: e.target as HTMLInputElement,
               currentTarget: e.target as HTMLInputElement,
               bubbles: true,
               cancelable: true,
               isDefaultPrevented: () => e.defaultPrevented,
               isPropagationStopped: () => hasStopped,
               stopPropagation: () => {
                  e.stopPropagation();
                  hasStopped = true;
               },
            };
            handleCommit(se);
         };
         n.addEventListener("change", cb);
         return () => {
            n.removeEventListener("change", cb);
         };
      }
   }, [handleCommit]);

   return (
      <div {...props} className={`${className ?? ""} ${disabled ? "state-disabled" : ""}`}>
         <Swatch value={value} />
         <input
            type="text"
            ref={inputRef}
            className={"input"}
            pattern={"^(#+([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6,8})|transparent)$"}
            disabled={disabled}
            value={stringCache}
            onChange={handleChange}
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

const Swatch = styled(({ value, className }: { value: Color; className?: string }) => {
   const style = useMemo(
      () => ({
         backgroundColor: colorToHex(value) ?? "none",
      }),
      [value]
   );
   return <div className={className} style={style} />;
})`
   outline: 1px solid var(--effect-border-highlight);
   width: 1.25em;
   height: 1.25em;
`;
