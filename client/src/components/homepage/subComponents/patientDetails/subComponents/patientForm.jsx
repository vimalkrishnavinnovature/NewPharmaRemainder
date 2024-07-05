import React, { useState } from 'react';
import axios from 'axios';
import {
    MDBRow,
    MDBCol,
    MDBInput,
    MDBBtn
} from 'mdb-react-ui-kit';

function PatientForm() {
    const [name, setName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bloodType, setBloodType] = useState('');
    const [error, setError] = useState({});

    const validateForm = () => {
        let errors = {};
        let formIsValid = true;

        // Name validation
        if (!name) {
            formIsValid = false;
            errors["name"] = "*Please enter the name.";
        }

        // Date of Birth validation
        if (!dateOfBirth) {
            formIsValid = false;
            errors["dateOfBirth"] = "*Please enter the date of birth.";
        } else {
            const dob = new Date(dateOfBirth);
            const today = new Date();
            if (dob >= today) {
                formIsValid = false;
                errors["dateOfBirth"] = "*Date of birth must be in the past.";
            }
        }

        // Gender validation
        if (!gender) {
            formIsValid = false;
            errors["gender"] = "*Please enter the gender.";
        } else if (!['Male', 'Female', 'Other'].includes(gender)) {
            formIsValid = false;
            errors["gender"] = "*Gender must be 'Male', 'Female', or 'Other'.";
        }

        // Phone Number validation
        if (!phoneNumber) {
            formIsValid = false;
            errors["phoneNumber"] = "*Please enter the phone number.";
        } else if (!/^\+?\d{10,20}$/.test(phoneNumber)) {
            formIsValid = false;
            errors["phoneNumber"] = "*Please enter a valid phone number with 10 to 20 digits.";
        }

        // Blood Type validation
        if (!bloodType) {
            formIsValid = false;
            errors["bloodType"] = "*Please enter the blood type.";
        } else if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(bloodType.toUpperCase())) {
            formIsValid = false;
            errors["bloodType"] = "*Please enter a valid blood type (e.g., A+, O-).";
        }

        setError(errors);
        return formIsValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError({}); // Reset error messages before attempting to submit
        if (validateForm()) {
            const patientData = {
                name,
                dateOfBirth,
                gender,
                phoneNumber,
                bloodType,
            };

            try {
                const response = await axios.post('/patient/add/', patientData);
                console.log(response.data.message);
                // Reset form fields after successful submission
                setName('');
                setDateOfBirth('');
                setGender('');
                setPhoneNumber('');
                setBloodType('');
                setError({}); // Clear any errors
            } catch (err) {
                console.log(err);
            }
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <MDBRow className="mb-3 mt-3">
                <MDBCol>
                    <MDBInput label="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </MDBCol>
            </MDBRow>
            <MDBRow className="mb-3">
                <MDBCol>
                    <MDBInput label="Date of Birth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                </MDBCol>
                <MDBCol>
                    <MDBInput label="Gender" type="text" value={gender} onChange={(e) => setGender(e.target.value)} required />
                </MDBCol>
            </MDBRow>
            <MDBRow className="mb-3">
                <MDBCol>
                    <MDBInput label="Phone Number" type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                </MDBCol>
                <MDBCol>
                    <MDBInput label="Blood Type" type="text" value={bloodType} onChange={(e) => setBloodType(e.target.value)} required />
                </MDBCol>
            </MDBRow>
            {error && Object.keys(error).length > 0 && (
                <div className="alert alert-danger" role="alert" style={{ padding: '5px 10px', margin: '10px 0' }}>
                    {Object.values(error).map((errorMessage, index) => (
                        <div key={index}>{errorMessage}</div>
                    ))}
                </div>
            )}
            <MDBRow className="mb-3 text-center">
                <MDBCol>
                    <MDBBtn type="submit">Add Patient Details</MDBBtn>
                </MDBCol>
            </MDBRow>
           
        </form>
    )
}

export default PatientForm;