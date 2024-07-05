// SignupForm.jsx
import React, { useState } from "react";
import axios from 'axios';
import {
    MDBInput,
    MDBBtn,
} from "mdb-react-ui-kit";

const SignupForm = ({ setIsSignin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const validateForm = () => {
        if (!email.includes('@')) {
            setError('Invalid Email');
            return false;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const formData = new URLSearchParams();
                formData.append('email', email);
                formData.append('password', password);
                const response = await axios.post("/signup/", formData.toString());
                console.log(response.data.message);
                setError('');
                setIsSignin(true);
            }
            catch (error) {
                if (error.response) {
                    console.log('Login error', /*error.response.data*/ error);

                    setError(error.response.data.message || 'An error occurred during login');
                } else {
                    console.log('Login error', error);
                    setError('An unexpected error occurred');
                }
            }
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <MDBInput
                    wrapperClass="mb-4"
                    label="Email address"
                    id="signupEmail"
                    type="email"
                    size="lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <MDBInput
                    wrapperClass="mb-4"
                    label="Password"
                    id="signupPassword"
                    type="password"
                    size="lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <MDBInput
                    wrapperClass="mb-4"
                    label="Confirm Password"
                    id="confirmPassword"
                    type="password"
                    size="lg"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <MDBBtn className="mb-0 px-5" size="lg" type="submit">Sign Up</MDBBtn>
                {error && <div className="alert alert-danger" role="alert" style={{ padding: '5px 10px', margin: '10px 0' }}>{error}</div>}
            </form>
        </>
    );
};


export default SignupForm;