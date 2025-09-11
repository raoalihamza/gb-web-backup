import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { SidebarProps } from '../../../shared/prop-types/ReducerProps';

class ToggleCollapsedMenu extends PureComponent {
	render() {
		const { changeSidebarVisibility, sidebar } = this.props;

		return (
			<label
				className="toggle-btn customizer__toggle"
				htmlFor="collapse_toggle"
			>
				<input
					className="toggle-btn__input"
					type="checkbox"
					name="collapse_toggle"
					id="collapse_toggle"
					checked={sidebar.collapse}
					onChange={changeSidebarVisibility}
				/>
				<span className="toggle-btn__input-label">Toggle</span>
				<span>Collapsed Menu</span>
			</label>
		);
	}
}

ToggleCollapsedMenu.propTypes = {
	sidebar: SidebarProps.isRequired,
	changeSidebarVisibility: PropTypes.func.isRequired,
};

export default ToggleCollapsedMenu;
