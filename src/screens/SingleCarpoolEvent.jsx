import LayoutContent from "atomicComponents/LayoutContent";
import Layout from "containers/Layout";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import SingleCarpoolEventPage from "containers/Commons/SingleCarpoolEventPage";

const SingleCarpoolEvent = () => {
  const { t } = useTranslation("common");
  const isCollapsed = useSelector((state) => state.sidebar.collapse);

  return (
    <Layout>
      <LayoutContent title={t("account.profile.carpool_events")} height={"100%"} isCollapsed={isCollapsed}>
        <SingleCarpoolEventPage />
      </LayoutContent>
    </Layout>
  );
};

export default SingleCarpoolEvent;
