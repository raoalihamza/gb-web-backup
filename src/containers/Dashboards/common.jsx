import { MAPPED_LOG_TYPE_TO_COLLECTION } from "shared/strings/firebase";
import dateUtils from "utils/dateUtils";

export const getEndDateForDashboard = ({ startDate, period, endDate }) => {
  if (period === MAPPED_LOG_TYPE_TO_COLLECTION.range) {
    if (!endDate) return endDate;
    return dateUtils.getFormattedStringWeekDayDate(endDate);
  }

  const endDateUpdated = dateUtils.getEndDateByLogTypeAndStartDate(period, startDate);
  endDateUpdated.setHours(endDateUpdated.getHours());

  return dateUtils.getFormattedStringWeekDayDate(endDateUpdated);
};
