import { ForwardedRef, forwardRef } from "react";
import styled from "styled-components";
import AbstractInputs, { SimpleInputProps } from "./abstract";

const TextArea = styled(
   forwardRef((props: SimpleInputProps<string, HTMLTextAreaElement>, fRef: ForwardedRef<HTMLTextAreaElement>) => {
      return <AbstractInputs.Area {...props} ref={fRef} />;
   })
)`
   width: 16em;
   height: 8em;
   background: var(--input-background);
   display: flex;
   padding: 0.125em 0.5em;
   border-radius: 0.125em;
   border: 1px solid var(--effect-border-highlight);
   &.monospace {
      font-family: monospace;
   }
   &:is(.auto) {
      width: auto;
      height: auto;
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
   &:is(.wide) {
      min-width: 32em;
   }
   &:is(.tall) {
      height: 16em;
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

export default TextArea;
