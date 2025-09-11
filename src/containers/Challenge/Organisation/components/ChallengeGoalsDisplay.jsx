import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { useTranslation } from "react-i18next";
import WeatherThunderIcon from "mdi-react/LightningBoltIcon";

import PieChart from "../../../../shared/components/PieChart";

export default function ChallengeGoalsDisplay({
  targets,
  challengeStats,
}) {
  const [t] = useTranslation("common");
  return (
    <Row>
      {typeof targets === "object"
        ? Object.keys(targets)?.map((goalKey, idx) => {
            if (goalKey === "mainTarget") {
              return null;
            }
        
            const goal = targets[goalKey] || 0;

            const currentGoalProgress = challengeStats[goalKey] || 0;
            const percentage = (value) => ((value / goal) * 100).toFixed(2);
            const remainingGoal =
              goal - currentGoalProgress > 0 ? goal - currentGoalProgress : 0;
            const data = [
              {
                name: t("global.progress"),
                value: currentGoalProgress,
                fill: "#f6da6e",
              },
              {
                name: t("global.remaining"),
                value: remainingGoal,
                fill: "#eeeeee",
              },
            ];
            const customTooltip = (props) => {
              const payload = props.payload?.at(0);
              return (
                <Card
                  className="px-1 py-1"
                  style={{
                    "backgroundColor": "white",
                    "borderColor": "gray",
                    "borderWidth": "thin",
                    "borderStyle": "solid",
                  }}
                >
                  <span>
                    {payload?.name}: {payload?.value}{" "}
                    {t(`challenge_goals.units.${goalKey}`)}
                  </span>
                  <span style={{ color: "gray" }}>
                    ({percentage(payload?.value)}%)
                  </span>
                </Card>
              );
            };

            return (
              <Col md={6} lg={6} key={idx}>
                <Card>
                  <CardBody className="text-center">
                    <div className="d-flex justify-content-between">
                      {targets[goalKey] ? (
                        <span>
                          {t(`challenge.individual_goal`)}: {targets[goalKey]}
                        </span>
                      ) : null}
                    </div>
                    <div className="position-relative">
                      <span className="text-center">
                        {t(`challenge_goals.${goalKey}`)}
                      </span>
                      <div className="health-chart-info-challenges">
                        <WeatherThunderIcon
                          style={{ fill: "#f6da6e" }}
                          size={15}
                        />
                        <p className="health-chart-number-challenges">
                          {currentGoalProgress} / {goal}
                        </p>
                        <p className="health-chart-units">
                          {t(`challenge_goals.units.${goalKey}`)}
                        </p>
                      </div>
                      {/* <PieChart
                        height={140}
                        data={data}
                        haveTooltip
                        customTooltip={customTooltip}
                      /> */}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })
        : null}
    </Row>
  );
}
