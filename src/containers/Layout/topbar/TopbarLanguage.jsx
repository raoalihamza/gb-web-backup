import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Collapse } from 'reactstrap';
import DownIcon from 'mdi-react/ChevronDownIcon';
import PropTypes from 'prop-types';
import {
	isUserOrganisationSelector,
} from "redux/selectors/user";

import { setTranslation } from '../../../redux/actions/translationAction';

export const AVAILABLE_LANGUAGES = {
	en: 'English',
	fr: 'Français',
};

function TopBarLanguage({ i18n }) {
	const dispatch = useDispatch();
	const language = useSelector((state) => state.translation.language);
	const isOrganisation = useSelector(isUserOrganisationSelector);

	const [collapse, setCollapse] = React.useState(false);

	const toggle = () => {
		setCollapse((previousState) => !previousState);
	};

	const changeLanguage = (lng) => {
		setCollapse((previousState) => !previousState);
		dispatch(setTranslation(lng));
		i18n.changeLanguage(lng);
	};

	return (
		<>
			<div className="topbar__collapse topbar__collapse--language">
				<button className="topbar__btn" type="button" onClick={toggle}>
					<span className="topbar__language-btn-title">
						<span>{isOrganisation ? AVAILABLE_LANGUAGES["Francais"] : AVAILABLE_LANGUAGES[language]}</span>
					</span>
					<DownIcon className="topbar__icon" />
				</button>
				<Collapse
					isOpen={collapse}
					className="topbar__collapse-content topbar__collapse-content--language"
				>
					{Object.entries(AVAILABLE_LANGUAGES).map(([lng, translation]) => (
						<button
							key={lng}
							className="topbar__language-btn"
							type="button"
							onClick={() => changeLanguage(lng)}
						>
							<span className="topbar__language-btn-title">
								<span>{translation}</span>
							</span>
						</button>
					))}
				</Collapse>
			</div>
		</>
	);
}

TopBarLanguage.propTypes = {
	i18n: PropTypes.shape({ changeLanguage: PropTypes.func }).isRequired,
	i: PropTypes.shape({ changeLanguage: PropTypes.func }),
};

TopBarLanguage.defaultProps = {
	i: {
		changeLanguage: () => null,
	},
};

export default withTranslation('common')(TopBarLanguage);
