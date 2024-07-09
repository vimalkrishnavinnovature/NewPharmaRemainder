import React, { useState, useEffect } from 'react';
import PatientForm from './subComponents/patientForm';
import axios from 'axios';
import PatientTable from './subComponents/patientTable';
import PrescriptionForm from './subComponents/prescriptionForm/PrescriptionsForm';
import './patientDetails.css';
import { handleFileExport, handleFileImport } from './fileHandlerUtility';
import DeleteIcon from '@mui/icons-material/Delete';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Spinner from 'react-bootstrap/Spinner';

import {
  MDBBtn,
  MDBRow,
  MDBCol,
  MDBContainer,
} from "mdb-react-ui-kit";

import {
  Col,
  Container,
  Row
} from 'react-bootstrap';


const PatientDetails = () => {
  const [showForm, setShowForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [importButtonClicked, setImportButtonClicked] = useState(false);
  const [patients, setPatients] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isDeleteing, setIsDeleting] = useState(false);



  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/patient/view/?page=${currentPage}&patientsPerPage=${patientsPerPage}`);
        setPatients(response.data.patients);
        setTotalPages(response.data.totalPages);
        console.log(response.data.patients);
      } catch (err) {
        console.log(err);
      }
      finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, [currentPage, patientsPerPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePatientsPerPageChange = (number) => {
    setPatientsPerPage(number);
    setCurrentPage(1); // Reset to first page with new setting
  };

  const toggleImportButton = () => setImportButtonClicked(!importButtonClicked);
  const toggleFormVisibility = () => setShowForm(!showForm);

  const togglePrescriptionFormVisibility = (patient) => {
    setSelectedPatient(patient);
    setShowPrescriptionForm(true);
  }

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleExport = async () => {
    try {
      await handleFileExport();
    } catch (err) {
      console.error(err);
      alert("Error exporting data");
    }
  };

  //handleImport Function
  const handleImport = async (event) => {
    event.preventDefault();
    try {
      setIsFileUploading(true);
      await handleFileImport(selectedFile);
    } catch (err) {
      console.error(err);
      alert("Error importing data");
    }
    finally {
      setIsFileUploading(false);
    }
  };

  const handleDeleteCompleteData = async () => {
    try {
      setIsDeleting(true);
      await axios.delete('/patient/delete/all/');
      alert("All data deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Error deleting all data");
    }
    finally {
      setIsDeleting(false);
    }
  }

  return (
    <MDBContainer className='patient-details-parent' fluid>
      <MDBRow className='d-flex justify-content-between mb-3 w-100'>
        <MDBCol className='d-flex justify-content-start '>
          <MDBBtn type="button" size='sm' className="btn btn-success" data-mdb-ripple-init onClick={handleExport}>Download</MDBBtn>
          <MDBBtn type="button" size='sm' className='btn btn-success ms-3' data-mdb-ripple-init onClick={toggleImportButton}>Upload</MDBBtn>
          {isDeleteing ? 
          (<Spinner animation="border" variant="danger" className='ms-3' />) : 
          (<MDBBtn color='danger' className='ms-3' onClick={handleDeleteCompleteData}>
            <DeleteIcon />
          </MDBBtn>)}

        </MDBCol>
        <MDBCol className='d-flex justify-content-end'>
          <MDBBtn size='sm' onClick={toggleFormVisibility}>New Patient</MDBBtn>
        </MDBCol>
      </MDBRow>
      {
        importButtonClicked &&
        <form onSubmit={handleImport}>
          <MDBRow className='mt-3 align-items-center'> {/* Added align-items-center here */}
            <MDBCol className='ms-3'>
              <input type="file" className="form-control form-control-sm" id="customFile" onChange={handleFileChange} />
            </MDBCol>
            <MDBCol className='d-flex align-items-center'>
              {isFileUploading ? (<Spinner animation="border" variant="info" />) :
                (<button type="submit" size='sm' className="btn btn-primary">Upload</button>)}
            </MDBCol>
          </MDBRow>
        </form>
      }
      {showForm && <PatientForm />}
      {
        showPrescriptionForm && selectedPatient != null && (
          <PrescriptionForm
            setShowPrescriptionForm={setShowPrescriptionForm}
            patientID={selectedPatient.PatientID}
            patientName={selectedPatient.Name}
          />
        )
      }
      {
        !showPrescriptionForm && (isLoading ?
          (<Container fluid className='d-flex justify-content-center mt-5'>
            <Row>
              <Col className='d-flex flex-column align-items-center'>
                <AutorenewIcon className='loading-icon mb-2' />
              </Col>
            </Row>
          </Container>)
          :
          ((patients === null || patients.length === 0) ? (
            <p>No Registered Patients</p>
          ) : (
            <PatientTable
              patients={patients}
              togglePrescriptionFormVisibility={togglePrescriptionFormVisibility}
              currentPage={currentPage}
              totalPages={totalPages}
              patientsPerPage={patientsPerPage}
              handlePageChange={handlePageChange}
              handlePatientsPerPageChange={handlePatientsPerPageChange}
            />
          )))
      }
    </MDBContainer >
  );
};

export default PatientDetails;