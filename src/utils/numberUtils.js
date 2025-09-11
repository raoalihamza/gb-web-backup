const convertPriceToGreenpoints = (value) => {

  const numberValue = typeof(value) === 'number' ? value : Number(value.replace("$", ""));
  const greenPoints = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    numberValue * 100
  );

  return greenPoints;
};

const convertBytesToSize = (bytes) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "n/a";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i <= 1) {
    return {
      number: 0,
      string: `${bytes} ${sizes[i]}`,
    };
  }
  return {
    number: bytes / 1024 ** i,
    string: `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`,
  };
};

const normalizeNumber = (number, countOfDigits) => {
  if (!number || Number.isNaN(number)) {
    return 0;
  }
  return Number(number.toFixed(countOfDigits))
}

const sumArrayByKey = (items, sumKey) => {
  return normalizeNumber(items.reduce((acc, next) => acc + next[sumKey], 0));
}

const numberUtils = {
  convertPriceToGreenpoints,
  convertBytesToSize,
  normalizeNumber,
  sumArrayByKey
};

export default numberUtils;
