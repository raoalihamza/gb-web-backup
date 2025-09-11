import { useMemo } from "react";
import GrainIcon from "@material-ui/icons/Grain";
import { useRouteMatch } from "react-router-dom";
import { capitalizeFirstLetter } from "utils";
import { BreadcrumbsForRoutes, routes } from "containers/App/Router";
import { useAuth } from "shared/providers/AuthProvider";

const useRouterPathsForBreadcrumbs = (userID, createdBy) => {
  const { path, params } = useRouteMatch();
  const [, , adminData] = useAuth();
  
  const pathsForBreadcrumbs = useMemo(() => {
    const splitPath = path.split("/");
    const pathToBreadcrumb = [];
    const allowParams = [];

    const mappedRoutes = Object.keys(routes).reduce((acc, next) => {
      const pageRoutes = Object.values(routes[next]);
      return acc.concat(pageRoutes);
    }, []);

    let result = splitPath.reduce((acc, path, idx) => {
      if (path.startsWith(":")) {
        path = params[path.replace(":", "")];
        allowParams.push(path);
      }
      pathToBreadcrumb.push(path);

      if (!path) {
        return acc;
      }

      let to = pathToBreadcrumb.join("/");

      const newBreadcrumb = {
        id: idx,
        name: BreadcrumbsForRoutes[to]?.name || capitalizeFirstLetter(path),
        to,
        icon: BreadcrumbsForRoutes[to]?.icon || GrainIcon,
      };

      return [...acc, newBreadcrumb];
    }, []);

    return result.filter((item) => {
      const includesWithParams = item.to.split('?')[0]
      .split("/")
      .some((urlPart) => urlPart && allowParams.includes(urlPart));
  
      const to = item.to;

      if(adminData?.tenantId){
        item.to = `${item.to}?tenantId=${adminData.tenantId}`
      }

      return mappedRoutes.includes(to) || includesWithParams;
    });
  }, [adminData?.tenantId, params, path]);

  return { pathsForBreadcrumbs };
};

const routerHooks = {
  useRouterPathsForBreadcrumbs,
};

export default routerHooks;
