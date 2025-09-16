import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const icon = `/img/burger.svg`;

class TopbarSidebarButton extends PureComponent {
	render() {
		const { changeMobileSidebarVisibility } = this.props;

		return (
			<div>
				<button
					className="topbar__button topbar__button--mobile"
					type="button"
					onClick={changeMobileSidebarVisibility}
				>
					<img src={icon} alt="" className="topbar__button-icon" />
				</button>
			</div>
		);
	}
}

TopbarSidebarButton.propTypes = {
	changeMobileSidebarVisibility: PropTypes.func.isRequired,
};

export default TopbarSidebarButton;
