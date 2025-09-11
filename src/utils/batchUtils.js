import { writeBatch } from "firebase/firestore";

const range = (from, to) => {
  const arrSize = to - from;
  const arr = new Array(arrSize).fill(from);

  return arr.reduce((acc, next, idx) => acc.concat(next + idx), []);
};

function defaultOnBatch(batch) {
  return batch.commit();
}

async function batchLimitParallel({
  firestore,
  limit = 500,
  onEach = (item, batch) => item,
  onBatch = defaultOnBatch,
  items,
}) {
  const numBatches = Math.ceil(items.length / limit);

  return Promise.all(
    range(0, numBatches).map(async (index) => {
      const batch = writeBatch(firestore); // Modular
      const batchItems = items.slice(index * limit, (index + 1) * limit);

      await Promise.all(batchItems.map((item) => onEach(item, batch)));
      return onBatch(batch);
    })
  );
}

const batchUtils = { batchLimitParallel, range };

export default batchUtils;
