export const USER_TYPES = {
  TENANT: 'tenant',
  ORGANISATION: 'organisation',
  CITY: 'city'
}
export const userRoleSelector = (state) => state.auth.data?.role;
export const isUserTenantSelector = (state) => state.auth.data?.role === USER_TYPES.TENANT;
export const isUserOrganisationSelector = (state) => state.auth.data?.role === USER_TYPES.ORGANISATION;
export const isUserCitySelector = (state) => state.auth.data?.role === USER_TYPES.CITY;
export const isExternalUserSelector = (state) => typeof state.auth.data?.externalFor === 'string';
export const isUserAdminSelector = (state) => state.auth.data?.cityAdmin === true ||state.auth.data?.admin === true;