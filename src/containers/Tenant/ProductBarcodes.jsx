import React, { useMemo, useCallback, useEffect } from "react";
import CardBox from "atomicComponents/CardBox";
import styled from "styled-components";
import { useAuth } from "shared/providers/AuthProvider";

import { useTranslation } from "react-i18next";

import { useParams, useHistory } from "react-router-dom";
import tenantHooks from "hooks/tenant.hooks";
import usersHooks from "hooks/users.hooks";
import dateUtils, { DATE_FORMATS } from "utils/dateUtils";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import { Button } from "reactstrap";
import gpColors from "constants/gpColors";
import { BARCODES_STATUSES_COLORS } from "constants/statuses";
import { capitalizeFirstLetter } from "utils";
import { getOrderIdFromOrderNumber } from "services/tenants";
import { routes } from "containers/App/Router";

const Wrapper = styled.div`
  padding-bottom: 12px;
`;

const Flex = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: flex-end;
`;

const StatusBlock = styled.div`
  border-radius: 4px;
  padding: 6px 16px;
  background-color: ${(props) => props.background};
  color: ${gpColors.white};
  width: fit-content;
`;

const changeStatusesMap = {
    active: "used",
    used: "active",
    cancelled: "cancelled",
};

const changeButtonTypeByStatus = {
    active: "success",
    used: "primary",
    cancelled: "primary",
};

const ProductBarCodes = () => {
    const [t] = useTranslation("common");
    const { productId } = useParams();
    const navigate = useHistory();
    const [tenantId, loggedUserDetails] = useAuth();

    const { userId, disabled, adminData, details } = usersHooks.useExternalUser();

    const { barCodes, updateBarCodeStatus } = tenantHooks.useProductBarCodes({ productId, userId });

    const isTenant = useMemo(() => loggedUserDetails.role === "tenant", [loggedUserDetails.role]);

    // useEffect(() => {
    //   console.log(`details?.tenantId : ${details?.tenantId}`)
    //   console.log(`adminData?.tenantId : ${tenantId}`)
    //   console.log(`isTenant :${isTenant}`);
    //   if ((!isTenant && adminData?.tenantId && details) && details?.tenantId !== adminData?.tenantId) {
    //     console.log(`details?.tenantId !== adminData?.tenantId ${details?.tenantId !== adminData?.tenantId}`)
    //     navigate.push(adminData?.tenantId ? `${routes.tenant.productList}?tenantId=${adminData.tenantId}` : routes.tenant.productList);
    //   }
    // }, [adminData?.tenantId, details, navigate])

    const columns = useMemo(
        () => [
            {
                Header: t("dashboard_commerce.bar_code_number"),
                accessor: `barCode`,
                Cell: (cell) => `#${cell.value}`,
            },
            {
                Header: t("dashboard_commerce.orders_list.order_id"),
                accessor: "orderNumber",
            },
            {
                Header: t("dashboard_commerce.orders_list.customer"),
                accessor: "user.userName",
            },
            {
                Header: t("dashboard_commerce.orders_list.date"),
                accessor: "date",
                Cell: (cell) => dateUtils.formatDate(cell.value, DATE_FORMATS.DAY_MM_DD_HH_MM),
            },
            {
                Header: "",
                accessor: "status",
                Cell: ({ value, row }) => {
                    const statusText = t(`dashboard_commerce.status_${value}`);
                    const changeToStatus = changeStatusesMap[value];
                    const newStatus = t(`dashboard_commerce.status_${changeToStatus}`);
                    const buttonType = changeButtonTypeByStatus[changeToStatus];
                    const additionalChangeStatusButtonStyles = {
                        ...(buttonType === "success" ? { background: "green", borderColor: "green" } : {}),
                    };

                    return (
                        <Flex>
                            <StatusBlock background={BARCODES_STATUSES_COLORS[value]}>
                                {capitalizeFirstLetter(statusText)}
                            </StatusBlock>

                            {(changeToStatus === "used" || changeToStatus === "active") && (
                                <>
                                    <Button
                                        type="button"
                                        color={buttonType}
                                        size="sm"
                                        disabled={disabled}
                                        style={{ ...additionalChangeStatusButtonStyles, margin: 0 }}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('row.original.tenantId', row.original)
                                            await updateBarCodeStatus(row.original.barCode, changeToStatus, row.original.tenantId);
                                        }}
                                    >
                                        {t(`dashboard_commerce.make_it_start`)} {newStatus}
                                    </Button>
                                    <Button
                                        type="button"
                                        color="link"
                                        size="sm"
                                        disabled={disabled}
                                        style={{ color: "red", margin: 0 }}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            await updateBarCodeStatus(row.original.barCode, "cancelled", row.original.tenantId);
                                        }}
                                    >
                                        {t("account.profile.cancel_btn")}
                                    </Button>
                                </>
                            )}
                        </Flex>
                    );
                },
            },
        ],
        [disabled, t, updateBarCodeStatus]
    );
    const history = useHistory();

    const onClickUserRow = useCallback(
        async ({ orderNumber, tenantId }) => {
            const orderId = await getOrderIdFromOrderNumber(orderNumber, tenantId);

            history.push(`/tenant/dashboard/orders/${orderId}`);
        },
        [history]
    );

    const rows = useMemo(
        () =>
            barCodes.map((barCode, idx) => ({
                ...barCode,
                // tenantId: userId,
                date: (barCode.updatedAt !== undefined ? barCode.updatedAt.toDate() : barCode.createdAt.toDate()) || "",
            })),
        [barCodes, userId]
    );

    return (
        <Wrapper>
            <CardBox padding="12px" style={{ marginTop: 2 }}>
                <ReactDataTable columns={columns} rows={rows} sortBy="date" onClickRow={onClickUserRow} />
            </CardBox>
        </Wrapper>
    );
};

export default ProductBarCodes;
