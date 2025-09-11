import React from "react";
import { Card, CardBody, Button, Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import { ceil } from "lodash";

import ChallengeViewModel from "./../../ChallengeViewModel";
import ChallengePreviewCard from "./../../ChallengePreviewCard";
import { PreviewsSkeleton } from "./Skeletons";
import { SENT_CHALLENGE_STATUSES } from "constants/statuses";

export default function ActiveChallenges({ userID, branch }) {
  const [t] = useTranslation("common");
  const pageLength = 1;

  const [challenges, setChallenges] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  const challengeViewModel = React.useMemo(
    () => new ChallengeViewModel(userID, t, true),
    [userID, t, true]
  );

  React.useEffect(() => {
    let isUnmounted = false;

    setLoading(true);
    challengeViewModel
      .getNearestChallenges()
      .then((response) => {
        if (!isUnmounted) {
          challengeViewModel
            .formatActiveChallengesInfo(response.docs)
            .then((formatedResponse) => {
              setChallenges(formatedResponse);
            })
            .finally(() => setLoading(false));
        }
      })
      .catch((error) => {
        if (!isUnmounted) {
          console.log("Fetch error", error);
        }
      });
    return () => {
      isUnmounted = true;
    };
  }, [challengeViewModel]);

  const data = React.useMemo(
    () =>
      Array.isArray(challenges)
        ? challenges.filter((value) => {
          const isBranchValid = !value?.branchId || !branch || value?.branchId === branch;
          const isAcceptedOrNull = value.status == null || value.status == SENT_CHALLENGE_STATUSES.accepted
          return isBranchValid && isAcceptedOrNull
        })
        : [],
    [challenges, branch]
  );

  const pagesAmount = React.useMemo(() => ceil(data.length / pageLength), [
    data,
    pageLength,
  ]);

  const downPage = () => {
    setCurrentPage(currentPage === 1 ? pagesAmount : currentPage - 1);
  };

  const upPage = () => {
    setCurrentPage(currentPage === pagesAmount ? 1 : currentPage + 1);
  };

  return (
    <Col style={{ height: "100%" }}>
      <Card>
        <CardBody>
          <div className="card__title d-flex align-items-center justify-content-between">
            <h5 className="bold-text text-left challenge-title">
              {t("challenge.active_challenges")}
            </h5>
          </div>
          {!loading ? (
            <>
              <div className="text-center">
                {data.length > 0 ? (
                  data
                    .slice(
                      (currentPage - 1) * pageLength,
                      currentPage * pageLength
                    )
                    ?.map((challenge) => {
                      return (
                        <ChallengePreviewCard
                          challenge={challenge}
                          key={challenge.id}
                          chartHeight={200}
                        />
                      );
                    })
                ) : (
                  <span>{t("challenge.no_active")}</span>
                )}
              </div>
              {pagesAmount > 1 ? (
                <div className="d-flex justify-content-center">
                  <Button onClick={downPage} size="sm">
                    {"<"}
                  </Button>
                  <Button onClick={upPage} size="sm">
                    {">"}
                  </Button>
                </div>
              ) : (
                <div />
              )}
            </>
          ) : (
            <PreviewsSkeleton />
          )}
        </CardBody>
      </Card>
    </Col>
  );
}
