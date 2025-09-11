import { useSelector } from "react-redux";

function TextExerpt({
  input,
  placeholder,
  id,
  type,
  meta: { touched, error },
}) {
  const locale = useSelector((state) => state.translation.language);

  return (
    <div className="form__form-group-input-wrap">
      <input {...input} placeholder={placeholder} id={id} type={type} />
      {touched && error?.[locale]?.length > 0 ? (
        <span className="form__form-group-error">{error?.[locale] || ""}</span>
      ) : null}
    </div>
  );
}

export default TextExerpt;
