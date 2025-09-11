import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { CustomizerProps } from '../../../shared/prop-types/ReducerProps';

class ToggleSquared extends PureComponent {
	render() {
		const { changeBorderRadius, customizer } = this.props;

		return (
			<label className="toggle-btn customizer__toggle" htmlFor="square_toggle">
				<input
					className="toggle-btn__input"
					type="checkbox"
					name="square_toggle"
					id="square_toggle"
					checked={customizer.squaredCorners}
					onChange={changeBorderRadius}
				/>
				<span className="toggle-btn__input-label">Toggle</span>
				<span>Squared borders</span>
			</label>
		);
	}
}

ToggleSquared.propTypes = {
	customizer: CustomizerProps.isRequired,
	changeBorderRadius: PropTypes.func.isRequired,
};

export default ToggleSquared;
