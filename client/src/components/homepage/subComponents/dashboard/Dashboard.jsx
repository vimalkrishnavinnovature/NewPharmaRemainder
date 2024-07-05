import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
} from "mdb-react-ui-kit";

const Dashboard = () => {
  const [patientDetails, setPatientDetails] = useState([]);

//   useEffect(() => {
//     const fetchPatientDetails = async () => {
//       try {
//         const response = await axios.get('/get_patient_details/');
//         setPatientDetails(response.data);
//       } catch (error) {
//         console.error('Error fetching patient details:', error);
//       }
//     };

//     fetchPatientDetails();
//   }, []);

  return (
    <MDBCard>
      <MDBCardBody>
        <MDBCardTitle>Patient Details</MDBCardTitle>
        <MDBCardText>
          Below are the details of registered patients.
        </MDBCardText>
        <MDBTable>
          <MDBTableHead>
            <tr>
              <th scope='col'>#</th>
              <th scope='col'>First Name</th>
              <th scope='col'>Last Name</th>
              <th scope='col'>Date of Birth</th>
              <th scope='col'>Gender</th>
              <th scope='col'>Address</th>
              <th scope='col'>Medical History</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {patientDetails.map((patient, index) => (
              <tr key={index}>
                <th scope='row'>{index + 1}</th>
                <td>{patient.firstName}</td>
                <td>{patient.lastName}</td>
                <td>{patient.dateOfBirth}</td>
                <td>{patient.gender}</td>
                <td>{patient.address}</td>
                <td>{patient.medicalHistory}</td>
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      </MDBCardBody>
    </MDBCard>
  );
};

export default Dashboard;