import ActionButton from "!/components/buttons/ActionButton";
import ArcaneGraph from "../definitions/graph";
import { IArcaneGraph } from "../definitions/types";

const LoadGraph = () => {
    const { load } = ArcaneGraph.useGraph();
    return (
        <ActionButton>
            Load Graph
            <input
                type="file"
                onChange={(e) => {
                    const thing = e.target.files?.[0];
                    if (thing) {
                        handleUpload(e.target, thing, load);
                    }
                }}
                accept=".trh"
            />
        </ActionButton>
    );
};

const NOOP = () => {};

export default LoadGraph;

type UploadJson = {
    version: string;
    nodes: IArcaneGraph["nodes"];
    links: IArcaneGraph["links"];
    positions: { [key: string]: { x: number; y: number } };
    toggles: { [key: string]: { node: boolean; [key: string]: boolean } };
};

const handleUpload = (element: HTMLInputElement, file: File, dispatch: (value: UploadJson) => void) => {
    if (file) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (evt) => {
            if (evt?.target?.result && typeof evt.target.result === "string") {
                try {
                    const json = JSON.parse(evt.target.result) as UploadJson;
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
