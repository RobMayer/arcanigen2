/* eslint-disable jsx-a11y/anchor-is-valid */

import useMergedRef from "!/utility/hooks/useMergedRef";
import { ForwardedRef, forwardRef, useCallback, MouseEvent, useEffect, HTMLAttributes } from "react";
import styled from "styled-components";

export type ButtonProps = {
   disabled?: boolean;
} & HTMLAttributes<HTMLDivElement>;

const Button = styled(
   forwardRef(({ disabled, onClick, tabIndex = 0, children, className, ...props }: ButtonProps, fRef: ForwardedRef<HTMLDivElement>) => {
      const [ref, setRef] = useMergedRef(fRef);

      const handleClick = useCallback(
         (e: MouseEvent<HTMLDivElement>) => {
            if (!disabled) {
               onClick && onClick(e);
            }
         },
         [onClick, disabled]
      );

      useEffect(() => {
         const n = ref.current;
         if (n) {
            const down = (e: KeyboardEvent) => {
               if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
               }
            };
            const up = (e: KeyboardEvent) => {
               if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  n.click();
               }
            };
            n.addEventListener("keydown", down);
            n.addEventListener("keyup", up);
            return () => {
               n.removeEventListener("keydown", down);
               n.removeEventListener("keyup", up);
            };
         }
      }, [ref]);

      return (
         <div
            role={"button"}
            className={`${className ?? ""} ${!onClick ? "state-inactive" : ""} ${disabled ? "state-disabled" : ""}`}
            onClick={handleClick}
            {...props}
            tabIndex={disabled || !onClick ? undefined : tabIndex}
            ref={setRef}
         >
            {children}
         </div>
      );
   })
)`
   display: inline-flex;
   align-items: center;
   &:not(.state-inactive) {
      cursor: pointer;
   }
   &.state-disabled {
      cursor: default;
   }
`;

export default Button;
