import React, { Suspense } from "react";
import { Route, Switch, Redirect, useRouteMatch } from "react-router-dom";
import PropType from "prop-types";

import MainWrapper from "./MainWrapper";
import FallbackComponent from "../../shared/components/FallbackComponent";
import { withMetaDecorator } from "../../shared/components/HOC";
import { meta } from "../../shared/strings/constants";

import { useAuth } from "../../shared/providers/AuthProvider";
import { fetchRegions } from "../../redux/actions/regionActions";
import { useDispatch, useSelector } from "react-redux";
import OrganizationSettings from "screens/OrganizationSettings";
import DashboardIcon from "@material-ui/icons/Dashboard";
import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined';
import LocalOfferOutlinedIcon from '@material-ui/icons/LocalOfferOutlined';
import PostAddIcon from '@material-ui/icons/PostAdd';
import { isUserCitySelector, isUserOrganisationSelector, isUserTenantSelector } from "redux/selectors/user";
import TenantStores from "screens/TenantStores";
import { TenantLayout } from "containers/Layout/TenantLayout";
import usersHooks from "hooks/users.hooks";
import cityHooks from "hooks/city.hooks";

const OrganisationLogin = React.lazy(() => import("../Account/LogIn/index"));

const CityLogin = React.lazy(() => import("../Account/LogIn/cityLogin"));

const RegisterPagesManager = React.lazy(() => import("../Account/Register/RegisterPagesManager"));

const OrganisationDashboard = React.lazy(() => import("../Dashboards/Organisation/index"));

const UserPage = React.lazy(() => import("../UserPage"));
const OrganisationPage = React.lazy(() => import("../OrganisationPage"));

const CityDashboard = React.lazy(() => import("../Dashboards/City/index"));

const OrganisationForgotPassword = React.lazy(() => import("../Account/ForgotPassword/index"));

const ProfileOrganisation = React.lazy(() => import("../Account/Profile/Organisation/index"));
const ProfileCity = React.lazy(() => import("../Account/Profile/City/index"));
const PostalCodeMap = React.lazy(() => import("../PostalcodeMap/index"));
const ProfileTenant = React.lazy(() => import("../Account/Profile/Tenant/index"));

const Branch = React.lazy(() => import("../Branch/index"));
const Categories = React.lazy(() => import("../Categories/index"));
const Notification = React.lazy(() => import("../Notifications/index"));
const Badge = React.lazy(() => import("../Badges/index"));
const News = React.lazy(() => import("../News/index"));
const HappyHours = React.lazy(() => import("../HappyHours/index"));
const NewsDetails = React.lazy(() => import("../News/edit"));
const Email = React.lazy(() => import("../Emails/index"));

const NotificationDetails = React.lazy(() => import("../Notifications/edit"));

const BranchDetails = React.lazy(() => import("../Branch/edit"));
const OrganisationFAQ = React.lazy(() => import("../FAQ/index"));
const CityKBS = React.lazy(() => import("../KBS/cityKBS"));

const ChallengeOrganisationEdit = React.lazy(() => import("../Challenge/Organisation/edit"));
const ChallengeOrganisationInfo = React.lazy(() => import("../Challenge/Organisation/info"));
const ChallengeOrganisationCreate = React.lazy(() => import("../Challenge/Organisation/create"));
const ChallengeOrganisationCreateForAnotherOrg = React.lazy(() => import("../Challenge/Organisation/CreateForAnotherOrg"));
const ChallengeOrganisationDashboard = React.lazy(() => import("../Challenge/Organisation/index"));
const ChallengeOrganisationList = React.lazy(() => import("../Challenge/Organisation/list"));

const ChallengeCityEdit = React.lazy(() => import("../Challenge/City/edit"));
const ChallengeCityInfo = React.lazy(() => import("../Challenge/City/info"));
const ChallengeCityCreate = React.lazy(() => import("../Challenge/City/create"));
const ChallengeCityDashboard = React.lazy(() => import("../Challenge/City/index"));
const ChallengeCityList = React.lazy(() => import("../Challenge/City/list"));

const TenantDashboard = React.lazy(() => import('screens/TenantDashboard'));
const TenantOrders = React.lazy(() => import('screens/TenantOrders'));
const TenantOrder = React.lazy(() => import('screens/TenantOrder'));
const TenantProducts = React.lazy(() => import('screens/TenantProducts'));
const TenantAddProduct = React.lazy(() => import('screens/TenantAddProduct'));
const TenantEditProduct = React.lazy(() => import('screens/TenantEditProduct'));
const TenantProductBarcodes = React.lazy(() => import('screens/TenantProductBarcodes'));
const TenantRegisterByAdminScreen = React.lazy(() => import('screens/TenantRegisterByAdminScreen'));
const TenantKBS = React.lazy(() => import("../KBS/TenantKBS"));

const CityManage = React.lazy(() => import('screens/CityManage'));
const CitySettings = React.lazy(() => import('screens/CitySettings'));
const CityOrganisations = React.lazy(() => import('screens/CityOrganizationsList'));
const CityUsers = React.lazy(() => import('screens/CityUsersList'));
const CityUsersSessions = React.lazy(() => import('screens/CityUsersSessionsList'));
const CityMaps = React.lazy(() => import('screens/CityMaps'));
const CitySessionsHeatMap = React.lazy(() => import('screens/CitySessionsHeatMap'));
const CityMailerLite = React.lazy(() => import('screens/CityMailerLite'));

const CarpoolEvents = React.lazy(() => import('screens/CarpoolEvents'));
const SingleCarpoolEvent = React.lazy(() => import('screens/SingleCarpoolEvent'));

// Project should not hard code routes while navigating or redirecting. Should be accessed everywhere from here
export const routes = {
  organisation: {
    dashboard: "/organisation/dashboard",
    login: "/organisation/login",
    forgotPassword: "/organisation/forgot-password",
    challengeEdit: "/organisation/challenges/update/:id",
    challengeInfo: "/organisation/challenges/info/:id",
    challengeCreate: "/organisation/challenges/create",
    challengeCreateForAnotherOrganisation: "/organisation/challenges/create-for-another-organisation",
    challengeDashboard: "/organisation/challenges/dashboard",
    challengeList: "/organisation/challenges",
    profile: "/organisation/profile",
    branch: "/organisation/branches",
    notification: "/organisation/notifications",
    email: "/organisation/emails",
    branchDetails: "/organisation/branches/:id",
    notificationDetails: "/organisation/notifications/:id",
    emailDetails: "/organisation/emails/:id",
    FAQ: "/organisation/FAQ",
    users: "/organisation/users/:userID",
    settings: "/organisation/settings",
    carpoolEvents: "/organisation/carpool-events",
    carpoolEvent: "/organisation/carpool-events/:id",
  },
  city: {
    dashboard: "/city/dashboard",
    login: "/city/login",
    profile: "/city/profile",
    postalCodeMap: "/city/postalCodeMap",
    branch: "/city/branches",
    challengeEdit: "/city/challenges/update/:id",
    challengeInfo: "/city/challenges/info/:id",
    challengeCreate: "/city/challenges/create",
    challengeDashboard: "/city/challenges/dashboard",
    notification: "/city/notifications",
    badge: "/city/badges",
    news: "/city/news",
    happyHours: "/city/happy_hours",
    newsDetails: "/city/news/:id",
    email: "/city/emails",
    mailerLite: "/city/mailerlite",
    notificationDetails: "/city/notifications/:id",
    emailDetails: "/city/emails/:id",
    challengeList: "/city/challenges",
    FAQ: "/city/FAQ",
    KBS: "/city/KBS",
    manage: "/city/manage",
    settings: "/city/settings",
    maps: "/city/maps",
    heatMap: "/city/heat-map",
    categoryDetails: "/city/categories/:id",
    users: "/city/users/:userID",
    organisations: "/city/organisations/:organisationId",
    allUsers: "/city/users",
    allUsersSessions: "/city/users-sessions",
    allOrganisations: "/city/organisations",
    carpoolEvents: "/city/carpool-events",
    carpoolEvent: "/city/carpool-events/:id",
  },
  tenant: {
    dashboard: "/tenant/dashboard",
    stores: "/tenant/dashboard/stores",
    addProfile: "/tenant/profile-add",
    profile: "/tenant/profile",
    profileById: "/tenant/profile/:id",
    orders: "/tenant/dashboard/orders",
    productList: "/tenant/dashboard/products",
    tenantKBS: "/tenant/tenantKBS",
    productForAction: "/tenant/dashboard/products/:typeOfAction",
    productBarCodes: "/tenant/dashboard/products/edit/:productId/barCodes",
  },
  register: {
    entity: '/register/:entity'
  },
  dynamicLink: {
    entity: '/partage'
  }
};

export const addTenantProductRoute = routes.tenant.productForAction.replace(':typeOfAction', 'add');
export const editTenantProductRoute = routes.tenant.productForAction.replace(':typeOfAction', 'edit')

export const BreadcrumbsForRoutes = {
  [routes.tenant.dashboard]: {
    icon: DashboardIcon,
    name: "Tableau de bord",
  },
  [routes.tenant.productList]: {
    icon: LocalOfferOutlinedIcon,
    name: "Produits",
  },
  [routes.tenant.tenantKBS]: {
    icon: LocalOfferOutlinedIcon,
    name: "KBS",
  },
  [routes.tenant.orders]: {
    icon: ShoppingCartOutlinedIcon,
    name: "Commandes",
  },
  [addTenantProductRoute]: {
    icon: PostAddIcon,
    name: "Ajouter"
  }
};

const TenantRoutes = () => {
  const { path } = useRouteMatch();
  const isOrganisation = useSelector(isUserOrganisationSelector);

  if (isOrganisation) {
    return <Redirect to={routes.organisation.dashboard} />
  }

  return (
    <TenantLayout>
      <Switch>
        <Route exact path={path}>
          <TenantDashboard />
        </Route>
        <Route exact path={routes.tenant.orders}>
          <TenantOrders />
        </Route>
        <Route exact path={`${routes.tenant.orders}/:orderId`}>
          <TenantOrder />
        </Route>
        <Route exact path={routes.tenant.productList}>
          <TenantProducts />
        </Route>
        <Route exact path={addTenantProductRoute}>
          <TenantAddProduct />
        </Route>
        <Route exact path={`${editTenantProductRoute}/:productID`}>
          <TenantEditProduct />
        </Route>
        <Route exact path={routes.tenant.productBarCodes}>
          <TenantProductBarcodes />
        </Route>
        <Route exact path={routes.tenant.tenantKBS}>
          <TenantKBS />
        </Route>
        <Route exact path={routes.tenant.stores}>
          <TenantStores />
        </Route>
      </Switch>
    </TenantLayout>
  );
};


const CityRoutes = () => {
  const isOrganisation = useSelector(isUserOrganisationSelector);
  const isTenant = useSelector(isUserTenantSelector);

  if (isOrganisation) {
    return <Redirect to={routes.organisation.dashboard} />
  }
  if (isTenant) {
    return <Redirect to={routes.tenant.dashboard} />
  }

  return (

    <Switch>
      <ProtectedRoute
        exact
        path={routes.city.dashboard}
        component={CityDashboard}
        meta={meta.city.Dashboard}
      />

      <ProtectedRoute
        exact
        path={routes.city.challengeEdit}
        component={ChallengeCityEdit}
        meta={meta.city.ChallengeEdit}
      />

      <ProtectedRoute
        exact
        path={routes.city.challengeInfo}
        component={ChallengeCityInfo}
        meta={meta.city.ChallengeInfo}
      />

      <ProtectedRoute
        exact
        path={routes.city.challengeCreate}
        component={ChallengeCityCreate}
        meta={meta.city.ChallengeCreate}
      />

      <ProtectedRoute
        exact
        path={routes.city.challengeDashboard}
        component={ChallengeCityDashboard}
        meta={meta.city.ChallengeDashboard}
      />

      <ProtectedRoute
        exact
        path={routes.city.challengeList}
        component={ChallengeCityList}
        meta={meta.city.ChallengeList}
      />

      <ProtectedRoute
        exact
        path={routes.city.profile}
        component={ProfileCity}
        meta={meta.city.Profile}
      />

      <ProtectedRoute
        exact
        path={routes.city.postalCodeMap}
        component={PostalCodeMap}
        meta={meta.city.postalCodeMap}
      />


      <ProtectedRoute
        exact
        path={routes.city.FAQ}
        component={OrganisationFAQ}
        meta={meta.city.FAQ}
      />

      <ProtectedRoute
        exact
        path={routes.city.KBS}
        component={CityKBS}
        meta={meta.city.KBS}
      />

      <ProtectedRoute
        exact
        path={routes.city.manage}
        component={CityManage}
        meta={meta.city.manage}
      />

      <ProtectedRoute
        exact
        path={routes.city.branch}
        component={Branch}
        meta={meta.city.Branch}
      />

      <ProtectedRoute
        exact
        path={routes.city.notification}
        component={Notification}
        meta={meta.city.Notification}
      />
      <ProtectedRoute
        exact
        path={routes.city.category}
        component={Categories}
        meta={meta.city.category}
      />
      <ProtectedRoute
        exact
        path={routes.city.email}
        component={Email}
        meta={meta.city.Email}
      />
      <ProtectedRoute
        exact
        path={routes.city.mailerLite}
        component={CityMailerLite}
        meta={meta.city.Email}
      />
      <ProtectedRoute
        exact
        path={routes.city.badge}
        component={Badge}
        meta={meta.city.Badge}
      />
      <ProtectedRoute
        exact
        path={routes.city.news}
        component={News}
        meta={meta.city.News}
      />
      <ProtectedRoute
        exact
        path={routes.city.happyHours}
        component={HappyHours}
        meta={meta.city.HappyHours}
      />
      <ProtectedRoute
        exact
        path={routes.city.newsDetails}
        component={NewsDetails}
        meta={meta.city.NewsDetails}
      />
      <ProtectedRoute
        exact
        path={routes.city.notificationDetails}
        component={NotificationDetails}
        meta={meta.city.NotificationDetails}
      />

      <ProtectedRoute
        exact
        path={routes.city.emailDetails}
        component={Email}
        meta={meta.city.Email}
      />

      <ProtectedRoute
        exact
        path={routes.city.branchDetails}
        component={BranchDetails}
        meta={meta.city.BranchDetails}
      />

      <ProtectedRoute
        exact
        path={routes.city.settings}
        component={CitySettings}
        meta={meta.city.settings}
      />

      <ProtectedRoute
        exact
        path={routes.city.maps}
        component={CityMaps}
        meta={meta.city.Dashboard}
      />

      <ProtectedRoute
        exact
        path={routes.city.heatMap}
        component={CitySessionsHeatMap}
        meta={meta.city.Dashboard}
      />

      <ProtectedRoute
        exact
        path={routes.city.users}
        component={UserPage}
        meta={meta.city.Dashboard}
      />

      <ProtectedRoute
        exact
        path={routes.city.organisations}
        component={OrganisationPage}
        meta={meta.city.Dashboard}
      />

      <ProtectedRoute
        exact
        path={routes.city.allUsers}
        component={CityUsers}
        meta={meta.city.Dashboard}
      />

      <ProtectedRoute
        exact
        path={routes.city.allUsersSessions}
        component={CityUsersSessions}
        meta={meta.city.Dashboard}
      />

      <ProtectedRoute
        exact
        path={routes.city.allOrganisations}
        component={CityOrganisations}
        meta={meta.city.Dashboard}
      />

      <ProtectedRoute
        exact
        path={routes.city.carpoolEvent}
        component={SingleCarpoolEvent}
        meta={meta.city.Dashboard}
      />

      <ProtectedRoute
        exact
        path={routes.city.carpoolEvents}
        component={CarpoolEvents}
        meta={meta.city.Dashboard}
      />
    </Switch>

  );
};


const OrganizationRoutes = () => {
  const isTenant = useSelector(isUserTenantSelector);
  const isCity = useSelector(isUserCitySelector);

  if (isTenant) {
    return <Redirect to={routes.tenant.dashboard} />
  }
  if (isCity) {
    return <Redirect to={routes.city.dashboard} />
  }

  return (
    <Switch>
      <ProtectedRoute
        exact
        path={routes.organisation.dashboard}
        component={OrganisationDashboard}
        meta={meta.organisation.Dashboard}
      />
      <ProtectedRoute
        exact
        path={routes.organisation.users}
        component={UserPage}
        meta={meta.organisation.Dashboard}
      />
      <ProtectedRoute
        exact
        path={routes.organisation.profile}
        component={ProfileOrganisation}
        meta={meta.organisation.Profile}
      />
      <ProtectedRoute
        exact
        path={routes.organisation.challengeEdit}
        component={ChallengeOrganisationEdit}
        meta={meta.organisation.ChallengeEdit}
      />

      <ProtectedRoute
        exact
        path={routes.organisation.challengeInfo}
        component={ChallengeOrganisationInfo}
        meta={meta.organisation.ChallengeInfo}
      />

      <ProtectedRoute
        exact
        path={routes.organisation.challengeCreate}
        component={ChallengeOrganisationCreate}
        meta={meta.organisation.ChallengeCreate}
      />

      <ProtectedRoute
        exact
        path={routes.organisation.challengeCreateForAnotherOrganisation}
        component={ChallengeOrganisationCreateForAnotherOrg}
        meta={meta.organisation.ChallengeCreate}
      />

      <ProtectedRoute
        exact
        path={routes.organisation.challengeDashboard}
        component={ChallengeOrganisationDashboard}
        meta={meta.organisation.ChallengeDashboard}
      />

      <ProtectedRoute
        exact
        path={routes.organisation.challengeList}
        component={ChallengeOrganisationList}
        meta={meta.organisation.ChallengeList}
      />
      <ProtectedRoute
        exact
        path={routes.organisation.FAQ}
        component={OrganisationFAQ}
        meta={meta.organisation.FAQ}
      />
      <ProtectedRoute
        exact
        path={routes.organisation.settings}
        component={OrganizationSettings}
        meta={meta.organisation.Settings}
      />
      <ProtectedRoute
        exact
        path={routes.organisation.branch}
        component={Branch}
        meta={meta.organisation.Branch}
      />
      <ProtectedRoute
        exact
        path={routes.organisation.notification}
        component={Notification}
        meta={meta.organisation.Notification}
      />
      <ProtectedRoute
        exact
        path={routes.organisation.email}
        component={Email}
        meta={meta.organisation.Email}
      />
      <ProtectedRoute
        exact
        path={routes.organisation.notificationDetails}
        component={NotificationDetails}
        meta={meta.organisation.NotificationDetails}
      />
      <ProtectedRoute
        exact
        path={routes.organisation.emailDetails}
        component={Email}
        meta={meta.organisation.EmailDetails}
      />
      <ProtectedRoute
        exact
        path={routes.organisation.branchDetails}
        component={BranchDetails}
        meta={meta.organisation.BranchDetails}
      />

      <ProtectedRoute
        exact
        path={routes.organisation.carpoolEvent}
        component={SingleCarpoolEvent}
        meta={meta.organisation.Dashboard}
      />

      <ProtectedRoute
        exact
        path={routes.organisation.carpoolEvents}
        component={CarpoolEvents}
        meta={meta.organisation.Dashboard}
      />
    </Switch>
  );
};

const RegularRoute = ({ component: Component, meta: metaDecorator }, ...otherProps) => {
  const Main = withMetaDecorator(Component, metaDecorator);
  return <Route {...otherProps} render={() => <Main />} />;
};

const ProtectedRoute = ({
  component: Component,
  meta: metaDecorator,
  path = "/",
  ...otherProps
}) => {
  // Check if is authenticated or not
  // If NOT redirect to login

  const [userID] = useAuth();
  const { details } = usersHooks.useExternalUser();
  const { limitSettings } = cityHooks.useFetchCityLimitSettings(details?.cityId);

  if (userID) {
    const Main = withMetaDecorator(Component, metaDecorator);
    return <Route {...otherProps} {...path} render={() => <Main />} />;
  }

  const showOnlyCarpool = limitSettings?.c19_carpooling_app?.carpool_events;

  return (
    <Redirect
      to={
        showOnlyCarpool
          ? routes.organisation.carpoolEvents
          : routes.organisation.login
      }
    />
  );

};

const PreventedRoute = ({ component: Component, meta: metaDecorator, ...otherProps }) => {
  // Check if is already logged in
  // If YES redirect to Dashboard

  const [userID, user] = useAuth();
  //const history = useHistory();

  //console.log(history.location.pathname);


  if (userID === null) {
    const Main = withMetaDecorator(Component, metaDecorator);
    return <Route {...otherProps} render={() => <Main />} />;
  }

  const redirectPath = () => {
    switch (user.role) {
      case 'city':
        return routes.city.dashboard;

      case 'tenant':
        return routes.tenant.dashboard;

      default:
        return otherProps.showOnlyCarpool ? routes.organisation.carpoolEvents : routes.organisation.dashboard;
    }
  }
  return (
    <Redirect to={redirectPath()} />
  );
};

const Router = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchRegions());
  }, [dispatch]);
  const { details, userId: userID } = usersHooks.useExternalUser();

  const { limitSettings } = cityHooks.useFetchCityLimitSettings(details.cityId);
  const showOnlyCarpool = limitSettings?.c19_carpooling_app?.carpool_events;

  return (
    <MainWrapper>
      <Suspense fallback={<FallbackComponent />}>
        <Switch>
          <Route exact path="/">
            {userID ? (
              showOnlyCarpool ? (
                <Redirect to={routes.organisation.carpoolEvents} />
              ) : (
                <Redirect to={routes.organisation.dashboard} />
              )
            ) : (
              <Redirect to={routes.organisation.login} />
            )}
          </Route>


          <PreventedRoute
            exact
            path={routes.organisation.login}
            component={OrganisationLogin}
            meta={meta.organisation.Login}
            showOnlyCarpool={showOnlyCarpool}
          />
          <PreventedRoute
            exact
            path={routes.city.login}
            component={CityLogin}
            meta={meta.city.Login}
            showOnlyCarpool={showOnlyCarpool}
          />

          <PreventedRoute
            exact
            path={routes.register.entity}
            component={RegisterPagesManager}
            meta={meta.city.Register}
          />

          <PreventedRoute
            exact
            path={routes.organisation.forgotPassword}
            component={OrganisationForgotPassword}
            meta={meta.organisation.ForgotPassword}
          />

          <ProtectedRoute
            path={routes.tenant.dashboard}
            component={TenantRoutes}
            meta={meta.tenant.Dashboard}
          />

          <ProtectedRoute
            exact
            path={routes.tenant.profile}
            component={ProfileTenant}
            meta={meta.tenant.Profile}
          />

          <ProtectedRoute
            exact
            path={routes.tenant.tenantKBS}
            component={TenantKBS}
            meta={meta.tenant.tenantKBS}
          />

          <ProtectedRoute
            exact
            path={routes.tenant.profileById}
            component={ProfileTenant}
            meta={meta.tenant.Profile}
          />

          <Route path={'/organisation'}> <OrganizationRoutes /> </Route>

          <Route path={'/city'}> <CityRoutes /> </Route>

          <ProtectedRoute
            path={routes.tenant.addProfile}
            component={TenantRegisterByAdminScreen}
            meta={meta.tenant.Dashboard}
          />
          {/* TODO: Need to check all Routes */}

          {/* <Route exact path="/user-login" component={UserLogin} /> */}
          {/* <Route exact path="/forgot_password" component={ForgotPassword} /> */}
          {/* <Route exact path="/reset_password/:token" component={ResetPassword} /> */}
          {/* <Route exact path="/registration" component={Register} /> */}
          {/* <Route exact path="/register/user" component={RegisterUser} /> */}
          {/* <Route exact path="/register/cgd" component={RegisterCGD} /> */}
          {/* <Route exact component={wrappedRoutes} /> */}
          {/* <Route exact path="/user/dashboard" component={UserDashboard} /> */}
          {/* <Route exact path="/CGD/dashboard" component={CGDDashboard} />
				<Route exact path="/user/sessions" component={Session} />
				<Route exact path="/user/FAQ" component={UserFAQ} />
				<Route
					exact
					path="/user/session/update/:id"
					component={SessionUpdate}
				/>
				
				<Route exact path="/data-tranfert" component={TransferData} /> */}

          {/* TODO: Create a 404 Page */}
          <RegularRoute component={() => <p>Page not found</p>} meta={meta[404]} />
        </Switch>
      </Suspense>
    </MainWrapper>
  );
};

RegularRoute.defaultProps = {
  component: null,
  meta: {
    title: "Greenplay",
    description: "Greenplay",
  },
};

RegularRoute.propTypes = {
  component: PropType.oneOfType([PropType.func, PropType.shape({})]),
  meta: PropType.shape({
    title: PropType.string,
    description: PropType.string,
  }),
};

ProtectedRoute.defaultProps = {
  component: null,
  meta: {
    title: "Greenplay",
    description: "Greenplay",
  },
  path: "/organisation/login",
};

ProtectedRoute.propTypes = {
  component: PropType.oneOfType([PropType.func, PropType.shape({})]),
  meta: PropType.shape({
    title: PropType.string,
    description: PropType.string,
  }),
  path: PropType.string,
};

PreventedRoute.defaultProps = {
  component: null,
  meta: {
    title: "Greenplay",
    description: "Greenplay",
  },
};

PreventedRoute.propTypes = {
  component: PropType.oneOfType([PropType.func, PropType.shape({})]),
  meta: PropType.shape({
    title: PropType.string,
    description: PropType.string,
  }),
};

export default Router;
