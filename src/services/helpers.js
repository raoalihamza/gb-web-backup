export const firestoreToArray = (snapshots) => {
  const data = [];

  snapshots.forEach((snap) => {
    data.push({ ...snap.data(), id: snap.id })
  });

  return data;
};

export const getFirestoreContentWhereFieldInArray = async ({ collectionRef, field, valuesToSearchIn = [] }) => {
  const batches = [];

  while (valuesToSearchIn.length) {
    // firestore limits batches to 10
    const batch = valuesToSearchIn.splice(0, 10);

    // add the batch request to to a queue
    batches.push(
      collectionRef
        .where(field, "in", [...batch])
        .get()
        .then(firestoreToArray)
    );
  }

  return Promise.all(batches).then((content) => content.flat());
};
