import moment from 'moment';
// Validate email format
// @param email:String  = email address to validate
export const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const reStartAndEnd = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}/g;

  if (re.test(email) && reStartAndEnd.test(email)) {
    return true;
  }
  return false;
};

// Scroll viewport to certain position
// @param targetRef:{current:object} = target ref to grab its bounding position in DOM
// @param parentRef:{current:object}  = parent ref where the scroll will take place
export const scrollWindowToPosition = (
  targetRef = { current: undefined },
  parentRef = { current: undefined }
) => {
  // For supported browsers
  if (targetRef.current?.getBoundingClientRect) {
    const findPositionY = targetRef.current?.getBoundingClientRect()?.top;
    parentRef.current?.scrollBy({
      top: findPositionY,
      left: 0,
      behavior: 'smooth',
    });
  }
};
// get last Monday from given date
// @param date: Target Date
export const getNearestSunday = (date, t) => {
  if (!moment(date).isValid()) {
    throw new Error('Invalid Date');
  }
  return new Date(date.setDate(date.getDate() - date.getDay()));
};

export const formatDate = (date, excludeYear = false, excludeDashes = false) => {
  if (!moment(date).isValid()) {
    throw new Error('Invalid Date');
  }
  return moment(date)
    .format('DD MMMM YYYY')
    .slice(0, excludeYear ? -5 : undefined)
    ?.replace('-', excludeDashes ? ' ' : '-');
};

export const formatDatePickerTranslated = (date, t) => {

  if (typeof date === 'string' && t && t('language') === 'fr') {
    const month = date.split(' ')[1];
    const translatedMonth = t('monthDays.' + month).toLowerCase();

    return `${date.split(' ')[0]} ${translatedMonth} ${date.split(' ')[2]}`;
  } else {

    return date;
  }
};

export const formatDateTranslated = (date, t) => {
  if (Object.prototype.toString.call(date) !== '[object Date]' || isNaN(date.getTime())) {
    throw new Error('Invalid Date');
  }
  //console.log("translate date", date);

  return date.toLocaleDateString(`${t('language')}-CA`, {
    month: 'long',
    day: 'numeric',
  });
};

export const globalObjectTranslated = (object, t) => {

  const globalObjectTranslated = t(`global.${object}`)

  return globalObjectTranslated
};

export const formatTime = (date) => {
  if (!moment(date).isValid()) {
    throw new Error('Invalid Date');
  }
  return moment(date).format('HH:mm');
};

export const formatListTranslated = (list, t) => {
  if (!Array.isArray(list) || list.length === 0) {
    return '';
  }

  const translatedList = list.map((item) => t(item));

  if (list.length > 1) {
    return [translatedList.slice(0, -1).join(', '), translatedList[translatedList.length - 1]].join(
      ` ${t('global.and')} `
    );
  } else {
    return translatedList[0];
  }
};

export const addDaysToDate = (date, days) => {
  if (!moment(date).isValid()) {
    throw new Error('Invalid Date');
  }
  return moment(date).add(days, 'days');
};

export const getDateDifference = ({ startDate = new Date(), endDate, differenceType = 'day' }) => {
  if (!moment(startDate).isValid() || !moment(endDate).isValid()) {
    throw new Error('Invalid Date');
  }
  return moment(endDate)
    .startOf(differenceType)
    .diff(moment(startDate).startOf(differenceType), differenceType);
};

export const clearUndefinedFromObject = (object) => {
  Object.keys(object).forEach((key) =>
    !object[key] && typeof object[key] !== 'boolean' && object[key] !== 0 ? delete object[key] : {}
  );
};

export const convertDistanceToKm = (distance) => (distance / 1000).toFixed(3);

export const convertActivitiesDistance = (activities) => {
  if (!activities) return {};

  return Object.keys(activities).reduce((acc, next) => {
    const activity = activities[next];

    return {
      ...acc,
      [next]: {
        ...activity,
        totalDistance: convertDistanceToKm(activity?.totalDistance || 0),
      },
    };
  }, {});
};

export const sumObjectKeys = (...objs) => {
  return objs.reduce((a, b) => {
    for (let k in b) {
      if (b.hasOwnProperty(k)) a[k] = (a[k] || 0) + b[k];
    }
    return a;
  }, {});
};

export const capitalizeFirstLetter = (string) => {
  return string && string[0].toUpperCase() + string.slice(1);
};

export const head = (arr) => arr ? arr[0] : arr;

export const generateRandomHexColor = () => `#${Math.floor(Math.random() * 0xffffff).toString(16)}`;

export const generateFullName = (firstName, lastName) => `${firstName ? capitalizeFirstLetter(firstName) : ''} ${lastName ? capitalizeFirstLetter(lastName) : ''}`;
export const getImageThumbnail = (image) => image.path ? `${image.path}_200x200` : image?.originUrl || '';

export const stringToColor = (inputString, opacity = 1) => {
  let hash = 0;
  // eslint-disable-next-line
  for (let i = 0; i < inputString.length; i++) {
    // eslint-disable-next-line
    hash = inputString.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate base colors with minimum brightness
  // eslint-disable-next-line
  let r = ((hash & 0xff0000) >> 16) % 128 + 128; // Red component (128-255)
  // eslint-disable-next-line
  let g = ((hash & 0x00ff00) >> 8) % 128 + 128; // Green component (128-255)
  // eslint-disable-next-line
  let b = (hash & 0x0000ff) % 128 + 128; // Blue component (128-255)

  // Ensure at least one color is very bright (close to 255)
  const maxComponent = Math.max(r, g, b);
  if (maxComponent < 200) {
    const components = [r, g, b];
    const brightestIndex = components.indexOf(maxComponent);
    components[brightestIndex] = 255;
    [r, g, b] = components;
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
