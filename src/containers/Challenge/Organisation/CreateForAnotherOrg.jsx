import React from "react";
import classnames from "classnames";
import { useSelector } from "react-redux";

import Layout from "../../Layout";
import ChallengeFormForAnotherOrganisation from "./components/ChallengeFormForAnotherOrganisation";
import usersHooks from "hooks/users.hooks";

function CreateForAnotherOrg() {
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const { details: user, userId} = usersHooks.useExternalUser();

  const [template, setTemplate] = React.useState({});

  return (
    <Layout>
      <div
        className={classnames(
          "challenge",
          !isCollapsed ? "sidebar-visible" : null
        )}
      >
        <ChallengeFormForAnotherOrganisation
          editForm={false}
          userId={userId}
          user={user}
          initialValues={template}
          initialTemplate={template?.templateName}
          setTemplate={setTemplate}
        />
      </div>
    </Layout>
  );
}

export default CreateForAnotherOrg;
