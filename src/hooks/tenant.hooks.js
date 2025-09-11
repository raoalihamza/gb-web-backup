import { PRODUCT_STATUSES } from "constants/statuses";
import { routes } from "containers/App/Router";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { isUserTenantSelector } from "redux/selectors/user";
import { useTranslation } from "react-i18next";
import { toast } from 'shared/components/Toast';

import { useHistory } from "react-router-dom";
import { getUserByID } from "../services/users";

import { getConnectedCityTenants, getTenantOrdersSums, getTenantData, getTenantOrderDetailsById, getTenantOrders, getTenantProductBarcodes, getTenantProductById, getTenantProducts, getTenantProductsForCity, tenantUpdateOrder, updateTenantProductBarCode, updateTenantProductFields } from "services/tenants";
import { useMemo } from "react";

import { getImageThumbnail } from "utils";
import { useAuth } from "shared/providers/AuthProvider";

const useFetchOrders = (userDetails, limit, logType, startDate, pageSize) => {
  const [isLoading, setIsLoading] = useState(true);
  const [, , adminData] = useAuth();
  const [orders, setOrders] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [ordersPageSize] = useState(pageSize);
  const isTenant = useSelector(isUserTenantSelector);

  const formatOrders = useCallback((orders) => {

    return orders.map(order => {

      const date = order.createdAt.toDate();
      const price = !!order.transactionDetails?.productPrice ? order.transactionDetails?.productPrice : order.transactionValue / 100;
      const greenpoints = order.transactionValue;
      const categoryName = order.transactionDetails?.categoryName || "";
      const customerName = order.userInfo?.name || "";
      const customerEmail = order.userInfo?.email || "";
      const orderNumber = order.orderNumber ?? order.orderId;


      return {
        ...order,
        orderNumber,
        date,
        price,
        greenpoints,
        categoryName,
        customerName,
        customerEmail,
        product: order.transactionDetails
      }
    })
  },
    [],
  )

  const getLoadingDefaultOrder = useCallback(() => {
    const date = new Date();
    date.setFullYear(1999)
    return {
      orderNumber: "loading",
      product: { tenantName: "loading", title: "loading", categoryName: "loading" },
      date: date,
      status: "loading",
      userInfo: { name: "loading" },
      greenpoints: "loading",
    };
  }, []);

  const getStartAfterDate = useCallback((idx) => {
    const item = orders[idx * ordersPageSize - 1];

    return item?.date;
  }, [orders, ordersPageSize]);

  const generateDefaultOrders = useCallback(async (user) => {
    try {
      let count = 0;

      if (!!user.tenantId) {
        count = userDetails.orderCount;
      } else {
        const tenants = await getConnectedCityTenants(user.cityId);

        const ordersCounters = tenants.filter((tenant) => tenant.orderCount != null && (adminData?.tenantId ? tenant.id === adminData?.tenantId : true)).reduce((acc, tenant) => ({
          orders: acc.orders + tenant?.orderCount || 0
        }), { orders: 0 })
        count = ordersCounters.orders;
      }

      const formattedOrders = Array(count).fill(getLoadingDefaultOrder());
      setOrders(formattedOrders);
    } catch (error) {
      console.error('error', error);
      setIsLoading(false);
      setOrders([]);
    }
  }, [adminData?.tenantId, getLoadingDefaultOrder, userDetails.orderCount]);

  const getOrdersPage = useCallback(async (user, { newPageIndex = 0, startAfterValue }) => {
    try {

      const tenantOrders = await getTenantOrders(user, { limit, logType, startDate, pageSize: ordersPageSize, startAfterValue });

      const formattedOrders = formatOrders(tenantOrders)
      setOrders((prev) => {
        if (!ordersPageSize) {

          return [...formattedOrders];
        }
        const startIndex = ordersPageSize * newPageIndex;
        const data = [...prev];

        const lengthToReplace = formattedOrders.length < ordersPageSize ? prev.length : formattedOrders.length;

        data.splice(startIndex, lengthToReplace, ...formattedOrders);

        return data;
      });
    } catch (error) {
      console.error('error', error);
      setIsLoading(false);
      setOrders([]);
    }
  }, [formatOrders, limit, logType, ordersPageSize, startDate]);

  useEffect(() => {
    const userId = userDetails.id;

    if (isTenant) {
      generateDefaultOrders({ tenantId: userId }).then(() => getOrdersPage({ tenantId: userId }, {}));
    } else {
      generateDefaultOrders({ cityId: userId }).then(() => getOrdersPage({ cityId: userId }, {}));
    }
  }, [generateDefaultOrders, getOrdersPage, isTenant, userDetails.id]);


  const onChangePageIndex = useCallback(
    (idx) => {
      if (idx !== pageIndex) {
        setPageIndex(idx);

        if (idx > pageIndex) {
          const userId = userDetails.id;

          if (isTenant) {
            getOrdersPage({ tenantId: userId }, { newPageIndex: idx, startAfterValue: getStartAfterDate(idx) });
          } else {
            getOrdersPage({ cityId: userId }, { newPageIndex: idx, startAfterValue: getStartAfterDate(idx) });
          }
        }
      }
    },
    [getOrdersPage, getStartAfterDate, isTenant, pageIndex, userDetails?.id],
  )

  const loadAllOrders = useCallback(
    async (idx) => {
      try {
        const userId = userDetails.id;
        let user = { cityId: userId };
        if (isTenant) {
          user = { tenantId: userId };
        }

        const tenantOrders = await getTenantOrders(user);
        const formattedOrders = formatOrders(tenantOrders)
        setOrders(formattedOrders);
      } catch (error) {
        console.error('error', error);
        setIsLoading(false);
        setOrders([]);
      }
    },
    [formatOrders, isTenant, userDetails?.id],
  )

  const filteredOrdersByTenantId = useMemo(() => {
    let filteredList = orders;

    if (adminData?.tenantId) {
      filteredList = orders.filter(i => i?.transactionDetails?.tenantId === adminData.tenantId);
    }

    return filteredList;
  }, [adminData?.tenantId, orders])


  return {
    isLoading,
    orders: filteredOrdersByTenantId,
    allOrders: orders,
    onChangePageIndex,
    ordersPageSize,
    loadAllOrders,
  }
};

const useFetchOrdersSums = (userId, limit, logType = "week", startDate) => {
  const [isLoading, setIsLoading] = useState(true);
  const [ordersSums, setOrdersSums] = useState([]);
  const isTenant = useSelector(isUserTenantSelector);
  const { t, i18n } = useTranslation("common");
  const formatLabel = useCallback((date) => {
    if (!date) return "";
    // If date is a string like "2025-05-05", parse it as a Date in UTC to avoid timezone offset
    let d;
    if (typeof date === "string") {
      // Parse as UTC date to avoid timezone issues
      const [year, month, day] = date.split('-');
      d = new Date(Date.UTC(year, month - 1, day));
    } else if (typeof date.toDate === "function") {
      d = date.toDate();
    } else {
      d = new Date(date);
    }

    if (logType === "week") {
      // Return localized weekday name, e.g., "dimanche", using UTC day
      return d.toLocaleDateString(i18n.language, { weekday: "long", timeZone: "UTC" });
    }
    if (logType === "month") {
      // Return day of month, e.g., "23", using UTC date
      return d.getUTCDate();
    }
    if (logType === "year") {
      // Return localized month name, e.g., "janvier", using UTC month
      return d.toLocaleDateString(i18n.language, { month: "long", timeZone: "UTC" });
    }
    return "";
  }, [logType, i18n.language]);

  const fetchOrdersSums = useCallback(async () => {
    setIsLoading(true);
    try {

      let user = { cityId: userId };
      if (isTenant) {
        user = { tenantId: userId };
      }
      const sums = await getTenantOrdersSums(user, { limit, logType, startDate });


      const formatted = (sums || []).map(item => ({

        ventes: item.transactionValue,
        orders: item.transactionCount ?? 0,
        name: formatLabel(item.period)
      }));

      setOrdersSums(formatted);


    } catch (error) {
      setOrdersSums([]);
      console.error("Failed to fetch orders sums", error);
    }
    setIsLoading(false);
  }, [userId, isTenant, limit, logType, startDate, formatLabel]);

  useEffect(() => {
    fetchOrdersSums();
  }, [fetchOrdersSums]);

  return {
    isLoading,
    ordersSums,
  };
};

const useFetchOrderDetails = (orderId, userDetails) => {
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState();
  const isTenant = useSelector(isUserTenantSelector);

  const getOrderDetails = useCallback(async (tenantId) => {
    try {

      const orderDetails = await getTenantOrderDetailsById(tenantId, orderId)

      const user = await getUserByID(orderDetails.userId)
      const date = orderDetails?.createdAt.toDate();
      const price = !!orderDetails.transactionDetails?.productPrice ? orderDetails.transactionDetails?.productPrice : orderDetails.transactionValue / 100;
      const greenpoints = orderDetails.transactionValue;
      const categoryName = orderDetails.transactionDetails?.categoryName || "";
      const customerName = orderDetails.userInfo?.name || "";
      const customerEmail = orderDetails.userInfo?.email || "";
      const customerAddress = user?.deliveryAddress || "";
      const res = {
        ...orderDetails,
        date,
        price,
        greenpoints,
        categoryName,
        customerName,
        customerEmail,
        customerAddress,
        product: orderDetails.transactionDetails
      }

      setOrderDetails(res);
    } catch (error) {
      setIsLoading(false);
      setOrderDetails({});
    }
  }, [orderId])

  useEffect(() => {
    if (isTenant) {
      getOrderDetails(userDetails.id);
    } else {
      getOrderDetails();
    }
  }, [getOrderDetails, isTenant, userDetails]);

  return {
    isLoading,
    orderDetails,
    refetch: getOrderDetails,
    setOrderDetails,
  }
};

const useFetchProducts = (userDetails, params) => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [, , adminData] = useAuth();
  const isTenant = useSelector(isUserTenantSelector);

  const getTenantProductsByParams = useCallback(async (tenantId, params) => {
    try {
      if (!tenantId) return;

      const res = await getTenantProducts(tenantId, params);
      const productsList = res.map(product => {
        const mainImage = product.images.find(img => img.isMain);
        const categoriesNames = (product?.categories || []).map(i => i.categoryName);
        if (product?.category?.categoryName) {
          categoriesNames.push(product?.category?.categoryName);
        }
        const categoryString = [...new Set(categoriesNames.filter(i => !!i))].join(', ');
        return {
          image: getImageThumbnail(mainImage),
          name: {
            en: product.title_en,
            fr: product.title_fr,
          },
          status: product.status === PRODUCT_STATUSES.approved,
          ...product,
          category: categoryString,
        }
      });

      setProducts(productsList);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setProducts([]);
      console.error('Failed to get products', error);
    }

  }, []);

  const getAllTenantsProductsForCity = useCallback(async (params) => {
    try {
      const res = await getTenantProductsForCity(params);
      const productsList = res.map(product => {
        const mainImage = (product.images && product.images?.find(img => img.isMain));
        const categoriesNames = (product?.categories || []).map(i => i.categoryName);
        if (product?.category?.categoryName) {
          categoriesNames.push(product?.category?.categoryName);
        }

        const categoryString = [...new Set(categoriesNames.filter(i => !!i))].join(', ');
        return {
          image: getImageThumbnail(mainImage),
          name: {
            en: product.title_en,
            fr: product.title_fr,
          },
          status: product.status,
          ...product,
          category: categoryString,
        }
      });

      setProducts(productsList);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setProducts([]);
      console.error('Failed to get products', error);
    }

  }, []);

  const refreshProducts = useCallback(async () => {
    if (isTenant) {
      getTenantProductsByParams(userDetails.id, params);
    } else {
      getAllTenantsProductsForCity({ ...params, cityId: userDetails.id })
    }
  }, [getAllTenantsProductsForCity, getTenantProductsByParams, isTenant, params, userDetails.id]);

  useEffect(() => {
    if (isTenant) {
      getTenantProductsByParams(userDetails.id, params);
    } else {
      getAllTenantsProductsForCity({ ...params, cityId: userDetails.id })
    }
  }, [getTenantProductsByParams, getAllTenantsProductsForCity, params, userDetails.id, isTenant]);

  const filteredProductsByTenantId = useMemo(() => {
    let filteredList = products;

    if (adminData?.tenantId) {
      filteredList = products.filter(i => i?.tenantId === adminData.tenantId);
    }

    return filteredList;
  }, [adminData?.tenantId, products])

  return {
    isLoading,
    products: filteredProductsByTenantId,
    allProducts: products,
    refreshProducts,
  }
};

const useFetchProductDetails = (userDetails, productId) => {
  const navigate = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState();
  const isTenant = useSelector(isUserTenantSelector);

  const getTenantProductsById = useCallback(async (tenantId) => {
    try {
      if (!productId) return;

      const res = await getTenantProductById(productId, tenantId);

      if (!res) return navigate.push(routes.tenant.productList);

      // const category = {
      //   ...res?.category,
      //   value: res?.category?.categoryName,
      //   label: res?.category?.categoryName
      // };
      const allCategories = [
        ...(res?.categories || []).map(category => ({
          ...category,
          value: category?.categoryName,
          label: category?.categoryName
        }
        )
        )
      ];
      // if (!!category.value && !allCategories.some(c => c.id === category.id)) {
      //   allCategories.unshift(category);
      // }
      const formattedData = {
        ...res,
        images: res?.images.map(img => ({ ...img, preview: img.originUrl, name: img.id })),
        title_en: res?.title_en,
        title_fr: res?.title_fr,
        bodyText_en: res?.bodyText_en,
        bodyText_fr: res?.bodyText_fr,
        displayOrder: res?.displayingOrder,
        tenantName: res?.tenantName,
        productUrl: res?.productUrl,
        categories: allCategories,
        ...(res.expirationDate ? { expirationDate: res.expirationDate.toDate() } : {}),
      }

      setDetails(formattedData);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setDetails(null);
      console.error('Failed to get products', error);
    }
  }, [navigate, productId]);

  useEffect(() => {
    if (isTenant) {
      getTenantProductsById(userDetails.id);
    } else {
      getTenantProductsById();
    }
  }, [getTenantProductsById, isTenant, userDetails.id]);

  return {
    isLoading,
    details
  }
};

const useProductBarCodes = ({ productId, userId }) => {
  const isTenant = useSelector(isUserTenantSelector);
  const [isLoading, setIsLoading] = useState(true);
  const [barCodes, setBarCodes] = useState([]);
  const [tenantID, setTenantID] = useState();

  const fillProductBarCodes = useCallback(async (tenantId) => {
    try {
      if (!productId) return;

      const res = await getTenantProductBarcodes(productId, tenantId);

      setBarCodes(res);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setBarCodes(null);
      console.error('Failed to get product barCodes', error);
    }
  }, [productId]);



  useEffect(() => {
    if (isTenant) {
      fillProductBarCodes(userId);
    } else {
      fillProductBarCodes();
    }
  }, [fillProductBarCodes, isTenant, userId]);

  const updateBarCodeStatus = useCallback(
    async (barCode, newStatus, tenantId) => {
      await updateTenantProductBarCode(productId, tenantId || userId, barCode, { status: newStatus, statusUpdatedAt: new Date() });
      setTenantID(tenantId || userId)
      setBarCodes((prev) => {
        return prev.map((item) => (item.id === barCode ? { ...item, status: newStatus } : item));
      });
    },
    [productId, userId]
  );

  const updateProductStockByBarCodes = useCallback(async (tenantId) => {
    const stockByBarCodes = barCodes.filter(i => i.status === 'active').length;
    await updateTenantProductFields(productId, { stock: stockByBarCodes });
  }, [barCodes, productId]);

  useEffect(() => {
    if (tenantID) {
      updateProductStockByBarCodes(tenantID);
    }
  }, [barCodes, tenantID, updateProductStockByBarCodes]);

  return {
    isLoading,
    barCodes,
    updateBarCodeStatus,
    updateProductStockByBarCodes,
  };
};

const useChangeOrderStatus = (orderID, tenantID, refetchOrder, { deliveryStatus, orderStatus }) => {

  const { t } = useTranslation("common");
  const isTenant = useSelector(isUserTenantSelector);

  let updatedData = {};
  if (orderStatus) { Object.assign(updatedData, { status: orderStatus }) };
  if (deliveryStatus) { Object.assign(updatedData, { deliveryStatus: deliveryStatus }) };

  if (orderStatus == "cancelled") { Object.assign(updatedData, { deliveryStatus: "does_not_apply" }) }

  const handleUpdateOrder = useCallback(async () => {
    if (!orderID || !isTenant) return;

    try {
      await tenantUpdateOrder(tenantID, orderID, updatedData);
      toast.success(t("account.profile.removing_success"))
      refetchOrder && refetchOrder()
    } catch (error) {
      toast.error(t("account.profile.removing_failed"))
      console.log('useDeleteUserFromOrganization', error);
    }
  }, [isTenant, refetchOrder, t, orderID])

  return { handleUpdateOrder };
}

const useGetTenantData = (params, loggedUserData) => {
  const [fetchedTenant, setFetchedTenant] = useState();
  const [loading, setLoading] = useState(false);

  // On détermine l'id à utiliser
  const tenantId = params?.id || loggedUserData?.id;

  useEffect(() => {
    // Si pas de tenantId, rien à faire
    if (!tenantId) return;

    // Si déjà fetch, rien à faire
    if (fetchedTenant) return;

    setLoading(true);
    getTenantData(tenantId)
      .then((tenantData) => {
        if (!tenantData.name) tenantData.name = tenantData.tenant_name;
        tenantData.postalCode = tenantData.postalCode || tenantData.postal_code;
        tenantData.firstName = tenantData.firstName || tenantData.first_name;
        setFetchedTenant({ ...tenantData });
      })
      .catch((error) => {
        console.log('error', error);
      })
      .finally(() => setLoading(false));
  }, [tenantId, fetchedTenant]);

  // On retourne le tenant fetché ou le loggedUserData
  const userData = fetchedTenant || loggedUserData;

  return {
    userData,
    loading,
  };
}

const tenantHooks = {
  useFetchOrders,
  useFetchOrderDetails,
  useFetchProducts,
  useFetchProductDetails,
  useGetTenantData,
  useChangeOrderStatus,
  useProductBarCodes,
  useFetchOrdersSums
}

export default tenantHooks;
