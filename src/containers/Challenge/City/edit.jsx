import React from "react";
import classnames from "classnames";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";

import ChallengeForm from "./components/ChallengeForm";
import ChallengeViewModel from "../ChallengeViewModel";
import Layout from "../../Layout";
import { routes } from "../../App/Router";
import usersHooks from "hooks/users.hooks";

function EditForm() {
  const [t] = useTranslation("common");
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const { details: user, userId} = usersHooks.useExternalUser();

  // const userId = loggedUser[USER_ID];
  const challengeViewModel = React.useMemo(
    () => new ChallengeViewModel(userId, t, false),
    [t, userId]
  );
  const challengeId = window.location.pathname.split("/").pop();
  const history = useHistory();

  const [challenge, setChallenge] = React.useState({});

  React.useEffect(() => {
    challengeViewModel
      .getChallengeInfoWithId(challengeId)
      .then((returnedChallenge) => {
        setChallenge(returnedChallenge);
      })
      .catch((error) => {
        console.log("Error getting specified challenge", error);
        history.replace(routes.organisation.challengeDashboard);
      });
    return () => {};
  }, [challengeId, challengeViewModel, history]);

  return (
    <Layout>
      <div
        className={classnames(
          "challenge",
          !isCollapsed ? "sidebar-visible" : null
        )}
      >
        <ChallengeForm
          editForm
          userId={userId}
          user={user}
          challengeId={challengeId}
          initialValues={challenge}
          
        />
      </div>
    </Layout>
  );
}

export default EditForm;
