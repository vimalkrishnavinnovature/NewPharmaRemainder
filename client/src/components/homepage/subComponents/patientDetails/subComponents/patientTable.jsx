import React, { useState, useEffect } from 'react';
import { Table, Button, ButtonGroup, InputGroup, Dropdown, Form, DropdownButton, Container, Row, Col } from 'react-bootstrap';
import deleteIcon from '../../../../../resources/patientDetails/deleteIcon.png';
import editIcon from '../../../../../resources/patientDetails/editIcon.png';
import viewIcon from '../../../../../resources/patientDetails/viewIcon.png';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import FirstPageIcon from '@mui/icons-material/FirstPage';

const PatientTable = ({ patients, togglePrescriptionFormVisibility, currentPage, totalPages, patientsPerPage, handlePageChange, handlePatientsPerPageChange }) => {
  const [currentPageInput, setCurrentPageInput] = useState(currentPage);

  useEffect(() => {
    setCurrentPageInput(currentPage);
  }, [currentPage]);

  const handleCurrentPageInputChange = (e) => {
    setCurrentPageInput(e.target.value);
  }

  const goToPage = () => {
    if (currentPageInput > 0 && currentPageInput <= totalPages) {
      handlePageChange(currentPageInput);
    }
    else {
      setCurrentPageInput(currentPage);
    }
  }

  return (
    <>
      <Table striped hover responsive='md'>
        <thead>
          <tr>
            <th>PatientID</th>
            <th>Name</th>
            <th>Date of Birth</th>
            <th>Gender</th>
            <th>Phone Number</th>
            <th>Blood Type</th>
            <th>Prescriptions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient, index) => (
            <tr key={index}>
              <td>{patient.PatientID}</td>
              <td>{patient.Name}</td>
              <td>{patient.DateOfBirth}</td>
              <td>{patient.Gender}</td>
              <td>{patient.PhoneNumber}</td>
              <td>{patient.BloodType}</td>
              <td>
                <ButtonGroup size='sm'>
                  <Button variant='info'>
                    <img src={viewIcon} className='custom-icons' alt='view' />
                  </Button>
                  <Button variant='warning'>
                    <img src={editIcon} className='custom-icons' alt='edit' onClick={() => togglePrescriptionFormVisibility(patient)} />
                  </Button>
                  <Button variant='danger'>
                    <img src={deleteIcon} className='custom-icons' alt='delete' />
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {
        totalPages > 1 && (
          <Container>
            <Row>
              <Col className='d-flex justify-content-start'>
                <ButtonGroup className='custom-pagination-btn-group'>
                  {currentPage > 1 && (
                    <>
                      <Button onClick={() => handlePageChange(1)}>
                        <FirstPageIcon />
                      </Button>
                      <Button onClick={() => handlePageChange(--currentPage)}>
                        <NavigateBeforeIcon />
                      </Button>
                    </>
                  )}
                  {currentPage < totalPages && (
                    <>
                      <Button onClick={() => handlePageChange(++currentPage)}>
                        <NavigateNextIcon  />
                      </Button>
                      <Button onClick={() => handlePageChange(totalPages)}>
                        <LastPageIcon  />
                      </Button>
                    </>
                  )}
                </ButtonGroup>
              </Col>
              <Col className='d-flex justify-content-end align-items-center'>
                <InputGroup size="sm" className="mb-3">
                  <InputGroup.Text>page</InputGroup.Text>
                  <Form.Control aria-label="current-page"
                    value={currentPageInput}
                    onChange={handleCurrentPageInputChange}
                    onBlur={goToPage}
                    onKeyDown={(e) => e.key === 'Enter' && goToPage()}
                  />
                  <InputGroup.Text>of</InputGroup.Text>
                  <Form.Control aria-label="total-page" readOnly value={totalPages} />
                </InputGroup>
              </Col>
              <Col className='d-flex justify-content-end'>
                <DropdownButton id="dropdown-basic-button" title={`Patients per Page: ${patientsPerPage}`} className="mb-3">
                  {[5,10, 20, 50, 100].map((number) => (
                    <Dropdown.Item key={number} onClick={() => handlePatientsPerPageChange(number)}>
                      {number}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              </Col>
            </Row>
          </Container>
        )
      }
    </>
  );
};

export default PatientTable;