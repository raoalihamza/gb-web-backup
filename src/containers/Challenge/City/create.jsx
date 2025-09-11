import React from "react";
import classnames from "classnames";
import { useSelector } from "react-redux";

import ChallengeForm from "./components/ChallengeForm";
import Layout from "../../Layout";
import usersHooks from "hooks/users.hooks";

function BasicForm() {
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const { details: user, userId} = usersHooks.useExternalUser();

  //onst userId = loggedUser[USER_ID];


  const [template, setTemplate] = React.useState({});

  return (
    <Layout>
      <div
        className={classnames(
          "challenge",
          !isCollapsed ? "sidebar-visible" : null
        )}
      >
        <ChallengeForm
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

export default BasicForm;
