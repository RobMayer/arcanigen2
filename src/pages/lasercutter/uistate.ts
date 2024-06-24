import { useCallback } from "react";
import { proxy, useSnapshot } from "valtio";

type UIState = {
    gridFoldout: boolean;
    materialFoldout: boolean;
    previewFoldout: boolean;
    tweakFoldout: boolean;
};

const uistatestore = proxy<UIState>({
    gridFoldout: true,
    materialFoldout: true,
    previewFoldout: true,
    tweakFoldout: true,
});

type Setter<T extends keyof UIState> = (val: UIState[T]) => void;

export const useUIState = <T extends keyof UIState>(key: T): [UIState[T], Setter<T>] => {
    const state = useSnapshot(uistatestore)[key];

    const setState = useCallback(
        (value: UIState[T]) => {
            uistatestore[key] = value;
        },
        [key]
    );

    return [state, setState];
};
