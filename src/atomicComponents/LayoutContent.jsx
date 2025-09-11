import React from "react";
import styled from "styled-components";
import IconBreadcrumbs from "shared/components/IconBreadcrumbs";
import routerHooks from "hooks/router.hooks";

const Wrapper = styled.div`
  padding-top: 80px;
  padding-left: 20px;
  padding-right: 20px;
  background-color: #f2f4f7;
  transition: all 0.2s ease-out;
  margin-left: ${({ isCollapsed }) => (isCollapsed ? "50px" : "250px")};
  ${({ height }) => (height ? `min-height: ${height};` : "")};
`;

const PageTitle = styled.h3`
  margin-bottom: 30px;
`;

const LayoutContent = ({ title, children, isCollapsed, height, withBreadcrumbs }) => {
  const { pathsForBreadcrumbs } = routerHooks.useRouterPathsForBreadcrumbs();
  return (
    <Wrapper isCollapsed={isCollapsed} height={height}>
      {title && <PageTitle>{title}</PageTitle>}
      {withBreadcrumbs && <IconBreadcrumbs paths={pathsForBreadcrumbs} />}
      {children}
    </Wrapper>
  );
};

export default LayoutContent;
