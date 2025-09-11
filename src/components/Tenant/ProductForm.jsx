import DatePicker from 'react-datepicker';

import ImageUpload from 'atomicComponents/ImageUpload';
import TextField, { FieldLabel } from 'atomicComponents/TextField';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useForm, Controller } from "react-hook-form";
import { useCallback } from 'react';
import { useMemo } from 'react';
import TextEditor from 'shared/components/text-editor/TextEditor';
import { Checkbox, Divider, FormControlLabel, InputAdornment, Radio } from '@material-ui/core';
import CustomSelect from 'atomicComponents/CustomSelect';
import { PRODUCT_STATUSES } from 'constants/statuses';
import { AVAILABLE_FILTER_TYPES_PRODUCTS } from 'atomicComponents/FilterDatePicker';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import sharedHooks from 'hooks/shared.hooks';
import CustomMultiSelect from 'atomicComponents/CustomMultiSelect';
import { Importer, ImporterField, enUS } from "react-csv-importer";
import "react-csv-importer/dist/index.css";

const Form = styled.form`
`;

const FlexWrapper = styled.div`
  display: flex;
`

const SECTION_SPACE = 24;

const ImageWrapper = styled.div`
  width: 316px;
  margin-right: 16px;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const ProductInfoSection = styled.div`
  flex: 1;
`;

const DescriptionSection = styled.div`
  margin-top: ${SECTION_SPACE}px;
`;

const CheckBoxSection = styled.div`
  margin-top: ${SECTION_SPACE}px;
  display: flex;
  justify-content: space-between;
  width: 70%;
  flex-wrap: wrap;
`;

const RadioButtonsSection = styled.div`
  margin-top: ${SECTION_SPACE}px;
  display: flex;
  width: 80%;
  flex-wrap: wrap;
`;

const PriceSection = styled.div`
  margin-top: ${SECTION_SPACE}px;
  display: flex;
  width: 83.9%;
  margin: 0 auto;
`;

const InventorySection = styled.div`
  margin-top: ${SECTION_SPACE}px;
  width: 80%;
  margin: 0 auto;
`;

const ErrorSpan = styled.span`
  color: red;
  margin-left: 8px;
`;

const PriceWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`

const StepsSection = styled.div`
  margin-top: ${SECTION_SPACE}px;
`;

const StepsSectionTitle = styled.div`
  margin-left: 10;
  font-size: 0.9rem;
`;

const StepWrapper = styled.div`
  display: flex;
  flex-wrap: no-wrap;
  align-items: center;
  width: 100%;
  padding-left: 3%;
`
const StepLabel = styled.label`
  min-width: 50px;
  margin: 0;
  color: rgba(0, 0, 0, 0.54);
`

const ExpirationWrapper = styled.div`
  display: flex;
  flex-wrap: no-wrap;
  flex-direction: column;
  align-items: start;
  width: 100%;
  margin: 8px;
`
const ExpirationLabel = styled.label`
  min-width: 50px;
  margin: 0;
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.54);
`

export const FORM_ID = 'product-form';
// @TODO take from organization config once ready
const GREENPOINTS_CURRENCY = 100;

const exampleFileLink = "https://firebasestorage.googleapis.com/v0/b/greenplaysherbrooke.appspot.com/o/Example.csv?alt=media&token=e1018b21-efbe-41d5-9073-e35d139ea280";

let defaultValues = {
  sku: '',
  title_en: '',
  title_fr: '',
  displayOrder: '',
  tenantName: '',
  bodyText_en: '',
  bodyText_fr: '',
  price: 0,
  productUrl: '',
  greenpoints: 0,
  stock: 0,
  initialStock: 0,
  barCode: '',
  cityId: "",
  availability: '',
  categories: [],
  status: PRODUCT_STATUSES.needApproval,
  isApproved: false,
  isDelivery: false,
  isBarCode: true,
  isUniqueBarcode: false,
  isQrCode: false,
  isQrCodeGreenplay: false,
  isUniqueQrcode: false,
  uniqueBarCodes: [],
  isCoupon: false,
  steps: {
    step1: '',
    step2: '',
    step3: '',
    step4: '',
    step5: '',
  },
  steps_en: {
    step1: '',
    step2: '',
    step3: '',
    step4: '',
    step5: '',
  },
  maxTransactionsPerPeriod: {
    value: 1,
    period: 'week'
  },
  expirationDate: null,
}

export const frCA = {
  general: {
    goToPreviousStepTooltip: 'Aller à l’étape précédente'
  },

  fileStep: {
    initialDragDropPrompt:
      'Glissez-déposez ici le fichier CSV, ou cliquez pour sélectionner dans le dossier',
    activeDragDropPrompt: 'Déposez le fichier CSV ici...',

    getImportError: (message) => `Erreur d'importation : ${message}`,
    getDataFormatError: (message) => `Veuillez vérifier le formatage des données : ${message}`,
    goBackButton: 'Retour',
    nextButton: 'Choisir les colonnes',

    rawFileContentsHeading: 'Contenu du fichier brut',
    previewImportHeading: 'Aperçu de l’importation',
    dataHasHeadersCheckbox: 'Les données comportent des en-têtes',
    previewLoadingStatus: 'Chargement de l’aperçu...'
  },

  fieldsStep: {
    stepSubtitle: 'Sélectionner les colonnes',
    requiredFieldsError: 'Veuillez assigner tous les champs requis',
    nextButton: 'Importer',

    dragSourceAreaCaption: 'Colonnes à importer',
    getDragSourcePageIndicator: (currentPage, pageCount) =>
      `Page ${currentPage} sur ${pageCount}`,
    getDragSourceActiveStatus: (columnCode) =>
      `Attribution de la colonne ${columnCode}`,
    nextColumnsTooltip: 'Afficher les colonnes suivantes',
    previousColumnsTooltip: 'Afficher les colonnes précédentes',
    clearAssignmentTooltip: 'Effacer l’attribution de la colonne',
    selectColumnTooltip: 'Sélectionner la colonne à attribuer',
    unselectColumnTooltip: 'Désélectionner la colonne',

    dragTargetAreaCaption: 'Champs cibles',
    getDragTargetOptionalCaption: (field) => `${field} (facultatif)`,
    getDragTargetRequiredCaption: (field) => `${field} (requis)`,
    dragTargetPlaceholder: 'Glisser la colonne ici',
    getDragTargetAssignTooltip: (columnCode) =>
      `Attribuer la colonne ${columnCode}`,
    dragTargetClearTooltip: 'Effacer l’attribution de la colonne',

    columnCardDummyHeader: 'Champ non assigné',
    getColumnCardHeader: (code) => `Colonne ${code}`
  },

  progressStep: {
    stepSubtitle: 'Importation',
    uploadMoreButton: 'Uploader plus',
    finishButton: 'Terminer',
    statusError: 'Impossible d’importer',
    statusComplete: 'Terminé',
    statusPending: 'Importation en cours...',
    processedRowsLabel: 'Lignes traitées :'
  }
};


const ProductForm = ({
  onSubmit,
  errors,
  initialValues = defaultValues,
  isEdit,
  isTenant,
  tenantName,
  categoryOptions = [],
}) => {
  const { t, i18n } = useTranslation('common');
  const [images, setImages] = useState([]);
  const [formLanguage, setFormLanguage] = useState('fr');
  const { isEnglishAvailable } = sharedHooks.useIsEnglishAvailable();
  const [selectedOption, setSelectedOption] = useState();
  const [stepsDefaultText, setStepsDefaultText] = useState({
    en: {
      step1: i18n.getDataByLanguage("en").common.dashboard_commerce.step1_default_text ?? "",
      step2: i18n.getDataByLanguage("en").common.dashboard_commerce.step2_default_text ?? "",
      step3: i18n.getDataByLanguage("en").common.dashboard_commerce.step3_default_text ?? "",
      step4: i18n.getDataByLanguage("en").common.dashboard_commerce.step4_default_text ?? "",
      step5: i18n.getDataByLanguage("en").common.dashboard_commerce.step5_default_text ?? "",
    },
    fr: {
      step1: i18n.getDataByLanguage("fr").common.dashboard_commerce.step1_default_text ?? "",
      step2: i18n.getDataByLanguage("fr").common.dashboard_commerce.step2_default_text ?? "",
      step3: i18n.getDataByLanguage("fr").common.dashboard_commerce.step3_default_text ?? "",
      step4: i18n.getDataByLanguage("fr").common.dashboard_commerce.step4_default_text ?? "",
      step5: i18n.getDataByLanguage("fr").common.dashboard_commerce.step5_default_text ?? "",
    },
  });


  const { control, handleSubmit, setValue, getValues, watch } = useForm({
    defaultValues: initialValues,
  });

  const isDiscovery = watch("isDiscovery");

  useEffect(() => {
    setImages(initialValues.images || [])
  }, [initialValues.images])

  useEffect(() => {
    if (!isEdit) {
      setValue("steps", stepsDefaultText.fr);
      setValue("steps_en", stepsDefaultText.en);
    }
  }, [formLanguage, isEdit, setValue, stepsDefaultText]);


  useEffect(() => {
    if (tenantName) {
      setValue("tenantName", tenantName);
    }
  }, [setValue, tenantName]);

  useEffect(() => {
    if (!isEnglishAvailable) {
      setFormLanguage("fr")
    }
  }, [isEnglishAvailable])

  const availabilityOptions = useMemo(() => {
    const statuses = t('dashboard_commerce.availabilty_status', { returnObjects: true });
    return Object.keys(statuses).reduce((acc, next) => {
      const label = statuses[next];

      return acc.concat({ value: next, label })
    }, []);
  }, [t]);

  const productStatuses = useMemo(() => {
    const stats = [
      { label: t('product_status.active'), value: PRODUCT_STATUSES.active },
      { label: t('product_status.disabled'), value: PRODUCT_STATUSES.disabled },
    ];

    return stats;
  }, [t]);

  const perRange = useMemo(
    () =>
      Object.keys(AVAILABLE_FILTER_TYPES_PRODUCTS).reduce((acc, next) => {
        return acc.concat({
          label: t(AVAILABLE_FILTER_TYPES_PRODUCTS[next].label),
          value: next,
        });
      }, []),
    [t]
  );

  const titleFormKey = useMemo(() => `title_${formLanguage}`, [formLanguage]);
  const descriptionFormKey = useMemo(() => `bodyText_${formLanguage}`, [formLanguage]);
  const stepsFormKey = useMemo(() => `steps${formLanguage === 'en' ? '_en' : ''}`, [formLanguage]);

  const handleChangeTitle = useCallback((event) => {
    setValue(titleFormKey, event.target.value);
  }, [titleFormKey, setValue]);

  const onChangeEditor = useCallback((description) => {
    setValue(descriptionFormKey, description);
  }, [descriptionFormKey, setValue]);

  const onClickChangeCategories = useCallback((item) => {
    let categories = getValues('categories');
    if (!categories.some(c => c.id === item.id)) {
      categories.push(item)
    } else {
      categories = categories.filter(c => c.id !== item.id);
    }
    setValue('categories', categories);
  }, [getValues, setValue]);

  // const onChangeStepState = useCallback((steps) => {
  //   setValue(stepsFormKey, steps);
  // }, [stepsFormKey, setValue]);

  const onChangeStepState = useCallback((field, event) => {
    // setValue(stepsFormKey, event);
    setStepsDefaultText(prev => {
      return {
        ...prev,
        [formLanguage]: {
          ...prev[formLanguage],
          [field]: event.target.value
        }
      };
    });
  }, [formLanguage]);

  const isDisabled = useMemo(() => isEdit && !isTenant, [isEdit, isTenant]);

  const setAvailabilityByStock = useCallback((stock) => {
    if (stock > 0) {
      setValue('availability', 'available')
    } else {
      setValue('availability', 'out_of_stock')
    }
  }, [setValue]);

  const isDiscoveryChecked = useCallback(() => {
    setValue('availability', 'available')
  }, [getValues]);

  const handleChangeRadioButton = (event) => {
    setSelectedOption(event.target.value);
    if (event.target.value === 'isCoupon') {
      setValue('isCoupon', true)
      setValue("isDelivery", false)
      setValue("isBarCode", false)
      setValue("isUniqueBarcode", false)
      setValue("isQrCode", false)
      setValue("isQrCodeGreenplay", false)
      setValue("isUniqueQrcode", false)
    }
    if (event.target.value === 'isDelivery') {
      setValue("isDelivery", true)
      setValue('isCoupon', false)
      setValue("isBarCode", false)
      setValue("isUniqueBarcode", false)
      setValue("isQrCode", false)
      setValue("isQrCodeGreenplay", false)
      setValue("isUniqueQrcode", false)
    }
    if (event.target.value === 'isBarCode') {
      setValue("isDelivery", false)
      setValue('isCoupon', false)
      setValue("isBarCode", true)
      setValue("isUniqueBarcode", false)
      setValue("isQrCode", false)
      setValue("isQrCodeGreenplay", false)
      setValue("isUniqueQrcode", false)
    }
    if (event.target.value === 'isUniqueBarcode') {
      setValue("isDelivery", false)
      setValue('isCoupon', false)
      setValue("isBarCode", false)
      setValue("isUniqueBarcode", true)
      setValue("isQrCode", false)
      setValue("isQrCodeGreenplay", false)
      setValue("isUniqueQrcode", false)
    }
    if (event.target.value === 'isQrCode') {
      setValue("isDelivery", false)
      setValue('isCoupon', false)
      setValue("isBarCode", false)
      setValue("isUniqueBarcode", false)
      setValue("isQrCode", true)
      setValue("isQrCodeGreenplay", false)
      setValue("isUniqueQrcode", false)
    }
    if (event.target.value === 'isUniqueQrcode') {
      setValue("isDelivery", false)
      setValue('isCoupon', false)
      setValue("isBarCode", false)
      setValue("isUniqueBarcode", false)
      setValue("isQrCode", false)
      setValue("isQrCodeGreenplay", false)
      setValue("isUniqueQrcode", true)
    }
    if (event.target.value === 'isQrCodeGreenplay') {
      setValue("isDelivery", false)
      setValue('isCoupon', false)
      setValue("isBarCode", false)
      setValue("isUniqueBarcode", false)
      setValue("isQrCode", false)
      setValue("isQrCodeGreenplay", true)
      setValue("isUniqueQrcode", false)
    }

  };



  return (
    <Form onSubmit={handleSubmit((data) => onSubmit({ ...data, images }))} id={FORM_ID}>
      <ToastContainer
        style={{ top: "5em" }} autoClose={5000} position={toast.POSITION.TOP_RIGHT} />
      <ProductInfo>
        <ImageWrapper>
          <ImageUpload images={images} onChange={setImages} name="Name" disabled={isDisabled} />
          {errors && errors.images && <ErrorSpan>{errors.images[formLanguage]}</ErrorSpan>}
        </ImageWrapper>
        <ProductInfoSection>
          <Controller
            name='sku'
            control={control}
            render={({ field }) => <TextField label={t('dashboard_commerce.SKU_abbr')} value={field.value} disabled={isEdit} onChange={field.onChange} />}
          />
          <Controller
            name={titleFormKey}
            control={control}
            render={() =>
              <>
                <TextField onChange={handleChangeTitle} value={getValues(titleFormKey)} label={t('dashboard_commerce.title')} language={isEnglishAvailable && formLanguage} onChangeLanguage={setFormLanguage} />
                {errors && errors[titleFormKey] && <ErrorSpan>{errors[titleFormKey][formLanguage]}</ErrorSpan>}
              </>
            }
          />
          <Controller
            name='tenantName'
            control={control}
            render={({ field }) => <TextField disabled={isDisabled} label={t('dashboard_commerce.tenant_name')} value={field.value} onChange={field.onChange} />}
          />
          <Controller
            name='productUrl'
            control={control}
            render={({ field }) => <TextField disabled={isDisabled} label={t('dashboard_commerce.product_url')} value={field.value} onChange={field.onChange} />}
          />
          <Controller
            name='displayOrder'
            control={control}
            render={({ field }) => <TextField disabled={isDisabled} label={t('dashboard_commerce.display_order')} type="number" value={field.value} onChange={field.onChange} />}
          />

        </ProductInfoSection>
      </ProductInfo>

      <DescriptionSection>
        <Controller
          name={descriptionFormKey}
          control={control}
          render={() =>
            <>
              <TextEditor disabled={isDisabled} onChange={onChangeEditor} value={getValues(descriptionFormKey)} language={isEnglishAvailable && formLanguage} onChangeLanguage={setFormLanguage} />
              {errors && errors[descriptionFormKey] && <ErrorSpan>{errors[descriptionFormKey][formLanguage]}</ErrorSpan>}
            </>
          }
        />
      </DescriptionSection>

      <CheckBoxSection>
        <Controller
          name="isNew"
          control={control}
          render={({ field }) => (<FormControlLabel disabled={isDisabled} control={<Checkbox {...field} checked={field.value} color="primary" />} label={t('dashboard_commerce.new')} />)}
        />
        <Controller
          name="isFeatured"
          control={control}
          render={({ field }) => (<FormControlLabel disabled={isDisabled} control={<Checkbox {...field} checked={field.value} color="primary" />} label={t('dashboard_commerce.featured')} />)}
        />
        <Controller
          name="isOnSale"
          control={control}
          render={({ field }) => (<FormControlLabel disabled={isDisabled} control={<Checkbox {...field} checked={field.value} color="primary" />} label={t('dashboard_commerce.on_sale')} />)}
        />
        <Controller
          name="isDiscovery"
          control={control}
          render={({ field }) => (<FormControlLabel disabled={isDisabled} control={<Checkbox {...field} checked={field.value} color="primary" />} label={t('dashboard_commerce.discovery_product')} />)}
        />
      </CheckBoxSection>
      <RadioButtonsSection>
        <Controller
          name="isCoupon"
          control={control}
          render={({ field }) => (<FormControlLabel disabled={isDisabled} control={<Radio {...field} value={"isCoupon"}
            checked={field.value ?? selectedOption === 'isCoupon'}
            color="primary" onChange={handleChangeRadioButton} />} label={t('dashboard_commerce.coupon')} />)}
        />
        <Controller
          name="isDelivery"
          control={control}
          render={({ field }) => (<FormControlLabel disabled={isDisabled} control={<Radio {...field} value={"isDelivery"}
            checked={field.value ?? selectedOption === 'isDelivery'}
            color="primary" onChange={handleChangeRadioButton} />} label={t('dashboard_commerce.delivery')} />)}
        />
        <Controller
          name="isBarCode"
          control={control}
          render={({ field }) => (<FormControlLabel disabled={isDisabled} control={<Radio {...field} value={"isBarCode"}
            checked={field.value ?? selectedOption === 'isBarCode'}
            color="primary" onChange={handleChangeRadioButton} />} label={t('dashboard_commerce.is_bar_code')} />)}
        />
        <Controller
          name="isUniqueBarcode"
          control={control}
          render={({ field }) => (<FormControlLabel disabled={isDisabled} control={<Radio {...field} value={"isUniqueBarcode"}
            checked={field.value ?? selectedOption === 'isUniqueBarcode'}
            color="primary" onChange={handleChangeRadioButton} />} label={t('dashboard_commerce.is_unique_bar_code')} />)}
        />
        <Controller
          name="isQrCode"
          control={control}
          render={({ field }) => (<FormControlLabel disabled={isDisabled} control={<Radio {...field} value={"isQrCode"}
            checked={field.value ?? selectedOption === 'isQrCode'}
            color="primary" onChange={handleChangeRadioButton} />} label={t('dashboard_commerce.is_qr_code')} />)}
        />
        <Controller
          name="isUniqueQrcode"
          control={control}
          render={({ field }) => (<FormControlLabel disabled={isDisabled} control={<Radio {...field} value={"isUniqueQrcode"}
            checked={field.value ?? selectedOption === 'isUniqueQrcode'}
            color="primary" onChange={handleChangeRadioButton} />} label={t('dashboard_commerce.is_unique_qr_code')} />)}
        />

        {/* <Controller
          name="isCharacter"
          control={control}
          render={({ field }) => (<FormControlLabel disabled={isDisabled} control={<Radio {...field} value={"isCharacter"}
            checked={field.value ?? selectedOption === 'isCharacter'}
            color="primary" onChange={handleChangeRadioButton} />} label={t('dashboard_commerce.is_character')} />)}
        /> */}

        {isDiscovery && (
          <Controller
            name="isQrCodeGreenplay"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                disabled={isDisabled}
                control={
                  <Radio
                    {...field}
                    value={"isQrCodeGreenplay"}
                    checked={field.value ?? selectedOption === 'isQrCodeGreenplay'}
                    color="primary"
                    onChange={handleChangeRadioButton}
                  />
                }
                label={t('dashboard_commerce.is_qr_code_greenplay')}
              />
            )}
          />
        )}
      </RadioButtonsSection>
      {errors && errors.productType && <ErrorSpan>{errors.productType[formLanguage]}</ErrorSpan>}
      {(getValues("isUniqueBarcode") || getValues("isUniqueQrcode")) && (
        <span className="checkbox-user__container">
          <div className="checkbox-user__container-inner">
            <div className="unique-bar-codes-group-field">
              <Controller
                name="uniqueBarCodes"
                control={control}
                render={({ field }) => (
                  <Importer
                    chunkSize={10000}
                    skipEmptyLines={true}
                    locale={i18n.language == "fr" ? frCA : enUS}
                    defaultNoHeader
                    restartable
                    displayColumnPageSize={2}
                    displayFieldRowSize={2}
                    processChunk={async (rows) => {
                      const data = [];

                      rows.map((i) => data.push(Object.values(i)[0]));
                      getValues("uniqueBarCodes") == undefined ? field.onChange([...new Set([...data])]) :
                        field.onChange([...new Set([...getValues("uniqueBarCodes"), ...data])]);

                      const uniqueBarCodesLength = (getValues("uniqueBarCodes") || []).filter(bc => bc !== "").length;
                      if (uniqueBarCodesLength > 0) {
                        setAvailabilityByStock(uniqueBarCodesLength)
                        setValue("stock", uniqueBarCodesLength);
                      }
                    }}
                  >
                    <ImporterField name="uniqueBarCodes" label="Code à barres" />
                  </Importer>
                )}
              />
            </div>
            <div className="checkbox-user__container-inner">
              <span>
                <a
                  href={exampleFileLink}
                  rel="noreferrer"
                  target="_blank"
                >
                  <u>{t(`challenge.use_model`)}</u>
                </a>
              </span>
            </div>
          </div>
        </span>
      )}
      {errors && errors.uniqueBarCodes && <ErrorSpan>{errors.uniqueBarCodes[formLanguage]}</ErrorSpan>}
      <Controller
        name="categories"
        control={control}
        render={({ field }) => {
          return (
            <CustomMultiSelect
              options={categoryOptions}
              disabled={isDisabled}
              label={t('dashboard_commerce.products_list.categories')}
              isMulti={true}
              width='100%'
              withLabel
              onClick={onClickChangeCategories}
              value={(field.value || []).map(i => i.value)}
            />
          );
        }}
      />

      <StepsSection>
        <StepsSectionTitle>
          {t('dashboard_commerce.steps_section_title')}
        </StepsSectionTitle>
        <FieldLabel language={isEnglishAvailable && formLanguage} onChange={setFormLanguage} />

        <Controller
          name={`${stepsFormKey}.step1`}
          control={control}
          render={({ field }) =>
            <StepWrapper>
              <StepLabel htmlFor={t('dashboard_commerce.step1')}>{t('dashboard_commerce.step1')}</StepLabel>
              <TextField withLabel={false} label={t('dashboard_commerce.step1')} value={getValues(`${stepsFormKey}.step1`)} disabled={isDisabled} onChange={event => {
                onChangeStepState('step1', event);
                field.onChange(event);
              }} placeholder={t('dashboard_commerce.step1_placeholder')} />
            </StepWrapper>}
        />
        <Controller
          name={`${stepsFormKey}.step2`}
          control={control}
          render={({ field }) =>
            <StepWrapper>
              <StepLabel htmlFor={t('dashboard_commerce.step2')}>{t('dashboard_commerce.step2')}</StepLabel>
              <TextField withLabel={false} label={t('dashboard_commerce.step2')} value={getValues(`${stepsFormKey}.step2`)} disabled={isDisabled} onChange={event => {
                onChangeStepState('step2', event);
                field.onChange(event);
              }} placeholder={t('dashboard_commerce.step2_placeholder')} />
            </StepWrapper>}
        />
        <Controller
          name={`${stepsFormKey}.step3`}
          control={control}
          render={({ field }) =>
            <StepWrapper>
              <StepLabel htmlFor={t('dashboard_commerce.step3')}>{t('dashboard_commerce.step3')}</StepLabel>
              <TextField withLabel={false} label={t('dashboard_commerce.step3')} value={getValues(`${stepsFormKey}.step3`)} disabled={isDisabled} onChange={event => {
                onChangeStepState('step3', event);
                field.onChange(event);
              }} placeholder={t('dashboard_commerce.step3_placeholder')} />
            </StepWrapper>}
        />
        <Controller
          name={`${stepsFormKey}.step4`}
          control={control}
          render={({ field }) =>
            <StepWrapper>
              <StepLabel htmlFor={t('dashboard_commerce.step4')}>{t('dashboard_commerce.step4')}</StepLabel>
              <TextField withLabel={false} label={t('dashboard_commerce.step4')} value={getValues(`${stepsFormKey}.step4`)} disabled={isDisabled} onChange={event => {
                onChangeStepState('step4', event);
                field.onChange(event);
              }} placeholder={t('dashboard_commerce.step4_placeholder')} />
            </StepWrapper>}
        />
        <Controller
          name={`${stepsFormKey}.step5`}
          control={control}
          render={({ field }) =>
            <StepWrapper>
              <StepLabel htmlFor={t('dashboard_commerce.step5')}>{t('dashboard_commerce.step5')}</StepLabel>
              <TextField withLabel={false} label={t('dashboard_commerce.step5')} value={getValues(`${stepsFormKey}.step5`)} disabled={isDisabled} onChange={event => {
                onChangeStepState('step5', event);
                field.onChange(event);
              }} placeholder={t('dashboard_commerce.step5_placeholder')} />
            </StepWrapper>}
        />
      </StepsSection>

      <Divider style={{ margin: 30 }} />
      <PriceSection>
        <Controller
          name='price'
          control={control}
          render={({ field }) =>
            <PriceWrapper>
              <TextField
                type='number'
                label={t('dashboard_commerce.orders_list.price')}
                value={field.value}
                onChange={field.onChange}
                startAdornment={<InputAdornment position="start">$</InputAdornment>}
                disabled={isDisabled}
              />
              {errors && errors.price && <ErrorSpan>{errors.price[formLanguage]}</ErrorSpan>}
            </PriceWrapper>
          }
        />

        <Controller
          name='price'
          control={control}
          render={({ field }) => <TextField
            label={t('global.greenpoints')}
            value={field.value * GREENPOINTS_CURRENCY}
            disabled={isDisabled}
          />}
        />
      </PriceSection>

      <InventorySection>
        {(getValues("isBarCode") || getValues("isQrCode")) && (
          <Controller
            name='barCode'
            control={control}
            render={({ field }) => <TextField
              label={getValues("isQrCode") ? t('dashboard_commerce.is_qr_code') : t('dashboard_commerce.barCode')}
              value={field.value}
              onChange={field.onChange}
              disabled={isDisabled || getValues("isQrCodeGreenplay") == true}
            />}
          />)}
        {errors && errors.barCode && <ErrorSpan>{errors.barCode[formLanguage]}</ErrorSpan>}

        <Controller
          name='stock'
          control={control}
          render={({ field }) => <TextField
            type='number'
            label={t('dashboard_commerce.stock')}
            value={field.value}
            onChange={(event) => {
              const uniqueBarCodesLength = getValues("uniqueBarCodes")?.length;
              const stock = uniqueBarCodesLength > 0 ? uniqueBarCodesLength : event.target.value

              console.log(`uniqueBarCodesLength : ${uniqueBarCodesLength} stock : ${stock}`)
              setAvailabilityByStock(stock)
              field.onChange(stock)
            }}
            disabled={isDisabled || (getValues("uniqueBarCodes")?.length > 0)

            }
          />}
        />

        <FlexWrapper>
          <Controller
            name="availability"
            control={control}
            render={({ field }) => <CustomSelect disabled={isDisabled} label={t('dashboard_commerce.availability')} options={availabilityOptions} value={field.value} onChange={field.onChange} />}
          />
          <Controller
            name="maxTransactionsPerPeriod"
            control={control}
            render={({ field }) => (
              <TextField
                type='number'
                label={t('dashboard_commerce.max_number_of_transaction_for_product_per_user')}
                value={field?.value?.value}
                onChange={(e) => field.onChange({ ...field?.value, value: e.target.value })}
                disabled={isDisabled}
                withPeriod
                periodRange={perRange}
                periodValue={perRange.find(item => item.value === field?.value?.period)}
                onChangePeriod={(item) => field.onChange({ ...field?.value, period: item.value })}
              />
            )}
          />
        </FlexWrapper>
        <Controller
          name="expirationDate"
          control={control}
          render={({ field }) => (
            <ExpirationWrapper className='date-picker-product'>
              <ExpirationLabel htmlFor='expirationDate'>{t('dashboard_commerce.expiration_date')}</ExpirationLabel>
              <DatePicker
                label="expirationDate"
                className='input'
                selected={field?.value}
                onChange={field.onChange}
                dateFormat="yyyy/MM/dd"
                showIcon
                disabled={isDisabled}
              />
            </ExpirationWrapper>
          )}
        />

        {initialValues.isApproved && (
          <div>
            <Controller
              name="status"
              control={control}
              render={({ field }) => <CustomSelect label={t('dashboard_commerce.orders_list.status')} options={productStatuses} value={field.value} onChange={field.onChange} />}
            />

          </div>
        )}
      </InventorySection>
    </Form>
  )
};

export default ProductForm;
