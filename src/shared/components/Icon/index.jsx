import React from 'react';
import PropType from 'prop-types';
import classnames from 'classnames';

import registry from './registry';

const _Icon = React.forwardRef(
	(
		{
			id,
			className,
			name,
			size,
			opacity,
			style,
			alt,
			containerSize,
			border,
			backgroundColor,
			pointer,
			borderColor,
			animateOnTap,
			animateOnHover,
			onMouseEnter,
			onMouseLeave,
			onClick,
			noContainer,
		},
		ref,
	) => {
		let altName;
		if (!alt) {
			altName = `${name}-icon`;
		} else {
			altName = alt;
		}

		const renderIcon = React.useMemo(
			() => (
				<img
					className={classnames('vendor-icon', className)}
					src={registry[name]}
					alt={altName}
					style={{
						cursor: pointer ? 'pointer' : 'default',
						width: `${size}px`,
						height: `${size}px`,
					}}
				/>
			),
			[altName, size, name, pointer, className],
		);

		return !noContainer ? (
			<div
				className={classnames('vendor-icon-container', className)}
				ref={ref}
				id={id}
				{...{ containerSize, border, backgroundColor, borderColor }}
				style={{
					...style,
					width: `${containerSize}px`,
					height: `${containerSize}px`,
					cursor: pointer ? 'pointer' : 'default',
				}}
				// onClick={onClick}
				// onMouseEnter={onMouseEnter}
				// onMouseLeave={onMouseLeave}
			>
				{renderIcon}
			</div>
		) : (
			renderIcon
		);
	},
);

_Icon.defaultProps = {
	id: '',
	name: '',
	size: 15,
	opacity: 1,
	style: {},
	onClick: () => null,
	alt: '',
	containerSize: 40,
	border: false,
	backgroundColor: 'transparent',
	noContainer: false,
	pointer: false,
	borderColor: 'black',
	animateOnTap: true,
	animateOnHover: false,
	onMouseEnter: () => null,
	onMouseLeave: () => null,
	className: '',
};
_Icon.propTypes = {
	id: PropType.string,
	name: PropType.string,
	size: PropType.number,
	opacity: PropType.number,
	style: PropType.shape({}),
	onClick: PropType.func,
	alt: PropType.string,
	containerSize: PropType.number,
	border: PropType.bool,
	backgroundColor: PropType.string,
	noContainer: PropType.bool,
	pointer: PropType.bool,
	borderColor: PropType.string,
	animateOnTap: PropType.bool,
	animateOnHover: PropType.bool,
	onMouseEnter: PropType.func,
	onMouseLeave: PropType.func,
	className: PropType.string,
};

export default React.memo(_Icon);
