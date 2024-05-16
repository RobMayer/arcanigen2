import styled from "styled-components";
import ActionButton from "../../../components/buttons/ActionButton";
import { useCutsheet, usePersistence } from "../systemstate";
import { saveAs } from "file-saver";
import { useMemo } from "react";
import JSZip from "jszip";

export const LaserMenu = styled(({ className }: { className?: string }) => {
    const { save, load } = usePersistence();
    const cutsheet = useCutsheet();

    const canExport = useMemo(() => {
        if (cutsheet.length === 0) {
            return false;
        }
        return cutsheet.some((e) => {
            if (e.result !== null) {
                return e.result.length > 0;
            }
            return false;
        });
    }, [cutsheet]);

    return (
        <div className={className}>
            <ActionButton
                onAction={() => {
                    const theBlob = new Blob([save()], { type: "application/json;charset=utf-8" });
                    saveAs(theBlob, "project.trhlaser");
                }}
            >
                Save
            </ActionButton>
            <ActionButton>
                Load
                <input
                    type="file"
                    onChange={(e) => {
                        const thing = e.target.files?.[0];
                        if (thing) {
                            handleUpload(e.target, thing, load);
                        }
                    }}
                    accept=".trhlaser"
                />
            </ActionButton>
            <ActionButton
                onAction={() => {
                    const content = document.getElementById("EXPORT_ME");
                    if (content) {
                        const theZip = new JSZip();
                        Array.from(content.querySelectorAll("svg")).forEach((el) => {
                            const mat = el.dataset.material;
                            const sheet = el.dataset.sheet;
                            if (mat && sheet) {
                                const theBlob = new Blob([el.outerHTML], { type: "image/svg+xml" });
                                theZip.file(`material ${mat} sheet ${sheet}.svg`, theBlob);
                            }
                        });
                        theZip
                            .generateAsync({ type: "blob" })
                            .then((b) => {
                                saveAs(b, "CutSheets.zip");
                            })
                            .catch((e) => {
                                console.error(e);
                            });
                    }
                }}
                disabled={!canExport}
            >
                Export SVGs
            </ActionButton>
        </div>
    );
})`
    display: flex;
    background: var(--layer1);
    border: 1px solid var(--effect-border-highlight);
`;

const NOOP = () => {};

const handleUpload = (element: HTMLInputElement, file: File, dispatch: (value: any) => void) => {
    if (file) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (evt) => {
            if (evt?.target?.result && typeof evt.target.result === "string") {
                try {
                    const json = JSON.parse(evt.target.result);
                    if (json) {
                        dispatch(json);
                    } else {
                        console.error("problem parsing uploaded file");
                    }
                } catch (e) {
                    console.error("problem parsing json");
                } finally {
                    element.value = "";
                }
            }
        };
        reader.onerror = (evt) => {
            console.error("problem reading file");
            element.value = "";
        };
    }
};
