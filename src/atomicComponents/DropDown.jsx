import React, { useState } from "react";
import { Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from "reactstrap";

const DropdownPicker = ({ items, value, onChange, style = {}, direction = 'down', disabled = false, disabledOptions = false }) => {
  const [opened, setOpened] = useState(false);
  const toggleDropdown = () => setOpened((previousState) => !previousState);

  return (
    <Dropdown isOpen={opened} toggle={toggleDropdown} direction={direction}>
      <DropdownToggle
        caret
        className="branch-picker-dropdown-toggle mb-0"
        style={style}
        disabled={disabled}
      >
        {value?.label}
      </DropdownToggle>
      <DropdownMenu className="branch-picker-dropdown-toggle mb-0" >
        {items.map((item) => <DropdownItem
          key={item.label}
          role="button"
          tabIndex={0}
          onClick={() => onChange(item)}
          disabled={disabledOptions}
        >
          {item.label}
        </DropdownItem>)}
      </DropdownMenu>
    </Dropdown>
  );
}

export default DropdownPicker;
