/* eslint-disable prefer-destructuring */
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardBody, Col } from "reactstrap";
import { withTranslation } from "react-i18next";
import { Avatar } from "@material-ui/core";
import { storage } from "../../../../firebase";
import PencilAddOutlineIcon from "mdi-react/PencilAddOutlineIcon";
import { setDetails } from "../../../../../redux/actions/authAction";
import { useDispatch } from "react-redux";
import Loading from "../../../../../assets/images/loading.gif";
import RegisterViewModel from "../../../../Account/Register/Organisation/components/RegisterViewModel";
import { getOrganizationById } from "services/organizations";

const ProfileMain = ({ userData, t, setImageAsUrl }) => {
  const [_, setImage] = useState(null);
  const [orgInviteCode, setOrgInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  // Initialize RegisterViewModel once
  const registerViewModel = useMemo(() => new RegisterViewModel(), []);

  // Update the profile image
  const updateProfileImage = (context) => {
    const img = context.target.files[0];
    setImage(img);
    setIsLoading(true);

    if (img) {
      const uploadTask = storage.ref(`/images/${img.name}`).put(img);

      uploadTask.on(
        "state_changed",
        (snapShot) => {
          if (snapShot.state === "running") {
            setIsLoading(true);
          }
        },
        (err) => {
          console.log("Uploading", err);
        },
        () => {
          storage
            .ref("images")
            .child(img.name)
            .getDownloadURL()
            .then((fireBaseUrl) => {
              setImageAsUrl({ imgUrl: fireBaseUrl });
              dispatch(setDetails({ ...userData, logoUrl: fireBaseUrl }));
              setIsLoading(false);
            });
        }
      );
    }
  };

  useEffect(() => {
    const fetchInviteCode = async () => {
      const defaultOrgId = await registerViewModel.getDefaultOrganization(userData.id);

      const orgData = await getOrganizationById(defaultOrgId);


      const inviteCode = orgData.inviteCode;
      setOrgInviteCode(inviteCode);

    };

    fetchInviteCode();
  }, [userData.id, registerViewModel]);

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
                />
              ) : (
                <>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    id="avatar"
                    onChange={(e) => updateProfileImage(e)}
                  />
                  <label htmlFor="avatar">
                    {userData.logoUrl ? (
                      <Avatar
                        style={{ width: 80, height: 80, cursor: "pointer" }}
                        alt={userData.name}
                        src={userData.logoUrl}
                      />
                    ) : (
                      <Avatar
                        style={{ width: 80, height: 80, cursor: "pointer" }}
                      >
                        {userData.name.charAt(0)}
                      </Avatar>
                    )}
                    <PencilAddOutlineIcon
                      color="#ffffff"
                      className="profile__editIcon"
                    />
                  </label>
                </>
              )}
              <p className="profile__name">{userData.name}</p>
              <p className="profile__contact">{userData.email}</p>
            </div>
            <div>
              <p className="profile__name">
                {t("account.profile.invite_code")}:
              </p>
              <p className="profile__contact">
                {orgInviteCode
                  ? orgInviteCode
                  : t("account.profile.no_invite_code")}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default withTranslation("common")(ProfileMain);
