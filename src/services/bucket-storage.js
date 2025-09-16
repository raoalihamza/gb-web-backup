import { firestore, storage } from "containers/firebase";

export const uploadImage = (image, imagePath) => {
  return storage.ref(imagePath).put(image);
};
  
export const generatedDownloadUrl = (imagePath, imageName) => {
  return storage.ref(imagePath).child(imageName).getDownloadURL();
}

export const generatedFullImagePath = (imagePath, imageName) => {
  return `https://storage.googleapis.com/${import.meta.env.VITE__FIREBASE_STORAGE_BUCKET}/${imagePath}${imageName}`
}

export const uploadImagesAndTransformToData = ({images, path = 'default-images-storage-path/'}) => {
  if (!images) return [];

  const imagesRes = images.map(async (img, idx) => {
    const doc = firestore.collection('generated_id').doc();
    const imagePath = path;
    const imageName = doc.id;

    await uploadImage(img, `${imagePath}${imageName}`);

    const fireBaseUrl = await generatedDownloadUrl(imagePath, imageName);
    const storagePath = generatedFullImagePath(imagePath, imageName);

    return {
      path: storagePath,
      order: idx + 1,
      originUrl: fireBaseUrl,
      thumbnailUrl: "",
      isMain: idx === 0,
      id: imageName,
    };
  });

  return Promise.all(imagesRes);
};