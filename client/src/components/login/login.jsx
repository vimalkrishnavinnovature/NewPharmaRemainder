//create a login/signup component using mdb-react-ui-kit
import React, { useState } from "react";
import LoginForm from "./subComponents/loginForm";
import SignupForm from "./subComponents/signupForm";
import './login.css';
import {
    MDBContainer,
    MDBCol,
    MDBRow,
} from "mdb-react-ui-kit";

const Login = () => {
    const [isSignin, setIsSignin] = useState(true);
    const toggleForm = () => {
        setIsSignin(!isSignin);
    };

    return (
        <MDBContainer className="custom-parent">
            <MDBContainer fluid className="p-3 h-custom form-container custom-container">
                <MDBRow className="d-flex align-items-center">
                    <MDBCol col="10" md="6">
                        <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg" className="img-fluid" alt="Phone illustration" />
                    </MDBCol>
                    <MDBCol col="10" md="6">
                        {/* This MDBRow contains the LoginForm or SignupForm */}
                        <MDBRow className="text-center text-md-start mt-4 pt-2">
                            <MDBCol>
                                {isSignin ? <LoginForm /> : <SignupForm setIsSignin={setIsSignin} />}
                            </MDBCol>
                        </MDBRow>
                        {/* Separate MDBRow for the "Don't have an account?" text */}
                        <MDBRow className="text-center text-md-start mt-4 pt-2">
                            <MDBCol>
                                <p className="small fw-bold mt-2 pt-1 mb-0">
                                    {isSignin ? "Don't have an account?" : "Already have an account?"}{" "}
                                    <a href="#!" className="link-danger" onClick={toggleForm}>
                                        {isSignin ? "Register" : "Login"}
                                    </a>
                                </p>
                            </MDBCol>
                        </MDBRow>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        </MDBContainer>

    );
};



export default Login;
