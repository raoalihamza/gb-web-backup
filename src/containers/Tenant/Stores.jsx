import React, { useCallback, useMemo, useState, useEffect } from "react";
import CardBox from "atomicComponents/CardBox";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import { useAuth } from "shared/providers/AuthProvider";
import { useHistory } from "react-router-dom";
import cityHooks from "hooks/city.hooks";
import { routes } from "containers/App/Router";
import { useSelector } from "react-redux";
import { isUserAdminSelector } from "redux/selectors/user";
import { Button } from "reactstrap";
import CustomSelect from "atomicComponents/CustomSelect";
import { deleteTenant } from "services/tenants";
import { toast } from "react-toastify";
import Toast from "shared/components/Toast";
import ConfirmWindow from "shared/components/Modal/ConfirmWindow";
import { TENANTS_STATUSES } from "constants/statuses";

const Wrapper = styled.div`
  padding-bottom: 12px;
`;

const ImageWrapper = styled.div`
  width: 120px;
  height: 80px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const ImageCell = ({ value }) => (
  <ImageWrapper>
    <img src={value} alt={value} style={{ height: "100%" }} />
  </ImageWrapper>
);

const EditDeleteCell = ({ row, column, onChangeCell, onEdit, onDelete, onShare }) => {
  const { t } = useTranslation("common");

  const onChange = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.target.value === "edit") {
        onEdit(row.original);
      }
      if (e.target.value === "delete") {
        onDelete(row.original);
      }
      onChangeCell && onChangeCell({ cellData: row.original, column, value: e.target.value });
    },
    [column, onChangeCell, onDelete, onEdit, row.original]
  );

  const onClick = useCallback(
    (item) => {
      if (item.value === "edit") {
        onEdit(row.original);
      }
      if (item.value === "delete") {
        onDelete(row.original);
      }
      if (item.value === "share") {
        onShare(row.original);
      }
    },
    [onDelete, onEdit, onShare, row.original]
  );

  const options = useMemo(() => {
    const opts = [
      { label: t("global.edit"), value: "edit" },
      { label: t("global.delete"), value: "delete" },
    ];

    if (row.original.status === "Pending" || row.original.status === "En attente") {
      opts.push({ label: t("account.profile.shareLink"), value: "share" });
    }

    return opts;
  }, [row.original.status, t]);

  const onClose = useCallback((e) => e.stopPropagation(), []);

  return (
    <CustomSelect
      withLabel={false}
      label={t("global.actions")}
      options={options}
      value={options[0].value}
      onChange={onChange}
      onClose={onClose}
      onClick={onClick}
    />
  );
};

const Stores = () => {
  const { t } = useTranslation("common");
  const [, userDetails] = useAuth();
  const isAdmin = useSelector(isUserAdminSelector);

  const [isOpenedConfirmDeleteTenant, setIsOpenedConfirmDeleteTenant] = useState(false);
  const [tenantRowToDelete, setTenantRowToDelete] = useState();

  const { stores: initialStores, refetchStoresForCity } = cityHooks.useFetchTenantStores(userDetails);
  const [stores, setStores] = useState([]);

  const history = useHistory();

  const tenantStatuses = useMemo(() => {
    const status = [
      { label: t('tenant_status.confirmed'), value: TENANTS_STATUSES.confirmed },
      { label: t('tenant_status.pending'), value: TENANTS_STATUSES.pending },
    ];

    return status;
  }, [t]);

  // Utiliser useEffect pour mettre à jour le statut des stores
  useEffect(() => {
    if (initialStores) {
      const updatedStores = initialStores.map(store => ({
        ...store,
        status: tenantStatuses.find(status => status.value === store.status)?.label || store.status,
      }));
      setStores(updatedStores);
    }
  }, [initialStores, tenantStatuses]);

  const handleClickRow = useCallback(
    (rowData) => {
      history.push(routes.tenant.profileById.replace(":id", rowData.id));
    },
    [history]
  );

  const handleDeleteTenant = useCallback(
    async (rowData) => {
      await deleteTenant(rowData.id, rowData.status);
      await refetchStoresForCity();
    },
    [refetchStoresForCity]
  );

  const handleOpenConfirmDeleteTenant = useCallback(async (rowData) => {
    setTenantRowToDelete(rowData);
    setIsOpenedConfirmDeleteTenant(true);
  }, []);

  const onShare = useCallback((rowData) => {
    const link = `${window.location.origin}${routes.register.entity.replace(
      ":entity",
      "confirm-tenant"
    )}?pendingTenantId=${rowData.id}`;

    navigator.clipboard.writeText(link);
    toast.success(t("admin.link_copied"));
  }, [t]);

  const columns = useMemo(() => {
    const cols = [
      {
        Header: t("dashboard_commerce.stores_list.image"),
        accessor: "image",
        Cell: ImageCell,
      },
      {
        Header: t("dashboard_commerce.stores_list.name"),
        accessor: "name",
      },
      {
        Header: t("dashboard_commerce.stores_list.address"),
        accessor: "address",
      },
      {
        Header: t("dashboard_commerce.orders_list.status"),
        accessor: "status",
      },
      {
        Header: "",
        accessor: "empty2",
      },
    ];

    if (isAdmin) {
      cols.push({
        Header: t("global.actions"),
        accessor: "actions",
        Cell: (props) => (
          <EditDeleteCell
            {...props}
            onEdit={handleClickRow}
            onDelete={handleOpenConfirmDeleteTenant}
            onShare={onShare}
          />
        ),
      });
    }

    return cols;
  }, [handleClickRow, handleOpenConfirmDeleteTenant, isAdmin, onShare, t]);

  return (
    <Wrapper>
      <Toast />
      <CardBox padding="12px" style={{ marginTop: 2 }}>
        {isAdmin && (
          <ButtonWrapper>
            <Button
              style={{ margin: 0 }}
              onClick={() => {
                history.push(routes.tenant.addProfile);
              }}
            >
              {t("admin.create_tenant")}
            </Button>
          </ButtonWrapper>
        )}
        <ReactDataTable columns={columns} rows={stores} onClickRow={handleClickRow} />
      </CardBox>
      <ConfirmWindow
        confirmTitle={t("admin.delete_tenant_confirm_title")}
        confirmText={t("admin.delete_tenant_confirm_description")}
        handleConfirmClick={() => handleDeleteTenant(tenantRowToDelete)}
        // buttonText={t("admin.global.delete")}
        Button={Button}
        isOpened={isOpenedConfirmDeleteTenant}
        setIsOpened={setIsOpenedConfirmDeleteTenant}
      />
    </Wrapper>
  );
};

export default Stores;
