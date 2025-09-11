import React, { useMemo } from "react";
import styled from "styled-components";
import FavoriteIcon from "@material-ui/icons/Favorite";

const Ratings = styled.div`
  position: relative;
`;

const EmptyStarsWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const ColoredStarsWrapper = styled.div`
  position: absolute;
  display: flex;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
`;

const Star = styled(FavoriteIcon)`
  flex-shrink: 0;
  overflow: hidden;
  margin-right: 0px;
  color: ${({ fill }) => fill};
`;

const HealthBar = ({ health = 100, hearts = 5 }) => {
  const coloredRatingWidth = health + "%";

  const { EmptyStars, ColoredStars } = useMemo(() => {
    let emptyStarsList = [];
    let coloredStarsList = [];
    for (let i = 0; i < hearts; i++) {
      emptyStarsList.push(<Star key={i} fill="#bdbdbd" style={{maxHeight:"20px",maxWidth:"20px"}}/>);
      coloredStarsList.push(<Star key={i} fill="#ff3d47"style={{maxHeight:"20px",maxWidth:"20px"}}/>);
    }

    return {
      EmptyStars: () => emptyStarsList,
      ColoredStars: () => coloredStarsList,
    };
  }, [hearts]);

  return (
      <EmptyStarsWrapper aria-valuenow={health}>
        <EmptyStars />
        <ColoredStarsWrapper style={{ width: coloredRatingWidth }}>
          <ColoredStars />
        </ColoredStarsWrapper>
      </EmptyStarsWrapper>
  );
};

export default HealthBar;
