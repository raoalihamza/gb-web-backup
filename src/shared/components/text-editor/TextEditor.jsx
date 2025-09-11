import React, { useEffect, useState } from 'react';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import PropTypes from 'prop-types';
import { FieldLabel } from 'atomicComponents/TextField';

const ToolbarOptions = {
  options: [
    'inline',
    'blockType',
    'list',
    'textAlign',
    'link',
    'emoji',
    'history',
  ],
  inline: {
    options: ['bold', 'italic', 'underline'],
  },
};

const disabledEditorWrapperStyles = {
  opacity: 0.6,
  cursor: "auto",
  pointerEvents: "none"
}

const TextEditor = ({ onChange, value, language, onChangeLanguage, disabled }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    const contentBlock = htmlToDraft(value);

    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      setEditorState(editorState);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    onChange(draftToHtml(convertToRaw(editorState.getCurrentContent())));
  }

  return (
    <>
      <FieldLabel language={language} onChange={onChangeLanguage} />
      <div className="text-editor">
        <Editor
          editorState={editorState}
          onEditorStateChange={onEditorStateChange}
          toolbar={ToolbarOptions}
          readOnly={disabled}
          wrapperStyle={disabled ? disabledEditorWrapperStyles : {}}
        />
      </div>
    </>
  )
};

TextEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default TextEditor;
