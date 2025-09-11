import React, { PureComponent } from 'react';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';

class DatePickerField extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			startDate: new Date(),
			minDate: '2019-09-16',
			maxDate: '2019-09-22',
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(date) {
		const { onChange } = this.props;
		this.setState({
			startDate: date,
		});
		onChange(date);
	}

	render() {
		const { startDate, minDate, maxDate } = this.state;
		const { value } = this.props;
		this.setState({
			startDate: value,
		});
		// if (value !== '') {
		//   this.setState({
		//     minDate: value,
		//     maxDate: value,
		//   });
		// }
		return (
			<div className="date-picker">
				<DatePicker
					className="form__form-group-datepicker"
					selected={startDate}
					onChange={this.handleChange}
					dateFormat="yyyy/MM/dd"
					minDate={minDate}
					maxDate={maxDate}
					peekNextMonth
					showMonthDropdown
					showYearDropdown
					dropdownMode="select"
				/>
			</div>
		);
	}
}

const renderDatePickerField = (props) => {
	const { input } = props;
	return <DatePickerField {...input} />;
};

renderDatePickerField.propTypes = {
	input: PropTypes.shape({
		onChange: PropTypes.func,
		name: PropTypes.string,
		selected: PropTypes.instanceOf(Date).isRequired,
	}).isRequired,
};

DatePickerField.propTypes = {
	onChange: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired,
};

export default renderDatePickerField;
