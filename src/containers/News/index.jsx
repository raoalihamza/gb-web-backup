import React, { useCallback, useEffect, useMemo, useState } from "react";
import { withTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Button, Col, Row } from "reactstrap";
import PropTypes from "prop-types";
import classnames from "classnames";

import { routes } from "../App/Router";
import NewsForm from "./components/NewsForm";
import Layout from "../Layout";
import NewsViewModel from "./components/NewsViewModel.js";
import CardBox from "atomicComponents/CardBox";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import { NavLink } from "react-router-dom";
import { isUserCitySelector } from "redux/selectors/user";
import { COLLECTION } from "shared/strings/firebase";
import usersHooks from "hooks/users.hooks";

const BasicForm = ({ t }) => {
  const forceUpdate = () => {
    updateState(!update);
  };
  const isCollapsed = useSelector((state) => state.sidebar.collapse);

  const isUserCity = useSelector(isUserCitySelector);
  const { userId, disabled } = usersHooks.useExternalUser();

  const documentsCollection = useMemo(() => {
    if (isUserCity) {
      return COLLECTION.Cities
    }
    return COLLECTION.Organisations
  }, [isUserCity])

  const [update, updateState] = useState(true);
  const newsViewModel = useMemo(
    () => new NewsViewModel(t),
    [t]
  );

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    newsViewModel
      .getNews(userId)
      .then((orgNews) => {
        setNews(orgNews);
      })
      .catch((error) => {
        console.log("Error getting news", error);
      })
      .finally(() => setLoading(false));
    return () => { };
  }, [documentsCollection, newsViewModel, update, userId]);

  const deleteNews = useCallback(async (newsId) => {
    try {
      setLoading(true);

      await newsViewModel.deleteNews(newsId, userId);
      const updatedNews = news?.filter((item) => {

        return newsId !== item.id;
      });

      setNews(updatedNews);

      setLoading(false);
    } catch (error) {
      console.log("DataTable Exact error log:", error);
    }
  }, [newsViewModel, news])

  const routeForEdit = useMemo(() => {
    if (isUserCity) {
      return routes.city.newsDetails
    }
    return routes.organisation.newsDetails
  }, [isUserCity])

  const data = useMemo(
    () =>
      news.map((item, index) =>

      ({
        key: index + 1,
        title: item.title,
        author: item.author,
        id: item.id,
        category: item.category,
        text: item.text,
        text_eng: item.text_eng ?? "",
        url: item.url,
        imageUrl: item.imageUrl,
        createdOn: item.createdOn,
        isActive: item.isActive ? "Actif" : "Inactif"
      })),
    [news]
  );

  const columns = useMemo(
    () => [
      { Header: "#", accessor: "key" },
      { Header: t("news.title"), accessor: "title" },
      { Header: t("news.author"), accessor: "author" },
      { Header: t("news.category"), accessor: "category" },
      { Header: t("news.text"), accessor: "text" },
      { Header: t("news.url"), accessor: "url" },
      {
        Header: t("news.imageUrl"),
        accessor: "imageUrl",
        Cell: ({ row }) => (
          <img
            src={row.original.imageUrl ?? "https://greenplay.social/wp-content/uploads/2021/08/Greenplay_Logo_COULEUR_RVB-2048x1151.png"}
            style={{ height: 80, width: 80, objectFit: "contain", objectPosition: "center" }}
            alt="news"
          />
        ),
      },
      { Header: t("global.status"), accessor: "isActive" },
      {
        Cell: ({ row }) => (
          <>
            <NavLink
              to={routeForEdit?.replace(":id", row.original.id)}
              className="newsModule-link"
              style={{ pointerEvents: disabled ? 'none' : 'auto' }}
            >
              {t("global.edit")}
            </NavLink>
            <Button
              onClick={() => deleteNews(row.original.id)}
              color="danger"
              size="sm"
              className="mb-0"
              disabled={disabled}
            >
              {t("global.delete")}
            </Button>
          </>
        ),
        accessor: "actions",
      },
    ],
    [deleteNews, disabled, routeForEdit, t]
  );

  return (
    <Layout>
      <div className={classnames("newsModule", { "sidebar-visible": !isCollapsed })}>
        <Row>
          <Col md={12}>
            <h3 className="page-title">{t("news.page_title")}</h3>
          </Col>
        </Row>

        <Row>
          <NewsForm
            handleRender={forceUpdate}
            userId={userId}
            isUserCity={isUserCity}
            documentsCollection={documentsCollection}
            disabled={disabled}
          />
        </Row>

        <CardBox>
          <ReactDataTable columns={columns} rows={data} />
        </CardBox>
      </div>
    </Layout>
  );
};

BasicForm.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation("common")(BasicForm);
