import { Changelog } from "../../components/utility/changelog";

export const GridGammaChangelog = () => {
    return (
        <Changelog>
            <Changelog.Release version={"v2.0.0"} on={"09-07-2024"}>
                <Changelog.Feature>Complete Rewrite of, well, everything</Changelog.Feature>
                <Changelog.Improvement>Added Changelog</Changelog.Improvement>
            </Changelog.Release>
            <Changelog.Release version={"Previous"} on={"Before Times"}>
                <Changelog.Improvement>Added everything else...</Changelog.Improvement>
            </Changelog.Release>
        </Changelog>
    );
};
