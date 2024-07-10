import { Changelog } from "../../components/utility/changelog";

export const ArcanigenChangelog = () => {
    return (
        <Changelog>
            <Changelog.Release version={"v2.1.0"} on={"24-06-2024"}>
                <Changelog.Improvement>Added Changelog</Changelog.Improvement>
                <Changelog.Bugfix>Conformal Path of Spiral was broken</Changelog.Bugfix>
                <Changelog.Feature>Added a search/filter to the Node List</Changelog.Feature>
                <Changelog.Bugfix>Color (HSI) was referencing the helper of Color (HSV)</Changelog.Bugfix>
            </Changelog.Release>
            <Changelog.Release version={"Previous"} on={"Before Times"}>
                <Changelog.Improvement>Added everything else...</Changelog.Improvement>
            </Changelog.Release>
        </Changelog>
    );
};
