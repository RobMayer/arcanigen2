import { ForwardedRef, forwardRef, HTMLAttributes } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import AbstractInputs, { AbstractInputProps } from "./abstract";

const XFORM = (a: string) => Number(a);
const DFORM = (a: number) => `${a}`;

type IProps = {
   flavour?: Flavour;
   min?: number;
   max?: number;
   step?: number | "any";
} & AbstractInputProps<number, HTMLInputElement> &
   HTMLAttributes<HTMLDivElement>;

const SliderInput = styled(
   forwardRef((props: IProps, fRef: ForwardedRef<HTMLInputElement>) => {
      const {
         value,
         min,
         max,
         step = "any",
         flavour = "accent",
         className,
         handlers,
         revertInvalid,
         disabled,
         ...rest
      } = AbstractInputs.useAbstractProps<number, IProps>(props);
      const inputProps = AbstractInputs.useAbstractHandlers<number, HTMLInputElement>(value, handlers, XFORM, DFORM);

      return (
         <div className={`${className ?? ""} flavour-${flavour}`} {...rest}>
            <AbstractInputs.Slider
               ref={fRef}
               className={"slider"}
               {...inputProps}
               min={min}
               max={max}
               step={step}
               disabled={disabled}
               revertInvalid={revertInvalid}
            />
            <AbstractInputs.Number className={"input"} {...inputProps} min={min} max={max} step={step} disabled={disabled} revertInvalid={revertInvalid} />
         </div>
      );
   })
)`
   display: inline-grid;
   align-items: center;
   justify-items: center;
   grid-template-columns: 1fr auto;
   gap: 0.125em;
   & > .input {
      width: 3em;
      background: var(--input-background);
      display: flex;
      padding: 0.125em 0.25em;
      border-radius: 0.125em;
      border: 1px solid var(--effect-border-highlight);
   }
   & > .input::selection {
      background-color: var(--input-text-selection);
   }
   & > .slider {
      justify-self: stretch;
      padding-block: 0.25rem;
      cursor: col-resize;
   }
   & > .slider::-webkit-slider-runnable-track {
      background-color: var(--flavour-button-muted);
      margin: 2px;
      height: 0.5rem;
      border-radius: 100vw;
      border: 1px solid var(--effect-border-highlight);
   }
   & > .slider::-webkit-slider-thumb {
      background-color: var(--flavour-button);
      border: 1px solid var(--effect-border-highlight);
      border-radius: 100%;
      margin-block: calc(-0.25rem - 1px);
      border-radius: 50%;
   }

   &:has(:focus-visible) {
      & > .slider::-webkit-slider-thumb {
         background-color: var(--flavour-button-highlight);
         outline-offset: 2px;
         outline: 1px solid var(--effect-border-overlight);
      }
      & > .input {
         outline: none;
         border: 1px solid var(--effect-border-focus);
      }
   }

   & > .slider:hover::-webkit-slider-thumb {
      background-color: var(--flavour-button-highlight);
      outline-offset: 2px;
      outline: 1px solid var(--effect-border-overlight);
   }

   & > .input:disabled {
      background: var(--disabled-input-background);
      color: var(--disabled-input-text);
   }
   & > .input:disabled::placeholder {
      color: var(--disabled-input-placeholder);
   }
   & > .slider:disabled {
      cursor: default;
   }
   & > .slider:disabled::-webkit-slider-runnable-track {
      background-color: var(--disabled-button-muted);
      outline: none;
   }
   & > .slider:disabled::-webkit-slider-thumb {
      background-color: var(--disabled-button);
      outline: none;
   }

   & > .input:not(:placeholder-shown):invalid {
      background: var(--invalid-input-background);
      color: var(--invalid-input-text);
      border: 1px solid var(--invalid-input-border);
   }
   & > .input:not(:placeholder-shown):invalid::selection {
      color: var(--invalid-input-selection);
   }
`;

export default SliderInput;
