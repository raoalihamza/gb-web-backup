import { useSelector } from 'react-redux';

function TextArea({ input, meta: { touched, error }, ...props }) {
	const locale = useSelector((state) => state.translation.language);

    return (<div className="form__form-group">
        <textarea {...props} {...input} />
        {touched && error?.[locale]?.length > 0 ? (
            <span className="form__form-group-error">{error?.[locale] || ''}</span>
        ) : null}
    </div>)
}

export default TextArea;