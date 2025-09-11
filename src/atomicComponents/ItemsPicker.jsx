import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  Button,
} from "reactstrap";

export const ItemsPicker = ({
  items,
  selectedItemName,
  setItem,
  emptyMessage,
  withCancel = true,
  toggleClass = "branch-picker-dropdown-toggle",
  setFirstDefault = true,
}) => {
  const [t] = useTranslation("common");

  const [opened, setOpened] = React.useState(false);
  const [firstMount, setFirstMount] = React.useState(true);

  const toggleDropdown = () => {
    setOpened((previousState) => !previousState);
  };

  const handleItemClick = (item) => {
    setItem(item);
  };

  useEffect(() => {
    if (firstMount && setFirstDefault && Object.keys(items).length > 0) {
      const [itemKey] = Object.entries(items).sort(
        (a, b) => a[1].listPriority - b[1].listPriority
      )[0];
      setItem(itemKey);
      setFirstMount(false);
    }
  }, [firstMount, items, setFirstDefault, setItem]);

  return (
    <Dropdown isOpen={opened} toggle={toggleDropdown}>
      <DropdownToggle caret className={`${toggleClass} mb-0`}>
        <>
          {selectedItemName?.name ??
            emptyMessage ??
            t("meta.organisation.none")}
          {withCancel && (
            <Button
              close
              color="secondary"
              tag="div"
              onClick={() => {
                if (!opened) {
                  toggleDropdown();
                }
                setItem(undefined);
              }}
            >
              ˣ
            </Button>
          )}
        </>
      </DropdownToggle>
      <DropdownMenu className={`${toggleClass} mb-0`}>
        {items && Object.keys(items).length !== 0 ? (
          Object.entries(items)
            .sort((a, b) => a[1].listPriority - b[1].listPriority)
            .map(([key, value]) => (
              <DropdownItem
                key={key}
                role="button"
                tabIndex={0}
                onClick={() => handleItemClick(key)}
              >
                {value.name}
              </DropdownItem>
            ))
        ) : (
          <span style={{ fontSize: 12 }}>{emptyMessage}</span>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};
