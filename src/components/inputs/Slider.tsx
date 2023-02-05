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
   step?: number;
} & AbstractInputProps<number, HTMLInputElement> &
   HTMLAttributes<HTMLDivElement>;

const Slider = styled(
   forwardRef((props: IProps, fRef: ForwardedRef<HTMLInputElement>) => {
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
      } = AbstractInputs.useAbstractProps<number, IProps>(props);
      const inputProps = AbstractInputs.useAbstractHandlers<number, HTMLInputElement>(value, handlers, XFORM, DFORM);

      return (
         <div className={`${className ?? ""} flavour-${flavour}`} {...rest}>
            <AbstractInputs.Slider
               {...props}
               ref={fRef}
               className={"slider"}
               {...inputProps}
               min={min}
               max={max}
               step={step}
               disabled={disabled}
               revertInvalid={revertInvalid}
            />
         </div>
      );
   })
)`
   display: inline-grid;
   align-items: center;
   justify-items: center;
   grid-template-columns: 1fr;
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
   &:has(:focus-visible),
   &:hover {
      & > .slider::-webkit-slider-thumb {
         background-color: var(--flavour-button-highlight);
         outline-offset: 2px;
         outline: 1px solid var(--effect-border-overlight);
      }
   }
`;

export default Slider;
