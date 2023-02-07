import useResizeObserver from "!/utility/hooks/useResizeObserver";
import MathHelper from "!/utility/mathhelper";
import lodash from "lodash";
import { HTMLAttributes, useRef, useState, ChangeEvent, useCallback, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Flavour } from "..";
import AbstractInputs from "./abstract";

type IProps = {
   value: number;
   onValue?: (v: number) => void;
   onValidValue?: (v: number) => void;
   onValidCommit?: (v: number) => void;
   onCommit?: (v: number) => void;
   disabled?: boolean;
   step?: number | "any";
   flavour?: Flavour;
   wrap?: boolean;
};

const AngleInput = styled(
   ({
      value,
      onValue,
      onValidValue,
      onCommit,
      onValidCommit,
      className,
      flavour = "accent",
      disabled,
      step = "any",
      wrap = false,
      ...props
   }: IProps & HTMLAttributes<HTMLDivElement>) => {
      const inputRef = useRef<HTMLInputElement>(null);
      const [cache, setCache] = useState<number>(value);
      const valueRef = useRef<number>(cache);

      useEffect(() => {
         setCache(value);
         valueRef.current = value;
      }, [value]);

      const quadrent = useRef<number>(Math.floor(cache / 90));

      useEffect(() => {
         quadrent.current = Math.floor(cache / 90);
      }, [cache]);

      const handleDragValue = useMemo(() => {
         return lodash.throttle((t: number) => {
            onValue && onValue(t);
            onValidValue && onValidValue(t);
         }, 50);
      }, [onValue, onValidValue]);

      const handleDragCommit = useCallback(
         (t: number) => {
            onCommit && onCommit(t);
            onValidCommit && onValidCommit(t);
         },
         [onCommit, onValidCommit]
      );

      const handleValueFinish = useCallback(
         (e: ChangeEvent<HTMLInputElement>) => {
            const t = wrap ? Number(e.target.value) : MathHelper.mod(Number(e.target.value), 360);
            setCache(t);
            valueRef.current = t;
            onCommit && onCommit(t);
            if (e.currentTarget.validity.valid) {
               onValidCommit && onValidCommit(t);
            }
         },
         [onCommit, onValidCommit, wrap]
      );

      const handleValueChange = useCallback(
         (e: ChangeEvent<HTMLInputElement>) => {
            const t = wrap ? Number(e.target.value) : MathHelper.mod(Number(e.target.value), 360);
            setCache(t);
            valueRef.current = t;
            onValue && onValue(t);
            if (e.currentTarget.validity.valid) {
               onValidValue && onValidValue(t);
            }
         },
         [onValue, onValidValue, wrap]
      );

      const canvasRef = useRef<SVGSVGElement>(null);
      const containerRef = useRef<SVGGElement>(null);

      const [path, setPath] = useState<string>("");
      const [r, setR] = useState<number>(0);

      useResizeObserver(
         canvasRef,
         useCallback((entry) => {
            const fS = parseFloat(getComputedStyle(entry.target).fontSize);
            const bb = entry.contentRect;
            const rO = bb.width / 2 - fS * 1;
            const rI = bb.width / 2 - fS * 1.5 - 2;
            setR((rO + rI) / 2);
            setPath(`M ${rO},0 A 1,1 0 0,0 ${-rO},0 A 1,1 0 0,0 ${rO},0 M ${rI},0 A 1,1 0 0,1 ${-rI},0 A 1,1 0 0,1 ${rI},0`);
         }, [])
      );

      const onMouseMove = useCallback(
         (e: MouseEvent) => {
            const n = containerRef.current;
            if (n) {
               const bb = n.getBoundingClientRect();
               const eX = bb.left + bb.width / 2 - e.clientX;
               const eY = bb.top + bb.height / 2 - e.clientY;
               if (wrap) {
                  const newPoint = MathHelper.mod((Math.atan2(eX, eY) * -180) / Math.PI, 360);

                  const oldQ = quadrent.current;

                  const cQ = MathHelper.shortestQuadrent(MathHelper.mod(oldQ, 4), Math.floor(newPoint / 90));
                  quadrent.current = oldQ + cQ;
                  const r = (oldQ + cQ) * 90 + MathHelper.mod(newPoint, 90);
                  setCache(r);
                  valueRef.current = r;
                  handleDragValue(valueRef.current);
               } else {
                  const r = MathHelper.mod((Math.atan2(eX, eY) * -180) / Math.PI, 360);
                  setCache(r);
                  valueRef.current = r;
                  handleDragValue(valueRef.current);
               }
            }
         },
         [handleDragValue, wrap]
      );

      useEffect(() => {
         const n = containerRef.current;
         if (n && !disabled) {
            const up = () => {
               handleDragCommit(valueRef.current);
               document.removeEventListener("mousemove", onMouseMove);
               document.removeEventListener("mouseup", up);
            };
            const down = (e: MouseEvent) => {
               const bb = n.getBoundingClientRect();
               const eX = bb.left + bb.width / 2 - e.clientX;
               const eY = bb.top + bb.height / 2 - e.clientY;

               if (wrap) {
                  const oldAngle = valueRef.current;
                  const newAngle = (Math.atan2(eX, eY) * -180) / Math.PI;
                  const dist = MathHelper.shortestArc(oldAngle, newAngle);

                  const r = oldAngle + dist;

                  quadrent.current = Math.floor(r / 90);

                  setCache(r);
                  valueRef.current = r;
                  handleDragValue(valueRef.current);
               } else {
                  const r = MathHelper.mod((Math.atan2(eX, eY) * -180) / Math.PI, 360);
                  setCache(r);
                  valueRef.current = r;
                  handleDragValue(valueRef.current);
               }
               document.addEventListener("mousemove", onMouseMove);
               document.addEventListener("mouseup", up);
            };

            n.addEventListener("mousedown", down);
            return () => {
               n.removeEventListener("mousedown", down);
               document.removeEventListener("mouseup", up);
               document.removeEventListener("mousemove", onMouseMove);
            };
         }
      }, [disabled, handleDragCommit, handleDragValue, wrap, onMouseMove]);

      return (
         <div {...props} className={`${className ?? ""} ${disabled ? "state-disabled" : ""} flavour-${flavour}`}>
            <svg className={"canvas"} width={"100%"} height={"100%"} ref={canvasRef}>
               <g className={"container"} ref={containerRef}>
                  <path className={"track"} d={path} />
                  <circle
                     tabIndex={-1}
                     className={"handle"}
                     r={"0.75em"}
                     cx={r * Math.cos(((cache - 90) * Math.PI) / 180)}
                     cy={r * Math.sin(((cache - 90) * Math.PI) / 180)}
                  />
               </g>
            </svg>
            <AbstractInputs.Number
               className={"input"}
               ref={inputRef}
               disabled={disabled}
               value={`${cache}`}
               onChange={onValue ? handleValueChange : undefined}
               onValidChange={onValidValue ? handleValueChange : undefined}
               onFinish={onCommit ? handleValueFinish : undefined}
               onValidFinish={onValidCommit ? handleValueFinish : undefined}
               step={step ?? "any"}
            />
         </div>
      );
   }
)`
   min-width: 100%;
   max-width: 0;
   width: auto;
   display: grid;
   grid-template-columns: 6em 1fr;
   grid-template-rows: auto;
   align-items: center;
   > .canvas {
      aspect-ratio: 1;
      min-height: 0;
      height: auto;
      grid-column: 1;
   }
   > .input {
      width: auto;
      justify-self: stretch;
      grid-column: 2;
   }
   &.large {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
      aspect-ratio: 1;
      place-items: center;
      margin-inline: auto;
      & > .canvas,
      & > .input {
         grid-row: 1 / -1;
         grid-column: 1 / -1;
      }
      & > .input {
         width: 40%;
      }
   }
   & > .input {
      background: var(--input-background);
      display: flex;
      padding: 0.125em 0.5em;
      border-radius: 0.125em;
      border: 1px solid var(--effect-border-highlight);
   }
   & > .input::selection {
      background-color: var(--input-text-selection);
   }
   & > .canvas {
      font-size: calc(1em * 72 / 96);
   }
   & > .canvas > .container {
      transform: translate(50%, 50%);
   }
   & > .canvas > .container > .track {
      stroke: var(--effect-border-highlight);
      stroke-width: 1px;
      vector-effect: non-scaling-stroke;
      fill: var(--flavour-button-muted);
      cursor: move;
   }
   & > .canvas > .container > .handle {
      fill: var(--flavour-button);
      stroke: var(--effect-border-highlight);
      border-radius: 100%;
      stroke-width: 1px;
      cursor: move;
   }
   & > .canvas > .container:hover > .handle {
      fill: var(--flavour-button-highlight);
      outline-offset: calc(1px / 72 * 96);
      outline: 1px solid var(--effect-border-overlight);
   }
   & > .canvas > .container > .handle:focus-visible,
   & > .canvas > .container > .handle:active {
      fill: var(--flavour-button-highlight);
      outline-offset: calc(1px / 72 * 96);
      outline: 1px solid var(--effect-border-overlight);
   }

   &.state-disabled > .input {
      background: var(--disabled-input-background);
      color: var(--disabled-input-text);
   }
   &.state-disabled > .input::placeholder {
      background: var(--disabled-input-placeholder);
   }
   &.state-disabled > .canvas > .container > .track {
      fill: var(--disabled-button-muted);
      outline: none;
      cursor: default;
   }
   &.state-disabled > .canvas > .container > .handle {
      fill: var(--disabled-button);
      outline: none;
      cursor: default;
   }
`;

export default AngleInput;
