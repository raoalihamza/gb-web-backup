import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {  Col, Row } from "reactstrap";
import classnames from "classnames";

import EmailForm from "./components/EmailForm";
import Layout from "../Layout";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import CardBox from "atomicComponents/CardBox";
import { useGetEmailsData } from "./hooks/useGetEmailsData";
import { NotificationsFormSkeleton } from "containers/Notifications/components/Skeletons";

const EmailDashboard = () => {
  const { t } = useTranslation("common");

  const {
    currentEmail,
    emailViewModel,
    forceUpdate,
    loading,
    userId,
    emailId,
    data,
    columns,
    isEdit,
    isUserCity,
    mainCollection,
    disabled,
  } = useGetEmailsData();

  const isCollapsed = useSelector((state) => state.sidebar.collapse);

  return (
    <Layout>
      <div className={classnames("notificationModule", !isCollapsed ? "sidebar-visible" : null)}>
        <Row>
          <Col md={12}>
            <h3 className="page-title">
              {isEdit ? t("emails.update_page_title") : t("emails.page_title")}
            </h3>
          </Col>
        </Row>
        {!loading ? (
          <>
            <Row>
              <EmailForm
                handleRender={forceUpdate}
                userId={userId}
                initialValues={currentEmail}
                editForm={isEdit}
                emailViewModel={emailViewModel}
                emailDocId={emailId}
                isUserCity={isUserCity}
                mainCollection={mainCollection}
                disabled={disabled}
              />
            </Row>

            <CardBox>
              <ReactDataTable columns={columns} rows={data} />
            </CardBox>
          </>
        ) : (
          <NotificationsFormSkeleton />
        )}
      </div>
    </Layout>
  );
};

export default EmailDashboard;
