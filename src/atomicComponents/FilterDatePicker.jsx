import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
} from 'reactstrap';
import PropTypes from 'prop-types';

const Wrapper = styled.div`
  .filter-dropdown-toggle {
    background-color: #70bbfd;
    height: initial;
    padding: 0.5rem 1rem;
    color: white;

    &:hover {
      color: #646777;
    }
  }
`

export const AVAILABLE_FILTER_TYPES_TENANT = {
  week: {
    id: 1,
    label: 'global.Week',
    logType: 'week'
  },
  month: {
    id: 2,
    label: 'global.Month',
    logType: 'month'
  },
  year: {
    id: 3,
    label: 'global.Year',
    logType: 'year'
  }
};

export const AVAILABLE_FILTER_TYPES = {
  week: {
    id: 1,
    label: 'global.Week',
    logType: 'week'
  },
  month: {
    id: 2,
    label: 'global.Month',
    logType: 'month'
  },
  year: {
    id: 3,
    label: 'global.Year',
    logType: 'year'
  },
  challenges: {
    id: 4,
    label: 'global.challenges',
    logType: 'challenges'
  }
};


export const DASHBOARD_AVAILABLE_FILTER_TYPES = {
  ...AVAILABLE_FILTER_TYPES,
  range: {
    id: 5,
    label: 'global.range',
    logType: 'range'
  },
};

export const AVAILABLE_FILTER_TYPES_PRODUCTS = {
  week: {
    id: 1,
    label: 'global.Week',
    logType: 'week'
  },
  month: {
    id: 2,
    label: 'global.Month',
    logType: 'month'
  },
  year: {
    id: 3,
    label: 'global.Year',
    logType: 'year'
  },
};

const FilterDatePicker = ({ filterBy, setFilterBy, filterTypes = AVAILABLE_FILTER_TYPES }) => {
  const [opened, setOpened] = React.useState(false);
  const [t] = useTranslation('common');

  const toggleDropdown = () => {
    setOpened((previousState) => !previousState);
  };

  return (
    <Wrapper>
      <Dropdown isOpen={opened} toggle={toggleDropdown}>
        <DropdownToggle
          caret
          className="filter-dropdown-toggle ml-2 mb-0"
        >
          {t('global.filterBy')}: {t(filterBy?.label)}
        </DropdownToggle>
        <DropdownMenu >
          {Object.entries(filterTypes).map(([key, value]) => (
            <DropdownItem
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => setFilterBy(value)}
            >
              {t(value.label)}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </Wrapper>
  );
}

FilterDatePicker.defaultProps = {
  filterBy: AVAILABLE_FILTER_TYPES.week,
  setFilterBy: () => null,
};
FilterDatePicker.propTypes = {
  filterBy: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
  }),
  setFilterBy: PropTypes.func,
};

export default FilterDatePicker;
