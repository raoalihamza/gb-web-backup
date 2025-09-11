/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import CheckIcon from 'mdi-react/CheckIcon';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function RadioButtonField({
	input,
	label,
	disabled,
	className,
	radioValue,
}) {
	const {
		onChange,
		name,
		value,
	} = input

	const RadioButtonClass = classNames({
		'radio-btn': true,
		disabled,
	});

	return (
		<label
			className={`${RadioButtonClass}${
				className ? ` radio-btn--${className}` : ''
			}`}
			htmlFor={`${name}_${radioValue}`}
		>
			<input
				className="radio-btn__radio"
				name={name}
				type="radio"
				onChange={() => onChange(radioValue)}
				checked={value === radioValue}
				disabled={disabled}
				id={`${name}_${radioValue}`}
			/>
			<span className="radio-btn__radio-custom" />
			{className === 'button' ? (
				<span className="radio-btn__label-svg">
					<CheckIcon className="radio-btn__label-check" />
					<htmlForon className="radio-btn__label-uncheck" />
				</span>
			) : (
				''
			)}
			<span className="radio-btn__label">{label}</span>
		</label>
	);
}

RadioButtonField.propTypes = {
	input: PropTypes.shape({
		onChange: PropTypes.func,
		name: PropTypes.string,
		value: PropTypes.string,
	}).isRequired,
	label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
	radioValue: PropTypes.string,
	disabled: PropTypes.bool,
	className: PropTypes.string,
};

RadioButtonField.defaultProps = {
	label: '',
	radioValue: '',
	disabled: false,
	className: '',
	onChange: () => null,
};

export default RadioButtonField;
