import { alpha, withStyles, makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { Button, Divider } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import DropdownPicker from './DropDown';
import styled from 'styled-components';

const PeriodWrapper = styled.div`
  margin-top: 25px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-left: 10px;
`;

const BootstrapInput = withStyles((theme) => ({
  root: {
    'label + &': {
      marginTop: props => props.space ? theme.spacing(props.space) : theme.spacing(5)
    },
  },
  input: {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.common.white,
    border: '1px solid #ced4da',
    fontSize: 16,
    // width: '100%',
    padding: '10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      boxShadow: `${alpha(theme.palette.success.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.success.main,
    },
  },
}))(InputBase);

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    margin: theme.spacing(1),
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    '&.Mui-focused': {
      color: 'inherit'
    }
  },
}));

export const FieldLabel = ({ label, onChange, language, startAdornment }) => {
  const classes = useStyles();
  const labelStyles = { marginRight: 12, ...(startAdornment ? { marginLeft: 24 } : {}) }

  return (<InputLabel shrink htmlFor={label} color='primary' className={classes.label}>
    {label && <span style={labelStyles}>{label}</span>}
    {language && (
      <>
        <Button
          color={language === 'en' ? 'primary' : 'default'}
          variant={language === 'en' ? 'contained' : 'text'}
          onClick={() => onChange('en')}>en</Button>
        <Divider style={{ margin: '0 8px' }} orientation="vertical" flexItem />
        <Button
          color={language === 'fr' ? 'primary' : 'default'}
          variant={language === 'fr' ? 'contained' : 'text'}
          onClick={() => onChange('fr')}>fr</Button>
      </>
    )}
  </InputLabel>)
}

const TextField = ({
  label,
  labelSpace = 3,
  value,
  onChange,
  type = 'text',
  autocomplete,
  name,
  language,
  onChangeLanguage,
  startAdornment,
  disabled,
  withLabel = true,
  placeholder,
  withPeriod = false,
  periodRange = [],
  periodValue,
  onChangePeriod,
  style = {},
}) => {
  const classes = useStyles();
  const { t } = useTranslation("common");


  return (
    <FormControl className={classes.root} style={withPeriod ? { display: 'flex', flexDirection: "row", ...style } : { ...style }} >
      {withLabel && <FieldLabel label={label} language={language} onChange={onChangeLanguage} startAdornment={startAdornment} />}
      <BootstrapInput
        space={labelSpace}
        type={type}
        value={value}
        id={label}
        onChange={onChange}
        startAdornment={startAdornment}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autocomplete}
        name={name}
      />
      {withPeriod && (
        <PeriodWrapper>
          {t("settings.per")}
          <DropdownPicker value={periodValue} items={periodRange} onChange={onChangePeriod} disabled={disabled} />
        </PeriodWrapper>
      )}
    </FormControl>
  )
};

export default TextField;
