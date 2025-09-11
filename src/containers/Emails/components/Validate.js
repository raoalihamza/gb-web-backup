/* eslint-disable operator-linebreak */
const validate = (values) => {
	const errors = {};
	if (!values.emailName) {
		errors.emailName = {
			fr: "Le champ du nom de succursale ne doit pas être vide",
			en: 'The notification name field must not be empty',
		};
	}
	if (!values.senderName) {
		errors.senderName = {
			fr: "Le champ de la région ne doit pas être vide",
			en: 'The region field must not be empty',
		};
	}
	return errors;
};

export default validate;
