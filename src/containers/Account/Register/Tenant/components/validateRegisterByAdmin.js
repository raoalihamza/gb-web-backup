
export const validateRegisterByAdmin = (values) => {
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
