import { useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import styled from 'styled-components';
import gpColors from "constants/gpColors";
import { E_COMMERCE_STATUSES_COLORS } from 'constants/statuses';
import dateUtils, { DATE_FORMATS } from "utils/dateUtils";
import numberUtils from "utils/numberUtils";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import ExportXLSX from "shared/components/Excel/ExportXLSX";
import tableFunctions from "shared/other/tableFunctions";
import { sleep } from "containers/utils";

const StatusBlock = styled.div`
  border-radius: 4px;
  padding: 2px 12px;
  background-color: ${(props) => props.background};
  color: ${gpColors.white};
  width: fit-content;
`;

const StyledExcelButton = styled.button`
  position: absolute;
  right: 30px;
  top: -90px;
`;

const Wrapper = styled.div`
  position: relative;
`;

const StatusCell = ({ value }) => {
  const { t } = useTranslation('common');
  const orderStatus = useMemo(() => {
    const translationKey = value.replace(' ', '_');

    return t(`dashboard_commerce.orders_list.statuses.${translationKey}`);
  }, [t, value]);
  return <StatusBlock background={E_COMMERCE_STATUSES_COLORS[value]}>{orderStatus}</StatusBlock>
}

const PriceCell = ({ value }) => {
  const greenPoints = numberUtils.convertPriceToGreenpoints(value);

  return <div>{`${greenPoints}`}</div>
}
const GreenpointsCell = ({ value }) => {
  // const greenPoints = numberUtils.convertPriceToGreenpoints(value);

  return <div>{`${value}`}</div>
}

const OrdersList = ({ orders, onClickRow, onChangePageIndex, ordersPageSize, loadAllOrders }) => {
  const { t, i18n } = useTranslation('common');

  const downloadExcelButtonRef = useRef();


  const columns = useMemo(() => [
    {
      Header: t('dashboard_commerce.orders_list.order_sign'),
      accessor: 'orderNumber',
      Cell: (cell) => `#${cell.value.toUpperCase()}`,
    },
    {
      Header: t('dashboard_commerce.orders_list.tenant_name'),
      accessor: `product.tenantName`,
    },
    {
      Header: t('dashboard_commerce.orders_list.product_name'),
      accessor: `product.title.${i18n.language}`,
    },
    {
      Header: t('dashboard_commerce.orders_list.category'),
      accessor: 'product.categoryName',
    },
    {
      Header: t('dashboard_commerce.orders_list.date'),
      accessor: 'date',
      Cell: (cell) => dateUtils.formatDate(cell.value, DATE_FORMATS.DAY_MM_DD_HH_MM),
    },
    {
      Header: t('dashboard_commerce.orders_list.status'),
      accessor: 'status',
      Cell: StatusCell
    },
    {
      Header: t('dashboard_commerce.orders_list.customer'),
      accessor: 'userInfo.name',
    },
    {
      Header: t('dashboard_commerce.orders_list.greenpoints'),
      accessor: 'greenpoints',
      Cell: GreenpointsCell
    }
  ], [i18n.language, t]);

  const rows = useMemo(() => orders.map((order, idx) => ({
    ...order
  })), [orders]);

  const ordersListForCSV = useMemo(() => tableFunctions.formatsOrdersExportToCSVData(rows, columns, t, i18n.language), [columns, i18n.language, rows, t])
  const columnsDescriptionDataForCSV = useMemo(() => tableFunctions.getTenantOrdersListTableDescriptionDataForCSV(t), [t])

  const onClickDownloadExcel = useCallback(
    async () => {
      try {
        if(loadAllOrders) {
          await loadAllOrders();
        }
        await sleep(1000)

        if (downloadExcelButtonRef.current !== null) {
          downloadExcelButtonRef.current.click();
        }

      } catch (error) {
        console.log('error to fetch all users for excel', error)
      }
    },
    [loadAllOrders],
  )

  const disableGoToLastPage = useMemo(() => rows.some(i=> i.status === 'loading'), [rows])

  return (
    <Wrapper>
      <StyledExcelButton type="button" className="export-to-csv mb-4">
        <div className="export-to-csv-link" onClick={onClickDownloadExcel}>
          {t("global.exportToCSV")}
        </div>
        <ExportXLSX
          element={<div ref={downloadExcelButtonRef}></div>}
          sheet1Title={t('dashboard_commerce.orders_list.list_of_orders')}
          sheet1Data={ordersListForCSV}
          sheet2Data={columnsDescriptionDataForCSV}
          sheet2Title={t("global.description_of_data")}
          filename={'orders'}
        />
      </StyledExcelButton>
      <ReactDataTable columns={columns} rows={rows} onClickRow={onClickRow} sortBy={'date'} onChangePageIndex={onChangePageIndex} pageSize={ordersPageSize} disableGoToLastPage={disableGoToLastPage}/>
    </Wrapper>
  );
};

export default OrdersList;
