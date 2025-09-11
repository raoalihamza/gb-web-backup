/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { storage } from "../../../containers/firebase";
import Logo from '../../../assets/images/logo/logo.png';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

class FileInputField extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      file: "",
      imageUrl: "",
      imageName: "",
      loading: false,
    };
  }

  componentDidMount() {
    if (this.props.initial) {
      this.setState({
        imageUrl: this.props.initial.value.imageUrl,
        imageName: this.props.initial.value.imageName,
      });
    }
  }

  uploadImage = (file) => {
    const { onChange } = this.props;
    this.setState({ loading: true });

    const uploadTask = storage.ref(`/images/${file.name}`).put(file);

    uploadTask.on(
      "state_changed",
      async (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        if (progress === 100) {
          await storage
            .ref("images")
            .child(file.name)
            .getDownloadURL()
            .then((url) => {
              this.setState({
                imageUrl: url,
                imageName: file.name,
              });
              onChange({ imageUrl: url, name: file.name });
              this.setState({ loading: false });
            })
            .catch((err) => {
              console.log(err);
            });
        }
      },
      (error) => {
        console.log(error);
      },
      async () => {
        await delay(1000);

        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          this.setState({
            imageUrl: downloadURL,
            imageName: file.name,
          });
          onChange({ imageUrl: downloadURL, name: file.name });
          this.setState({ loading: false });
        });
      }
    );
  };

  handleChange = (file) => {
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgText = e.target.result;
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            const pngFile = new File([blob], file.name.replace(/\.svg$/, ".png"), { type: "image/png" });
            this.uploadImage(pngFile);
          }, "image/png");
        };
        img.src = "data:image/svg+xml;base64," + window.btoa(svgText);
      };
      reader.readAsText(file);
    } else {
      this.uploadImage(file);
    }
  };

  render() {
    const { name, value, disabled } = this.props;
    return (
      <div className="form__form-group-file">
        <label htmlFor={name}>Choisir une image</label>
        {this.state.loading ? (
          <span>Chargement....</span>
        ) : (
          <span>{value && value.name}</span>
        )}

        <input
          type="file"
          name={name}
          disabled={disabled}
          id={name}
          onChange={(e) => {
            e.preventDefault();
            this.handleChange(e.target.files[0]);
          }}
        />
      </div>
    );
  }
}

const renderFileInputField = (props) => {
  const { input, meta, disabled } = props;

  return (
    <div className="form__form-group-input-wrap">
      <FileInputField {...input} disabled={disabled} />
      {meta.touched && meta.error && (
        <span className="form__form-group-error">{meta.error}</span>
      )}
    </div>
  );
};

renderFileInputField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string,
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }),
};

renderFileInputField.defaultProps = {
  meta: null,
};

FileInputField.propTypes = {
  onChange: PropTypes.func.isRequired,
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

export default renderFileInputField;
