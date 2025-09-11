import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { setTranslation } from '../../redux/actions/translationAction';

export default function TranslationProvider({ children }) {
	const { i18n } = useTranslation();

	const dispatch = useDispatch();

	// Remember translation on App Start
	React.useEffect(() => {
		i18n.changeLanguage('fr')
		dispatch(setTranslation('fr'));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return children;
}
