import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useTable, useSortBy, usePagination } from "react-table";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { userRoleSelector, USER_TYPES } from "redux/selectors/user";
import { deletePointsTransactions, TRANSACTION_COLLECTIONS, TRANSACTION_TYPES } from "services/users";
import ConfirmWindow from "shared/components/Modal/ConfirmWindow";
import usersHooks from "../../../hooks/users.hooks";
import DataTableBody from "../../../shared/components/dataTable/DataTableBody";
import DataTableHeader from "../../../shared/components/dataTable/DataTableHeader";
import DataTablePagination from "../../../shared/components/dataTable/DataTablePagination";
import dateUtils from "../../../utils/dateUtils";
import { number } from "prop-types";

const TransactionList = ({ userID, disabled }) => {
  const { t, i18n } = useTranslation('common');
  const loggedUserRole = useSelector(userRoleSelector);
  const { transactions, refetchTransactions } = usersHooks.useFetchUserTransactions({
    userID,
    collection: TRANSACTION_COLLECTIONS.greenpoint,
    transactionType: TRANSACTION_TYPES.SHOPPING,
  });
  
  const columns = useMemo(() => [
    {
      Header: '#',
      accessor: 'key',
    },
    {
      Header: t('commerce.product_page.product_name'),
      accessor: 'productName',
    },
    {
      Header: t('dashboard_commerce.orders_list.transaction_type'),
      accessor: 'transactionType',
    },
    {
      Header: t('dashboard_commerce.orders_list.date'),
      accessor: 'orderDate',
      sortType: 'datetime',
      Cell: (cell) => dateUtils.formatDate(cell.value),
    },
    {
      Header: t('global.value'),
      accessor: 'transactionValue'
    }
  ], [t]);

  const getProductName = (transactionDetails) => {
    
    if (!transactionDetails) return;

    if (Array.isArray(transactionDetails)) {

      return transactionDetails.map(item => i18n.language == 'fr' ? item.productNameFr : item.productName).join(', ');
    }
    const productTranslation = transactionDetails.level != undefined ? transactionDetails.level :
    (transactionDetails.productName == "badge" ? transactionDetails.name : 
    ((i18n.language == 'fr' && (transactionDetails.productNameFr ?? transactionDetails.sessionNameFr) !== undefined) ? 
    (transactionDetails.productNameFr ?? transactionDetails.sessionNameFr) : 
    (transactionDetails.productName ?? transactionDetails.sessionName)));

    return productTranslation;
  }

 
  const data = useMemo(() => transactions.map((item, idx) => ({
    key: idx + 1,
    ...item,
    transactionValue: item?.transactionType == TRANSACTION_TYPES.SHOPPING ? `( - ${item?.transactionValue})` : item?.transactionValue,
    productName: getProductName(item?.transactionDetails),
    orderDate: 
    item?.transactionType == TRANSACTION_TYPES.SESSION ?  new Date(parseInt(item.transactionDetails?.key.split("-")[0]))  : 
    item.createdAt.toDate()
  })), [transactions]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    rows,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex }
  } = useTable({ columns, data, initialState: { pageSize: 10 } }, useSortBy, usePagination);

  const handleDeleteTransaction = useCallback(
    async (transactionID) => {
      try {
        if (loggedUserRole !== USER_TYPES.CITY) {
          toast.error(t('admin.dont_have_permission'));
          return;
        }

        await deletePointsTransactions({
          userID,
          collection: TRANSACTION_COLLECTIONS.greenpoint,
          transactionID
        })
        refetchTransactions()
        toast.success(t('admin.success_delete_transaction'));
      } catch (error) {
        toast.error(t('admin.failure_delete_transaction'));
      }
    },
    [loggedUserRole, refetchTransactions, t, userID],
  )

  return (
    <>
      <table {...getTableProps()} className="data-table">
        <DataTableHeader headerGroups={headerGroups} sortable />
        <DataTableBody
          getTableBodyProps={getTableBodyProps}
          prepareRow={prepareRow}
          page={page}
          additionalColumns={(row) =>
          (<td className="data-table-data">
            <ConfirmWindow
              confirmTitle={t('admin.confirm_delete_transaction_title')}
              confirmText={t('admin.confirm_delete_transaction_description')}
              handleConfirmClick={() => handleDeleteTransaction(row.original.id)}
              Button={Button}
              disabled={disabled}
              buttonText={t('global.delete')}
              buttonProps={{
              color:"danger",
              size:"sm",
              className:"mb-0"
              }} />
          </td>)
          }
        />
      </table>
      <DataTablePagination
        gotoPage={gotoPage}
        nextPage={nextPage}
        previousPage={previousPage}
        pageIndex={pageIndex}
        pageOptions={pageOptions}
        pageCount={pageCount}
        canNextPage={canNextPage}
        canPreviousPage={canPreviousPage}
      />
    </>

  )
};

export default TransactionList;
