/* eslint-disable no-return-assign */
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import styled from 'styled-components';

import Topbar from "./topbar/Topbar";
import TopbarWithNavigation from "./topbar_with_navigation/TopbarWithNavigation";
import Sidebar from "./sidebar/Sidebar";
import SidebarMobile from "./topbar_with_navigation/sidebar_mobile/SidebarMobile";
import {
  changeMobileSidebarVisibility,
  changeSidebarVisibility,
} from "../../redux/actions/sidebarActions";
import {
  changeThemeToDark,
  changeThemeToLight,
} from "../../redux/actions/themeActions";

const Wrapper = styled.div`
	height: 100vh;
`;

function Layout({ children }) {
  const customizer = useSelector((state) => state.customizer);
  const sidebar = useSelector((state) => state.sidebar);

  const dispatch = useDispatch();

  const handleChangeSidebarVisibility = () => {
    dispatch(changeSidebarVisibility());
  };

  const handleChangeMobileSidebarVisibility = () => {
    dispatch(changeMobileSidebarVisibility());
  };

  const handleChangeToDark = () => {
    dispatch(changeThemeToDark());
  };

  const handleChangeToLight = () => {
    dispatch(changeThemeToLight());
  };

  const layoutClass = classNames({
    layout: true,
    "layout--collapse": sidebar.collapse,
    "layout--top-navigation": customizer.topNavigation,
  });

  return (
    <Wrapper className={layoutClass}>
      {customizer.topNavigation ? (
        <TopbarWithNavigation
          changeMobileSidebarVisibility={changeMobileSidebarVisibility}
        />
      ) : (
        <Topbar
          changeMobileSidebarVisibility={changeMobileSidebarVisibility}
          changeSidebarVisibility={handleChangeSidebarVisibility}
        />
      )}
      {customizer.topNavigation ? (
        <SidebarMobile
          sidebar={sidebar}
          changeToDark={handleChangeToDark}
          changeToLight={handleChangeToLight}
          changeMobileSidebarVisibility={handleChangeMobileSidebarVisibility}
        />
      ) : (
        <Sidebar
          sidebar={sidebar}
          changeToDark={handleChangeToDark}
          changeToLight={handleChangeToLight}
          changeMobileSidebarVisibility={changeMobileSidebarVisibility}
        />
      )}
      {children}

    </Wrapper>
  );
}

Layout.defaultProps = {
  children: null,
};

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.arrayOf(PropTypes.node),
  ]),
};

export default Layout;
