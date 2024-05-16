import styled from "styled-components";
import { Icon } from "../../../components/icons";
import { iconActionAdd } from "../../../components/icons/action/add";
import { iconActionClose } from "../../../components/icons/action/close";
import { iconActionCopy } from "../../../components/icons/action/copy";
import { iconActionCut } from "../../../components/icons/action/cut";
import { iconActionEdit } from "../../../components/icons/action/edit";
import { iconActionMore } from "../../../components/icons/action/more";
import { iconActionPaste } from "../../../components/icons/action/paste";
import { iconActionPick } from "../../../components/icons/action/pick";
import { iconActionPower } from "../../../components/icons/action/power";
import { iconActionRefresh } from "../../../components/icons/action/refresh";
import { iconActionSave } from "../../../components/icons/action/save";
import { iconActionSearch } from "../../../components/icons/action/search";
import { iconActionSettings } from "../../../components/icons/action/settings";
import { iconActionSubtract } from "../../../components/icons/action/subtract";
import { iconArrowDown } from "../../../components/icons/arrow/down";
import { iconArrowHorizontal } from "../../../components/icons/arrow/horizontal";
import { iconArrowLeft } from "../../../components/icons/arrow/left";
import { iconArrowRight } from "../../../components/icons/arrow/right";
import { iconArrowUp } from "../../../components/icons/arrow/up";
import { iconArrowVertical } from "../../../components/icons/arrow/vertical";
import { iconCaretDown } from "../../../components/icons/caret/down";
import { iconCaretLeft } from "../../../components/icons/caret/left";
import { iconCaretRight } from "../../../components/icons/caret/right";
import { iconCaretUp } from "../../../components/icons/caret/up";
import { iconChevronDown } from "../../../components/icons/chevron/down";
import { iconChevronLeft } from "../../../components/icons/chevron/left";
import { iconChevronRight } from "../../../components/icons/chevron/right";
import { iconChevronUp } from "../../../components/icons/chevron/up";
import { iconActionFromDrive } from "../../../components/icons/action/fromDrive";
import { iconActionToDrive } from "../../../components/icons/action/toDrive";
import { iconActionTrash } from "../../../components/icons/action/trash";
import { iconArrowUpRight } from "../../../components/icons/arrow/upRight";
import { iconArrowDownRight } from "../../../components/icons/arrow/downRight";
import { iconArrowUpLeft } from "../../../components/icons/arrow/upLeft";
import { iconArrowDownLeft } from "../../../components/icons/arrow/downLeft";
import { iconArrowDexter } from "../../../components/icons/arrow/dexter";
import { iconArrowSinister } from "../../../components/icons/arrow/sinister";
import { iconArrowCardinal } from "../../../components/icons/arrow/cardinal";
import { iconArrowOrdinal } from "../../../components/icons/arrow/ordinal";
import { iconArrowOrdinalIn } from "../../../components/icons/arrow/ordinalIn";
import { iconArrowSinisterIn } from "../../../components/icons/arrow/sinisterIn";
import { iconArrowSinisterOut } from "../../../components/icons/arrow/sinisterOut";
import { iconArrowDexterIn } from "../../../components/icons/arrow/dexterIn";
import { iconArrowDexterOut } from "../../../components/icons/arrow/dexterOut";
import { iconActionToCloud } from "../../../components/icons/action/toCloud";
import { iconActionFromCloud } from "../../../components/icons/action/fromCloud";
import { iconCaretHorizontal } from "../../../components/icons/caret/horizontal";
import { iconCaretVertical } from "../../../components/icons/caret/vertical";
import { iconCaretNorth } from "../../../components/icons/caret/north";
import { iconCaretWest } from "../../../components/icons/caret/west";
import { iconCaretSouth } from "../../../components/icons/caret/south";
import { iconCaretEast } from "../../../components/icons/caret/east";
import { iconChevronVertical } from "../../../components/icons/chevron/vertical";
import { iconChevronHorizontal } from "../../../components/icons/chevron/horizontal";
import { iconFSFile } from "../../../components/icons/fs/file";
import { iconFSFolder } from "../../../components/icons/fs/folder";
import { iconFSFolderOpen } from "../../../components/icons/fs/folderOpen";
import { iconFSPath } from "../../../components/icons/fs/path";
import { iconNoticeConfirm } from "../../../components/icons/notice/confirm";
import { iconNoticeInfo } from "../../../components/icons/notice/info";
import { iconNoticeQuery } from "../../../components/icons/notice/query";
import { iconNoticeWarning } from "../../../components/icons/notice/warning";
import { iconNoticeError } from "../../../components/icons/notice/error";
import { iconNoticeFatal } from "../../../components/icons/notice/fatal";

export const IconsDemo = styled(({ className }: { className?: string }) => {
    return (
        <div className={className}>
            <h2>Actions</h2>
            <Group>
                <Icon value={iconActionAdd} />
                <Icon value={iconActionClose} />
                <Icon value={iconActionCopy} />
                <Icon value={iconActionCut} />
                <Icon value={iconActionToDrive} />
                <Icon value={iconActionFromDrive} />
                <Icon value={iconActionToCloud} />
                <Icon value={iconActionFromCloud} />
                <Icon value={iconActionEdit} />
                <Icon value={iconActionMore} />
                <Icon value={iconActionPaste} />
                <Icon value={iconActionPick} />
                <Icon value={iconActionPower} />
                <Icon value={iconActionRefresh} />
                <Icon value={iconActionSave} />
                <Icon value={iconActionSearch} />
                <Icon value={iconActionSettings} />
                <Icon value={iconActionSubtract} />
                <Icon value={iconActionTrash} />
            </Group>
            <h2>Arrows</h2>
            <Group>
                <Icon value={iconArrowUp} />
                <Icon value={iconArrowRight} />
                <Icon value={iconArrowDown} />
                <Icon value={iconArrowLeft} />

                <Icon value={iconArrowUpRight} />
                <Icon value={iconArrowDownRight} />
                <Icon value={iconArrowDownLeft} />
                <Icon value={iconArrowUpLeft} />

                <Icon value={iconArrowHorizontal} />
                <Icon value={iconArrowVertical} />

                <Icon value={iconArrowDexter} />
                <Icon value={iconArrowDexterIn} />
                <Icon value={iconArrowDexterOut} />
                <Icon value={iconArrowSinister} />
                <Icon value={iconArrowSinisterIn} />
                <Icon value={iconArrowSinisterOut} />
                <Icon value={iconArrowCardinal} />
                <Icon value={iconArrowOrdinal} />
                <Icon value={iconArrowOrdinalIn} />
            </Group>
            <h2>Carets</h2>
            <Group>
                <Icon value={iconCaretDown} />
                <Icon value={iconCaretLeft} />
                <Icon value={iconCaretRight} />
                <Icon value={iconCaretUp} />
                <Icon value={iconCaretHorizontal} />
                <Icon value={iconCaretVertical} />
                <Icon value={iconCaretNorth} />
                <Icon value={iconCaretWest} />
                <Icon value={iconCaretSouth} />
                <Icon value={iconCaretEast} />
            </Group>
            <h2>Chevrons</h2>
            <Group>
                <Icon value={iconChevronDown} />
                <Icon value={iconChevronLeft} />
                <Icon value={iconChevronRight} />
                <Icon value={iconChevronUp} />
                <Icon value={iconChevronHorizontal} />
                <Icon value={iconChevronVertical} />
            </Group>
            <h2>FileSystem</h2>
            <Group>
                <Icon value={iconFSFile} />
                <Icon value={iconFSFolder} />
                <Icon value={iconFSFolderOpen} />
                <Icon value={iconFSPath} />
            </Group>
            <h2>Notice</h2>
            <Group>
                <Icon value={iconNoticeConfirm} />
                <Icon value={iconNoticeInfo} />
                <Icon value={iconNoticeQuery} />
                <Icon value={iconNoticeWarning} />
                <Icon value={iconNoticeError} />
                <Icon value={iconNoticeFatal} />
            </Group>
        </div>
    );
})``;

const Group = styled.div`
    display: grid;
    grid-template-columns: auto-fit(auto);
    grid-auto-flow: column;
    place-content: start;
    gap: 4px;
`;
