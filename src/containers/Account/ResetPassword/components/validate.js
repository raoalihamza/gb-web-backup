/* eslint-disable operator-linebreak */
const validate = (values) => {
	const errors = {};
	if (!values.password) {
		errors.password =
			'Le champ mot de passe ne doit pas être vide / Password field shouldn’t be empty';
	} else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/i.test(values.password)) {
		const frenchpasswordmsg =
			'Mot de passe Minimum 8 caractères, au moins une lettre et un chiffre';
		const englishpasswordmsg =
			' / Password Minimum 8 characters, at least one letter and one number';
		errors.password = frenchpasswordmsg + englishpasswordmsg;
	}
	if (values.password !== values.confirm_password) {
		const frenchcpasswordmsg =
			'Confirmez que le mot de passe doit correspondre au champ Mot de passe ';
		const englishcpasswordmsg =
			' / Confirm password must be match with Password field';
		errors.confirm_password = frenchcpasswordmsg + englishcpasswordmsg;
	}
	return errors;
};

export default validate;
