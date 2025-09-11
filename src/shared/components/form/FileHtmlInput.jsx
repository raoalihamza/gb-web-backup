/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { auth, storage } from "../../../containers/firebase";

class FileInputField extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      file: "",
      fileName: "",
      loading: false,
      setInitial: false
    };
  }

    componentDidUpdate() {
      const { onChange, initialValue} = this.props;
      if(!this.state.setInitial && initialValue){
        this.setState({ loading: false, file: initialValue?.value, fileName: initialValue?.name, setInitial: true });
        onChange({ value: initialValue?.value, name: initialValue?.name });
      }
    }

  render() {
    const { onChange, name, value, emailDocId, t, disabled} = this.props;
    const handleChange = (file) => {
      this.setState({ ...this.state, loading: true });
      let htmlString = '';

      const reader = new FileReader();

      reader.onload = async (e) => { 
        htmlString = e.target.result;
      };
      reader.readAsText(file);

      const uploadTask = storage.ref(`html_file/${auth.currentUser.uid}/${emailDocId}.html`).put(file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
      
        },
        (error) => {
          console.error("snap", error);
        },
        () => {
          // complete function ...
          storage
            .ref(`html_file/${auth.currentUser.uid}`)
            .child(`${emailDocId}.html`)
            .getDownloadURL()
            .then((url) => {
              this.setState({ loading: false, file: url, fileName: file.name });
              onChange({ value: url, name: file.name, html: htmlString });
            });
        }
      );
    };
    return (
      <div className="form__form-group-file">
        <label
          htmlFor={name}
          // style={{
          //   backgroundColor: "#70bbfd",
          //   color: "white",
          //   borderRadius: "6px",
          // }}
        >
          {t('emails.add_html_file')}
        </label>
        {this.state.loading ? (
          <span>{t('emails.loading')}</span>
        ) : (
          <span>{value.name}</span>
        )}

        <input
          type="file"
          accept="text/html"
          name={name}
          id={name}
          disabled={disabled}
          onChange={(e) => {
            e.preventDefault();
            handleChange(e.target.files[0]);
          }}
        />
      </div>
    );
  }
}

const renderHtmlFileInputField = (props) => {
  const { input, meta } = props;
  return (
    <div className="form__form-group-input-wrap">
      <FileInputField {...input} {...props} />
      {meta.touched && meta.error && (
        <span className="form__form-group-error">{meta.error}</span>
      )}
    </div>
  );
};

renderHtmlFileInputField.propTypes = {
  input: PropTypes.shape({
    onChange: PropTypes.func,
    name: PropTypes.string,
  }).isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool,
    error: PropTypes.string,
  }),
};

renderHtmlFileInputField.defaultProps = {
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

export default withTranslation("common")(renderHtmlFileInputField);
