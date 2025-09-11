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

import CategoryViewModel from "./CategoryViewModel";
import { useAuth } from "../../../shared/providers/AuthProvider";

export default function CategoryPicker({ category, setCategory }) {
  const [t] = useTranslation("common");
  const [userID] = useAuth();
  const categories = useSelector((state) => state.category.categories);

  const [opened, setOpened] = React.useState(false);

  const categoryViewModel = React.useMemo(() => new CategoryViewModel(userID), [
    userID,
  ]);

  React.useEffect(() => {
    let _isUnmounted = false;

    if (!_isUnmounted) {
      categoryViewModel.fetchCategories();
    }

    return () => {
      _isUnmounted = true;
    };
  }, [categoryViewModel]);

  const toggleDropdown = () => {
    setOpened((previousState) => !previousState);
  };

  const handleItemClick = (item) => {
    setCategory(item);
  };

  return (
    <Dropdown isOpen={opened} toggle={toggleDropdown}>
      <DropdownToggle
        caret
        className="category-picker-dropdown-toggle mb-0"
      >
        {t("meta.organisation.category")}:{" "}
        {categories?.[category] ?? t("meta.organisation.none")}
        <Button
          close
          color="secondary"
          tag="div"
          onClick={() => {
            if (!opened) {
              toggleDropdown();
            }
            setCategory(undefined);
          }}
        >
          ˣ
        </Button>
      </DropdownToggle>
      <DropdownMenu className="category-picker-dropdown-toggle mb-0">
        {categories && Object.keys(categories).length !== 0 ? (
          Object.entries(categories).map(([key, value]) => (
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
          <span style={{ fontSize: 12 }}>{t("category.no_category")}</span>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}

CategoryPicker.defaultProps = {
  category: undefined,
  setCategory: () => null,
};
CategoryPicker.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
  }),
  setCategory: PropTypes.func,
};
