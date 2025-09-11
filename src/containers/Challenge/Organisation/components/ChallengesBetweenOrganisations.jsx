import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col } from "reactstrap";
import { useTranslation } from "react-i18next";

import ChallengeViewModel from "./../../ChallengeViewModel";
import { formatDateTranslated } from "../../../../utils";
import { PreviewsSkeleton } from "./Skeletons";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import { useHistory } from "react-router-dom";
import { routes } from "containers/App/Router";
import { SENT_CHALLENGE_STATUSES } from "constants/statuses";
import cityHooks from "hooks/city.hooks";
import usersHooks from "hooks/users.hooks";

export default function ChallengesBetweenOrganisations({ userID, branch }) {
  const [t] = useTranslation("common");

  const history = useHistory();
  const { details } = usersHooks.useExternalUser();
  const { limitSettings } = cityHooks.useFetchCityLimitSettings(details.cityId);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);

  const challengeViewModel = useMemo(() => new ChallengeViewModel(userID, t, true), [userID, t]);

  const challengeStatuses = useMemo(() => {
    const stats = [
      { label: t('challenge.status.active'), value: SENT_CHALLENGE_STATUSES.active },
      { label: t('challenge.status.cancelled'), value: SENT_CHALLENGE_STATUSES.cancelled },
      { label: t('challenge.status.accepted'), value: SENT_CHALLENGE_STATUSES.accepted },
    ];

    return stats;
  }, [t]);

  useEffect(() => {
    setLoading(true);

    challengeViewModel
      .getChallengesBetweenOrganisationsWithOtherAcceptation()
      .then((response) => {
        setChallenges(response);
      })
      .catch((error) => {
        console.log("Fetch error", error);
      })
      .finally(() => setLoading(false));
  }, [challengeViewModel]);

  const columns = useMemo(() => challengeViewModel.tableColumnDataChallengeBetweenOrg(), [challengeViewModel]);

  const data = useMemo(
    () =>
      Array.isArray(challenges)
        ? challenges
          .filter((value) => {
            const isBranchValid = !value?.branchId || !branch || value?.branchId === branch;
            const isNotCancelled = value?.status !== 'cancelled' || (() => {
              const endDate = value?.endAt?.toDate();
              if (!endDate) return true;
              const now = new Date();
              const differenceInDays = (now - endDate) / (1000 * 60 * 60 * 24);
              return differenceInDays <= 5;
            })();
            return isBranchValid && isNotCancelled;
          })
          .map((rowData) => {
            const translatedValue = challengeStatuses.find((stat) => stat.value === rowData?.status)?.label || "";
            const opponentTranslatedValue = challengeStatuses.find((stat) => stat.value === rowData?.opponentStatus)?.label || "";

            return {
              name: rowData?.nameFrench || "",
              dates:
                formatDateTranslated(rowData?.startAt?.toDate(), t) +
                " - " +
                formatDateTranslated(rowData?.endAt?.toDate(), t) || "",
              reward: rowData?.rewardGreenPoints || 0,
              acceptation: `${rowData?.sentByName} - ${translatedValue} 
  ${rowData?.sentToName} - ${opponentTranslatedValue}`,
              challengeId: rowData?.id,
              sentTo: rowData?.sentTo[0],
              status: rowData?.status
            };
          })
        : [],
    [challenges, branch, t, challengeStatuses]
  );
  const handleClickRow = (row) => {

    history.push(routes.organisation.challengeInfo.replace(":id", row.challengeId));
  };


  return (
    <Col>
      <Card>
        {limitSettings?.c25_challenge_between_organization?.granted && (loading || challenges.length > 0) && (
          <CardBody>
            <div className="card__title d-flex align-items-center justify-content-between">
              <h5 className="bold-text text-left challenge-title">{t("challenge.challenge_between_organization")}</h5>
            </div>
            {!loading ? (
              <div className="text-center">
                <ReactDataTable
                  columns={columns}
                  rows={data}
                  sortBy="dates"
                  pageSize={5}
                  onClickRow={handleClickRow}

                />
              </div>
            ) : (
              <PreviewsSkeleton />
            )}
          </CardBody>
        )}
      </Card>
    </Col>
  );
}
