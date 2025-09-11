import LayoutContent from "atomicComponents/LayoutContent";
import { useTranslation } from "react-i18next";
import Manage from "containers/City/Manage";
import Layout from "containers/Layout";

const CityManage = () => {
  const { t } = useTranslation("common");

  return (
    <Layout>
      <LayoutContent title={t("meta.city.manage")} height={"100%"}>
        <Manage />
      </LayoutContent>
    </Layout>
  );
};

export default CityManage;
