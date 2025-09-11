import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

import { COLLECTION } from "../shared/strings/firebase";
import { setUserOfflineStatus, setUserOnlineStatus } from "services/users";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_MESSAGING_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

firebase.initializeApp(config);

export const firebaseInstance = firebase;
// Incase we want to use explicitly
export const firestore = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage();
auth.useDeviceLanguage();
//firestore.settings({ experimentalAutoDetectLongPolling: true });
// firestore.useEmulator("localhost", 9292);

// All firebase functions should be encapsulated within this class

const onVisibilityChangeCallback = (uid) => (ev) => {
  ev.preventDefault();
  ev.stopPropagation();
  if (window.document?.visibilityState === "visible") {
    setUserOnlineStatus(uid);
    return;
  } 
    setUserOfflineStatus(uid);
  
};
export class Firebase {
  _onVisibilityChangeCallback;
  constructor() {
    this.firebase = firebase;
    this.firestore = firestore;
    this.auth = auth;
    // if (document.location.hostname === "localhost") {
    // 	this.firestore.settings({ host: "localhost:8080", ssl: false });
    // 	this.auth.useEmulator("http://localhost:9099");
    // }
  }

  // Auth State Change from firebase auth
  // @param callback: Function = function to call on auth change
  _onAuthStateChanged(callback = () => null) {
    return this.auth.onAuthStateChanged(callback);
  }

  // Find document with custom where
  // @param collection:String = Collection name
  // @param where:Any = Custom where clause
  _findDoc(collection, where) {
    return this.firestore
      .collection(collection)
      .where(...where)
      .get();
  }

  // Find document by document ID
  // @param collection:String = Collection name
  // @param docId:String = Document ID
  _findDocById(collection, docId) {
    return this.firestore.collection(collection).doc(docId).get();
  }

  // Find docs in Organisation with the given email
  // @param email: String = email to identify
  _findOrganisationByEmail(email) {
    return this._findDoc(COLLECTION.Organisations, ["email", "==", email]);
  }

  _findCityByEmail(email) {
    return this._findDoc(COLLECTION.Cities, ["email", "==", email]);
  }

  _findById(collection, uid) {
    return this._findDoc(collection, ["id", "==", uid]);
  }

  _updateLastSignInIfExternal(uid) {
    return this._findById(COLLECTION.externalUsers, uid).then(async (external) => {
      if (!external.empty) {
        external.docs[0].ref.update({ lastSignIn: this.firebase.firestore.Timestamp.now() });
      }
    });
  }
  // SignOut current user
  _signOut() {
    return this.auth.signOut();
  }

  _resetPassword(email) {
    return this.auth.sendPasswordResetEmail(email);
  }

  _stopTrackingOnlineStatus(uid) {
    if (uid) {
      setUserOfflineStatus(uid);
    }

    if (this._onVisibilityChangeCallback) {
      window.document.removeEventListener("visibilitychange", this._onVisibilityChangeCallback);
      window.document.removeEventListener("beforeunload", this._onVisibilityChangeCallback);
    }

    this.firebase.database().ref(".info/connected").off("value");
  }

  _startTrackingOnlineStatus(uid) {
    const connectedRef = this.firebase.database().ref(".info/connected");

    this._onVisibilityChangeCallback = onVisibilityChangeCallback(uid);
    window.document.addEventListener("visibilitychange", this._onVisibilityChangeCallback);
    window.document.addEventListener("beforeunload", this._onVisibilityChangeCallback);

    connectedRef.on("value", async (snapshot) => {
      if (snapshot.val() === true) {
        setUserOnlineStatus(uid);
      } else {
        setUserOfflineStatus(uid);
      }
    });
  }
}

export default firebase;
