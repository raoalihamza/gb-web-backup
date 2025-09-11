import { useState } from "react";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@material-ui/icons/Delete";
import styled from "styled-components";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const CustomDeleteButton = styled(Button)`
  margin: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  // without important not removing text capitalization
  text-transform: none !important;
`;

const DeleteButton = ({ handleDelete, disabled, btnTitle, dialogTitle, dialogDescription, color = '', variant = '' }) => {
  const { t } = useTranslation("common");
  const [openConfirmWindow, setOpenConfirmWindow] = useState(false);

  const handleClickOpen = () => {
    setOpenConfirmWindow(true);
  };

  const handleClose = () => {
    setOpenConfirmWindow(false);
  };

  return (
    <>
      <CustomDeleteButton onClick={handleClickOpen} disabled={disabled} color={color} variant={variant}>
        <DeleteIcon fontSize="small" style={{ marginRight: "5px" }} />
        {btnTitle}
      </CustomDeleteButton>

      <Dialog
        open={openConfirmWindow}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialogTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogDescription}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {t("account.profile.no")}
          </Button>
          <Button
            onClick={() => {
              handleDelete();
              handleClose();
            }}
            color="primary"
            autoFocus
          >
            {t("account.profile.yes")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteButton;
