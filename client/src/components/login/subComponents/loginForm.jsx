// LoginForm.jsx
import React, { useState, useRef } from "react";
import axios from 'axios';
import { useAuth } from '../../../contexts/authUserContext';
import ReCAPTCHA from "react-google-recaptcha";
import './loginForm.css';
import {
    MDBInput,
    MDBBtn,
    MDBCheckbox,
    MDBRow,
    MDBCol,
    MDBContainer,
} from "mdb-react-ui-kit";

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [captchaValue, setCaptchaValue] = useState(null);
    const recaptchaRef = useRef(null);
    const { setUser, setIsAuthenticated } = useAuth();
    const validateForm = () => {
        //check if the email is a legit email
        if (!email.includes('@')) {
            setError('Invalid Email');
            return false;
        }

        //check if the password is atleast 6 characters long
        if (password.length < 6) {
            setError('Password must be atleast 6 characters long');
            return false;
        }

        //check if captcha is filled
        if (!captchaValue) {
            setError("Please fill the Captcha");
            return false;
        }
        return true;

    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const formData = new URLSearchParams();
                formData.append('email', email);
                formData.append('password', password);
                formData.append('captcha-response', captchaValue);

                const response = await axios.post("/login/", formData.toString(), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });
                console.log(response.data.message);
                setError('');
                setUser(response.data.user);
                setIsAuthenticated(true);
                window.location.href = '/home';
            }
            catch (error) {
                setCaptchaValue(null);
                recaptchaRef.current.reset();
                if (error.response) {
                    console.error('Login error', error.response.data);
                    setError(error.response.data.message || 'An error occurred during login');
                } else {
                    // Handle cases where error.response is undefined
                    console.error('Login error', error);
                    setError('An unexpected error occurred');
                }
            }

        }
    }


    return (
        <>
            <form onSubmit={handleSubmit}>
                <MDBInput
                    wrapperClass="mb-4 mt-4"
                    label="Email address"
                    id="formEmail"
                    type="email"
                    size="lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <MDBInput
                    wrapperClass="mb-4"
                    label="Password"
                    id="formPassword"
                    type="password"
                    size="lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <MDBRow className="d-flex justify-content-between mb-4">
                    <MDBCol size="auto">
                        <MDBCheckbox name="flexCheck" value="" id="flexCheckDefault" label="Remember me" />
                    </MDBCol>
                    <MDBCol size="auto">
                        <a href="#!" className="text-body"><u>Forgot password?</u></a>
                    </MDBCol>
                </MDBRow>
                <MDBContainer className="d-flex justify-content-start mb-4 ">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.REACT_APP_CAPTCHA_SITE_KEY}
                        onChange={(value) => setCaptchaValue(value)}
                    />
                </MDBContainer>
                <MDBBtn className="px-5" size="lg" type="submit">Login</MDBBtn>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
            </form>
        </>
    )
};

export default LoginForm;