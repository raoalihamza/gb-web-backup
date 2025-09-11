import React from "react";

import ChallengePage from "./components/ChallengePage";
import Layout from "../../Layout";
import usersHooks from "hooks/users.hooks";

function InfoPage() {
  const { userId, disabled } = usersHooks.useExternalUser();
  const challengeId = window.location.pathname.split("/").pop();

  return (
    <Layout>
      <ChallengePage userId={userId} challengeId={challengeId} editDisabled={disabled}/>
    </Layout>
  );
}

export default InfoPage;
