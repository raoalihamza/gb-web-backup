import { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const ConfirmWindow = ({
  handleConfirmClick,
  Button,
  confirmTitle,
  confirmText,
  buttonProps = {},
  buttonText,
  isOpened,
  setIsOpened,
  disabledButton
}) => {
  const { t } = useTranslation("common");
  const [openConfirmWindow, setOpenConfirmWindow] = useState(false);

  const handleClickOpen = () => {
    setOpenConfirmWindow(true);
    if (setIsOpened) {
      setIsOpened(true);
    }
  };

  const handleClose = () => {
    setOpenConfirmWindow(false);
    if (setIsOpened) {
      setIsOpened(false);
    }
  };

  return (
    <>
      {buttonText && (
        <Button onClick={handleClickOpen} {...buttonProps} disabled={disabledButton}>
          {buttonText}
        </Button>
      )}

      <Dialog
        open={isOpened || openConfirmWindow}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{confirmTitle}</DialogTitle>
        {confirmText && (
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{confirmText}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {t("account.profile.no")}
          </Button>
          <Button
            onClick={() => {
              handleConfirmClick();
              handleClose();
            }}
            color="primary"
            autoFocus
            disabled={disabledButton}
          >
            {t("account.profile.yes")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfirmWindow;
