import numberUtils from "utils/numberUtils";

// const useIsEnglishAvailable = () => {
//   const isEnglishAvailable = useMemo(() => process.env.REACT_APP_LANGUAGES?.split(",").includes("en"), []);
//   return { isEnglishAvailable }
// };

//let languages = process.env.REACT_APP_LANGUAGES;

const validateCreateProduct = (values, languages) => {

  const isFrench = languages == "fr" ? true : false;
  const errors = {};

  if (!values.title_en && !values.title_fr) {
    errors.title_en = {
      fr: "Le titre doit être en anglais et en français",
      en: "The title must be in English and French",
    };
    errors.title_fr = {
      fr: "Le titre doit être en anglais et en français",
      en: "The title must be in English and French",
    };
  }

  if (!isFrench && !values.bodyText_en && !values.bodyText_fr) {
    errors.bodyText_en = {
      fr: "Vous devez écrire une description en anglais et en français",
      en: "You need to add a Description in English and in French",
    };
    errors.bodyText_fr = {
      fr: "Vous devez écrire une description en anglais et en français",
      en: "You need to add a Description in English and in French",
    };
  }

  if (isFrench && !values.bodyText_fr) {
    errors.bodyText_en = {
      fr: "Vous devez entrer une description",
      en: "You must add a description",
    };
    errors.bodyText_fr = {
      fr: "Vous devez entrer une description",
      en: "You must add a description",
    };
  }

  // if (!values.price || values.price === 0) {
  //   errors.price = {
  //     fr: "Le prix ne peut pas être nul",
  //     en: "The price cannot be zero",
  //   };
  // }

  if (values.isUniqueBarcode && values.uniqueBarCodes.length === 0) {
    errors.uniqueBarCodes = {
      fr: "Vous devez ajouter une liste de codes à barres",
      en: "You must add a barCode list",
    };
  }

  if (!values.isBarCode && !values.isCoupon && !values.isUniqueBarcode && !values.isQrCodeGreenplay && !values.isDelivery && !values.isQrCode && !values.isUniqueQrcode) {
    errors.productType = {
      fr: "Vous devez sélectionner le type de produit",
      en: "You must select the product type",
    };
  }

  if (values.isBarCode && !values.barCode) {
    errors.barCode = {
      fr: "Vous devez entrer un code à barres si vous sélectionnez l'option « Code à barres »",
      en: "You must add a barcode if you select the barCode option",
    };
  }

  if (values.isQrCode && !values.barCode) {
    errors.barCode = {
      fr: "Vous devez entrer un code QR si vous sélectionnez l'option « code QR »",
      en: "You must add a Qr Code if you select the Qr code option",
    };
  }
  if (values.images?.length === 0) {
    errors.images = {
      fr: "Vous devez ajouter au moins une image",
      en: "You need to add at least one picture",
    };
  }

  if (values.images?.some(img => numberUtils.convertBytesToSize(img.size)?.number >= 7)) {
    errors.images = {
      fr: "La taille de chaque image ne peut pas dépasser 7 Mo",
      en: "The size of each image cannot exceed 7 MB",
    };
  }

  return errors;
};
export default validateCreateProduct;
