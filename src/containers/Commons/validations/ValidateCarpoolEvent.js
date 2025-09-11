export const validateCarpoolEvent = (values) => {
  const errors = {};

  if (!values.title) {
    errors.title = {
      fr: "Le titre est requis",
      en: "Title is required",
    };
  }

  if (!values.eventUrl) {
    errors.eventUrl = {
      fr: "L'URL de l'événement est requise",
      en: "Event URL is required",
    };
  }

  if (!values.eventDate) {
    errors.eventDate = {
      fr: "La date de l'événement est requise",
      en: "Event date is required",
    };
  }

  if (!values.startTime) {
    errors.startTime = {
      fr: "L'heure de début est requise",
      en: "Start time is required",
    };
  }

  if (!values.endTime) {
    errors.endTime = {
      fr: "L'heure de fin est requise",
      en: "End time is required",
    };
  }

  if (!values.destination?.name) {
    errors.destination = {
      fr: "La destination est requise",
      en: "Destination is required",
    };
  }

  if (!values.closingDate) {
    errors.closingDate = {
      fr: "La date de clôture est requise",
      en: "Closing date is required",
    };
  }

  if (!values.lastReminderDate) {
    errors.lastReminderDate = {
      fr: "La date du dernier rappel est requise",
      en: "Last reminder date is required",
    };
  }

  if (!values.maxMinutesDetourDriver) {
    errors.maxMinutesDetourDriver = {
      fr: "Le temps de détour maximum pour le conducteur est requis",
      en: "Maximum driver detour time is required",
    };
  } else if (typeof values.maxMinutesDetourDriver !== 'number' || Number(values.maxMinutesDetourDriver) <= 0) {
    errors.maxMinutesDetourDriver = {
      fr: "Le temps de détour maximum pour le conducteur doit être un nombre positif",
      en: "Maximum driver detour time must be a positive number",
    };
  }

  if (!values.maxMinutesDetourRider) {
    errors.maxMinutesDetourRider = {
      fr: "Le temps de détour maximum pour le passager est requis",
      en: "Maximum rider detour time is required",
    };
  } else if (typeof values.maxMinutesDetourRider !== 'number' || Number(values.maxMinutesDetourRider) <= 0) {
    errors.maxMinutesDetourRider = {
      fr: "Le temps de détour maximum pour le passager doit être un nombre positif",
      en: "Maximum rider detour time must be a positive number",
    };
  }

  if (!values.maxMatchPerUser) {
    errors.maxMatchPerUser = {
      fr: "Le nombre maximum de correspondances par utilisateur est requis",
      en: "Maximum matches per user is required",
    };
  } else if (typeof values.maxMatchPerUser !== 'number' || Number(values.maxMatchPerUser) <= 0) {
    errors.maxMatchPerUser = {
      fr: "Le nombre maximum de correspondances par utilisateur doit être un nombre positif",
      en: "Maximum matches per user must be a positive number",
    };
  }

  

  // Validate time ranges
  if (values.startTime && values.endTime) {
    const start = new Date(`1970-01-01T${values.startTime}`);
    const end = new Date(`1970-01-01T${values.endTime}`);
    if (end <= start) {
      errors.endTime = {
        fr: "L'heure de fin doit être postérieure à l'heure de début",
        en: "End time must be after start time",
      };
    }
  }

  if (values.eventDate && values.closingDate) {
    const eventDate = new Date(values.eventDate);
    const closingDate = new Date(values.closingDate);
    // Set both dates to midnight for date-only comparison
    eventDate.setHours(0, 0, 0, 0);
    closingDate.setHours(0, 0, 0, 0);
    if (closingDate < eventDate) {
      errors.closingDate = {
        fr: "La date de clôture doit être la même ou postérieure à la date de l'événement",
        en: "Closing date must be the same as or after event date",
      };
    }
  }

  if (values.closingDate && values.lastReminderDate) {
    const closingDate = new Date(values.closingDate);
    const lastReminderDate = new Date(values.lastReminderDate);
    if (lastReminderDate >= closingDate) {
      errors.lastReminderDate = {
        fr: "La date du dernier rappel doit être antérieure à la date de clôture",
        en: "Last reminder date must be before closing date",
      };
    }
  }

  return errors;
};
