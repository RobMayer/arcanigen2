import ActionButton from "!/components/buttons/ActionButton";
import Modal, { useModal } from "!/components/popups/Modal";
import styled from "styled-components";
import ArcaneGraph from "../definitions/graph";
import { Fragment } from "react";

const EXAMPLE_CATEGORIES = [
    {
        name: "Shapes",
        flavour: "normal",
        contents: ["shapeCircle", "shapeRectangle", "shapeRing", "shapePolygon", "shapePolygram", "shapeKnot", "shapePolyring", "shapeStar", "shapeText", "thatRobShape"],
    },
    {
        name: "Modifiers and Collections",
        flavour: "danger",
        contents: ["styles", "transforms", "mask", "vertexArray", "spiralArray", "clusterArray", "sequencer", "lerp", "portals"],
    },
    {
        name: "Other Things",
        flavour: "confirm",
        contents: ["note"],
    },
    {
        name: "Fancy Stuff",
        flavour: "emphasis",
        contents: ["demoTalisman"],
    },
];

const EXAMPLE_DATA: { [key: string]: IExample } = {
    shapeCircle: {
        name: "Circle",
        description: "The circle of life finds a way?",
    },
    shapeRectangle: {
        name: "Rectangle",
        description: "[insert pulp fiction gif here]",
    },
    shapeRing: {
        name: "Ring",
        description: "not 'lord of the', I'm afraid",
    },
    shapePolygon: {
        name: "Polygon",
        description: "Got nothing witty for this one.",
    },
    shapePolygram: {
        name: "Polygram",
        description: "Still got nothin'.",
    },
    shapeKnot: {
        name: "Knot",
        description: "Knot quite what you think.",
    },
    shapePolyring: {
        name: "Polyring",
        description: "nothing witty springs to mind here either.",
    },
    shapeStar: {
        name: "Star",
        description: "The thing's hollow -- it goes on forever -- and -- oh my God! -- it's full of stars!",
    },
    shapeText: {
        name: "Text",
        description: "I couldn't think to use anything other than Lorem Ipsum and Hello World.",
    },
    thatRobShape: {
        name: "ThatRobShape",
        description: "What an original name, I know.",
    },
    styles: {
        name: "Styles & Restyles",
        description: "I feel like I should reference gangnam style or something, but I already feel old.",
    },
    lerp: {
        name: "Lerp (tweening)",
        description: "Not to be confused with the butler from the Addams family.",
    },
    mask: {
        name: "Masks",
        description: "It's just that masks are terribly comfortable - I think everyone will be wearing them in the future.",
    },
    vertexArray: {
        name: "Vertex Arrays",
        description: "Clones are meant to be expendable.",
    },
    spiralArray: {
        name: "Spiral Arrays",
        description: "You spin me right round baby...",
    },
    clusterArray: {
        name: "Cluster Arrays",
        description: "Come together / right now / over me.",
    },
    sequencer: {
        name: "Sequencer",
        description: "The ants go marching one by one hurrah, hurrah.",
    },
    portals: {
        name: "Portals",
        description: "Now you're thinking with them...",
    },
    transforms: {
        name: "Transforms",
        description: "It's not a very good disguise even for a robot.",
    },
    note: {
        name: "Note",
        description: "it's what it says on the tin...",
    },
    demoTalisman: {
        name: "Rob Talisman",
        description: "a study in using the ThatRobShape and Restyle nodes",
    },
};

const LoadExample = styled(({ className }: { className?: string }) => {
    const modalControls = useModal();

    return (
        <>
            <Modal controls={modalControls} label={"Load Examples"}>
                <div className={className}>
                    {EXAMPLE_CATEGORIES.map((category, i) => {
                        return (
                            <Fragment key={category.name}>
                                <SectionHeader className={`flavour-${category?.flavour ?? "normal"}`}>{category.name}</SectionHeader>
                                {category.contents.map((k) => {
                                    return <Card onLoad={modalControls.close} key={k} id={k} data={EXAMPLE_DATA[k]} />;
                                })}
                            </Fragment>
                        );
                    })}
                </div>
            </Modal>
            <ActionButton onAction={modalControls.open}>Load Example</ActionButton>
        </>
    );
})`
    display: grid;
    max-width: 80vw;
    width: auto;
    grid-template-columns: repeat(auto-fit, 600px);
    gap: 0.75em;
    padding: 0.5em;
`;

export default LoadExample;

type IExample = {
    name: string;
    description?: string;
    image?: string;
    file?: string;
};

const SectionHeader = styled.div`
    grid-column: 1 / -1;
    font-size: 1.5em;
    padding-inline: 0.25em;
    border: 1px solid var(--flavour-button);
    background: var(--flavour-button-muted);
`;

const Card = styled(({ className, onLoad, id, data }: { className?: string; data: IExample; id: string; onLoad: () => void }) => {
    const { load } = ArcaneGraph.useGraph();

    const modalControls = useModal();

    return (
        <>
            <Modal controls={modalControls} label={"Double-checking"}>
                You will lose your work.
                <ConfirmOptions>
                    <ActionButton
                        onAction={() => {
                            fetch(`/examples/${data.file ?? id}.trh`)
                                .then((res) => {
                                    if (res.ok) {
                                        return res.json();
                                    }
                                    return Promise.reject(res.statusText);
                                })
                                .then((json) => {
                                    load(json);
                                    modalControls.close();
                                    onLoad();
                                })
                                .catch((e) => {
                                    console.error(e);
                                });
                        }}
                        flavour={"danger"}
                    >
                        Proceed
                    </ActionButton>
                    <ActionButton onAction={modalControls.close}>Nevermind</ActionButton>
                </ConfirmOptions>
            </Modal>
            <div className={className}>
                <Thumbnail src={`/examples/${data.image ?? `${id}.png`}`} alt={id} />
                <Name>{data.name}</Name>
                <Desc>{data.description}</Desc>
                <LoadButton onAction={modalControls.open}>Load {data.name}</LoadButton>
            </div>
        </>
    );
})`
    display: grid;
    grid-template-columns: 128px 1fr;
    grid-template-rows: auto 1fr auto;
    gap: 0.5em;
    grid-template-areas:
        "thumbnail name"
        "thumbnail desc"
        "thumbnail button";
    border: 1px solid var(--effect-border-highlight);
    padding: 0.25em;
`;

const ConfirmOptions = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid var(--effect-border-highlight);
`;

const Thumbnail = styled.img`
    aspect-ratio: 1;
    height: auto;
    grid-area: thumbnail;
`;
const Name = styled.div`
    font-size: 1.25em;
    border-bottom: 1px solid var(--effect-border-highlight);
    grid-area: name;
`;
const Desc = styled.div`
    grid-area: desc;
    font-size: 0.875em;
`;

const LoadButton = styled(ActionButton)`
    grid-area: button;
    justify-self: end;
`;
