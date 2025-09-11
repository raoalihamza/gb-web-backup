import React, { Component } from "react";
import PropTypes from "prop-types";
import OrganisationSidebar from "./OrganisationSidebar";
import CitySidebar from "./CitySidebar";
import TenantSidebar from "./TenantSidebar";

class SidebarContent extends Component {
  hideSidebar() {
    const { onClick } = this.props;
    onClick();
  }

  render() {
    let RenderComponent;
    switch (this.props?.locale?.role) {
      case "city":
        RenderComponent = CitySidebar;
        break;  

      case "tenant":
        RenderComponent = TenantSidebar;
        break;
        

      default:
        RenderComponent = OrganisationSidebar;
        break;
    }

    return (
      <div className="sidebar__content">
        <RenderComponent />
      </div>
    );
  }
}

SidebarContent.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default SidebarContent;
