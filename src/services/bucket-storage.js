import { storage } from "containers/firebase";

export const uploadImage = (image, imagePath) => {
  return storage.ref(imagePath).put(image);
};
  
export const generatedDownloadUrl = (imagePath, imageName) => {
  return storage.ref(imagePath).child(imageName).getDownloadURL();
}

export const generatedFullImagePath = (imagePath, imageName) => {
  return `https://storage.googleapis.com/${process.env.REACT_APP_FIREBASE_STORAGE_BUCKET}/${imagePath}${imageName}`
}