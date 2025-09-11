import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import TimePicker from 'rc-time-picker';
import AvTimerIcon from 'mdi-react/AvTimerIcon';
import classNames from 'classnames';

function TimePickerField({
	value,
	name,
	onChange,
	timeMode,
	error
}) {
	const locale = useSelector((state) => state.translation.language);

	const [openState, setOpenState] = React.useState(false);
	const [touched, setTouched] = React.useState(false);

	const setOpen = ({ open }) => {
		setOpenState(open);
	};

	const toggleOpen = (e) => {
		e?.preventDefault();
		setOpenState((prevState) => !prevState);
	};

	const btnClass = classNames({
		'form__form-group-button': true,
		active: window.open,
	});

	return (
		<div>
			<div className="form__form-group-field">
				<TimePicker
					open={openState}
					onOpen={setOpen}
					onClose={setOpen}
					name={name}
					onChange={onChange}
					showSecond={false}
					use12Hours={timeMode}
					autoComplete="off"
					value={value}
					onBlur={() => setTouched(true)}
				/>
				<button className={btnClass} type="button" onClick={toggleOpen}>
					<AvTimerIcon />
				</button>
			</div>
			{touched && error?.[locale]?.length > 0 ? (
				<span className="form__form-group-error">{error?.[locale] || ''}</span>
			) : null}
		</div>
	);
}

const renderTimePickerField = (props) => {
	const { input, timeMode, meta } = props;
	return <TimePickerField {...input} {...meta} timeMode={timeMode} />;
};

renderTimePickerField.propTypes = {
	input: PropTypes.shape({
		onChange: PropTypes.func,
		name: PropTypes.string,
	}).isRequired,
	timeMode: PropTypes.bool,
	meta: PropTypes.shape({
		touched: PropTypes.bool,
		error: PropTypes.shape({}),
	}),
};

renderTimePickerField.defaultProps = {
	timeMode: false,
};

TimePickerField.propTypes = {
	onChange: PropTypes.func.isRequired,
	name: PropTypes.string.isRequired,
	timeMode: PropTypes.bool.isRequired,
};

export default renderTimePickerField;
