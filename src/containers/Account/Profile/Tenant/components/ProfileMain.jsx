/* eslint-disable prefer-destructuring */
import React, { useState } from "react";
import { Card, CardBody, Col } from "reactstrap";
import { withTranslation } from "react-i18next";
import { Avatar } from "@material-ui/core";
import { storage } from "../../../../firebase";
// import Icon from "@mdi/react";
// import { mdiPencilOutline } from "@mdi/js";
import PencilAddOutlineIcon from "mdi-react/PencilAddOutlineIcon";
import { setDetails } from "../../../../../redux/actions/authAction";
import { useDispatch } from "react-redux";
import Loading from "../../../../../assets/images/loading.gif";

const ProfileMain = ({ userData, t, setImageAsUrl, disabled, isAdmin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const updateProfileImage = (context) => {
    const img = context.target.files[0];
    //setImage((imageFile) => img);
    setIsLoading(true);
    //After selecting the image, we need to upload it to firebase storage
    if (img) {
      const uploadTask = storage.ref(`/images/${img.name}`).put(img);
      //initiates the firebase side uploading
      uploadTask.on(
        "state_changed",
        (snapShot) => {

          if (snapShot.state === "running") {
            setIsLoading(true);
          }
        },
        (err) => {
          //catches the errors
          console.log("Uploading", err);
        },
        () => {
          // gets the functions from storage refrences the image storage in firebase by the children
          // gets the download url then sets the image from firebase as the value for the imgUrl key:
          storage
            .ref("images")
            .child(img.name)
            .getDownloadURL()
            .then((fireBaseUrl) => {
              //setting image from firebase as the value for our imgUrl key
              setImageAsUrl(() => ({
                imgUrl: fireBaseUrl,
              }));

              //dispatch event to update the profile image
              if(!isAdmin) {
                dispatch(setDetails({ ...userData, logoUrl: fireBaseUrl }));
              }
              //show the image after successfully uploading
              setIsLoading(false);

            });
        }
      );
    }
  };

  return (
    <Col md={12} lg={12} xl={12}>
      <Card>
        <CardBody className="profile__card">
          <div className="profile__information">
            <div className="profile__data">
              {isLoading ? (
                <Avatar
                  style={{ width: 80, height: 80, cursor: "pointer" }}
                  alt="loading"
                  src={Loading}
                  // src={Config.API_URL + userData.imgUrl}
                />
              ) : (
                <>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    id="avatar"
                    onChange={(e) => updateProfileImage(e)}
                    disabled={disabled}
                  />
                  <label htmlFor="avatar">
                    {userData.logoUrl ? (
                      <img src={userData.logoUrl} alt={userData.name} />
                    ) : (
                      <Avatar
                        style={{ width: 80, height: 80, cursor: disabled ? 'auto' : "pointer" }}
                      >
                        {(userData.name || userData.tenantName).charAt(0)}
                      </Avatar>
                    )}

                    <PencilAddOutlineIcon
                      color="#ffffff"
                      className="profile__editIcon"
                      size={40}  
                      style={{ cursor: disabled ? 'auto' : "pointer" }}
                    />
                  </label>
                </>
              )}
              <p className="profile__name">{userData.name}</p>
              <p className="profile__contact">{userData.email}</p>
              <p className="profile__name">{t("account.profile.emailContact")}</p>
              <p className="profile__contact">{userData.emailContact}</p>
            </div>
            
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default withTranslation("common")(ProfileMain);
