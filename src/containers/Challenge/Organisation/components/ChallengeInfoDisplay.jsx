import React from "react";
import { Col, Row, Card, CardBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import WalkIcon from "mdi-react/WalkIcon";

import PieChart from "../../../../shared/components/PieChart";
import {
  formatListTranslated,
  formatDateTranslated,
  getDateDifference,
} from "../../../../utils";


export default function ChallengeInfoDisplay({
  challengeInfo,
  targets,
  orgTargets,
}) {
  const [t] = useTranslation("common");

  const now = new Date();
  const startDate = challengeInfo?.startDate || now;
  const endDate = challengeInfo?.endDate || now;

  const totalChallengeDays =
    getDateDifference({
      startDate: startDate,
      endDate: endDate,
    }) + 1;
  const daysPassed = getDateDifference({
    startDate: startDate,
    endDate: now,
  });

  const daysRemaining = totalChallengeDays - daysPassed;

  const challengeType = (challengeInfo?.individualGoals || challengeInfo?.individualGoals || [])[0]?.select?.value || {};

  let challengeRemainingTime;
  if (daysRemaining > 0) {
    challengeRemainingTime = t("localekeys.days_before_end");
    // text : '{tr(stringKey )}'
  } else if (daysRemaining === 0) {
    challengeRemainingTime = t("localekeys.ending_today");
  } else if (daysRemaining < 0) {
    challengeRemainingTime = ""
  } else {
    challengeRemainingTime = t("localekeys.not_started_yet");
  }

  let challengeTypeLabel;
  if ((challengeInfo?.individualGoals || challengeInfo?.individualGoals || [])[0]?.select.valuePlus === "sessionCount") {
    challengeTypeLabel = t("challenge_goals.placeholder.sessionCount");
  } else if ((challengeInfo?.individualGoals || challengeInfo?.individualGoals || [])[0]?.select.valuePlus === "time") {
    challengeTypeLabel = t("challenge_goals.placeholder.time");
  } else if ((challengeInfo?.individualGoals || challengeInfo?.individualGoals || [])[0]?.select.valuePlus === "ghg") {
    challengeTypeLabel = t("challenge_goals.placeholder.ghg");
  } else if (
    (challengeInfo?.individualGoals || challengeInfo?.individualGoals || [])[0]?.select.valuePlus === "distance"
  ) {
    challengeTypeLabel = t("challenge_goals.placeholder.distance");
  } else {
    challengeTypeLabel = t("challenge_goals.placeholder.calories");
  }


  const dataDays =
    typeof totalChallengeDays === "number" &&
      !Number.isNaN(totalChallengeDays) &&
      totalChallengeDays >= 0
      ? new Array(totalChallengeDays).fill("#eeeeee").map((item, index) => ({
        value: 1 / totalChallengeDays,
        fill:
          index > daysPassed
            ? item
            : index >= daysPassed
              ? "#bef4e5"
              : "#4ce1b6",
      }))
      : [{ value: 0, fill: "#eeeeee" }];

  const challengeImg = challengeInfo?.ChallengeImage
    ? challengeInfo?.ChallengeImage
    : `https://greenplay.social/wp-content/uploads/2022/01/quart_commercants@3x-e1642459818493.png`;

  return (
    <Card>
      <CardBody>
        {challengeInfo ? (
          <Row>
            <Col md={12}>
              {/* Section where image will go */}
              <div>
                <img
                  src={challengeImg}
                  alt="challengeImage"
                  style={{
                    backgroundImage: `url(https://greenplay.social/wp-content/uploads/2022/05/background2.jpg)`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    width: "100%",
                    height: "40vh",
                    objectFit: "contain",
                    border: "1px solid #ccc",
                    borderRadius: "20px",
                  }}
                />
              </div>
              <Row>
                <Col md={6} lg={8}>
                  <Row>
                    <span className="mx-4 my-2">
                      <b>{t("challenge.period")}</b>
                      {`: ${t("challenge.from_period")} ${formatDateTranslated(
                        challengeInfo?.startDate,
                        t
                      )}` +
                        ` ${t("challenge.to_period")} ${formatDateTranslated(
                          challengeInfo?.endDate,
                          t
                        )}`}
                    </span>
                  </Row>
                  <Row>
                    <span className="mx-4 my-2">
                      <b>{t("challenge.activity_type")}</b>:{" "}
                      {formatListTranslated(
                        challengeInfo?.activityType?.map((item) => item.label),
                        t
                      )}
                    </span>
                  </Row>
                  <Row>
                    <span className="mx-4 my-2">
                      <b>{t("challenge.reward")}</b>:{" "}
                      {challengeInfo?.reward || 0} {t("challenge.points")}
                    </span>
                  </Row>
                  <Row>
                    {challengeInfo?.Branch?.label ? (
                      <span className="mx-4 my-2">
                        <b>{t("branch.name")}</b>:{" "}
                        {challengeInfo?.Branch?.label}
                      </span>
                    ) : null}
                  </Row>
                  <Row>
                    <span className="mx-4 my-2">
                      <b>{t("challenge.description")}</b>:{" "}
                      {challengeInfo?.descriptionFrench}
                    </span>
                  </Row>
                  <Row>
                    <span className="mx-4 my-2">
                      <b>{t("challenge.individual_goals")}</b>:
                    </span>

                    {

                      (challengeType != undefined && targets != undefined) ? (
                        <p>
                          {targets}{" "}
                          {t(`challenge_goals.placeholder.${challengeType}`)}
                        </p>
                      )
                        : (
                          <p>{t("challenge_goals.no_goals")}</p>
                        )}
                  </Row>
                </Col>
                <Col md={6} lg={4} className="text-center">
                  <div className="position-relative">
                    <span className="text-center">{t("global.daysToGo")}</span>
                    <PieChart height={120} data={dataDays} />
                    <div className="health-chart-info-challenges">
                      <WalkIcon style={{ fill: "#4ce1b6" }} size={15} />
                      <p className="health-chart-number-challenges">
                        {daysRemaining >= 0 ? daysRemaining : t("global.ended")}
                      </p>
                      {/* <p className="health-chart-units">
                        {daysRemaining > 0
                          ? t(`challenge_goals.units.days`)
                          : " "}
                      </p> */}
                    </div>
                    <p className="health-chart-units">{challengeRemainingTime}</p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        ) : null}
      </CardBody>
    </Card>
  );
}
