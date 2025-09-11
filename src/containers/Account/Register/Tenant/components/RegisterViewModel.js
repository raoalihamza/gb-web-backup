import firebase, { auth, firestore } from "../../../../firebase";

import { COLLECTION } from "../../../../../shared/strings/firebase";
import CategoryViewModel from "../../../../Categories/components/CategoryViewModel"

const categoryViewModel = new CategoryViewModel();
export default class RegisterViewModel {
  // Creates Tenant
  // @param user: Object = User credential of tenant
  // @param otherDetails: Object = Tenant details (address, city, country and known by can be undefined)

  async createTenant(user, otherDetails, inviteCode) {
    const setTenant = {
      name: otherDetails.tenant_name,
      city: otherDetails.city ?? "",
      cityId: otherDetails.cityId ?? "",
      country: otherDetails.country ?? "",
      firstName: otherDetails.first_name,
      lastName: otherDetails.last_name,
      knowAboutUs: otherDetails.know_about_us ?? "",
      postalCode: otherDetails.postal_code,
      street: otherDetails.street_address ?? "",
      email: otherDetails.email,
      emailContact: otherDetails.email,
      id: user.uid,
      inviteCode: inviteCode,
      createdOn: firebase.firestore.FieldValue.serverTimestamp(),
      updatedOn: firebase.firestore.FieldValue.serverTimestamp(),
      role: 'tenant',
      ...(otherDetails.orderCount ? { orderCount: otherDetails.orderCount } : {}),
      ...(otherDetails.productCount ? { productCount: otherDetails.productCount } : {}),
      ...(otherDetails.customerCount ? { customerCount: otherDetails.customerCount } : {}),
      ...(otherDetails.logoUrl ? { logoUrl: otherDetails.logoUrl } : {}),
      ...(otherDetails.description_fr ? { description_fr: otherDetails.description_fr } : {}),
      ...(otherDetails.description_en ? { description_en: otherDetails.description_en } : {}),
      ...(otherDetails.status ? { status: otherDetails.status } : {}),
    }
    if (otherDetails.cityId) {
      setTenant.cityId = otherDetails.cityId;
    }

    await firestore
      .collection(COLLECTION.Tenants)
      .doc(user.uid)
      .set(setTenant);

    await categoryViewModel.getCategories(otherDetails.cityId).then(
      async (categories) => {

        const data = Array.isArray(categories)
          ? categories?.map((item, index) => {
            return {
              key: index + 1,
              categoryName: item.categoryName,
              description: item.description,
              logoUrl: item.logoUrl,
              categoryId: item.categoryId,
            };
          }) : [];


        console.log(JSON.stringify(data));

        let category;

        for (category of data) {
          await firestore
            .collection(COLLECTION.Tenants)
            .doc(user.uid)
            .collection(COLLECTION.categories)
            .doc(category.categoryId)
            .set(category);
        }
      }
    )

    return { success: true, newTenantId: user.uid }
  }

  // Registers tenant account
  // @param email: String = Tenant email
  // @param password: Object = Tenant password
  // @param otherDetails: Object = Tenant details
  // @param successCallback: Function = A callback to call when creating account and creating its corresponding tenant is succeeded
  async registerTenant(
    email,
    password,
    otherDetails,
    successCallback = () => null
  ) {
    const response = await auth.createUserWithEmailAndPassword(email, password);

    const { user } = response;


    if (!otherDetails.tenant_name) {
      otherDetails.tenant_name = otherDetails.name;
    }

    const generatedCode = otherDetails.tenant_name.substring(0, 3).toUpperCase() +
      Math.floor(Math.random() * 10000 + 1);

    const creatingResponse = await this.createTenant(user, otherDetails, generatedCode);

    await successCallback();

    return creatingResponse;
  }

  async getDefaultCity() {
    return (await firestore.collection(COLLECTION.globalConfig).doc(COLLECTION.organizationConfig).get()).data()
  }
}
