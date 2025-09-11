import { validateEmail } from '../../../../../utils';

const validate = (values) => {
	const errors = {};
	if (!values.first_name) {
		errors.first_name = {
			fr: 'Le champ Prénom ne doit pas être vide',
			en: 'First Name field shouldn’t be empty',
		};
	}
	if (!values.last_name) {
		errors.last_name = {
			fr: 'Le champ Nom de famille ne doit pas être vide',
			en: 'Last Name field shouldn’t be empty',
		};
	}
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

	if (!values.postal_code) {
		errors.postal_code = {
			fr: 'Le champ du code postal ne doit pas être vide',
			en: 'Postal code field shouldn’t be empty',
		};
	} else if (
		values.postal_code &&
		!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/i.test(values.postal_code)
	) {
		errors.postal_code = {
			fr: 'Format non supporté',
			en: 'Format not supported',
		};
	}
	if (!values.city) {
		errors.city = {
			fr: "Le champ du nom de l'ville ne doit pas être vide",
			en: 'Ville name field shouldn’t be empty',
		};
	}
	
	return errors;
};

export default validate;
