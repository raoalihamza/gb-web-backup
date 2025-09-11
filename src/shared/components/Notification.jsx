/* eslint-disable max-classes-per-file */
/* eslint-disable react/no-multi-comp */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export class BasicNotification extends PureComponent {
	render() {
		const { color, title, message } = this.props;

		return (
			<div className={`notification notification--${color}`}>
				<h5 className="notification__title bold-text">{title}</h5>
				<p className="notification__message">{message}</p>
			</div>
		);
	}
}

export class ImageNotification extends PureComponent {
	render() {
		const { img, title, message } = this.props;

		return (
			<div className="notification notification--image">
				<div className="notification__image">
					<img src={img} alt="" />
				</div>
				<h5 className="notification__title bold-text">{title}</h5>
				<p className="notification__message">{message}</p>
			</div>
		);
	}
}

export class FullWideNotification extends PureComponent {
	render() {
		const { color, message } = this.props;

		return (
			<div
				className={`notification notification--full-wide notification--${color}`}
			>
				<p className="notification__message">{message}</p>
			</div>
		);
	}
}

BasicNotification.propTypes = {
	color: PropTypes.string,
	title: PropTypes.string,
	message: PropTypes.string.isRequired,
};

BasicNotification.defaultProps = {
	color: '',
	title: '',
};

ImageNotification.propTypes = {
	img: PropTypes.string.isRequired,
	title: PropTypes.string,
	message: PropTypes.string.isRequired,
};

ImageNotification.defaultProps = {
	title: '',
};

FullWideNotification.propTypes = {
	color: PropTypes.string,
	message: PropTypes.string.isRequired,
};

FullWideNotification.defaultProps = {
	color: '',
};
