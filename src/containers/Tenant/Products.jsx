import React, { useCallback, useState, useMemo, useEffect } from 'react';
import CardBox from 'atomicComponents/CardBox';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';
import TabsButton from 'atomicComponents/TabsButton';
import ReactDataTable from 'shared/components/dataTable/ReactDataTable';
import numberUtils from 'utils/numberUtils';
import { useAuth } from 'shared/providers/AuthProvider';
import { useHistory } from 'react-router-dom';
import { editTenantProductRoute } from 'containers/App/Router';
import { PRODUCT_STATUSES } from 'constants/statuses';
import { createProductTransactionsByAdmin, getTenantProductById, updateTenantProductFields } from 'services/tenants';
import tenantHooks from 'hooks/tenant.hooks';
import { useSelector } from 'react-redux';
import { userRoleSelector, USER_TYPES, isUserAdminSelector } from 'redux/selectors/user';
import CustomSelect from 'atomicComponents/CustomSelect';
import { CustomSwitch } from 'atomicComponents/CustomSwitch';
import CreateOrderDialog from './CreateOrderDialog';
import { Button } from 'reactstrap';
import Toast, { toast } from 'shared/components/Toast';
import usersHooks from 'hooks/users.hooks';

const Wrapper = styled.div`
  padding-bottom: 12px;
`;

const ImageWrapper = styled.div`
  width: 100px;
  height: 80px;
`;

const ImageCell = ({ value }) => (
  <ImageWrapper>
    <img src={value} style={{ height: '100%' }} />
  </ImageWrapper>
);

const PriceCell = ({ value }) => {
  const greenPoints = numberUtils.convertPriceToGreenpoints(value);

  return <div>{`CAD ${value} | Greenpoints ${greenPoints}`}</div>
}

const ApprovedCell = ({ value, row, column, onChangeCell }) => {
  const handleClick = useCallback(async (e) => {
    e.stopPropagation();
    const isApproved = e.target.checked;

    await updateTenantProductFields(row.original.id, { isApproved });
  }, [row.original]);

  return <CustomSwitch
    checked={!!value}
    onClick={handleClick}
    onChange={(e, isChecked) => onChangeCell({ cellData: row.original, column, value: isChecked })}
  />
};

const StatusCell = ({ value, row, column, onChangeCell, productStatuses, onChangeOverridden }) => {
  const pickerValue = productStatuses.find(stat => stat.value === value)

  const onChange = useCallback(async (e) => {
    e.stopPropagation();
    const newStatusItem = productStatuses.find(stat => stat.value === e.target.value)
    if (newStatusItem.onChangeOverridden) {
      newStatusItem.onChangeOverridden(row.original);
      return;
    }
    await updateTenantProductFields(row.original.id, { status: e.target.value });
    onChangeCell({ cellData: row.original, column, value: e.target.value });
  }, [column, onChangeCell, productStatuses, row.original]);

  const onClose = useCallback((e) => e.stopPropagation(), []);

  return (
    <CustomSelect
      withLabel={false}
      disabled={!row.original.isApproved}
      label="status"
      options={productStatuses}
      value={pickerValue?.value}
      onChange={onChange}
      onClose={onClose}
    />
  )
};

const EditDeleteCell = ({ row, column, onChangeCell, onEdit }) => {
  const { t } = useTranslation('common')

  const onChange = useCallback((e) => {
    e.stopPropagation()
    if (e.target.value === 'edit') {
      onEdit(row.original.id)
    }
    onChangeCell({ cellData: row.original, column, value: e.target.value });
  }, [column, onChangeCell, onEdit, row.original]);

  const onClick = useCallback((item) => {
    if (item.value === 'edit') {
      onEdit(row.original.id)
    }
  }, []);

  const options = useMemo(() => [
    { label: t("global.edit"), value: "edit" }
  ], [t])

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
  )
};

const Products = () => {
  const [t, i18n] = useTranslation('common');
  const [productBy, setProductBy] = useState({ label: 'all' });
  const {adminData, details: userDetails} = usersHooks.useExternalUser();
  const { products: data, refreshProducts } = tenantHooks.useFetchProducts(userDetails);
  const [products, setProducts] = useState([]);
  const history = useHistory();
  const userRole = useSelector(userRoleSelector);
  const isAdmin = useSelector(isUserAdminSelector);

  const [productToCreateOrders, setProductToCreateOrders] = useState();
  const [loadingCreationOrders, setLoadingCreationOrders] = useState(false);

  useEffect(() => {
    setProducts(data);
  }, [data])

  const onClickCreateOrder = useCallback(
    (productData) => {
      setProductToCreateOrders(productData);
    },
    [],
  )

  const statuses = useMemo(() => [
    { label: t('dashboard_commerce.products_list.statuses.all') },
    { label: t('dashboard_commerce.products_list.statuses.new') }
  ], [t]);

  const productStatuses = useMemo(() => {
    const stats = [
      { label: t('product_status.active'), value: PRODUCT_STATUSES.active },
      { label: t('product_status.disabled'), value: PRODUCT_STATUSES.disabled },
    ]

    if (isAdmin) {
      stats.push({ label: t('dashboard_commerce.create_order'), value: 'create_order', onChangeOverridden: onClickCreateOrder });
    }

    return stats;
  }, [isAdmin, onClickCreateOrder, t])

  const onChangeStatus = ({ cellData, column, value }) => {
    const { id } = column;

    const changedProducts = products.map((item) => {
      if (item.id === cellData.id) {
        Object.assign(item, { [id]: value })
      }
      return item;
    });

    setProducts(changedProducts);
  }

  const handleChangeProductBy = (val) => {
    const newProductBy = statuses.find(item => item.label === val.label);

    setProductBy(newProductBy);
  };

  const handleEditProduct = useCallback(
    (productId) => {
      history.push(adminData?.tenantId ? `${`${editTenantProductRoute}/${productId}`}?tenantId=${adminData.tenantId}` : `${editTenantProductRoute}/${productId}`)
    },
    [history, adminData],
  );

  const columns = useMemo(() => {
    const cols = [
      {
        Header: t('dashboard_commerce.products_list.image'),
        accessor: 'image',
        Cell: ImageCell
      },
      {
        Header: t('dashboard_commerce.products_list.name'),
        accessor: 'name',
        width: 150,
        Cell: ({ cell }) => <>{cell.value[i18n.language]}</>
      },
      {
        Header: t('dashboard_commerce.products_list.price'),
        accessor: 'price',
        Cell: PriceCell
      },
      {
        Header: t('dashboard_commerce.products_list.stock'),
        accessor: 'stock',
      },
      {
        Header: t('dashboard_commerce.products_list.category'),
        accessor: 'category',
      }
    ];

    if (userRole === USER_TYPES.CITY) {
      cols.push({
        Header: t('dashboard_commerce.products_list.approved'),
        accessor: 'isApproved',
        Cell: ApprovedCell
      })
    }

    cols.push({
      Header: t('dashboard_commerce.products_list.status'),
      accessor: 'status',
      Cell: (props) => <StatusCell {...props} productStatuses={productStatuses} />
    });

    if (userRole === USER_TYPES.TENANT) {
      cols.push({
        Header: t('global.actions'),
        accessor: 'actions',
        Cell: (props) => <EditDeleteCell {...props} onEdit={handleEditProduct} />
      })
    }

    return cols;
  }, [t, userRole, i18n.language, productStatuses, handleEditProduct]);

  const productsRows = useMemo(() => {
    const status = productBy.label;

    if (status === t('dashboard_commerce.products_list.statuses.new')) {
      return products.filter(item => item.isNew);
    }

    return products;
  }, [productBy, products, t]);


  const handleClickRow = (rowData) => {
    if (userRole === USER_TYPES.CITY) {
      handleEditProduct(rowData.id)
    }

  }

  const handleCreateProductOrders = useCallback(async (formData, productData) => {
    try {
      if (!formData.usersEmails.length) return;
      setLoadingCreationOrders(true);

      const product = await getTenantProductById(productData.id, productData.tenantId);

      if (product?.stock < formData.usersEmails.length) {
        toast.error(t('dashboard_commerce.error_create_order_reason_stock'))
        return;
      }

      const createOrderSuccess = await createProductTransactionsByAdmin({
        usersEmails: formData.usersEmails,
        productData: { ...productData, ...product },
      })

      if (createOrderSuccess) {
        toast.success(t('dashboard_commerce.success_create_order'))
        refreshProducts();
      } else {
        toast.error(t('dashboard_default.no_user_email'))

      }

    } catch (error) {
      toast.error(t('dashboard_commerce.error_create_order'))
      console.log('error', error)
    } finally {
      setLoadingCreationOrders(false);
    }
  }, [refreshProducts, t]);

  return (
    <Wrapper>
      <Toast />
      <CardBox padding="16px 20px">
        <TabsButton items={statuses} activeItem={productBy} onChange={handleChangeProductBy} />
      </CardBox>

      <CardBox padding="12px" style={{ marginTop: 2 }}>
        <ReactDataTable columns={columns} rows={productsRows} onClickRow={handleClickRow} onChangeCell={onChangeStatus} />
      </CardBox>

      <CreateOrderDialog
        isOpened={!!productToCreateOrders}
        productToCreateOrders={productToCreateOrders}
        Button={Button}
        setIsOpened={(isOpened) => {
          if (!isOpened) setProductToCreateOrders(undefined);
        }}
        handleSubmitClick={handleCreateProductOrders}
        loading={loadingCreationOrders}
      />
    </Wrapper>
  )
};

export default Products;
