import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => (
	<div className="account">
		<div className="account__wrapper">
			<div className="account__card">
				<div className="account__head">
					<h3 className="account__title">
						Welcome to
						<span className="account__logo">
							{' '}
							Green
							<span className="account__logo-accent">Play</span>
						</span>
					</h3>
					<h4 className="account__subhead subhead">Create an account</h4>
				</div>
				<div className="account__btns">
					<Link className="btn btn-primary account__btn" to="/user/register">
						User
					</Link>
				</div>
				<div className="account__btns">
					<Link
						className="btn btn-primary account__btn"
						to="/organisation/register"
					>
						Organisation
					</Link>
				</div>
				<div className="account__btns">
					<Link
						className="btn btn-primary account__btn"
						to="/city/register"
					>
						City
					</Link>
				</div>
				<div className="account__have-account">
					<p>
						Already have an account? <Link to="/">Login</Link>
					</p>
				</div>
			</div>
		</div>
	</div>
);

export default Register;
