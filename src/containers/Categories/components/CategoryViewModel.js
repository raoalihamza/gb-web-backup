import { Firebase } from '../../firebase';

import { COLLECTION } from '../../../shared/strings/firebase';
import { store } from '../../../redux/store';
import { fetchCategories } from '../../../redux/actions/categoryAction';
import { getAllTenants } from '../../../services/tenants';

export default class CategoryViewModel extends Firebase {

	async getCategories(uid) {
		const category = await this.firestore.collection(COLLECTION.Cities).doc(uid).collection(COLLECTION.settings).doc("city_access")
			.collection(COLLECTION.categories).orderBy('categoryName').get();
		
		
		return Array.isArray(category?.docs)
			? category.docs.map((category) => {
				const categoryData = category?.data()
		
				return {
					categoryName: categoryData?.categoryName,
					logoUrl: categoryData?.logoUrl,
					description: categoryData?.description,
					categoryId: category?.id,
					createdOn: categoryData?.createdOn?.toDate(),
					updatedOn: categoryData?.updatedOn?.toDate(),
				}
			}): [];
	}

	async getCategoryWithId(uid, categoryId) {
		const category = await this.firestore.collection(COLLECTION.Cities).doc(uid).collection(COLLECTION.settings).doc("city_access")
			.collection(COLLECTION.categories).doc(categoryId).get();

		const categoryData = category?.data()
		const formatedData = {
			categoryName: categoryData?.categoryName,
			logoUrl: categoryData?.logoUrl,
			description: categoryData?.description,
			categoryId: category?.id,
		};
		return formatedData;
	}

	async createCategory(uid, values) {
		const categoryName = values.categoryName;
		const logoUrl = values.logoUrl.imageUrl;
		const description = values.description;

		await this.verifyCategoryName(uid, categoryName).catch((error) => {
				throw error;
			});

		var newDoc = this.firestore.collection(COLLECTION.Cities).doc(uid).collection(COLLECTION.settings).doc("city_access").collection(COLLECTION.categories).doc();
		newDoc.set({
			categoryName: categoryName,
			id: newDoc.id,
			logoUrl: logoUrl,
			description: description,
			createdOn: new Date(),
			updatedOn: new Date(),
		});

		const returned = { id : newDoc.id, logoUrl : logoUrl };
		
		await this.fetchCategories();

		return returned
	}

	async appendCategoryToTenants(categoryId, values, logoUrl) {

	 const tenants = await getAllTenants();

		const promises = tenants.map((tenant) => {
		  const { id: tenantId } = tenant;
		  
		  return this.firestore
			.collection(`${COLLECTION.Tenants}/${tenantId}/${COLLECTION.categories}`)
			.doc(categoryId)
			.set({
			  ...values,
			  logoUrl : logoUrl,
			  updatedOn: new Date(),
			  id: categoryId,
			}, { merge: true })
		});
	
		return Promise.all(promises);
	  }

	async deleteCategory(uid, categoryId) {
		await this.firestore.collection(COLLECTION.Cities).doc(uid).collection(COLLECTION.settings).doc("city_access").collection(COLLECTION.categories).doc(categoryId).delete()
			.then(() => {
				console.log("Document successfully deleted!");
			}).catch((error) => {
				console.error("Error removing document: ", error);
			});

		await this.fetchCategories();
	}

	
	async updateCategory(uid, categoryId, values) {
		const categoryName = values.categoryName;
		const logoUrl = values.logoUrl.imageUrl;
		const description = values.description;

		await this.verifyCategoryName(uid, categoryName).catch((error) => {
				throw error;
			});
		
		this.firestore.collection(COLLECTION.Cities).doc(uid).collection(COLLECTION.settings).doc("city_access").collection(COLLECTION.categories).doc(categoryId).update({
			categoryName: categoryName,
			logoUrl: logoUrl,
			description: description,
			updatedOn: new Date(),
		});

		await this.fetchCategories();
	}

	async verifyCategoryName(uid, categoryName) {
		const duplicates = await this.firestore.collection(COLLECTION.Cities).doc(uid).collection(COLLECTION.settings).doc("city_access")
			.collection(COLLECTION.categories).where('name', '==', categoryName).get();

		if (duplicates.size !== 0) {
			throw ReferenceError('Already a category named ' + categoryName);
		}
	}

	async fetchCategories() {
		await store.dispatch(fetchCategories);
	}

	tableColumnData(t) {
		return [
			{
				Header: '#',
				accessor: 'key', // accessor is the "key" in the data
			},
			{
				Header: t('category.name'),
				accessor: 'categoryName',
			},
			{
				Header: t('category.description'),
				accessor: 'description',
			},
			{
				Header: t("category.image"),
				Cell: (tableProps) => (
				  <div>
					<img
					  src={tableProps.row.original.logoUrl}
					  style={{
						height: 80,
						width: 80,
					  }}
					  alt="category"
					/>
				  </div>
				),
				accessor: "logoUrl",
			  },

		];
	}
}
