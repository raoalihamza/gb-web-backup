
import React, { useState } from "react";
import { Card, CardBody, Col } from "reactstrap";
import { useTranslation } from "react-i18next";
import { Avatar } from "@material-ui/core";
import { useDispatch } from "react-redux";
import styled from 'styled-components';
import { storage } from "../../containers/firebase";
import CardBox from "atomicComponents/CardBox";

import PencilAddOutlineIcon from "mdi-react/PencilAddOutlineIcon";
import { setDetails } from "../../redux/actions/authAction";
import Loading from "../../assets/images/loading.gif";

const ProfileData = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const ProfileName = styled.div`
  font-weight: 600;
`
const ProfileMain = ({ userData, isEdit, isFullProfile, setImageAsUrl }) => {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const updateProfileImage = (context) => {
    const img = context.target.files[0];
    setIsLoading(true);
    //After selecting the image, we need to upload it to firebase storage
    if (img) {
      const uploadTask = storage.ref(`/images/${img.name}`).put(img);
      //initiates the firebase side uploading
      uploadTask.on(
        "state_changed",
        (snapShot) => {
          //takes a snap shot of the process as it is happening

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
              dispatch(setDetails({ ...userData, logoUrl: fireBaseUrl }));
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
        <CardBox variant="outlined" padding="0">
          <CardBody className="profile__card">
            <div className="profile__information">
              <ProfileData>
                <div>
                  {isLoading ? (
                    <Avatar
                      style={{ width: 80, height: 80, cursor: "pointer" }}
                      alt="loading"
                      src={Loading}
                    // src={Config.API_URL + userData.imgUrl}
                    />
                  ) : (
                    <>
                      {isEdit && <input
                        type="file"
                        style={{ display: "none" }}
                        id="avatar"
                        onChange={(e) => updateProfileImage(e)}
                      />}
                      <label htmlFor="avatar">
                        {userData.logoUrl ? (
                          <img src={userData.logoUrl} alt={userData.name} />
                        ) : (
                          <Avatar
                            style={{ width: 80, height: 80, cursor: "pointer" }}
                          >
                            {userData?.firstName?.charAt(0)}
                          </Avatar>
                        )}

                        {isEdit && <PencilAddOutlineIcon
                          color="#ffffff"
                          className="profile__editIcon"
                          size={40}
                        />}
                      </label>
                    </>
                  )}
                </div>
                <div>
                  <ProfileName>{userData.firstName} {userData.lastName}</ProfileName>
                  <p className="profile__contact">{userData.email}</p>
                  {isFullProfile && <>
                    <p className="profile__name">{t("account.profile.emailContact")}</p>
                    <p className="profile__contact">{userData.emailContact}</p>
                    <div>
                      <p className="profile__name">
                        {t("account.profile.invite_code")}:
                      </p>
                      <p className="profile__contact">
                        {userData.inviteCode
                          ? userData.inviteCode
                          : t("account.profile.no_invite_code")}
                      </p>
                    </div>
                  </>
                  }

                </div>
              </ProfileData>
            </div>
          </CardBody>
        </CardBox>
      </Card>
    </Col>
  );
};

export default ProfileMain;
