import axios from "axios";
import { auth, firestore } from "containers/firebase";
import { COLLECTION } from "shared/strings/firebase";

const { REACT_APP_CLOUD_FUNCTION_API_URL } = process.env;

export const addCloudTask = async (task) => {
  if (!task) {
    throw Error("task is required");
  }
  const token = await auth.currentUser.getIdToken();
  axios.post(`${REACT_APP_CLOUD_FUNCTION_API_URL}/cloudTasksApi`, task, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

};

export const sendEmail = ({ subject, html, from, bcc, replyTo, headers }) => {
  const emailNotification = {
    message: {
      subject,
      html,
    },
    from,
    bcc,
    replyTo,
    headers,
  };

  firestore.collection(COLLECTION.Mail).add(emailNotification);
};
