/* eslint-disable operator-linebreak */
const validate = (values) => {
	const errors = {};
	if (!values.username) {
		errors.username =
			"Le champ Nom d'utilisateur ne doit pas être vide / Username field shouldn’t be empty";
	}
	if (!values.first_name) {
		errors.first_name =
			'Le champ Prénom ne doit pas être vide / First Name field shouldn’t be empty';
	}
	if (!values.last_name) {
		errors.last_name =
			'Le champ Nom de famille ne doit pas être vide / Last Name field shouldn’t be empty';
	}
	if (!values.email) {
		errors.email =
			'Le champ email ne doit pas être vide / Email field shouldn’t be empty';
	} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i.test(values.email)) {
		errors.email = 'Adresse e-mail invalide / Invalid email address';
	}
	if (!values.password) {
		errors.password =
			'Le champ mot de passe ne doit pas être vide / Password field shouldn’t be empty';
	} else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/i.test(values.password)) {
		const frenchpasswordmsg =
			'Mot de passe Minimum 8 caractères, au moins une lettre et un chiffre';
		const englishpasswordmsg =
			' / Password Minimum 8 characters, at least one letter and one number';
		errors.password = frenchpasswordmsg + englishpasswordmsg;
	}
	if (values.password !== values.confirmpassword) {
		const frenchcpasswordmsg =
			'Confirmez que le mot de passe doit correspondre au champ Mot de passe ';
		const englishcpasswordmsg =
			' / Confirm password must be match with Password field';
		errors.confirmpassword = frenchcpasswordmsg + englishcpasswordmsg;
	}
	if (!values.sex) {
		errors.sex = "Veuillez sélectionner l'option / Please select the option";
	}
	// if (!/^(19[5-9][0-9]|20[0-4][0-9]|2050)[/](0?[1-9]|1[0-2])[/](0?[1-9]|[12][0-9]|3[01])$/i.test(values)) {
	//   errors.dobtext = 'Format de date invalide / Invalid date format';
	// }
	// if (!values.street_address) {
	//   errors.street_address = 'Street field shouldn’t be empty';
	// }
	// if (!values.city) {
	//   errors.city = 'City field shouldn’t be empty';
	// }
	// if (!values.country) {
	//   errors.country = 'country field shouldn’t be empty';
	// }
	if (!values.postal_code) {
		errors.postal_code =
			'Le champ code postal ne doit pas être vide / Postalcode field shouldn’t be empty';

		// else if (
		//   values.postal_code &&
		//   !/^([A-Z]{1}[0-9]{1}){3}$/i.test(values.postal_code)
		// ) {
		// }
	} else if (
		values.postal_code &&
		/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/i.test(values.postal_code)
	) {
		errors.postal_code = 'Format non supporté / Format not supported';
	}
	if (!values.usual_transfer_mode) {
		errors.usual_transfer_mode =
			"Veuillez sélectionner l'option / Please select the option";
	}
	if (values.aggrement === false) {
		errors.aggrement =
			'Doit accepter les termes et conditions / Must agree with Terms & Condition';
	}
	if (!values.data_collection_method) {
		errors.data_collection_method =
			"Veuillez sélectionner l'option / Please select the option";
	}
	return errors;
};

export default validate;
