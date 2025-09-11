import { Button } from "reactstrap";
import LayoutContent from "atomicComponents/LayoutContent";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import CardBox from "atomicComponents/CardBox";
import ProductForm, { FORM_ID } from "components/Tenant/ProductForm";
import { firestore } from "containers/firebase";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "shared/providers/AuthProvider";
import validateCreateProduct from "components/Tenant/validation/validationCreateProduct";
import { COLLECTION } from "shared/strings/firebase";
import { toast } from "shared/components/Toast";
import { createTenantProduct, getTenantCategoryOptions, getTenantCollectionNameFromTenantStatus } from "services/tenants";
import { generatedDownloadUrl, generatedFullImagePath, uploadImage } from "services/bucket-storage";
import { useHistory } from "react-router-dom";
import { routes } from "containers/App/Router";
import { TENANTS_STATUSES } from "constants/statuses";

const Wrapper = styled.div`
  width: 80%;
  margin: auto;
  padding-bottom: 20px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
`;

const TenantAddProduct = () => {
  const { i18n, t } = useTranslation("common");
  const [tenantId, loggedUserDetails, adminData] = useAuth();
  const [errors, setErrors] = useState();
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([])
  const navigate = useHistory();
  const [tenantID, setTenantID] = useState(tenantId)
  const [tenantData, setTenantData] = useState()
  // const [tenantStatus, setTenantStatus] = useState('confirmed')

  useEffect(() => {
    if (loggedUserDetails.role !== 'tenant' && !adminData?.tenantId) {
      navigate.push(adminData?.tenantId ? `${routes.tenant.productList}?tenantId=${adminData.tenantId}` : routes.tenant.productList)
    }
  }, [adminData?.tenantId, loggedUserDetails.role, navigate])

  useEffect(() => {
    if (adminData?.tenantId) {
      setTenantID(adminData.tenantId)
      firestore.collection(COLLECTION.Tenants).doc(adminData.tenantId).get().then((data) => {
        setTenantData({ ...data.data(), id: data.id })
      })
    }
  }, [adminData?.tenantId])

  const uploadImagesAndTransformToData = useCallback((images) => {
    if (!images) return [];

    const imagesRes = images.map(async (img, idx) => {
      const doc = firestore.collection(COLLECTION.Tenants).doc();
      const imagePath = `tenant/${tenantID}/products/images/`;
      const imageName = doc.id;

      await uploadImage(img, `${imagePath}${imageName}`);

      const fireBaseUrl = await generatedDownloadUrl(imagePath, imageName);
      const storagePath = generatedFullImagePath(imagePath, imageName);

      return {
        path: storagePath,
        order: idx + 1,
        originUrl: fireBaseUrl,
        thumbnailUrl: "",
        isMain: idx === 0,
        id: imageName,
      };
    });

    return Promise.all(imagesRes);
  }, [tenantID]);

  const onSubmit = useCallback(
    async (data) => {

      setLoading(true);

      const error = validateCreateProduct(data, i18n.language);
      if (Object.keys(error).length > 0) {
        setErrors(error);
        setLoading(false);
        return;
      }

      try {
        const imagesData = await uploadImagesAndTransformToData(data?.images);
        const createData = { ...data, images: imagesData };

        if (loggedUserDetails.cityId == undefined) {
          console.log("loggedUserDetails.cityId == undefined :", loggedUserDetails.cityId == undefined)
          createData.cityId = loggedUserDetails.id;
        } else {
          createData.cityId = loggedUserDetails.cityId;
        }

        await createTenantProduct(tenantID, createData);
        setLoading(false);
        toast.success(t("dashboard_commerce.add_product_success"));
        navigate.push(adminData?.tenantId ? `${routes.tenant.productList}?tenantId=${adminData.tenantId}` : routes.tenant.productList);
      } catch (error) {
        setErrors(null);
        setLoading(false);
        toast.error(t("dashboard_commerce.add_product_failed"));
        console.error('Failed submit', error);
      }
    },
    [adminData?.tenantId, i18n.language, loggedUserDetails?.cityId, navigate, t, tenantID, uploadImagesAndTransformToData]
  );

  const setCategoryOptionsFromCollection = useCallback(async () => {
    const options = await getTenantCategoryOptions(tenantID)
    const formattedOptions = options.map(opt => {
      return {
        ...opt,
        value: opt.categoryName,
        label: opt.categoryName
      }
    })
    setCategoryOptions(formattedOptions)
  }, [tenantID])


  useEffect(() => {
    setCategoryOptionsFromCollection()
  }, [setCategoryOptionsFromCollection])

  return (
    <LayoutContent title={t("dashboard_commerce.add_product")} withBreadcrumbs>
      <ButtonWrapper>
        <Button type="submit" color="primary" size="sm" disabled={loading} form={FORM_ID}>
          {t("commerce.product_edit.save")}
        </Button>
      </ButtonWrapper>
      <Wrapper>
        <CardBox>
          <ProductForm onSubmit={onSubmit} errors={errors} isTenant categoryOptions={categoryOptions} tenantName={tenantData?.name} />
        </CardBox>
      </Wrapper>
    </LayoutContent>
  );
};

export default TenantAddProduct;
