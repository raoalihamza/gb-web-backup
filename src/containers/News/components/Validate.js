/* eslint-disable operator-linebreak */
const validate = (values) => {
	const errors = {};
	if (!values.newsName) {
		errors.newsName = {
			fr: "Le champ du nom de succursale ne doit pas être vide",
			en: 'The news name field must not be empty',
		};
	}
	if (!values.region) {
		errors.region = {
			fr: "Le champ de la région ne doit pas être vide",
			en: 'The region field must not be empty',
		};
	}
	return errors;
};

export default validate;
