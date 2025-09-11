import React from 'react';
import cx from 'classnames';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';

const FormLabel = ({ className, label, info, required }) => (
	<span>
		<span className={cx(className, 'form__form-group-label')}>{label}</span>
		{info && (
			<span className="title-icon" data-tip data-for={`${label}-info`}>
				<img src="/img/info1.png" className="bubble-info-img" alt="info" />
			</span>
		)}
		{required && <span style={{ color: 'red' }}> *</span>}
		{info && (
			<ReactTooltip
				id={`${label}-info`}
				className="tooltip-box"
				aria-haspopup="true"
				type="success"
			>
				<p>{info}</p>
			</ReactTooltip>
		)}
	</span>
);

FormLabel.propTypes = {
	className: PropTypes.string,
	label: PropTypes.string,
	info: PropTypes.string,
	required: PropTypes.bool,
};

FormLabel.defaultProps = {
	className: '',
	label: '',
	info: '',
	required: true,
};

export default FormLabel;
