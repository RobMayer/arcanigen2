/** @scope default . */

import { HTMLAttributes, useRef, useEffect, ForwardedRef, forwardRef } from "react";
import CSSType from "csstype";

/** @scope * */

export type BoundingBox = {
   x: number;
   y: number;
   width: number;
   height: number;
};

/** @scope * */

export type Justification = "start" | "end" | "center" | "fill";

/** @scope * */

export type ArrowProps = {
   color: CSSType.Property.Color;
   border: CSSType.Property.Color;
   stroke: string;
   size: string;
};

/** @scope * */

export type Direction =
   | "center"
   | "center center"
   | "down right"
   | "up right"
   | "down left"
   | "up left"
   | "down center"
   | "up center"
   | "left up"
   | "left center"
   | "left down"
   | "right up"
   | "right center"
   | "right down";

export const Popup = ({
   target,
   align = "down right",
   justify = "start",
   style,
   children,
   wrapper: Wrapper = DefaultWrapper as (p: HTMLAttributes<HTMLDivElement>) => JSX.Element,
   arrow = false,
   ...props
}: PopupProps) => {
   arrow = arrow ? { ...defaultArrow, ...arrow } : false;

   if (align === "center") {
      align = "center center";
   }
   const fRef = useRef<HTMLDivElement>(null);
   const sRef = useRef<SVGSVGElement>(null);
   const aRef = useRef<SVGPolylineElement>(null);

   useEffect(() => {
      if (fRef.current && sRef.current) {
         const flyout = fRef.current.getBoundingClientRect();
         const arw = arrow
            ? sRef.current.getBoundingClientRect()
            : {
                 width: 0,
                 height: 0,
              };
         const bounds = document.getElementById("widget-root")?.getBoundingClientRect();
         const result = {
            left: "auto",
            right: "auto",
            top: "auto",
            bottom: "auto",
            minWidth: "auto",
            minHeight: "auto",
            maxHeight: "auto",
            maxWidth: "auto",
            visibility: "visible",
         };
         const arrowResult = {
            top: "auto",
            left: "auto",
            bottom: "auto",
            right: "auto",
         };
         let points = "";

         const [primary, secondary] = align.split(" ");
         if (bounds) {
            if (primary === "center" && secondary === "center") {
               const roomTop = target.y + target.height / 2 - bounds.top;
               const roomBottom = bounds.top + bounds.height - target.y - target.height;
               const roomLeft = target.x + target.width / 2 - bounds.left;
               const roomRight = bounds.left + bounds.width - target.x - target.width;
               if (flyout.width / 2 > roomRight) {
                  result.right = "0px";
               }
               if (flyout.width / 2 > roomLeft) {
                  result.left = "0px";
               }
               if (flyout.height / 2 > roomTop) {
                  result.top = "0px";
               }
               if (flyout.height / 2 > roomBottom) {
                  result.bottom = "0px";
               }
               if (result.left === "auto" && result.right === "auto") {
                  result.left = `${target.x + target.width / 2 - flyout.width / 2 - bounds.left}px`;
               }
               if (result.top === "auto" && result.bottom === "auto") {
                  result.top = `${target.y + target.height / 2 - flyout.height / 2 - bounds.top}px`;
               }
            } else {
               if (primary === "down" || primary === "up") {
                  if (justify === "fill" && target.width > 0) {
                     result.minWidth = `${target.width}px`;
                  }
                  const roomAbove = target.y - bounds.top - arw.height;
                  const roomBelow = bounds.top + bounds.height - (target.y + target.height) - arw.height;
                  if (
                     (roomAbove < flyout.height && roomBelow < flyout.height && roomAbove < roomBelow) || //not enough room up or down, but there's more room down than up
                     (primary === "up" && roomAbove < flyout.height) || //trying to go up but there's not enough room
                     (primary === "down" && roomBelow > flyout.height) // trying to go down and there's enough room
                  ) {
                     result.top = `${target.y + target.height - bounds.top + arw.height}px`;
                     result.maxHeight = `${roomBelow}px`;
                     arrowResult.top = "-1em";
                     points = POINT_UP;
                  }
                  if (
                     (roomAbove < flyout.height && roomBelow < flyout.height && roomAbove > roomBelow) || //not enough room up or down, but there's more room up than down
                     (primary === "down" && roomBelow < flyout.height) || //trying to go down but there's not enough room
                     (primary === "up" && roomAbove > flyout.height) // trying to go up and there's enough clearance
                  ) {
                     result.bottom = `${bounds.bottom - target.y + arw.height}px`;
                     result.maxHeight = `${roomAbove}px`;
                     arrowResult.bottom = "-1em";
                     points = POINT_DN;
                  }
                  if (secondary === "center") {
                     const roomLeft = target.x + target.width / 2 - bounds.left;
                     const roomRight = bounds.left + bounds.width - target.x - target.width;
                     if (flyout.width / 2 > roomRight || flyout.width / 2 > roomLeft) {
                        if (flyout.width / 2 > roomRight) {
                           result.right = "0px";
                           arrowResult.right = "0px";
                        }
                        if (flyout.width / 2 > roomLeft) {
                           result.left = "0px";
                           arrowResult.left = "0px";
                        }
                     } else {
                        result.left = `${target.x + target.width / 2 - flyout.width / 2 - bounds.left}px`;
                        arrowResult.left = "calc(50% - 0.5em)";
                     }
                  }
               }
               if (primary === "left" || primary === "right") {
                  if (justify === "fill" && target.height > 0) {
                     result.minHeight = `${target.height}px`;
                  }
                  const roomLeft = target.x - bounds.left - arw.width; //good
                  const roomRight = bounds.left + bounds.width - (target.x + target.width) - arw.width;
                  if (
                     (roomLeft < flyout.width && roomRight < flyout.width && roomLeft < roomRight) || //not enough room to go left or right, but there's more room right than left
                     (primary === "left" && roomLeft < flyout.width && roomRight > flyout.width) || //trying to go left but there's not enough room
                     (primary === "right" && roomRight > flyout.width) //trying to go right and there's enough room
                  ) {
                     result.left = `${target.x + target.width - bounds.left + arw.width}px`;
                     result.maxWidth = `${roomRight}px`;
                     arrowResult.left = "-1em";
                     points = POINT_LF;
                  }
                  if (
                     (roomLeft < flyout.width && roomRight < flyout.width && roomLeft > roomRight) || //not enough room to go left or right, but there's more room left than right
                     (primary === "right" && roomRight < flyout.width && roomLeft > flyout.width) || //trying to go right but there's not enough room.
                     (primary === "left" && roomLeft > flyout.width) //trying to go left and there's enough room
                  ) {
                     result.right = `${bounds.right - target.x + arw.width}px`;
                     result.maxWidth = `${roomLeft}px`;
                     arrowResult.right = "-1em";
                     points = POINT_RT;
                  }
                  if (secondary === "center") {
                     const roomTop = target.y + target.height / 2 - bounds.top;
                     const roomBottom = bounds.top + bounds.height - target.y - target.height;
                     if (flyout.height / 2 > roomBottom || flyout.height / 2 > roomTop) {
                        if (flyout.height / 2 > roomBottom) {
                           result.bottom = "0px";
                           arrowResult.bottom = "0px";
                        }
                        if (flyout.height / 2 > roomTop) {
                           result.top = "0px";
                           arrowResult.top = "0px";
                        }
                     } else {
                        result.top = `${target.y + target.height / 2 - flyout.height / 2 - bounds.top}px`;
                        arrowResult.top = "calc(50% - 0.5em)";
                     }
                  }
               }
               if (secondary === "left" || secondary === "right") {
                  const justAdd = justify === "end" ? 0 : justify === "center" ? target.width / 2 : target.width;
                  const theW = flyout.width + justAdd;

                  const roomLeft = target.x - bounds.left + target.width - arw.width;
                  const roomRight = bounds.left + bounds.width - target.x - arw.width;

                  if (
                     (roomLeft < theW && roomRight < theW && roomRight > roomLeft) || // not enough room to fly left or fly right, but more room on right
                     (secondary === "left" && roomLeft < theW && roomRight > theW) || // trying to go left, but not enough room
                     (secondary === "right" && roomRight > theW) // trying to go right and success!
                  ) {
                     result.left = `${target.x - bounds.left + target.width - justAdd - arw.width / 2}px`;
                     arrowResult.left = "0.5em";
                  }
                  if (
                     (roomLeft < theW && roomRight < theW && roomLeft > roomRight) || // not enough room to fly left or fly right, but more room on left
                     (secondary === "right" && roomRight < theW && roomLeft > theW) || // trying to go right, but not enough room
                     (secondary === "left" && roomLeft > theW) // trying to go left and success!
                  ) {
                     result.right = `${bounds.right - target.x - justAdd - arw.width / 2}px`;
                     arrowResult.right = "0.5em";
                  }
               }
               if (secondary === "up" || secondary === "down") {
                  const justAdd = justify === "end" ? 0 : justify === "center" ? target.height / 2 : target.height;
                  const theH = flyout.height + justAdd;

                  const roomUp = target.y - bounds.top - arw.height; //good
                  const roomDown = bounds.top + bounds.height - (target.y + target.height) - arw.height;

                  if (
                     (roomUp < theH && roomDown < theH && roomUp > roomDown) || // not enough room up or down, but more room up than down
                     (secondary === "down" && roomDown < theH && roomUp > theH) || // trying to go down but not enough room
                     (secondary === "up" && roomUp > theH) // trying to go up and success
                  ) {
                     result.bottom = `${bounds.bottom - target.y - justAdd - arw.height / 2}px`;
                     arrowResult.bottom = "0.5em";
                  }
                  if (
                     (roomUp < theH && roomDown < theH && roomUp < roomDown) || // not enough room up or down, but more room down than up
                     (secondary === "up" && roomUp < theH && roomDown > theH) || // trying to go up but not enough room
                     (secondary === "down" && roomDown > theH) // trying to go down and success
                  ) {
                     result.top = `${target.y - bounds.top + target.height - justAdd - arw.height / 2}px`;
                     arrowResult.top = "0.5em";
                  }
               }
            }
            fRef.current.style.left = result.left;
            fRef.current.style.right = result.right;
            fRef.current.style.top = result.top;
            fRef.current.style.bottom = result.bottom;
            fRef.current.style.minWidth = result.minWidth;
            fRef.current.style.minHeight = result.minHeight;
            fRef.current.style.maxHeight = result.maxHeight;
            fRef.current.style.maxWidth = result.maxWidth;
            fRef.current.style.visibility = "visible";
            if (sRef.current) {
               sRef.current.style.left = arrowResult.left;
               sRef.current.style.top = arrowResult.top;
               sRef.current.style.bottom = arrowResult.bottom;
               sRef.current.style.right = arrowResult.right;
               sRef.current.style.visibility = "visible";
            }
            if (aRef.current) {
               aRef.current.setAttribute("points", points);
            }
            //return ["", arrowResult];
         }
      }
      //return ["", {} as Partial<CSSProperties>];
   }, [target, align, justify, arrow]);

   return (
      <div
         style={{
            position: "absolute",
            visibility: "hidden",
         }}
         ref={fRef}
      >
         <Wrapper>
            <svg
               ref={sRef}
               style={{
                  position: "absolute",
                  visibility: "hidden",
                  fontSize: arrow ? arrow.size : "1em",
                  pointerEvents: "none",
               }}
               width={"1em"}
               height={"1em"}
               viewBox={"0 0 1 1"}
            >
               <polyline
                  ref={aRef}
                  style={{
                     vectorEffect: "non-scaling-stroke",
                     stroke: arrow ? arrow.border : "none",
                     strokeWidth: arrow ? arrow.stroke : "0px",
                     fill: arrow ? arrow.color : "none",
                  }}
               />
            </svg>
            {children}
         </Wrapper>
      </div>
   );
};

const POINT_UP = "0,1 0.5,0 1,1";
const POINT_DN = "0,0 0.5,1 1,0";
const POINT_LF = "1,0 0,0.5 1,1";
const POINT_RT = "0,0 1,0.5 0,1";

type PopupProps = {
   align: Direction;
   target: BoundingBox;
   justify?: Justification;
   arrow?: Partial<ArrowProps> | false;
   wrapper?: (p: HTMLAttributes<HTMLDivElement>) => JSX.Element;
} & HTMLAttributes<HTMLDivElement>;

const defaultArrow: ArrowProps = {
   stroke: "0px",
   border: "none",
   color: "none",
   size: "1em",
};

const DefaultWrapper = forwardRef((props: HTMLAttributes<HTMLDivElement>, fRef: ForwardedRef<HTMLDivElement>) => {
   return <div {...props} ref={fRef} />;
});
