import { validateEmail } from "utils";

const validate = (values) => {
	const errors = {};

	if (!values.email) {
		errors.email = {
			fr: 'Le champ email ne doit pas être vide',
			en: 'Email field shouldn’t be empty',
		};
	} else if (!validateEmail(values.email)) {
		errors.email = {
			fr: 'Adresse e-mail invalide',
			en: 'Invalid email address',
		};
	}
	if (!values.password) {
		errors.password = {
			fr: 'Le champ mot de passe ne doit pas être vide',
			en: 'Password field shouldn’t be empty',
		};
	} else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/i.test(values.password)) {
		errors.password = {
			fr:
				'Mot de passe Minimum 8 caractères, au moins une lettre et un chiffre',
			en: 'Password Minimum 8 characters, at least one letter and one number',
		};
	}
	if (values.password !== values.confirm_password) {
		errors.confirm_password = {
			fr:
				'Confirmez que le mot de passe doit correspondre au champ Mot de passe',
			en: 'Confirm password must be match with Password field',
		};
	}
	return errors;
};

export default validate;
