import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  Button,
} from "reactstrap";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import BranchViewModel from "./BranchViewModel";
import { useAuth } from "../../../shared/providers/AuthProvider";

export default function BranchPicker({ branch, setBranch }) {
  const [t] = useTranslation("common");
  const [userID] = useAuth();
  const branches = useSelector((state) => state.branch.branches);

  const [opened, setOpened] = React.useState(false);

  const branchViewModel = React.useMemo(() => new BranchViewModel(userID), [
    userID,
  ]);

  React.useEffect(() => {
    let _isUnmounted = false;

    if (!_isUnmounted) {
      branchViewModel.fetchBranches();
    }

    return () => {
      _isUnmounted = true;
    };
  }, [branchViewModel]);

  const toggleDropdown = () => {
    setOpened((previousState) => !previousState);
  };

  const handleItemClick = (item) => {
    setBranch(item);
  };

  return (
    <Dropdown isOpen={opened} toggle={toggleDropdown}>
      <DropdownToggle
        caret
        className="branch-picker-dropdown-toggle mb-0"
      >
        {t("meta.organisation.branch")}:{" "}
        {branches?.[branch] ?? t("meta.organisation.none")}
        <Button
          close
          color="secondary"
          tag="div"
          onClick={() => {
            if (!opened) {
              toggleDropdown();
            }
            setBranch(undefined);
          }}
        >
          ˣ
        </Button>
      </DropdownToggle>
      <DropdownMenu className="branch-picker-dropdown-toggle mb-0">
        {branches && Object.keys(branches).length !== 0 ? (
          Object.entries(branches).map(([key, value]) => (
            <DropdownItem
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => handleItemClick(key)}
            >
              {value}
            </DropdownItem>
          ))
        ) : (
          <span style={{ fontSize: 12 }}>{t("branch.no_branch")}</span>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}

BranchPicker.defaultProps = {
  branch: undefined,
  setBranch: () => null,
};
BranchPicker.propTypes = {
  branch: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
  }),
  setBranch: PropTypes.func,
};
