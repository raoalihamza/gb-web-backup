import React from 'react';
import { Collapse } from 'reactstrap';
import MinusIcon from 'mdi-react/MinusIcon';
import PlusIcon from 'mdi-react/PlusIcon';
import ChevronDownIcon from 'mdi-react/ChevronDownIcon';

export default function CollapseComponent({
	className,
	title,
	children
}) {
	const [isCollapsed, setIsCollapsed] = React.useState(true);
	const [status, setStatus] = React.useState('closed');
	const [icon, setIcon] = React.useState(<PlusIcon />);

	const onEntering = () => {
		setStatus('opening');
		setIcon(<MinusIcon />);
	}

	const onEntered = () => {
		setStatus('opened');
		setIcon(<MinusIcon />);
	}

	const onExiting = () => {
		setStatus('closing');
		setIcon(<PlusIcon />);
	}

	const onExited = () => {
		setStatus('closed');
		setIcon(<PlusIcon />);
	}

	const toggle = () => {
		setIsCollapsed(!isCollapsed)
	}

	return (
		<div className={`collapse__wrapper ${status} ${className}`}>
			<button onClick={toggle} className="collapse__title" type="button">
				{icon}
				<p>
					{title}
					<ChevronDownIcon />
				</p>
			</button>
			<Collapse
				isOpen={!isCollapsed}
				className="collapse__content"
				onEntering={onEntering}
				onEntered={onEntered}
				onExiting={onExiting}
				onExited={onExited}
			>
				<div>{children}</div>
			</Collapse>
		</div>
	);
}

CollapseComponent.defaultProps = {
	title: '',
	className: '',
};
