/* eslint-disable operator-linebreak */
const validate = (values) => {
  const errors = {};
  if (!values.Name || !values.NameFrench) {
    errors.NameFrench = {
      fr: "Le champ nom de défi ne doit pas être vide",
      en: "The challenge name field must not be empty",
    };
    errors.Name = {
      fr: "Le champ nom de défi ne doit pas être vide",
      en: "The challenge name field must not be empty",
    };
  }

  if (!values.startDate) {
    errors.startDate = {
      fr: "Le champ date de départ ne doit pas être vide",
      en: "The start date field must not be empty",
    };
  }
  if (!values.endDate) {
    errors.endDate = {
      fr: "Le champ date de fin ne doit pas être vide",
      en: "The end date field must not be empty",
    };
  } else if (values.startDate > values.endDate) {
    errors.startDate = {
      fr: "La date de départ doit être avant la date de fin",
      en: "The start date must be before the end date",
    };
  }
  if (
    values.ScheduleStart &&
    values.ScheduleEnd &&
    values.ScheduleStart >= values.ScheduleEnd
  ) {
    errors.ScheduleStart = {
      fr: "L'heure de départ doit être avant l'heure de fin",
      en: "The start time must be before the end time",
    };
  }

  if (!values.Description || !values.DescriptionFrench) {
    errors.Description = {
      fr: "Le champ de la description ne doit pas être vide",
      en: "The challenge description field must not be empty",
    };
    errors.DescriptionFrench = {
      fr: "Le champ de la description ne doit pas être vide",
      en: "The challenge description field must not be empty",
    };
  }
  if (!values.Exerpt || !values.ExerptFrench) {
    errors.Exerpt = {
      fr: "Le champ de la exerpt ne doit pas être vide",
      en: "The challenge exerpt field must not be empty",
    };
    errors.ExerptFrench = {
      fr: "Le champ de la exerpt ne doit pas être vide",
      en: "The challenge exerpt field must not be empty",
    };
  }

  if (!values.individualGoals?.length) {
    errors.individualGoals = {
      fr: "Le défi nécessite au moins 1 objectif individuel",
      en: "The challenge requires at least 1 individual goal",
    };
  } else if (
    values.individualGoals?.some((goal) => !goal.select.value || !goal.value)
  ) {
    errors.individualGoals = {
      fr: "Aucun objectifs ne peut avoir un type ou valeur d'objectif vide",
      en: "No goals can have an empty goal type or value",
    };
  }
  if (!values.activityType) {
    errors.activityType = {
      fr: "Au moins un type d'activité doit être sélectionné",
      en: "At least one activity type must be selected",
    };
  }

  return errors;
};

export default validate;
