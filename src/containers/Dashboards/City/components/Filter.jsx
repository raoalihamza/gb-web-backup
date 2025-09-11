import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
} from "reactstrap";
import PropTypes from "prop-types";

export const AVAILABLE_FILTER_TYPES = {
  week: {
    id: 1,
    label: "global.Week",
  },
  month: {
    id: 2,
    label: "global.Month",
  },
  year: {
    id: 3,
    label: "global.Year",
  },
};

export default function Filter({ filterBy, setFilterBy }) {
  const [opened, setOpened] = React.useState(false);

  const [t] = useTranslation("common");

  const toggleDropdown = () => {
    setOpened((previousState) => !previousState);
  };

  const handleItemClick = (item) => {
    setFilterBy(item);
  };
  return (
    <Dropdown isOpen={opened} toggle={toggleDropdown}>
      <DropdownToggle
        caret
        className="dashboard-filter-dropdown-toggle ml-2 mb-0"
      >
        {t("global.filterBy")}: {t(filterBy?.label)}
      </DropdownToggle>
      <DropdownMenu>
        {Object.entries(AVAILABLE_FILTER_TYPES).map(([key, value]) => (
          <DropdownItem
            key={key}
            role="button"
            tabIndex={0}
            onClick={() => handleItemClick(value)}
          >
            {t(value.label)}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

Filter.defaultProps = {
  filterBy: AVAILABLE_FILTER_TYPES.week,
  setFilterBy: () => null,
};
Filter.propTypes = {
  filterBy: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
  }),
  setFilterBy: PropTypes.func,
};
