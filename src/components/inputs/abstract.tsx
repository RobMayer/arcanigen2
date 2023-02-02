import { useMemo, ChangeEvent, DetailedHTMLProps, ForwardedRef, forwardRef, InputHTMLAttributes, useCallback, useEffect, useRef, useState } from "react";

/*

? for ease of grabbing for prop spreading

onChange,
onValidChange,
onValue,
onValidValue,
onFinish,
onValidFinish,
onCommit,
onValidCommit,
value

*/

export type AbstractInputProps<T, E extends HTMLElement = HTMLInputElement> = {
   onChange?: (e: ChangeEvent<E>) => void;
   onValidChange?: (e: ChangeEvent<E>) => void;
   onValue?: (value: T) => void;
   onValidValue?: (value: T) => void;
   onFinish?: (e: ChangeEvent<E>) => void;
   onValidFinish?: (e: ChangeEvent<E>) => void;
   onCommit?: (value: T) => void;
   onValidCommit?: (value: T) => void;
   onInvalidCommit?: (value: T, revert?: boolean) => void;
   onInvalidFinish?: (e: ChangeEvent<E>, revert?: boolean) => void;
   value: T;
   disabled?: boolean;
   revertInvalid?: boolean;
};

type IProps = AbstractInputProps<string> & Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "value" | "onChange">;

export type SimpleInputProps<T> = AbstractInputProps<T, HTMLInputElement> &
   Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "value" | "onChange">;

const AbstractTextInput = forwardRef(
   (
      {
         value = "",
         autoFocus,
         revertInvalid,
         onValidChange,
         onChange,
         onValidValue,
         onValue,
         onValidFinish,
         onFinish,
         onValidCommit,
         onCommit,
         onInvalidCommit,
         onInvalidFinish,
         ...props
      }: IProps,
      fRef: ForwardedRef<HTMLInputElement>
   ) => {
      const [cache, setCache] = useState(value);
      const ref = useRef<HTMLInputElement>();

      useEffect(() => {
         if (autoFocus && ref.current) {
            ref.current.focus();
         }
      }, [autoFocus]);

      useEffect(() => {
         setCache(value);
      }, [value]);

      const handleChange = useCallback(
         (e: ChangeEvent<HTMLInputElement>) => {
            setCache(e.currentTarget.value);
            onChange && onChange(e);
            onValue && onValue(e.currentTarget.value);
            if (e.currentTarget.validity.valid) {
               onValidChange && onValidChange(e);
               onValidValue && onValidValue(e.currentTarget.value);
            }
         },
         [onChange, onValue, onValidValue, onValidChange]
      );

      const handleFinish = useCallback(
         (e: ChangeEvent<HTMLInputElement>) => {
            setCache(e.currentTarget.value);
            onFinish && onFinish(e);
            onCommit && onCommit(e.currentTarget.value);
            if (e.currentTarget.validity.valid) {
               onValidFinish && onValidFinish(e);
               onValidCommit && onValidCommit(e.currentTarget.value);
            } else {
               onInvalidFinish && onInvalidFinish(e, revertInvalid);
               onInvalidCommit && onInvalidCommit(e.currentTarget.value, revertInvalid);
            }
         },
         [onFinish, onCommit, onValidFinish, onValidCommit, onInvalidCommit, onInvalidFinish, revertInvalid]
      );

      useEffect(() => {
         const n = ref.current;
         if (n && handleFinish) {
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
               handleFinish(se);
            };
            n.addEventListener("change", cb);
            return () => {
               n.removeEventListener("change", cb);
            };
         }
      }, [handleFinish]);

      const setRef = useCallback(
         (el: HTMLInputElement) => {
            ref.current = el;
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
      return <input {...props} type={"text"} ref={setRef} value={cache} onChange={handleChange} />;
   }
);

const AbstractNumberInput = forwardRef(
   (
      {
         value,
         autoFocus,
         onChange,
         onValidChange,
         onValue,
         onValidValue,
         onFinish,
         onValidFinish,
         onCommit,
         onValidCommit,
         onInvalidFinish,
         onInvalidCommit,
         revertInvalid,
         step,
         ...props
      }: IProps,
      fRef: ForwardedRef<HTMLInputElement>
   ) => {
      const [cache, setCache] = useState<string>(`${value}`);
      const ref = useRef<HTMLInputElement>();

      useEffect(() => {
         if (autoFocus && ref.current) {
            ref.current.focus();
         }
      }, [autoFocus]);

      useEffect(() => {
         setCache(`${value}`);
      }, [value]);

      const handleChange = useCallback(
         (e: ChangeEvent<HTMLInputElement>) => {
            setCache(e.currentTarget.value);
            onChange && onChange(e);
            if (e.currentTarget.validity.valid) {
               onValidChange && onValidChange(e);
            }
            if (e.currentTarget.value !== "") {
               const theNum = Number(e.currentTarget.value);
               if (!isNaN(theNum)) {
                  onValue && onValue(e.currentTarget.value);
                  if (e.currentTarget.validity.valid) {
                     onValidValue && onValidValue(e.currentTarget.value);
                  }
               }
            }
         },
         [onChange, onValue, onValidChange, onValidValue]
      );

      const handleFinish = useCallback(
         (e: ChangeEvent<HTMLInputElement>) => {
            setCache(e.currentTarget.value);
            const theNum = Number(e.currentTarget.value);

            onFinish && onFinish(e);
            onCommit && onCommit(e.currentTarget.value);
            if (e.currentTarget.validity.valid && !isNaN(theNum)) {
               onValidCommit && onValidCommit(e.currentTarget.value);
               onValidFinish && onValidFinish(e);
            } else {
               onInvalidCommit && onInvalidCommit(e.currentTarget.value, revertInvalid);
               onInvalidFinish && onInvalidFinish(e, revertInvalid);
            }
         },
         [onFinish, onCommit, onValidCommit, onValidFinish, onInvalidFinish, onInvalidCommit, revertInvalid]
      );

      useEffect(() => {
         const n = ref.current;
         if (n) {
            const onActualChange = (e: Event) => {
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
               handleFinish(se);
            };
            n.addEventListener("change", onActualChange);
            return () => {
               n.removeEventListener("change", onActualChange);
            };
         }
      }, [handleFinish]);

      const setRef = useCallback(
         (el: HTMLInputElement) => {
            ref.current = el;
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
      return <input {...props} step={step ?? "any"} type={"number"} ref={setRef} value={cache} onChange={handleChange} />;
   }
);

const AbstractSliderInput = forwardRef(
   (
      {
         value,
         autoFocus,
         onChange,
         onValidChange,
         onValue,
         onValidValue,
         onFinish,
         onValidFinish,
         onCommit,
         onValidCommit,
         onInvalidCommit,
         onInvalidFinish,
         revertInvalid,
         step,
         ...props
      }: IProps,
      fRef: ForwardedRef<HTMLInputElement>
   ) => {
      const [cache, setCache] = useState<string>(`${value}`);
      const ref = useRef<HTMLInputElement>();

      useEffect(() => {
         if (autoFocus && ref.current) {
            ref.current.focus();
         }
      }, [autoFocus]);

      useEffect(() => {
         setCache(`${value}`);
      }, [value]);

      const handleChange = useCallback(
         (e: ChangeEvent<HTMLInputElement>) => {
            setCache(e.currentTarget.value);
            onChange && onChange(e);
            if (e.currentTarget.validity.valid) {
               onValidChange && onValidChange(e);
            }
            if (e.currentTarget.value !== "") {
               const theNum = Number(e.currentTarget.value);
               if (!isNaN(theNum)) {
                  onValue && onValue(e.currentTarget.value);
                  if (e.currentTarget.validity.valid) {
                     onValidValue && onValidValue(e.currentTarget.value);
                  }
               }
            }
         },
         [onChange, onValue, onValidChange, onValidValue]
      );

      const handleFinish = useCallback(
         (e: ChangeEvent<HTMLInputElement>) => {
            setCache(e.currentTarget.value);
            const theNum = Number(e.currentTarget.value);
            onFinish && onFinish(e);
            onCommit && onCommit(e.currentTarget.value);
            if (e.currentTarget.validity.valid && !isNaN(theNum)) {
               onValidCommit && onValidCommit(e.currentTarget.value);
               onValidFinish && onValidFinish(e);
            } else {
               onInvalidCommit && onInvalidCommit(e.currentTarget.value, revertInvalid);
               onInvalidFinish && onInvalidFinish(e, revertInvalid);
            }
         },
         [onFinish, onCommit, onValidCommit, onValidFinish, onInvalidCommit, onInvalidFinish, revertInvalid]
      );

      useEffect(() => {
         const n = ref.current;
         if (n) {
            const onActualChange = (e: Event) => {
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
               handleFinish(se);
            };
            n.addEventListener("change", onActualChange);
            return () => {
               n.removeEventListener("change", onActualChange);
            };
         }
      }, [handleFinish]);

      const setRef = useCallback(
         (el: HTMLInputElement) => {
            ref.current = el;
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
      return <input {...props} step={step ?? "any"} type={"range"} ref={setRef} value={cache} onChange={handleChange} />;
   }
);

const useAbstractProps = <V, T extends AbstractInputProps<V>>(props: T) => {
   const {
      value,
      onChange,
      onValidChange,
      onValue,
      onValidValue,
      onFinish,
      onValidFinish,
      onCommit,
      onValidCommit,
      onInvalidCommit,
      onInvalidFinish,
      revertInvalid = false,
      disabled = false,
      ...rest
   } = props;

   const handlers = useMemo(
      () => ({
         onChange,
         onValidChange,
         onValue,
         onValidValue,
         onFinish,
         onValidFinish,
         onCommit,
         onValidCommit,
         onInvalidCommit,
         onInvalidFinish,
      }),
      [onChange, onValidChange, onValue, onValidValue, onFinish, onValidFinish, onCommit, onValidCommit, onInvalidCommit, onInvalidFinish]
   );

   return {
      value,
      handlers,
      disabled,
      revertInvalid,
      ...rest,
   };
};

const useAbstractHandlers = <S, E extends HTMLElement & { value: string }>(
   incomingValue: S,
   {
      onChange: incomingOnChange,
      onValidChange: incomingOnValidChange,
      onValue: incomingOnValue,
      onValidValue: incomingOnValidValue,
      onFinish: incomingOnFinish,
      onValidFinish: incomingOnValidFinish,
      onCommit: incomingOnCommit,
      onValidCommit: incomingOnValidCommit,
      onInvalidCommit: incomingOnInvalidCommit,
      onInvalidFinish: incomingOnInvalidFinish,
   }: Omit<AbstractInputProps<S, E>, "value">,
   transform: (incoming: string) => S,
   inverter: (incoming: S) => string
) => {
   const [value, setValue] = useState<string>(inverter(incomingValue));

   const held = useRef(inverter(incomingValue));

   useEffect(() => {
      setValue(inverter(incomingValue));
      held.current = inverter(incomingValue);
   }, [incomingValue, inverter]);

   const onChange = useCallback(
      (e: ChangeEvent<E>) => {
         setValue(e.currentTarget.value);
         incomingOnChange && incomingOnChange(e);
      },
      [incomingOnChange]
   );

   const onValidChange = useCallback(
      (e: ChangeEvent<E>) => {
         incomingOnValidChange && incomingOnValidChange(e);
      },
      [incomingOnValidChange]
   );

   const onFinish = useCallback(
      (e: ChangeEvent<E>) => {
         incomingOnFinish && incomingOnFinish(e);
      },
      [incomingOnFinish]
   );

   const onValidFinish = useCallback(
      (e: ChangeEvent<E>) => {
         incomingOnValidFinish && incomingOnValidFinish(e);
      },
      [incomingOnValidFinish]
   );

   const onValue = useCallback(
      (v: string) => {
         incomingOnValue && incomingOnValue(transform(v));
      },
      [incomingOnValue, transform]
   );

   const onValidValue = useCallback(
      (v: string) => {
         incomingOnValidValue && incomingOnValidValue(transform(v));
      },
      [incomingOnValidValue, transform]
   );

   const onCommit = useCallback(
      (v: string) => {
         incomingOnCommit && incomingOnCommit(transform(v));
      },
      [incomingOnCommit, transform]
   );

   const onValidCommit = useCallback(
      (v: string) => {
         incomingOnValidCommit && incomingOnValidCommit(transform(v));
      },
      [incomingOnValidCommit, transform]
   );

   const onInvalidCommit = useCallback(
      (v: string, revert: boolean = false) => {
         if (revert) {
            setValue(held.current);
         }
         incomingOnInvalidCommit && incomingOnInvalidCommit(transform(v), revert);
      },
      [incomingOnInvalidCommit, transform]
   );

   const onInvalidFinish = useCallback(
      (e: ChangeEvent<E>, revert: boolean = false) => {
         incomingOnInvalidFinish && incomingOnInvalidFinish(e, revert);
      },
      [incomingOnInvalidFinish]
   );

   return {
      value,
      onChange,
      onValidChange,
      onValue,
      onValidValue,
      onFinish,
      onValidFinish,
      onCommit,
      onValidCommit,
      onInvalidCommit,
      onInvalidFinish,
   };
};

const AbstractInputs = {
   Text: AbstractTextInput,
   Number: AbstractNumberInput,
   Slider: AbstractSliderInput,
   useAbstractHandlers,
   useAbstractProps,
};

export default AbstractInputs;
