import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import classnames from "classnames";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { useTranslation } from "react-i18next";
import ProfileDataForm from "../../../../components/Profile/ProfileDataForm";
import Manage from "../../../Commons/Manage";

import "react-app-polyfill/ie9";
import "react-app-polyfill/ie11";
import "core-js/stable";

import gpColors from "../../../../constants/gpColors";
import { isUserAdminSelector, isUserTenantSelector } from "redux/selectors/user";
import Tabs from "../../../../atomicComponents/Tabs";
import tenantHooks from "hooks/tenant.hooks";
import ProfileMain from "./components/ProfileMain";
import Layout from "../../../Layout";
import { useAuth } from "../../../../shared/providers/AuthProvider";
import ProfileSettings from "./components/ProfileSettings";
import { ToastContainer } from "react-toastify";
import DiscoveryTab from "./components/DiscoveryTab";

const TenantProfile = () => {
  const { t } = useTranslation("common");

  const params = useParams();
  const [, loggedUserData] = useAuth();
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const [imageAsUrl, setImageAsUrl] = useState();
  const isTenant = useSelector(isUserTenantSelector);
  const isAdmin = useSelector(isUserAdminSelector);
  const { loading, userData } = tenantHooks.useGetTenantData(params, loggedUserData);

  useEffect(() => {
    if (imageAsUrl) {
      userData.logoUrl = imageAsUrl.imgUrl;
    }
  }, [imageAsUrl, userData])

  return (
    <Layout>
      <ToastContainer style={{ zIndex: 10000000 }} />
      {!loading ? (
        <div className={classnames("profile", !isCollapsed ? "sidebar-visible" : null)}>
          <Row>
            <Col md={12} lg={12} xl={4}>
              <Row>
                <ProfileMain userData={userData} setImageAsUrl={setImageAsUrl} disabled={!isAdmin && !isTenant} isAdmin={isAdmin} />
              </Row>
            </Col>
            <Col
              md={12}
              lg={8}
              xl={8}
              style={{
                background: gpColors.white,
                marginBottom: 15,
                border: "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: "4px",
              }}
            >
              <Tabs
                tabs={[
                  {
                    id: "profile",
                    title: t("account.profile.title"),
                    content: (
                      <ProfileSettings
                        initialValues={userData}
                        disabled={!isAdmin && !isTenant}
                        userData={userData}
                        userId={userData.id}
                        isAdmin={isAdmin}
                      />
                    ),
                  },
                  ...(!isTenant
                    ? [{
                      id: "manage",
                      title: t("account.profile.manage"),
                      content: <Manage userID={userData.id} role={"tenant"} disabled={!isAdmin} />,
                    }]
                    : []),
                  ...(userData.discoveryOrganisationId != undefined
                    ? [{
                      id: "discovery",
                      title: "Découverte",
                      content: <DiscoveryTab discoveryOrganisationId={userData.discoveryOrganisationId} />
                    }]
                    : [])
                ]}
                defaultActiveTab="profile"
              />
            </Col>
          </Row>
        </div>
      ) : (
        <Skeleton style={{ with: "100%", height: "100%" }} />
      )}
    </Layout>
  );
};
export default TenantProfile;
