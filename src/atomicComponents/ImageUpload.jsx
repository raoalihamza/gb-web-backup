import React, { useMemo } from 'react';
import Dropzone from 'react-dropzone';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import styled from 'styled-components';
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from 'react-i18next';

const PreviewsContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin-top: 16px;
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 0;
  display: none;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: #eeeeee;
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  position: relative;
`;

const DropzoneText = styled.p`
  position: absolute;
`;
const sizes = {
  default: '100%',
  preview: '100px'
};

const Overflow = styled.div`
  position: absolute;
  background: black;
  opacity: 0.7;
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  display: none;
`;

const ImagePreview = styled.div`
  display: inline-flex;
  border-radius: 2px;
  border: 1px solid rgb(234, 234, 234);
  margin-bottom: 8px;
  margin-right: 8px;
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  padding: 4px;
  box-sizing: border-box;
  position: relative;

  &:nth-child(3) {
    margin-right: 0;
  }

  &:hover {
    ${Overflow} {
      display: block;
    }
    ${IconWrapper} {
      display: block;
    }
  }
`;

const Preview = ({ image, onRemoveFile, width = '100px', height = '100px', disabled }) => (
  <ImagePreview width={width} height={height}>
    <img src={image.preview} alt={image.name} />
    {!disabled && (
      <>
        <Overflow />
        <IconWrapper>
          <CloseIcon onClick={() => onRemoveFile(image)} style={{ color: 'white' }} />
        </IconWrapper>
      </>
    )}
  </ImagePreview>
);

const ImageUpload = ({ images, onChange, name, disabled }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const image = acceptedFiles[0];

    Object.assign(image, { preview: URL.createObjectURL(image) });

    onChange((prev) => prev.concat(image));
  }, [onChange]);

  const removeFile = (file) => {
    onChange((prev) => prev.filter(item => item.name !== file.name))
  }

  const firstImage = useMemo(() => images[0], [images])
  const [t] = useTranslation("common");

  return (
    <>
      {firstImage && <Preview image={images[0]} width='100%' height='300px' onRemoveFile={removeFile} disabled={disabled} />}
      {images && Array.isArray(images) && (
        <PreviewsContainer>
          {images.map((image) => <Preview key={image.name} image={image} onRemoveFile={removeFile} disabled={disabled} />)}
          <Dropzone
            className="container"
            accept="image/jpeg, image/png"
            name={name}
            onDrop={onDrop}
            disabled={disabled}
          >
            {({ getRootProps, getInputProps }) => (
              <Container {...getRootProps()}
                width={!firstImage ? '100%' : sizes.preview}
                height={!firstImage ? '300px' : sizes.preview}
              >
                <input {...getInputProps()} />
                <DropzoneText>{t("forms.uploadImage")}</DropzoneText>
              </Container>
            )}
          </Dropzone>
        </PreviewsContainer>
      )}
    </>
  );
}

ImageUpload.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};

export default ImageUpload;
