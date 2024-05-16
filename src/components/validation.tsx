import { useState, useRef, useCallback } from "react";

export type ValidationEntry = { code: string; message: string };

export type ValidationHandler = {
    onDismount: () => void;
    check: (reasons: ValidationEntry[]) => void;
};

export const useValidator = (): [errors: { [field: string]: ValidationEntry[] }, validator: (field: string) => ValidationHandler] => {
    const [errors, setErrors] = useState<{ [key: string]: ValidationEntry[] }>({});

    const handlersRef = useRef<{ [key: string]: ValidationHandler }>({});

    const validator = useCallback((field: string) => {
        if (!(field in handlersRef.current)) {
            handlersRef.current[field] = {
                check: (reasons: ValidationEntry[]) => {
                    if (reasons.length > 0) {
                        setErrors((p) => {
                            return { ...p, [field]: reasons };
                        });
                    }
                },
                onDismount: () => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [field]: _, ...rest } = handlersRef.current;
                    handlersRef.current = rest;
                    setErrors((p) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { [field]: _, ...rest } = p;
                        return rest;
                    });
                },
            };
        }
        return handlersRef.current[field];
    }, []);

    return [errors, validator];
};
