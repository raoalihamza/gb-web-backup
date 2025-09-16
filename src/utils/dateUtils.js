import firebase from "firebase/compat/app";
import moment from 'moment';

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const DATE_FORMATS = {
  DAY_MM_DD: 'YYYY-MM-DD',
  DAY_MM_DD_HH_MM: 'YYYY-MM-DD H:mm',
};

export const formatDate = (date, format = 'YYYY-MM-DD H:mm:ss') => moment(date).format(format);

export function getDaysInRange(startDate, endDate) {
  const result = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  // Normalise à minuit
  current.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    // Format YYYY-MM-DD
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    result.push(`${year}-${month}-${day}`);

    // Passe au jour suivant
    current.setDate(current.getDate() + 1);
  }
  return result;
}

export function getWeeksInRange(startDate, endDate) {
  const result = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  // Aller au lundi de la semaine de départ
  current.setHours(0, 0, 0, 0);
  current.setDate(current.getDate() - ((current.getDay() + 6) % 7)); // Lundi

  while (current <= end) {
    const weekStart = new Date(current);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Clamp la fin de semaine à la date de fin
    if (weekEnd > end) weekEnd.setTime(end.getTime());

    // Numéro de semaine ISO
    const year = weekStart.getFullYear();
    const week = getISOWeekNumber(weekStart);
    const label = `${year}-W${String(week).padStart(2, "0")}`;

    result.push({ start: new Date(weekStart), end: new Date(weekEnd), label });

    // Passe à la semaine suivante
    current.setDate(current.getDate() + 7);
  }
  return result;
}

export function getMonthsInRange(startDate, endDate) {
  const result = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  current.setDate(1);
  current.setHours(0, 0, 0, 0);

  while (current <= end) {
    const monthStart = new Date(current);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);

    // Clamp la fin de mois à la date de fin
    if (monthEnd > end) monthEnd.setTime(end.getTime());

    const year = monthStart.getFullYear();
    const month = String(monthStart.getMonth() + 1).padStart(2, "0");
    const label = `${year}-${month}-1`;

    result.push({ start: new Date(monthStart), end: new Date(monthEnd), label });

    // Passe au mois suivant
    current.setMonth(current.getMonth() + 1);
  }
  return result;
}

export function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export const formatDateTimePicker = (date) => moment(date).format().split('+')[0];

const getNearestSunday = (date) => {
  if (!moment(date).isValid()) {
    throw new Error("Invalid Date");
  }

  const newDate = new Date(date);

  return new Date(newDate.setDate(newDate.getDate() - newDate.getDay()));
};

const getNearestMonday = (date) => {
  if (!moment(date).isValid()) {
    throw new Error("Invalid Date");
  }
  const newDate = new Date(date);

  return new Date(newDate.setDate(newDate.getDate() - newDate.getDay() + 1));
};

const getYearMonthDay = (date) => {
  if (!moment(date).isValid()) {
    throw new Error("Invalid Date");
  }
  const actualDay = date.getDate();
  const actualMonth = +date.getMonth() + 1;

  const year = date.getFullYear();
  const month = actualMonth < 10 ? `0${actualMonth}` : `${actualMonth}`;
  const day = actualDay < 10 ? `0${actualDay}` : `${actualDay}`;

  return { year, month, day };
};

const getFormattedStringWeekDayDate = (date) => {
  if (!date) return 'undefined';

  const {
    year: yearForWeek,
    month: monthForWeek,
    day: dayForWeek,
  } = getYearMonthDay(date);
  return `${yearForWeek}-${monthForWeek}-${dayForWeek}`;
}

const getDateByLogtype = (date, filterBy) => {
  if (filterBy === 'week') {
    const {
      year: yearForWeek,
      month: monthForWeek,
      day: dayForWeek,
    } = getYearMonthDay(projectId === "defisansautosolo-17ee7" ? getNearestMonday(date) : getNearestSunday(date));
    return `${yearForWeek}-${monthForWeek}-${dayForWeek}`;
  } else {
    const { year, month } = getYearMonthDay(date);
    return filterBy === 'month' ? `${year}-${month}` : year.toString();
  }
}

const getDaysInMonth = () => moment().daysInMonth();
const getMonthName = (date) => moment(date).format('MMMM');

const getWeekdays = () => moment.weekdaysShort();
const getWeekday = (date) => moment(date).weekday();

const getWeekdayString = (date) => {
  var dated = moment();
  let day = moment(date).weekday();
  return dated.day(day).format("dddd");
}

const getMonthsShort = () => moment.monthsShort();

const getDateFromFirebaseTimeFormat = (time) => {
  return new firebase.firestore.Timestamp(time.seconds || 0, time.nanoseconds || 0).toDate()
}

const getDateYearAgo = () => new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate())
const getDateMonthAgo = () => new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate())
const getDateWeekAgo = () => new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7)

const getDateYearForward = (startDate) => new Date(new Date(startDate).getFullYear() + 1, new Date(startDate).getMonth(), new Date(startDate).getDate())
const getDateMonthForward = (startDate) => new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, new Date(startDate).getDate())
const getDateWeekForward = (startDate) => new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth(), new Date(startDate).getDate() + 7)

const getNearestStartDateByFilter = (logType, date) => {

  const month = new Date(moment(date).startOf('month').format('YYYY-MM-DD'));
  const year = new Date(moment(date).startOf('year').add(10, 'hours'));

  if (logType === 'week') return projectId === "defisansautosolo-17ee7" ? getNearestMonday(new Date(date)) : getNearestSunday(new Date(date));
  if (logType === 'month') return month;
  if (logType === 'year') return year;
  return projectId === "defisansautosolo-17ee7" ? getNearestMonday(new Date(date)) : getNearestSunday(new Date(date));
}

const getShortWeekDayNameByDate = (date) => {
  return moment(date, "YYYY-MM-DD HH:mm:ss").format('ddd');
}

const getShortMonthNameByDate = (date) => {
  return moment(date, "YYYY-MM-DD HH:mm:ss").format('MMM');
}

const getDayInMonthNameByDate = (date) => {
  return moment(date, "YYYY-MM-DD HH:mm:ss").date();
}

const convertDateToFirestoreTimestamp = (date) => firebase.firestore.Timestamp.fromDate(date);

const getEndDateByLogTypeAndStartDate = (logType, startDate) => {
  if (logType === 'week') return getDateWeekForward(startDate);
  if (logType === 'month') return getDateMonthForward(startDate);
  if (logType === 'year') return getDateYearForward(startDate);
  return startDate
}

const getSecondsToPlanedDate = (planned) => (planned - new Date()) / 1000;


const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayNameMapping = {
  "Sun": "Sunday",
  "Mon": "Monday",
  "Tue": "Tuesday",
  "Wed": "Wednesday",
  "Thu": "Thursday",
  "Fri": "Friday",
  "Sat": "Saturday"
};

function getStringEnumeratedDays(matchOrRequest, translation = () => null) {
  let dayString = "";
  let timeString = "";

  if (matchOrRequest.frequency !== "once" && matchOrRequest.frequency !== "CPFrequency.once") {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const presentDays = [];

    for (const day of days) {
      if (matchOrRequest.meetingTime?.hasOwnProperty(day) || matchOrRequest.days?.includes(day)) {
        presentDays.push(day);
      }
    }

    function getLocalizedDayKey(day) {
      const dayMap = {
        mon: translation(`weekDays.Monday`),
        tue: translation(`weekDays.Tuesday`),
        wed: translation(`weekDays.Wednesday`),
        thu: translation(`weekDays.Thursday`),
        fri: translation(`weekDays.Friday`),
        sat: translation(`weekDays.Saturday`),
        sun: translation(`weekDays.Sunday`),
      };
      return dayMap[day.toLowerCase()] || day;
    }

    const dayRangesInit = {
      MonTueWed: "Lundi au mercredi",
      MonTueWedThu: "Lundi au jeudi",
      MonTueWedThuFri: "Lundi au vendredi",
      MonTueWedThuFriSat: "Lundi au samedi",
      MonTueWedThuFriSatSun: "Tous les jours",
      TueWedThuFriSatSun: "Mardi au dimanche",
      WedThuFriSatSun: "Mercredi au dimanche",
      ThuFriSatSun: "Jeudi au dimanche",
      FriSatSun: "Vendredi au dimanche"
    };

    if (presentDays.length === 1) {
      dayString = `${dayRangesInit.MonTueWedThuFriSatSun} ${getLocalizedDayKey(presentDays[0])}${"fr".toLowerCase() !== "en" ? "s" : ""}`;
    } else if (presentDays.length === 2) {
      dayString = `${getLocalizedDayKey(presentDays[0])} ${translation(`global.and`)} ${getLocalizedDayKey(presentDays[1])}`;
    } else {
      const dayRanges = {
        MonTueWed: "Lundi au mercredi",
        MonTueWedThu: "Lundi au jeudi",
        MonTueWedThuFri: "Lundi au vendredi",
        MonTueWedThuFriSat: "Lundi au samedi",
        MonTueWedThuFriSatSun: "Tous les jours",
        TueWedThuFriSatSun: "Mardi au dimanche",
        WedThuFriSatSun: "Mercredi au dimanche",
        ThuFriSatSun: "Jeudi au dimanche",
        FriSatSun: "Vendredi au dimanche"
      };

      const daysKey = presentDays.join('');
      dayString = dayRanges[daysKey] || presentDays.map(getLocalizedDayKey).join(", ");
    }

    if (matchOrRequest.meetingTime.length > 0) {
      const meetingTime = Object.values(matchOrRequest.meetingTime)[0];
      timeString = ` à ${meetingTime.startsWith('0') ? meetingTime.substring(1, 2) : meetingTime.substring(0, 2)}h${meetingTime.substring(3, 5)}`;
    }
  } else {
    const date = new Date(matchOrRequest.date) || new Date();

    dayString = `${new Intl.DateTimeFormat("fr", { weekday: 'long' }).format(date)} à ${new Intl.DateTimeFormat("fr", { day: 'numeric' }).format(date)} ${new Intl.DateTimeFormat("fr", { month: 'long' }).format(date)}`;

    if (matchOrRequest.meetingTime) {
      const meetingTime = Object.values(matchOrRequest.meetingTime)[0];
      timeString = ` à ${meetingTime.startsWith('0') ? meetingTime.substring(1, 2) : meetingTime.substring(0, 2)}h${meetingTime.substring(3, 5)}`;
    }
  }

  return [dayString, timeString];
}

const formatDateFrCAConnected = (date) => {
  return date.toLocaleString("fr-CA", {
    hour: "numeric", // Heure
    minute: "numeric", // Minute
  });
};

const getCloserScheduleDateString = (inputObject = {}, translation = () => null) => {
  const currentDayAbbreviated = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  let closestDayAbbreviated = currentDayAbbreviated;
  let closestTime = inputObject[currentDayAbbreviated];

  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (daysOfWeek.indexOf(currentDayAbbreviated) + i) % 7;
    const nextDayAbbreviated = daysOfWeek[nextDayIndex];
    const nextTime = inputObject[nextDayAbbreviated];

    if (nextTime !== undefined) {
      closestDayAbbreviated = nextDayAbbreviated;
      closestTime = nextTime;
      break;
    }
  }

  if (closestTime !== undefined) {
    const closestDayFull = dayNameMapping[closestDayAbbreviated];

    const dayTranslated = translation(`weekDays.${closestDayFull}`)
    const at = translation(`meta.at`)
    const resultString = `${dayTranslated} ${at} ${closestTime}`;
    return resultString;
  } else {
    return;
  }
}
const getAllScheduleDatesArray = (inputObject = {}, translation = () => null) => {
  const schedules = [];

  for (const dayAbbreviated in inputObject) {
    const time = inputObject[dayAbbreviated];

    let closestDayAbbreviated = dayAbbreviated;
    let closestTime = time;

    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (daysOfWeek.indexOf(dayAbbreviated) + i) % 7;
      const nextDayAbbreviated = daysOfWeek[nextDayIndex];
      const nextTime = inputObject[nextDayAbbreviated];

      if (nextTime !== undefined) {
        closestDayAbbreviated = nextDayAbbreviated;
        closestTime = nextTime;
        break;
      }
    }

    if (closestTime !== undefined) {
      // Get the next scheduled day date
      const today = new Date();
      const todayIndex = today.getDay(); // 0 = Sunday
      const targetIndex = daysOfWeek.indexOf(closestDayAbbreviated);
      const daysUntil = (targetIndex - todayIndex + 7) % 7;
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + daysUntil);

      // Inject the scheduled time (hours & minutes)
      const [hour, minute] = closestTime.split(':').map(Number);
      scheduledDate.setHours(hour, minute, 0, 0);

      // Convert to America/New_York timezone to detect EST/EDT
      const dateInEastern = new Date(scheduledDate.toLocaleString("en-US", { timeZone: "America/New_York" }));

      const isEST = Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        timeZoneName: 'short',
      }).formatToParts(dateInEastern).some(part => part.type === 'timeZoneName' && part.value === 'EDT');

      // Si on est en EST (hiver), on ajoute 1h
      if (isEST) {
        dateInEastern.setHours(dateInEastern.getHours() + 1);
      }

      const dayTranslated = translation(`weekDays.${dayNameMapping[closestDayAbbreviated]}`);
      const at = translation(`meta.at`);

      const formattedTime = `${dateInEastern.getHours().toString().padStart(2, '0')}:${dateInEastern.getMinutes().toString().padStart(2, '0')}`;
      const resultString = `${dayTranslated} ${at} ${formattedTime}`;
      schedules.push(resultString);
    } else {
      schedules.push(`No valid schedule found for ${dayAbbreviated}.`);
    }
  }

  return schedules;
};


const getScheduleStringByDate = (date, translation = () => null) => {
  const currentDate = date ?? new Date();

  // On clone la date pour ne pas modifier l'originale
  const dateInEastern = new Date(currentDate.toLocaleString("en-US", { timeZone: "America/New_York" }));

  // Vérifie si on est en EDT
  const isEST = Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  }).formatToParts(dateInEastern).some(part => part.type === 'timeZoneName' && part.value === 'EST');

  // Si on est en EST (hiver), on ajoute 1h
  if (isEST) {
    dateInEastern.setHours(dateInEastern.getHours() + 1);
  }

  const options = { weekday: 'long' };
  const weekday = dateInEastern.toLocaleDateString('en-US', options);

  const hours = dateInEastern.getHours();
  const minutes = dateInEastern.getMinutes();

  const dayTranslated = translation(`weekDays.${weekday}`);
  const at = translation(`meta.at`);

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return `${dayTranslated} ${at} ${formattedTime}`;
};


const convertFirestoreTimestamp = (timestamp) => {
  const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
  return new Date(milliseconds);
};

const getFullYear = () => new Date().getFullYear();

const getNumberDayOfWeek = (date) => {
  const theDate = moment(date); // Example theDate
  let dayOfWeek = theDate.day(); // Get day of the week (0 for Sunday, 6 for Saturday)

  dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // If Sunday (0), set to 7
  if (projectId !== "defisansautosolo-17ee7") {
    dayOfWeek = dayOfWeek === 7 ? 1 : dayOfWeek + 1;
  }
  return dayOfWeek;
};
const hasPassed = ({ fromDate, differenceValue = 12, differenceUnit = 'hours' }) => {
  const timeAgo = moment().subtract(differenceValue, differenceUnit);
  return moment(fromDate).isBefore(timeAgo);
}

const getDifferenceBetweenDates = ({ fromDate, toDate, differenceUnit = 'days' }) => {
  const timeFrom = moment(fromDate);
  const timeTo = moment(toDate);
  return Math.abs(timeFrom.diff(timeTo, differenceUnit));
}

const dateUtils = {
  formatDateFrCAConnected,
  formatDate,
  convertFirestoreTimestamp,
  getStringEnumeratedDays,
  getDateByLogtype,
  getNearestSunday,
  getNearestMonday,
  getDaysInMonth,
  getMonthName,
  getWeekdays,
  getWeekday,
  getMonthsShort,
  getDateYearAgo,
  getDateMonthAgo,
  getDateWeekAgo,
  getDateFromFirebaseTimeFormat,
  getDateYearForward,
  getDateMonthForward,
  getDateWeekForward,
  getNearestStartDateByFilter,
  getShortWeekDayNameByDate,
  getShortMonthNameByDate,
  getDayInMonthNameByDate,
  convertDateToFirestoreTimestamp,
  getEndDateByLogTypeAndStartDate,
  getSecondsToPlanedDate,
  getCloserScheduleDateString,
  getAllScheduleDatesArray,
  getScheduleStringByDate,
  getWeekdayString,
  dayNameMapping,
  getFormattedStringWeekDayDate,
  getFullYear,
  getNumberDayOfWeek,
  hasPassed,
  getDifferenceBetweenDates,
  getISOWeekNumber,
  getMonthsInRange,
  getWeeksInRange,
  getDaysInRange
}

export default dateUtils;