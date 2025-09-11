import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Icon from '../../../shared/components/Icon';

class TopbarSidebarButton extends PureComponent {
	render() {
		const {
			changeMobileSidebarVisibility,
			changeSidebarVisibility,
		} = this.props;

		return (
			<div>
				<button
					className="topbar__button topbar__button--desktop"
					type="button"
					onClick={changeSidebarVisibility}
				>
					<Icon
						name="hamburger"
						className="topbar__button-icon"
						size={20}
						noContainer
						pointer
					/>
				</button>
				<button
					className="topbar__button topbar__button--mobile"
					type="button"
					onClick={changeMobileSidebarVisibility}
				>
					<Icon
						name="hamburger"
						className="topbar__button-icon"
						noContainer
						size={20}
					/>
				</button>
			</div>
		);
	}
}

TopbarSidebarButton.propTypes = {
	changeMobileSidebarVisibility: PropTypes.func.isRequired,
	changeSidebarVisibility: PropTypes.func.isRequired,
};

export default TopbarSidebarButton;
