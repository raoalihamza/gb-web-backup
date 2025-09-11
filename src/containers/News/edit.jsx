import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Button, Col, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { reduxForm } from "redux-form";
import classnames from "classnames";
import PropTypes from "prop-types";
import { useHistory } from "react-router";

import Layout from "../Layout";
import NewsForm from "./components/NewsForm";
import NewsViewModel from "./components/NewsViewModel";
import { NewsFormSkeleton } from "./components/Skeletons";
import { useAuth } from "../../shared/providers/AuthProvider";
import { routes } from "../App/Router";
import CardBox from "atomicComponents/CardBox";
import ReactDataTable from "shared/components/dataTable/ReactDataTable";
import { NavLink } from "react-router-dom";
import { isUserCitySelector } from "redux/selectors/user";
import { COLLECTION } from "shared/strings/firebase";


function EditForm({ t }) {
  const forceUpdate = () => {
    updateState(!update);
  };
  const newsViewModel = useMemo(() => new NewsViewModel(), []);
  const isCollapsed = useSelector((state) => state.sidebar.collapse);
  const [userId] = useAuth();

  const isUserCity = useSelector(isUserCitySelector);
  const documentsCollection = useMemo(() => {
    if (isUserCity) {
      return COLLECTION.Cities
    }
    return COLLECTION.Organisations
  }, [isUserCity])

  const newsId = window.location.pathname.split("/").pop();
  const history = useHistory();

  const [newsItem, setNewsItem] = useState({});
  const [update, updateState] = useState(true);
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState([]);

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

  useEffect(() => {
    let _isUnmounted = false;

    if (!_isUnmounted) {
      setLoading(true);
      newsViewModel
        .getNewsWithId(newsId)
        .then((returnedNews) => {

          setNewsItem(returnedNews);
        })
        .catch((error) => {
          console.log("Error getting specified news", error);
          history.replace(routes.organisation.news);
        })
        .finally(() => setLoading(false));
    }

    return () => {
      _isUnmounted = true;
    };
  }, [history, newsId, newsViewModel]);

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

  const data = useMemo(
    () => news?.map((item, index) => {
      return {
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
        isActive: item.isActive
      };
    }),
    [news]
  );

  const routeForEdit = useMemo(() => {
    if (isUserCity) {
      return routes.city.newsDetails
    }
    return routes.organisation.newsDetails
  }, [isUserCity])

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
            >
              {t("global.edit")}
            </NavLink>
            <Button
              onClick={() => deleteNews(row.original.id)}
              color="danger"
              size="sm"
              className="mb-0"
            >
              {t("global.delete")}
            </Button>
          </>
        ),
        accessor: "actions",
      },
    ],
    [deleteNews, routeForEdit, t]
  );

  return (
    <Layout>
      <div className={classnames("newsModule", !isCollapsed ? "sidebar-visible" : null)}>
        <Row>
          <Col md={12}>
            <h3 className="page-title">{t("news.update_page_title")}</h3>
          </Col>
        </Row>
        {!loading ? (
          <>
            <Row>
              <NewsForm
                handleRender={forceUpdate}
                userId={userId}
                initialValues={newsItem}
                isUserCity={isUserCity}
                documentsCollection={documentsCollection}
                editForm
              />
            </Row>
            <CardBox>
              <ReactDataTable columns={columns} rows={data} />
            </CardBox>
          </>
        ) : (
          <NewsFormSkeleton />
        )}
      </div>
    </Layout>
  );
}

EditForm.propTypes = {
  t: PropTypes.func.isRequired,
};

export default reduxForm({
  form: "vertical_form", // a unique identifier for this form
})(withTranslation("common")(EditForm));
