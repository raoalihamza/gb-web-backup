import { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import styled from "styled-components";
import { Controller, useForm } from "react-hook-form";
import { CheckBoxField } from "shared/components/form/CheckBoxUser";
import ProductCard from "shared/components/ProductCard";
import { CircularProgress, Typography } from "@material-ui/core";

const Form = styled.form``;
const InfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
`;
const ProductInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  flex-shrink: 0;
`;

export const FORM_ID = "create-order-form";

let defaultValues = {
  usersEmails: [],
};

const CreateOrderDialog = ({ handleSubmitClick, Button, isOpened, setIsOpened, productToCreateOrders, loading }) => {
  const [t, i18n] = useTranslation("common");
  const [openCreateOrderDialog, setOpenCreateOrderDialog] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues,
  });

  const handleClose = () => {
    if (loading) return;

    setOpenCreateOrderDialog(false);
    if (setIsOpened) {
      setIsOpened(false);
    }
  };

  return (
    <>
      <Dialog
        open={isOpened || openCreateOrderDialog}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        aria-labelledby="create-order-title"
        aria-describedby="create-order-description"
      >
        <DialogTitle id="create-order-title">{t("dashboard_commerce.create_order")}</DialogTitle>

        <Form
          onSubmit={handleSubmit(async (data) => {
            await handleSubmitClick(data, productToCreateOrders);
            handleClose();
          })}
          id={FORM_ID}
        >
          <DialogContent>
            <InfoWrapper>
              <ProductInfoContainer>
                <Typography variant="h5">{t("dashboard_commerce.products_list.name")}</Typography>
                <ProductCard
                  store={productToCreateOrders?.tenantName ?? ""}
                  category={productToCreateOrders?.categories[0]?.categoryName ?? " "}
                  image={productToCreateOrders?.image ?? ""}
                  name={productToCreateOrders?.name[i18n.language] ?? ""}
                  quantity={productToCreateOrders?.stock ?? ""}
                />
              </ProductInfoContainer>
            </InfoWrapper>
            <Controller
              name="usersEmails"
              control={control}
              render={({ field }) => (
                <div>
                  <CheckBoxField {...field} showCheckbox={false} value={field.value} t={t} />
                </div>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="danger">
              {t("forms.cancel")}
            </Button>
            <Button color="primary" type="submit">
              {loading ? <CircularProgress style={{ color: "white" }} size={15} /> : t("forms.submit")}
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
    </>
  );
};

export default CreateOrderDialog;
