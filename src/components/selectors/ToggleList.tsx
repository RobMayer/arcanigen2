import useKey from "@accessible/use-key";
import { MutableRefObject } from "react";
import { ForwardedRef, forwardRef, HTMLAttributes, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Flavour } from "..";

type IProps<T> = {
   options: T;
   onValue?: (v: keyof T) => void;
   value?: string;
   flavour?: Flavour;
   disabled?: boolean;
};

const ToggleList = styled(
   forwardRef(
      <T extends Record<any, ReactNode>>(
         { options, value, onValue, flavour = "accent", disabled = false, className, tabIndex, ...props }: IProps<T> & HTMLAttributes<HTMLDivElement>,
         fRef: ForwardedRef<HTMLDivElement>
      ) => {
         const [cache, setCache] = useState<keyof T>(value as keyof T);

         const keys = useMemo(() => {
            return Object.keys(options) as (keyof T)[];
         }, [options]);

         const ref = useRef<HTMLDivElement>(null);
         const createRef = useCallback(
            (el: HTMLDivElement) => {
               (ref as MutableRefObject<HTMLDivElement>).current = el;
               if (fRef) {
                  if (typeof fRef === "function") {
                     fRef(el);
                  } else {
                     fRef.current = el;
                  }
               }
            },
            [fRef]
         );

         const handleChange = useCallback(
            (v: string) => {
               setCache(v as keyof T);
               onValue && onValue(v as keyof T);
            },
            [onValue]
         );

         useKey(ref, {
            ArrowRight: () => {
               if (keys.indexOf(cache) !== keys.length - 1) {
                  handleChange(keys[keys.indexOf(cache) + 1] as string);
               }
            },
            ArrowLeft: () => {
               if (keys.indexOf(cache) > 0) {
                  handleChange(keys[keys.indexOf(cache) - 1] as string);
               }
            },
            End: () => {
               handleChange(keys[keys.length - 1] as string);
            },
            Home: () => {
               handleChange(keys[0] as string);
            },
         });

         useEffect(() => {
            setCache(value as keyof T);
         }, [value]);

         return (
            <div
               {...props}
               className={`${className ?? ""} ${disabled ? "state-disabled" : ""}`}
               tabIndex={disabled ? undefined : tabIndex ?? 0}
               ref={createRef}
            >
               {Object.entries(options).map(([k, v]) => {
                  return (
                     <Option key={k} selected={k === cache} value={k} select={handleChange} disabled={disabled}>
                        {v}
                     </Option>
                  );
               })}
            </div>
         );
      }
   )
)`
   display: inline-grid;
   grid-auto-flow: column;
   grid-auto-columns: 1fr;
   align-items: center;
   justify-items: stretch;
   background: var(--input-background);
   padding: 0.125em;
   border-radius: 0.125em;
   gap: 0.125em;
   border: 1px solid var(--effect-border-highlight);
   &:focus {
      outline: none;
      border: 1px solid var(--effect-border-focus);
   }
   & > .option {
      cursor: pointer;
      padding: 0 0.5em;
      display: flex;
      justify-content: center;
      color: var(--flavour-text-muted);
   }
   & > .option:hover:not(.state-disabled) {
      background: var(--flavour-effect-bg-highlight);
      color: var(--flavour-button-text);
   }
   & > .option.state-selected:not(.state-disabled) {
      color: var(--flavour-button-text);
      background: var(--flavour-button);
   }
   & > .option.state-selected:hover:not(.state-disabled) {
      color: var(--flavour-button-text-highlight);
      background: var(--flavour-button-highlight);
   }
   & > .option.state-disabled {
      cursor: default !important;
      color: var(--disabled-button-text);
   }
   & > .option.state-selected.state-disabled {
      background: var(--disabled-button);
   }
`;

export default ToggleList;

const Option = ({
   selected = false,
   select,
   value,
   children,
   disabled = false,
   ...props
}: { selected: boolean; select: (v: string) => void; value: string; disabled?: boolean } & HTMLAttributes<HTMLDivElement>) => {
   const handleClick = useCallback(() => {
      select(value);
   }, [value, select]);

   return (
      <div {...props} className={`option ${selected ? "state-selected" : ""} ${disabled ? "state-disabled" : ""}`} onClick={disabled ? undefined : handleClick}>
         {children}
      </div>
   );
};
