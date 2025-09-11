import { Firebase } from '../../firebase';

import { COLLECTION } from '../../../shared/strings/firebase';
import { store } from '../../../redux/store';
import { fetchBranches } from '../../../redux/actions/branchAction';

export default class BranchViewModel extends Firebase {

	async getBranches(uid) {
		const branches = await this.firestore.collection(COLLECTION.Organisations).doc(uid)
			.collection(COLLECTION.Branches).orderBy('name').get();
		return Array.isArray(branches?.docs)
			? branches.docs.map((branch) => {
				const branchData = branch?.data()
				return {
					branchName: branchData?.name,
					branchId: branch?.id,
					regionName: branchData?.region?.label,
					createdOn: branchData?.createdOn?.toDate(),
					updatedOn: branchData?.updatedOn?.toDate(),
				}
			}): [];
	}

	async getBranchWithId(uid, branchId) {
		const branch = await this.firestore.collection(COLLECTION.Organisations).doc(uid)
			.collection(COLLECTION.Branches).doc(branchId).get();
		const branchData = branch?.data()
		const formatedData = {
			region: branchData?.region,
			branchName: branchData?.name,
			branchId: branch?.id,
		};
		return formatedData;
	}

	async createBranch(uid, values) {
		const branchName = values.branchName;
		const region = values.region;

		await this.verifyBranchName(uid, branchName).catch((error) => {
				throw error;
			});
		
		var newDoc = this.firestore.collection(COLLECTION.Organisations).doc(uid).collection(COLLECTION.Branches).doc();
		newDoc.set({
			name: branchName,
			region: region,
			branchId: newDoc.id,
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		
		await this.fetchBranches();
	}

	async deleteBranch(uid, branchId) {
		await this.firestore.collection(COLLECTION.Organisations).doc(uid).collection(COLLECTION.Branches).doc(branchId).delete()
			.then(() => {
				console.log("Document successfully deleted!");
			}).catch((error) => {
				console.error("Error removing document: ", error);
			});

		await this.fetchBranches();
	}

	
	async updateBranch(uid, branchId, values) {
		const branchName = values.branchName;
		const region = values.region;

		await this.verifyBranchName(uid, branchName).catch((error) => {
				throw error;
			});
		
		this.firestore.collection(COLLECTION.Organisations).doc(uid).collection(COLLECTION.Branches).doc(branchId).update({
			name: branchName,
			region: region,
			updatedOn: new Date(),
		});

		await this.fetchBranches();
	}

	async verifyBranchName(uid, branchName) {
		const duplicates = await this.firestore.collection(COLLECTION.Organisations).doc(uid)
			.collection(COLLECTION.Branches).where('name', '==', branchName).get();

		if (duplicates.size !== 0) {
			throw ReferenceError('Already a branch named ' + branchName);
		}
	}

	async fetchBranches() {
		await store.dispatch(fetchBranches);
	}

	tableColumnData(t) {
		return [
			{
				Header: '#',
				accessor: 'key', // accessor is the "key" in the data
			},
			{
				Header: t('branch.name'),
				accessor: 'name',
			},
			{
				Header: t('branch.region'),
				accessor: 'region',
			},
			{
				Header: t('branch.created_on'),
				Cell: (cell) => cell.value.toLocaleString('fr-CA', {dateStyle: 'long', timeStyle: 'short'}),
				sortType: 'datetime',
				accessor: 'createdOn',
			},
			{
				Header: t('branch.updated_on'),
				Cell: (cell) => cell.value.toLocaleString('fr-CA', {dateStyle: 'long', timeStyle: 'short'}),
				sortType: 'datetime',
				accessor: 'updatedOn',
			},
		];
	}
}
