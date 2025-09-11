import React, { useEffect, useMemo } from "react";
import { Row, Col, Button } from "reactstrap";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Toast from "shared/components/Toast";

import LayoutContent from "../../atomicComponents/LayoutContent";
import CardBox from "../../atomicComponents/CardBox";
import Layout from "../Layout";

import ProfileMain from "../../components/Profile/ProfileCard";
import ProfileDataForm from "../../components/Profile/ProfileDataForm";
import Tabs from "../../atomicComponents/Tabs";
import UserStats from "../../components/Profile/UserStats";
import gpColors from "../../constants/gpColors";
import StatsContainer from "./containers/StatsContainer";
import organizationHooks from "../../hooks/organization.hooks";

import usersHooks from "hooks/users.hooks";
import { userRoleSelector, USER_TYPES } from "redux/selectors/user";
import ConfirmWindow from "shared/components/Modal/ConfirmWindow";
import { useHistory } from "react-router-dom";
import cityHooks from "hooks/city.hooks";
import { CarpoolTab } from "./containers/Carpool";
import Manage from "containers/Commons/Manage";

const UserPage = () => {
  const { t } = useTranslation("common");
  const history = useHistory();
  const loggedUserRole = useSelector(userRoleSelector);
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const { userID } = useParams();
  const { disabled, details: profileDetails, userId: loggedUserID } = usersHooks.useExternalUser();
  const { userProfile, refetch } = usersHooks.useFetchUserProfile(userID);
  const { useChangeUserActivationProfileStatus } = organizationHooks.useChangeUserActivationProfileStatus({
    userID,
    loggedUserID,
    disabled: true,
    refetchUser: refetch
  });
  const { handleDeleteUser } = cityHooks.useDeleteUser({
    userID,
    refetchUser: refetch
  });

  const { handleDeaffiliateUser } = cityHooks.useDeaffiliateUser({
    userID,
    refetchUser: refetch
  });

  const { limitSettings } = cityHooks.useFetchCityLimitSettings(loggedUserRole === USER_TYPES.ORGANISATION ? (profileDetails.cityId || 'defaultCityId') : loggedUserID);

  const initialValues = useMemo(() => {
    if (!userProfile) return;

    return {
      ...userProfile,
      fullName: `${userProfile.firstName} ${userProfile.lastName}`,
    };
  }, [userProfile]);

  useEffect(() => {
    if (userProfile === undefined) {
      // it redirects to the dashboard in any case
      history.push('/')
    }
  }, [history, userProfile])

  return (
    <Layout>
      <LayoutContent isCollapsed={isCollapsed} height={"100%"}>
        {userProfile && (
          <Row>
            <Col md={12} lg={4} xl={4}>
              <Row>
                <ProfileMain userData={userProfile} isEdit={false} isFullProfile={false} />
              </Row>
              <CardBox
                style={{ height: 400 }}
                variant="outlined"
                wrapperStyle={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <UserStats userProfile={userProfile} />
                {/* {loggedUserRole === USER_TYPES.ORGANISATION && (
                  <DeleteButtonWithAlert
                    handleDeletion={useChangeUserActivationProfileStatus}
                    disabled={userProfile?.disabled}
                    buttonText={t("account.profile.remove_user_from_organization")}
                    buttonConfirmationText={t("account.profile.remove_user_from_organization_confirmation")}
                  />
                )} */}
                {(loggedUserRole === USER_TYPES.CITY && !disabled) && (
                  <ConfirmWindow
                    confirmTitle={t('admin.delete_user_confirm_title')}
                    confirmText={t('admin.delete_user_confirm_description')}
                    handleConfirmClick={handleDeleteUser}
                    Button={Button}
                    buttonText={t('admin.delete_user')}
                    buttonProps={{
                      outline: true,
                      color: "danger",
                      size: "sm",
                      className: "mb-2",
                      style: { width: "100%" }
                    }} />
                )}
                {(loggedUserRole === USER_TYPES.ORGANISATION && !disabled) && (
                  <ConfirmWindow
                    confirmTitle={t('admin.deaffiliate_user_confirm_title')}
                    confirmText={t('admin.deaffiliate_user_confirm_description')}
                    handleConfirmClick={handleDeaffiliateUser}
                    Button={Button}
                    buttonText={t('admin.deaffiliate_user')}
                    buttonProps={{
                      outline: true,
                      color: "danger",
                      size: "sm",
                      className: "mb-2",
                      style: { width: "100%" }
                    }} />
                )}
              </CardBox>
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
                    content: <ProfileDataForm initialValues={initialValues} isDisabled={true} />,
                  },
                  {
                    id: "manage",
                    title: t("account.profile.manage"),
                    content: <Manage userID={userID} disabled={disabled} role={"user"} />,
                  },
                  limitSettings?.c19_carpooling_app?.granted ? {
                    id: "catpool",
                    title: t("modeOfTransport.carpool"),
                    content: <CarpoolTab userID={userID} />,
                  } : {},
                  // limitSettings?.c19_carpooling_app?.greenplay_addon ? {
                  //   id: "statistics",
                  //   title: t("account.profile.statistics"),
                  //   content: (
                  //     <Col md={12} lg={12} xl={12}>
                  //       <StatsContainer userID={userID} />
                  //     </Col>
                  //   ),
                  // } : {},
                ]}
                defaultActiveTab="profile"
              />
            </Col>
          </Row>
        )}
      </LayoutContent>
      <Toast />
    </Layout>
  );
};

export default UserPage;
