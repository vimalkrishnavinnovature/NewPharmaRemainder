import React, { useState, useEffect } from 'react';
import PatientForm from './subComponents/patientForm';
import axios from 'axios';
import PrescriptionForm from './subComponents/prescriptionForm/PrescriptionsForm';
import './patientDetails.css';
import deleteIcon from '../../../../resources/patientDetails/deleteIcon.png';
import viewIcon from '../../../../resources/patientDetails/viewIcon.png';
import editIcon from '../../../../resources/patientDetails/editIcon.png';
import {
  MDBBtn,
  MDBRow,
  MDBCol,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtnGroup,
  MDBContainer,
} from "mdb-react-ui-kit";

const PatientDetails = () => {
  const [showForm, setShowForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState(null);


  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('/patient/view/');
        setPatients(response.data.patients);
      }
      catch (err) {
        console.log(err);
      }
    }
    fetchPatients();
  }, []);


  const toggleFormVisibility = () => setShowForm(!showForm);

  const togglePrescriptionFormVisibility = (patient) => {
    setSelectedPatient(patient);
    setShowPrescriptionForm(true);
  }

  const handleExport = async () => {
    try {
      alert("Exporting to an excel file");
      const response = await axios.get('/guardian/export/', {
        responseType: 'blob', // Important: This tells axios to expect a binary response instead of JSON
      });
  
      // Create a URL for the blob
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      // Create a temporary anchor element and trigger the download
      const fileLink = document.createElement('a');
      fileLink.href = fileURL;
      fileLink.setAttribute('download', 'patients_details.xlsx'); // Set the file name for the download
      document.body.appendChild(fileLink);
      
      fileLink.click(); // Trigger the download
  
      // Clean up by removing the temporary link
      fileLink.remove();
    } catch (err) {
      console.error(err);
    }
  }




  return (
    <MDBContainer className='patient-details-parent' fluid>
      <MDBRow className='d-flex justify-content-between w-100'>
        <MDBCol className='d-flex justify-content-start '>
        <button type="button" size='sm' className="btn btn-success" data-mdb-ripple-init onClick={handleExport}>Export</button>
        </MDBCol>
        <MDBCol className='d-flex justify-content-end'>
          <MDBBtn size='sm' onClick={toggleFormVisibility}>New Patient</MDBBtn>
        </MDBCol>
      </MDBRow>
      {showForm && <PatientForm />}
      {showPrescriptionForm && selectedPatient != null && (
        <PrescriptionForm
          setShowPrescriptionForm={setShowPrescriptionForm}
          patientID={selectedPatient.PatientID}
          patientName={selectedPatient.Name}
        />
      )}
      {!showPrescriptionForm && (patients == null ? (
        <p>No Registered Patients</p>
      ) : (
        <MDBTable responsive='md'>
          <MDBTableHead>
            <tr>
              <th>PatientID</th>
              <th>Name</th>
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Phone Number</th>
              <th>Blood Type</th>
              <th>Prescriptions</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {patients.map((patient, index) => (
              <tr key={index}>
                <td>{patient.PatientID}</td>
                <td>{patient.Name}</td>
                <td>{patient.DateOfBirth}</td>
                <td>{patient.Gender}</td>
                <td>{patient.PhoneNumber}</td>
                <td>{patient.BloodType}</td>
                <td>
                  <MDBBtnGroup size='sm'>
                    <MDBBtn color='info'>
                      <img src={viewIcon} className='custom-icons' alt='view' />
                    </MDBBtn>
                    <MDBBtn color='warning'>
                      <img src={editIcon} className='custom-icons' alt='edit' onClick={() => togglePrescriptionFormVisibility(patient)} />
                    </MDBBtn>
                    <MDBBtn color='danger'>
                      <img src={deleteIcon} className='custom-icons' alt='delete' />
                    </MDBBtn>
                  </MDBBtnGroup>
                </td>
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      ))}
    </MDBContainer>
  );
};

export default PatientDetails;