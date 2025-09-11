import { Button } from "reactstrap";
import LayoutContent from "atomicComponents/LayoutContent";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import CardBox from "atomicComponents/CardBox";
import ProductForm, { FORM_ID } from "components/Tenant/ProductForm";
import { firestore } from "containers/firebase";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "shared/providers/AuthProvider";
import validateCreateProduct from "components/Tenant/validation/validationCreateProduct";
import { COLLECTION } from "shared/strings/firebase";
import { toast } from "shared/components/Toast";
import {
  updateTenantProductFields,
  editTenantProduct,
  deleteTenantProduct,
  getTenantCategoryOptions,
  getTenantCollectionNameFromTenantStatus,
} from "services/tenants";
import { generatedDownloadUrl, generatedFullImagePath, uploadImage } from "services/bucket-storage";
import { useHistory } from "react-router-dom";
import { routes } from "containers/App/Router";
import { useParams } from "react-router-dom";
import tenantHooks from "hooks/tenant.hooks";
import ConfirmWindow from "shared/components/Modal/ConfirmWindow";
import { PRODUCT_STATUSES } from "constants/statuses";
import { isUserAdminSelector } from "redux/selectors/user";
import { useSelector } from "react-redux";

const Wrapper = styled.div`
  width: 80%;
  margin: auto;
  padding-bottom: 20px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
`;

const GREENPOINTS_CURRENCY = 100;

const TenantEditProduct = () => {
  const { i18n, t } = useTranslation("common");
  const [tenantId, loggedUserDetails, adminData] = useAuth();
  const [errors, setErrors] = useState();
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([])
  const navigate = useHistory();
  const params = useParams();
  const [tenantID, setTenantID] = useState(tenantId)
  const isAdmin = useSelector(isUserAdminSelector);

  const productId = useMemo(() => params?.productID, [params?.productID]);

  const { details } = tenantHooks.useFetchProductDetails(loggedUserDetails, productId);

  const isTenant = useMemo(() => loggedUserDetails.role === "tenant", [loggedUserDetails.role]);

  useEffect(() => {
    if ((!isTenant && adminData?.tenantId && details) && details?.tenantId !== adminData?.tenantId) {
      navigate.push(adminData?.tenantId ? `${routes.tenant.productList}?tenantId=${adminData.tenantId}` : routes.tenant.productList);
    }
  }, [adminData?.tenantId, details, isTenant, navigate])

  useEffect(() => {
    if (adminData?.tenantId) {
      setTenantID(adminData.tenantId)
    } else if (details?.tenantId) {
      setTenantID(details.tenantId)
    }
  }, [adminData?.tenantId, details?.tenantId])

  const uploadImagesAndTransformToData = useCallback(
    (images) => {
      if (!images) return [];

      const imagesRes = images.map(async (img, idx) => {
        if (img.id) {
          return {
            path: img.path || '',
            order: img.order,
            originUrl: img.originUrl,
            thumbnailUrl: img.thumbnailUrl,
            isMain: idx === 0,
            id: img.id,
          };
        }

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
    },
    [tenantID]
  );

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
        const editData = {
          ...data,
          images: imagesData,
          price: Number(+data?.price),
          greenpoints: Number(+data?.price * GREENPOINTS_CURRENCY),
          initialStock: Number(data?.initialStock) < Number(data?.stock) ? Number(data?.initialStock) + Number(data?.stock) : Number(data?.initialStock),
          stock: Number(data?.stock),
          uniqueBarCodes: (data.isUniqueBarcode || data.isUniqueQrcode) ? data?.uniqueBarCodes : [],
        };

        if (isTenant) {

          const editDataPlusStatus = { ...editData, status: PRODUCT_STATUSES.needApproval, isApproved: false }

          if (loggedUserDetails.cityId) {
            editDataPlusStatus.cityId = loggedUserDetails.cityId;
          }

          await editTenantProduct(tenantID, productId, editDataPlusStatus);

        } else {

          await updateTenantProductFields(productId, { ...editData, status: editData.status });
        }
        setLoading(false);
        toast.success(t("dashboard_commerce.edit_product_success"));
        navigate.push(routes.tenant.productList);
      } catch (error) {
        setErrors(null);
        setLoading(false);
        toast.error(t("dashboard_commerce.edit_product_failed"));
        console.error("Failed submit", error);
      }
    },
    [i18n.language, isTenant, navigate, productId, t, tenantID, uploadImagesAndTransformToData, loggedUserDetails?.cityId]
  );

  const onDeleteProduct = useCallback(async () => {
    try {
      setLoading(true);

      await deleteTenantProduct(tenantID, productId);

      setLoading(false);
      toast.success(t("dashboard_commerce.delete_product_success"));
      navigate.push(routes.tenant.productList)
    } catch (error) {
      setLoading(false);
      toast.error(t("dashboard_commerce.delete_product_failed"));
      console.error("Failed delete product", error);
    }

  }, [navigate, productId, t, tenantID]);

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
    <LayoutContent title={t("dashboard_commerce.edit_product")} withBreadcrumbs>
      <ButtonWrapper>
        {(details?.isUniqueBarcode || details?.isUniqueQrcode) && <Button
          type="button"
          color="link"
          size="sm"
          disabled={loading}
          onClick={() => navigate.push(routes.tenant.productBarCodes.replace(":productId", productId))}
        >
          {details?.isUniqueQrcode ? t("commerce.product_edit.see_QrCode_list") : t("commerce.product_edit.see_barCode_list")}
        </Button>}
        <Button type="submit" color="primary" size="sm" disabled={loading} form={FORM_ID}>
          {t("commerce.product_edit.save")}
        </Button>
      </ButtonWrapper>
      <Wrapper>
        <CardBox>
          {details && (
            <ProductForm
              onSubmit={onSubmit}
              errors={errors}
              initialValues={details}
              isEdit={true}
              isTenant={isTenant || isAdmin}
              tenantName={details.tenantName}
              categoryOptions={categoryOptions}
            />
          )}
        </CardBox>
      </Wrapper>
      {(isTenant || isAdmin) && (
        <ButtonWrapper>
          <ConfirmWindow
            Button={Button}
            buttonProps={{
              type: "button",
              color: "danger",
              size: "sm",
              disabled: loading,
            }}
            buttonText={t("commerce.product_edit.delete")}
            confirmTitle={t("commerce.product_edit.confirm_delete_title")}
            handleConfirmClick={onDeleteProduct}
          />
        </ButtonWrapper>
      )}
    </LayoutContent>
  );
};

export default TenantEditProduct;
