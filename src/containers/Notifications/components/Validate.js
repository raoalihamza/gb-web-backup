/* eslint-disable operator-linebreak */
const validate = (values) => {
	const errors = {};
	if (!values.notificationName) {
		errors.notificationName = {
			fr: "Le champ de nom de la notification ne doit pas être vide",
			en: 'The notification name field must not be empty',
		};
	}
	if (!values.title) {
		errors.title = {
			fr: "Le titre de la notification ne doit pas être vide",
			en: 'The notification title field must not be empty',
		};
	}
	if (!values.contenu) {
		errors.contenu = {
			fr: "Le contenu de la notification ne doit pas être vide",
			en: 'The notification content field must not be empty',
		};
	}
	if (!values.plannedOn) {
		errors.plannedOn = {
			fr: "L'heure de planification de la notification ne doit pas être vide",
			en: 'The notification planning date field must not be empty',
		};
	}
	return errors;
};

export default validate;
