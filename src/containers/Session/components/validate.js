const validate = (values) => {

	const errors = {};
	if (!values.movementDateTime) {
		errors.movementDateTime =
			'Le champ de date ne doit pas être vide / The date field should not be empty';
	}
	if (!values.TransportMode) {
		errors.TransportMode =
			'Le champ TransportMode ne doit pas être vide / The TransportMode field must not be empty';
	}
	if (!values.distance) {
		errors.distance =
			'Le champ de kilométrage est obligatoirement / The number of kilometers is required';
	} else if (values.distance && values.distance < 0) {
		errors.distance =
			'Kilomètre doit être en valeur positive / Kilometer must be in positive value';
	}

	return errors;
};

export default validate;
