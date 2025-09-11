import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SidebarLink from './SidebarLink';
import SidebarCategory from './SidebarCategory';

class SidebarContent extends Component {
	hideSidebar() {
		const { onClick } = this.props;
		onClick();
	}

	render() {
		const { changeToLight, changeToDark } = this.props;

		return (
			<div className="sidebar__content">
				<ul className="sidebar__block">
					<SidebarLink
						title="Dashboard Default"
						icon="home"
						route="/dashboard_default"
						onClick={this.hideSidebar}
					/>
					<SidebarCategory title="Layout" icon="layers">
						<button
							className="sidebar__link"
							type="button"
							onClick={changeToLight}
						>
							<p className="sidebar__link-title">Light Theme</p>
						</button>
						<button
							className="sidebar__link"
							type="button"
							onClick={changeToDark}
						>
							<p className="sidebar__link-title">Dark Theme</p>
						</button>
					</SidebarCategory>
				</ul>
				<ul className="sidebar__block">
					<SidebarLink title="Log Out" icon="exit" route="/" />
				</ul>
				<ul className="sidebar__block">
					<SidebarLink
						title="Documentation"
						icon="text-align-justify"
						route="/documentation/introduction"
						onClick={this.hideSidebar}
					/>
				</ul>
			</div>
		);
	}
}

SidebarContent.propTypes = {
	changeToDark: PropTypes.func.isRequired,
	changeToLight: PropTypes.func.isRequired,
	onClick: PropTypes.func.isRequired,
};

export default SidebarContent;
