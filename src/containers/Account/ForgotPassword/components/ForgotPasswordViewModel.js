import { Firebase } from '../../../firebase';

export default class RegisterViewModel extends Firebase {
	// Send reset password link
	sendResetPasswordLink(email) {
		return this._resetPassword(email);
	}
}
