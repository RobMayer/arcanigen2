import { Changelog } from "../../components/utility/changelog";

export const GridGammaChangelog = () => {
    return (
        <Changelog>
            <Changelog.Release version={"v2.2.0"} on={"14-07-2024"}>
                <Changelog.Feature>Added "Grid-based Drawers"</Changelog.Feature>
                <Changelog.Bugfix>Fixed a bug with Item-Setup layout sheet calculation.</Changelog.Bugfix>
            </Changelog.Release>
            <Changelog.Release version={"v2.1.0"} on={"12-07-2024"}>
                <Changelog.Feature>Added "Freeform Box"</Changelog.Feature>
                <Changelog.Improvement>Save/Load objects to/from disk</Changelog.Improvement>
            </Changelog.Release>
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
