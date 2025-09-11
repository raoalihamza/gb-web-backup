import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import PropType from 'prop-types';

export default function Skeleton({ children, color, highlightColor }) {
	return (
		<SkeletonTheme {...{ color, highlightColor }}>{children}</SkeletonTheme>
	);
}

Skeleton.defaultProps = {
	children: null,
	color: '#ffffff',
	highlightColor: '#f9f9f9',
};

Skeleton.propTypes = {
	children: PropType.oneOfType([
		PropType.shape({}),
		PropType.arrayOf(PropType.shape({})),
	]),
	color: PropType.string,
	highlightColor: PropType.string,
};
