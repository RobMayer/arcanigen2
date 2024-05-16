import { useRef, useEffect } from "react";

export const useStable = <T>(input: T) => {
    const ref = useRef<T>(input);
    useEffect(() => {
        ref.current = input;
    }, [input]);

    return ref;
};
