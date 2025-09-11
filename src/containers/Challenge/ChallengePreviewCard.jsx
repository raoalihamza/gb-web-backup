import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import WalkIcon from "mdi-react/WalkIcon";
import WeatherThunderIcon from "mdi-react/LightningBoltIcon";
import { Link } from "react-router-dom";

import PieChart from "../../shared/components/PieChart";
import { formatDateTranslated, getDateDifference } from "../../utils";
import { routes } from "../App/Router";
import LogoController from '../../components/logos/logoController'
import tableFunctions from "shared/other/tableFunctions";
import { useSelector } from "react-redux";
import ExportXLSX from "shared/components/Excel/ExportXLSX";
import { isUserOrganisationSelector } from "redux/selectors/user";

export default function ChallengePreviewCard({
  challenge,
  chartHeight = 100,
  withExportLeaderboard = false,
  leaderboardUsers,
}) {
  const [t, i18next] = useTranslation("common");
  const branches = useSelector((state) => state.branch?.branches);
  const isOrganisation = useSelector(isUserOrganisationSelector);

  const routeToChallenge = isOrganisation ? routes.organisation : routes.city;
  const [formatUsersListTableDataForCSV, setFormatUsersListTableDataForCSV] = useState([])

  const goals = challenge?.personalChallenge || {};
  const mainGoalKey = goals.challengeType;
  const mainGoal =
    mainGoalKey === "distance"
      ? goals?.challengeGoal / 1000
      : goals.challengeGoal;

  const currentMainGoalProgress = goals?.challengeValue || 0;
  const percentage = useMemo(() => (value) => ((value / mainGoal) * 100).toFixed(2), [mainGoal]);
  const remainingMainGoal =
    +mainGoal - currentMainGoalProgress > 0
      ? +mainGoal - currentMainGoalProgress
      : 0;

  const data = useMemo(
    () => [
      {
        name: t("global.progress"),
        value: +currentMainGoalProgress,
        fill: "#f6da6e",
      },
      { name: t("global.remaining"), value: +remainingMainGoal, fill: "#eeeeee" },
    ],
    [currentMainGoalProgress, remainingMainGoal, t]
  );

  const goalTooltip = useCallback(
    (props) => {
      let payload = "";
      if (props.payload.length === 0) {
        payload = "";
      } else {
        payload = props.payload[0];
      }
      return (
        <Card
          className="px-1 py-1"
          style={{
            backgroundColor: "white",
            borderColor: "gray",
            borderWidth: "thin",
            borderStyle: "solid",
          }}
        >
          <span>
            {payload?.nameFrench}: {payload?.value} {t(`challenge_goals.units.${mainGoalKey}`)}
          </span>
          <span style={{ color: "gray" }}>({percentage(payload?.value)}%)</span>
        </Card>
      );
    },
    [mainGoalKey, percentage, t]
  );
  const now = useMemo(() => new Date(), []);
  const startDate = useMemo(() => challenge?.startAt?.toDate() || now, [challenge?.startAt, now]);
  const endDate = useMemo(() => challenge?.endAt?.toDate() || now, [challenge?.endAt, now]);

  const totalChallengeDays = useMemo(
    () =>
      getDateDifference({
        startDate: startDate,
        endDate: endDate,
      }) + 1,
    [endDate, startDate]
  );

  const daysPassed = useMemo(
    () =>
      getDateDifference({
        startDate: startDate,
        endDate: now,
      }),
    [now, startDate]
  );

  const daysRemaining = totalChallengeDays - daysPassed;
  const dataDays = useMemo(
    () =>
      typeof totalChallengeDays === "number" && !Number.isNaN(totalChallengeDays) && totalChallengeDays >= 0
        ? new Array(totalChallengeDays).fill("#eeeeee").map((item, index) => ({
          value: 1 / totalChallengeDays,
          fill: index > daysPassed ? item : index >= daysPassed ? "#bef4e5" : "#4ce1b6",
        }))
        : [{ value: 0, fill: "#eeeeee" }],
    [daysPassed, totalChallengeDays]
  );

  useEffect(() => {
    const transportModes = Object.keys(i18next.store.data.en.common.modeOfTransport);
    const usersData = Object.values(leaderboardUsers || {});
    tableFunctions.getUsersListCSVData(usersData || [], transportModes, branches || {}, t,
      { isOrganisation: isOrganisation },
      {
        filterByObject: {
          ownerType: isOrganisation ? 'organisation' : 'city',
        },
      }).then((csvData) => {
        setFormatUsersListTableDataForCSV(csvData);
      });
  }, [branches, i18next.store.data.en.common.modeOfTransport, leaderboardUsers, t]);

  const usersListTableDescriptionDataForCSV = useMemo(() => tableFunctions.getUsersListTableDescriptionDataForCSV(t), [
    t,
  ]);
  const usersTableCustomColumns = useMemo(() => tableFunctions.getUsersTableCustomColumns(t), [t]);

  return (
    <CardBody
      className="dashboard__health-chart dashboard__health-chart-card"
      key={challenge?.id}
      style={{
        padding: "1rem 1.5rem",
      }}
    >
      <div>
        {challenge.logoUrl ?
          <img
            src={challenge.logoUrl}
            alt="challenge.img"
            style={{
              maxWidth: "100%",
              height: "5rem",
              marginRight: "0.5rem",

              objectFit: "contain",
            }}
          />
          : <LogoController />
        }

      </div>

      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <p className="bold-text text-left">{challenge?.nameFrench}</p>
        </div>
        <Link to={routeToChallenge.challengeInfo.replace(":id", challenge?.id)}>
          <span className="bold-text text-left m-0">{t("global.SeeDetails")}</span>
        </Link>
      </div>
      {withExportLeaderboard && Object.keys(leaderboardUsers || {}).length > 0 && (
        <div className="d-flex align-items-center justify-content-center mt-2">
          <ExportXLSX
            element={
              <button type="button" className="p-1 m-0 bold-text export-to-csv text-white">
                {t("global.exportToCSV")}
              </button>
            }
            sheet1Data={formatUsersListTableDataForCSV}
            sheet2Data={usersListTableDescriptionDataForCSV}
            sheet1Title={t("global.leaderboard")}
            sheet2Title={t("global.description_of_data")}
            filename="challenge-leaderboard"
            customColumnsSheet1={usersTableCustomColumns}
          />
        </div>
      )}
      <div className="d-flex align-items-center justify-content-between pt-2 pb-3">
        <p className="bold-text text-left">
          {t(`challenge.goal_type`)} : {t(`challenge_goals.placeholder.${mainGoalKey}`)}
        </p>
        <p className="bold-text text-left m-0">
          {formatDateTranslated(startDate, t)} - {formatDateTranslated(endDate, t)}
        </p>
      </div>

      <div className="d-flex mt-2">
        <div className="position-relative w-50">
          <span className="text-center">{t(`challenge_goals.${mainGoalKey}`)}</span>
          <div className="dashboard__health-chart-info-challenges">
            <WeatherThunderIcon style={{ fill: "#f6da6e" }} size={15} />
            <p className="dashboard__health-chart-number-challenges">{remainingMainGoal.toFixed(2)}</p>
            <p className="dashboard__health-chart-units">
              {t(`challenge_goals.units.${mainGoalKey}`)}
            </p>
          </div>
          <PieChart height={chartHeight} data={data} haveTooltip customTooltip={goalTooltip} />
        </div>

        <div className="position-relative w-50">
          <span className="text-center">{t("global.daysToGo")}</span>
          <PieChart height={chartHeight} data={dataDays} />
          <div className="dashboard__health-chart-info-challenges ">
            <WalkIcon style={{ fill: "#4ce1b6" }} size={15} />
            <p className="dashboard__health-chart-number-challenges">
              {daysRemaining < 1 ? t("global.ended") : daysRemaining}
            </p>
            <p className="dashboard__health-chart-units">
              {t(`challenge_goals.units.days`)} {t("challenge_goals.left")}
            </p>
          </div>
        </div>
      </div>
    </CardBody>
  );
}

ChallengePreviewCard.defaultProps = {
  challenge: {
    data: () => null,
  },
};

ChallengePreviewCard.propTypes = {
  challenge: PropTypes.shape({
    data: PropTypes.func,
  }),
};
