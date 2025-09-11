import React from "react";
import { Row, Col } from "reactstrap";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Toast from "shared/components/Toast";

import LayoutContent from "../../atomicComponents/LayoutContent";
import CardBox from "../../atomicComponents/CardBox";
import Layout from "../Layout";
import Manage from "../Commons/Manage";
import usersHooks from "hooks/users.hooks";


const OrganisationPage = () => {
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const { disabled } = usersHooks.useExternalUser();

  const { organisationId } = useParams();

  return (
    <Layout>
      <LayoutContent isCollapsed={isCollapsed} height={"100%"}>
        <Row>
          <Col md={12} lg={12} xl={12}>
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
              <Manage userID={organisationId} disabled={disabled} role={"organisation"} />
            </CardBox>
          </Col>
        </Row>
      </LayoutContent>
      <Toast />
    </Layout>
  );
};

export default OrganisationPage;
