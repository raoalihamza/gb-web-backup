/* eslint-disable operator-linebreak */
const validate = (values) => {
  const errors = {};
  if (!values.name && !values.nameFrench) {
    errors.nameFrench = {
      fr: "Le champ nom de défi ne doit pas être vide",
      en: "The challenge name field must not be empty",
    };
    errors.name = {
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
    values.scheduleStart &&
    values.scheduleEnd &&
    values.scheduleStart >= values.scheduleEnd
  ) {
    errors.scheduleStart = {
      fr: "L'heure de départ doit être avant l'heure de fin",
      en: "The start time must be before the end time",
    };
  }
  // if (!values.ScheduleStart) {
  //   errors.ScheduleStart = {
  //     fr: "Le champ heure de départ ne doit pas être vide",
  //     en: "The start time field must not be empty",
  //   };
  // }
  // if (!values.ScheduleEnd) {
  //   errors.ScheduleEnd = {
  //     fr: "Le champ heure de fin ne doit pas être vide",
  //     en: "The end time field must not be empty",
  //   };
  // }

  if (!values.description && !values.descriptionFrench) {
    errors.description = {
      fr: "Le champ de la description ne doit pas être vide",
      en: "The challenge description field must not be empty",
    };
    errors.descriptionFrench = {
      fr: "Le champ de la description ne doit pas être vide",
      en: "The challenge description field must not be empty",
    };
  }
  if (!values.exerpt && !values.exerptFrench) {
    errors.exerpt = {
      fr: "Le champ extrait ne doit pas être vide",
      en: "The challenge exerpt field must not be empty",
    };
    errors.exerptFrench = {
      fr: "Le champ extrait ne doit pas être vide",
      en: "The challenge exerpt field must not be empty",
    };
  }
  // if (!values.CollaborativeGoals?.length) {
  //   errors.CollaborativeGoals = {
  //     fr: "Un défi doit avoir au moins 1 objectif collaboratif",
  //     en: "The challenge requires at least 1 collaborative goal",
  //   };
  // } else if (
  //   values.CollaborativeGoals?.some((goal) => !goal.select.value || !goal.value)
  // ) {
  //   errors.CollaborativeGoals = {
  //     fr: "Aucun objectifs ne peut avoir un type ou valeur d'objectif vide",
  //     en: "No goals can have an empty goal type or value",
  //   };
  // }
  //   if (
  //     values.individualGoals?.select?.some(
  //       (goal) => !goal.select.value || !goal.value
  //     )
  //   ) {
  //     errors.individualGoals = {
  //       fr: "Aucun objectifs ne peut avoir un type ou valeur d'objectif vide",
  //       en: "No goals can have an empty goal type or value",
  //     };
  //   }
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
  // if (!values.Branch) {
  //   errors.Branch = {
  //     fr:
  //       "L'une des branches doit être sélectionnée. Créez-en un nouveau si vous n'en avez pas",
  //     en:
  //       "One of the branches should be selected. Create a new one if you don't have one",
  //   };
  // }
  if (!values.reward) {
    errors.reward = {
      fr: "Le défi doit avoir une récompense",
      en: "The challenge must have a reward",
    };
  }

  return errors;
};

export default validate;
