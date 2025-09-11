import { validateEmail } from '../../../../utils';

const validate = (values) => {
	const errors = {};
	if (!values.email) {
		errors.email = {
			fr: `Le champ email ne doit pas être vide`,
			en: 'Email field shouldn’t be empty',
		};
	} else if (!validateEmail(values.email)) {
		errors.email = {
			fr: 'Adresse e-mail invalide',
			en: 'Invalid email address',
		};
	}
	return errors;
};

export default validate;
