import { auth, Firebase } from '../../../firebase';

export default class RegisterViewModel {
	// SignIn to firebase authentication
	// @param email: String = Email of the account
	// @param password:String = password of the account
	async signIn({ email, password }) {
		const res = await auth.signInWithEmailAndPassword(email, password);

		new Firebase()._updateLastSignInIfExternal(res.user.uid);
		return res;
	}

	// On Auth State changed from firebase auth
	// @param callback: function = callback to call on success
	onAuthStateChanged(callback = () => null) {
		auth.onAuthStateChanged(callback);
	}
}
