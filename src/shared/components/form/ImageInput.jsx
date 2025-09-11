/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FileUploader } from "react-drag-drop-files";
import { ButtonToolbar } from "reactstrap";
import { storage } from "../../../containers/firebase";
import { useSelector } from "react-redux";
import { withTranslation } from "react-i18next";
import PencilAddOutlineIcon from "mdi-react/PencilAddOutlineIcon";
import LoadingGIF from "../../../assets/images/loading.gif";

const FileInputField = (props) => {
  const fileTypes = ["JPG", "PNG", "JPEG"];
  const { name, onChange, t } = props;
  // const { file } = this.state;
  const { ChallengeImage, ChallengeImageName } = props.locale;
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageName, setImageName] = React.useState("");
  const [file, setFile] = React.useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ChallengeImage?.imageUrl) {
      setImageUrl(ChallengeImage.imageUrl);
      setImageName(ChallengeImage.name);
    } else if (ChallengeImage) {
      setImageUrl(ChallengeImage);
      setImageName(ChallengeImageName);
    }
  }, [ChallengeImage, ChallengeImageName]);

  const handleChange = (file) => {
    setFile(file[0]);
    setLoading(true);

    const uploadTask = storage.ref(`/images/${file.name}`).put(file);
    //initiates the firebase side uploading
    uploadTask.on(
      "state_changed",
      (snapShot) => {
        //takes a snap shot of the process as it is happening

      },
      (err) => {
        //catches the errors
        console.log("Uploading", err);
      },
      async () => {
        // gets the functions from storage refrences the image storage in firebase by the children
        // gets the download url then sets the image from firebase as the value for the imgUrl key:
        await storage
          .ref("images")
          .child(file.name)
          .getDownloadURL()
          .then((url) => {
            setImageName(file.name);
            setImageUrl(url);
            //this.setState({ imageUrl: url, imageName: file.name });
            onChange({ imageUrl: url, name: file.name });
            setLoading(false);
          });
      }
    );
  };

  return (
    <div className="mb-3">
      <label htmlFor={name}>{t("challenge.choose_file")}</label>
      {loading ? (
        <img
          src={LoadingGIF}
          alt="loading"
          style={{ width: "200px", height: "200px" }}
        />
      ) : (
        <ButtonToolbar className="form__button-toolbar col-md-12 p-0 mt-0 d-flex align-items-center justify-content-between">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt="challengeimage"
                style={{
                  width: "400px",
                  height: "100px",
                  backgroundImage:
                    "url(https://greenplay.social/wp-content/uploads/2022/05/background2.jpg)",
                  objectFit: "contain",
                  objectPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",

                  border: "1px solid rgb(204, 204, 204)",
                  borderRadius: "20px",
                }}
              />
              <input
                type="file"
                style={{ display: "none" }}
                id="challenge_image"
                onChange={(e) => handleChange(e.target.files[0])}
              />
              <label htmlFor="challenge_image">
                <PencilAddOutlineIcon
                  color="#ffffff"
                  style={{
                    backgroundColor: "#4ce1b6",
                    borderRadius: "50%",
                    padding: "2px",
                    position: "absolute",
                    left: "380px",
                    top: "80px",
                    cursor: "pointer",
                  }}
                />
              </label>
            </>
          ) : (
            <FileUploader
              name={name}
              id={name}
              label={t("challenge.file_label")}
              handleChange={handleChange}
              types={fileTypes}
            />
          )}

          {/* <img src={this.state.imageUrl} alt="challenge pic" /> */}
          <p>
            {imageName
              ? `${t("challenge.file_name")}: ${imageName}`
              : t("challenge.no_image")}
          </p>
        </ButtonToolbar>
      )}
    </div>
  );
};

const RenderImageUploadField = (props) => {
  const locale = useSelector((state) => state.form.challenge_form.values);
  const { input, meta, t } = props;

  return (
    <div className="form__form-group-input-wrap mb-5">
      <FileInputField {...input} t={t} locale={locale} />
      {meta.touched && meta.error && (
        <span className="form__form-group-error">{meta.error}</span>
      )}
    </div>
  );
};

RenderImageUploadField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string,
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }),
};

RenderImageUploadField.defaultProps = {
  meta: null,
};

FileInputField.propTypes = {
  handleImageChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.shape({
      name: PropTypes.string,
    }),
    PropTypes.string,
  ]),
};

FileInputField.defaultProps = {
  value: null,
};

export default withTranslation("common")(RenderImageUploadField);
