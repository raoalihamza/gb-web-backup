/* eslint-disable operator-linebreak */
const validate = (values) => {
	const errors = {};
	if (!values.happyHourName) {
		errors.happyHourName = {
			fr: "Le champ de nom de la surtention ne doit pas être vide",
			en: 'The happyHour name field must not be empty',
		};
	}
	if (!values.plannedOn) {
		errors.plannedOn = {
			fr: "L'heure de planification de la surtention ne doit pas être vide",
			en: 'The happyHour planning date field must not be empty',
		};
	}
	if (!values.multiplier) {
		errors.multiplier = {
			fr: "La valeur de la surtention ne doit pas être vide",
			en: 'The happyHour value field must not be empty',
		};
	}
	return errors;
};

export default validate;
