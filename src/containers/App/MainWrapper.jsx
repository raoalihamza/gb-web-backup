import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
	CustomizerProps,
	ThemeProps,
} from '../../shared/prop-types/ReducerProps';

const Wrapper = styled.div`
	height: 100vh;
`;

class MainWrapper extends PureComponent {
	render() {
		const { theme, customizer, children } = this.props;

		const wrapperClass = classNames({
			wrapper: true,
			'squared-corner-theme': customizer.squaredCorners,
			'blocks-with-shadow-theme': customizer.withBoxShadow,
			'top-navigation': customizer.topNavigation,
		});

		return (
			<Wrapper className={theme.className}>
				<div className={wrapperClass}>{children}</div>
			</Wrapper>
		);
	}
}

MainWrapper.propTypes = {
	customizer: CustomizerProps.isRequired,
	theme: ThemeProps.isRequired,
	children: PropTypes.element.isRequired,
};

export default connect((state) => ({
	theme: state.theme,
	customizer: state.customizer,
}))(MainWrapper);
