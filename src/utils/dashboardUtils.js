import numberUtils from "./numberUtils";

const countTotalGreenpoints = (data) => {
  const totalGreenponts = data.reduce((acc, next) => {
    return acc + next.totalGreenpoints;
  }, 0);

  return numberUtils.normalizeNumber(totalGreenponts, 0);
};

const dashboardUtils = {
  countTotalGreenpoints,
};

export default dashboardUtils;
