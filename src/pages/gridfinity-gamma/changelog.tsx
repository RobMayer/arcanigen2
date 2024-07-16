import { Changelog } from "../../components/utility/changelog";

const { Release, Feature, Bugfix, Improvement } = Changelog;

export const GridGammaChangelog = () => {
    return (
        <Changelog>
            <Release version={"v2.3.0"} on={"16-07-2024"}>
                <Feature>Added "Pattern Top" (and a way to exclude the standard top for grid box)</Feature>
                <Improvement>Internal optimizations</Improvement>
            </Release>
            <Release version={"v2.2.1"} on={"15-07-2024"}>
                <Bugfix>Fixed a bug with only half of the dividers showing up on Grid and Freeform Boxes</Bugfix>
            </Release>
            <Release version={"v2.2.0"} on={"14-07-2024"}>
                <Feature>Added "Grid-based Drawers"</Feature>
                <Bugfix>Fixed a bug with Item-Setup layout sheet calculation.</Bugfix>
            </Release>
            <Release version={"v2.1.0"} on={"12-07-2024"}>
                <Feature>Added "Freeform Box"</Feature>
                <Improvement>Save/Load objects to/from disk</Improvement>
            </Release>
            <Release version={"v2.0.0"} on={"09-07-2024"}>
                <Feature>Complete Rewrite of, well, everything</Feature>
                <Improvement>Added Changelog</Improvement>
            </Release>
            <Release version={"Previous"} on={"Before Times"}>
                <Improvement>Added everything else...</Improvement>
            </Release>
        </Changelog>
    );
};
