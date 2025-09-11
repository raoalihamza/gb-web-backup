import React, { PureComponent } from 'react';
import Slider from 'react-slick';
import PropTypes from 'prop-types';

export default class CarouselSingle extends PureComponent {
	render() {
		// all settings: https://github.com/akiran/react-slick
		const settings = {
			dots: true,
			infinite: true,
			speed: 500,
			autoplay: true,
			swipeToSlide: true,
			slidesToScroll: 1,
			slidesToShow: 1,
		};
		const { children } = this.props;

		return (
			<Slider {...settings} className="slick-slider--single">
				{children}
			</Slider>
		);
	}
}

CarouselSingle.propTypes = {
	children: PropTypes.arrayOf(PropTypes.element).isRequired,
};
