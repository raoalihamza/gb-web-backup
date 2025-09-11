import React, { useMemo } from "react";
import { withStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";
import ValueLabel from "@material-ui/core/Slider/ValueLabel";
import { CardBody, Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import CardBox from 'atomicComponents/CardBox';

const ScoreBar = withStyles((theme) => {
  return {
    root: {
      color: (props) => props.color,
      padding: "13px 0 30px",
      marginBottom: 0,
      marginTop: 35,
    },
    markLabel: {
      marginTop: 10,
      backgroundColor: "#fff",
      padding: 3,
      borderRadius: 5,
      "&:hover": {
        zIndex: 1000000000000,
      },
    },
    thumb: {
      "&.Mui-disabled": {
        height: 30,
        width: 2,
        backgroundColor: "#000",
        marginLeft: -1,
        marginTop: -5,
      },
      "& .MuiSlider-valueLabel": {
        width: 150,
        marginLeft: -35,
        marginTop: 20,
        textColor: "#000",
        fontSize: "0.85rem",
      },
    },
    active: {},
    track: {
      height: 20,
    },
    rail: {
      background:
        "linear-gradient(90deg, rgba(146,208,80,1) 0%, rgba(146,208,80,1) 50%, rgba(255,255,255,1) 50%, rgba(255,255,255,1) 100%);",
      opacity: 1,
      height: 20,
    },
  };
})(Slider);

const StyledValueLabel = withStyles({
  offset: {
    width: 150, // Height and Width should be equal
  },
  circle: {
    display: "inline",
    alignItems: "center",
    justifyContent: "center",
    width: 150, // Height and Width should be equal
    height: 30,
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "#fff",
    transform: "rotate(-45deg)",
  },
  label: {
    color: "black",
  },
})(ValueLabel);

const ComparisonScoreBar = ({ averageScore, myScore, title, averageScoreLabelTitle, barStyle = {}, isInAdvance }) => {
  const { t } = useTranslation("common");
  const color = myScore < averageScore ? "#FF0000" : "#00B0F0";

  const marks = useMemo(
    () => [
      {
        value: averageScore == null ? 0 : averageScore,
        label: `${averageScoreLabelTitle}: ${averageScore == null ? 0 : averageScore}`,
      },
    ],
    [averageScore, averageScoreLabelTitle]
  );
  if ((myScore || 0) == 0 && (averageScore || 0) == 0) {
    return <div></div>
  }
  return (
    <CardBox padding='0' style={{ marginBottom: "30px" }}>
      <CardBody className="dashboard__card-widget" >
        <div className="mobile-app-widget">
          <h5 className="bold-text text-left challenge-title">
            {title}
          </h5>
          <div style={{
            marginLeft: "auto",
            marginRight: "auto",
            width: "80%",
            padding: "10px"
          }}>
            <ScoreBar
              defaultValue={[100, 120]}
              value={[myScore, averageScore]}
              min={0}
              max={averageScore * 2}
              onChange={() => { }}
              style={{ color, ...barStyle }}
              disabled
              valueLabelDisplay="on"
              valueLabelFormat={(val) => val === averageScore ? '' : `${t("challenge.your_score")}: ${val || 0}`}
              ValueLabelComponent={StyledValueLabel}
              marks={marks}
            />

          </div>

          <div style={{
            marginLeft: "auto",
            marginRight: "auto",

          }}>{isInAdvance}</div>
        </div>
      </CardBody>
    </CardBox>
  );
};

export default ComparisonScoreBar;
