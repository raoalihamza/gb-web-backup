import React, { useCallback, useMemo } from "react";
import CalendarIcon from "mdi-react/CalendarIcon";
import DatePicker, { registerLocale } from "react-datepicker";
import { useSelector } from "react-redux";
import fr from "date-fns/locale/fr-CA"; // the locale you want

import "react-datepicker/dist/react-datepicker.css";
import {
  formatDate,
  formatDatePickerTranslated,
  addDaysToDate,
} from "../utils";
import { useTranslation } from "react-i18next";
import dateUtils from "utils/dateUtils";

const LOG_TYPE = {
  week: "week",
  month: "month",
  year: "year",
  range: "range",
};
registerLocale("fr", fr);

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

const StatsDatePicker = ({ startDate, setStartDate, logType, setEndDate, endDate, maxDaysRange }) => {
  const [isCalenderOpened, setIsCalenderOpened] = React.useState(false);
  const [t] = useTranslation("common");
  const locale = useSelector((state) => state.translation.language);
  const isRange = useMemo(() => logType === LOG_TYPE.range, [logType])

  const handleCalenderOpen = (evt) => {
    evt?.stopPropagation();
    setIsCalenderOpened((preState) => !preState);
  };

  const handleDateSelected = useCallback(
    (dates) => {
      if (isRange && Array.isArray(dates)) {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        if (start && end) {
          setIsCalenderOpened(false);
          if (maxDaysRange) {
            const differenceBetweenDates = dateUtils.getDifferenceBetweenDates({
              fromDate: start,
              toDate: end,
              differenceUnit: 'days',
            });
            if (differenceBetweenDates > maxDaysRange) {
              window.alert(`La plage maximum est de ${maxDaysRange} jours.`)
              setStartDate(null);
              setEndDate(null);
            }
          }
        }
      } else {
        setStartDate(dates);
        setIsCalenderOpened(false);
      }
    },
    [isRange, maxDaysRange, setEndDate, setStartDate]
  );

  const getHightLightDates = React.useMemo(
    () =>
      logType === "week"
        ? new Array(7).fill().map((_, i) => {
          const d = projectId === "defisansautosolo-17ee7" ? dateUtils.getNearestMonday(startDate) : dateUtils.getNearestSunday(startDate);
          d.setDate(d.getDate() + i);
          return d;
        })
        : [],
    [startDate, logType]
  );

  const renderDateString = React.useMemo(() => {
    if (logType === LOG_TYPE.week) {
      return `${formatDatePickerTranslated(
        formatDate(projectId === "defisansautosolo-17ee7" ? dateUtils.getNearestMonday(startDate) : dateUtils.getNearestSunday(startDate)),
        t
      )} - ${formatDatePickerTranslated(
        formatDate(addDaysToDate(projectId === "defisansautosolo-17ee7" ? dateUtils.getNearestMonday(startDate) : dateUtils.getNearestSunday(startDate), 6)),
        t
      )}`;
    }
    if (isRange) {
      return `${startDate ? formatDatePickerTranslated(
        formatDate(startDate),
        t
      ) : "Sélectionner date de début"} - ${endDate ? formatDatePickerTranslated(formatDate(endDate), t) : "et date de fin"
        }`;
    }
    const options = { month: "long" };
    const month = new Intl.DateTimeFormat("fr-CA", options).format(startDate);
    const formatMonth = month.charAt(0).toUpperCase() + month.slice(1);

    if (logType === LOG_TYPE.month) {
      return formatMonth;

    }
    return startDate?.getFullYear();
  }, [logType, isRange, startDate, t, endDate]);


  return (
    <div className="d-flex align-items-center">
      <span className="date-display-text text-muted d-block mr-1">
        {renderDateString}
      </span>
      <div className="position-relative">
        <div
          className="date-picker-icon"
          onClick={handleCalenderOpen}
          role="button"
          onKeyDown={(evt) =>
            evt.key === "Enter" ? handleCalenderOpen(evt) : null
          }
          tabIndex={0}
        >
          <CalendarIcon color="#70bbfd" />
        </div>
        {isCalenderOpened ? (
          <DatePicker
            selected={startDate}
            onChange={handleDateSelected}
            highlightDates={getHightLightDates}
            withPortal
            inline
            locale={locale === "fr" ? "fr" : ""}
            onClickOutside={() => setIsCalenderOpened(false)}
            showYearPicker={logType === LOG_TYPE.year}
            showMonthYearPicker={logType === LOG_TYPE.month}
            startDate={isRange ? startDate : undefined}
            endDate={isRange ? endDate : undefined}
            selectsRange={isRange}
          // selectsDisabledDaysInRange={isRange}
          />
        ) : null}
      </div>
    </div>
  );
};

export default StatsDatePicker;
