import React, { useState, useEffect } from 'react';
import { MDBRow, MDBCol, MDBBtn, MDBContainer } from 'mdb-react-ui-kit';
import axios from 'axios';
import './prescriptionsForm.css';
import closeIcon from '../../../../../../resources/home/closeIcon.png';
import PrescriptionForm from './subComponents/PrescriptionForm';

//Prescriptions Parent Form Component
const PrescriptionsForm = ({ setShowPrescriptionForm, patientID, patientName }) => {
    const [selectedPrescription, setSelectedPrescription] = useState(0);
    const [isPrescriptionExpanded, setIsPrescriptionExpanded] = useState(true);
    const [prescriptions, setPrescriptions] = useState([
        {
            Condition: '',
            DoctorName: '',
            Medications: [{
                MedicationName: '',
                Label: '',
                Dosage: '',
                NotificationTime: '00:00',
                Frequency: '',
                StartDate: '',
                EndDate: ''
            }]
        }
    ]);


    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                if (patientID) {
                    const response = await axios.get('/prescription/view/' + patientID);
                    if (response.data.prescriptions && response.data.prescriptions.length > 0 && response.data.prescriptions[0]['Condition'] !== null) {
                        setPrescriptions(response.data.prescriptions);
                    }
                }
            }
            catch (err) {
                console.error(err);
            }
        }
        fetchPrescriptions();
    }, [])

    useEffect(() => {
        console.log("Prescriptions From Prescriptions Component\n: ", prescriptions);
    }, [prescriptions])


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("before posting: ", prescriptions)
            const response = await axios.post('/prescription/add/' + patientID + '/', { prescriptions });
            console.log(response.data.message);
            setShowPrescriptionForm(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleClose = () => {
        setShowPrescriptionForm(false);
    }

    //Prescription specific functions
    //Add New Prescription To The Form
    const handleAddPrescription = (e) => {
        e.preventDefault();

        // Check if the last prescription in the list is filled out
        const lastPrescription = prescriptions[prescriptions.length - 1];
        const isLastPrescriptionFilled = lastPrescription && Object.keys(lastPrescription).every(key => {
            if (key === 'Medications') {
                // For Medications, check if the last medication is filled out
                const lastMedication = lastPrescription.Medications[lastPrescription.Medications.length - 1];
                return lastMedication && Object.keys(lastMedication).every(medKey => lastMedication[medKey].trim() !== '');
            }
            return lastPrescription[key].trim() !== '';
        });

        if (isLastPrescriptionFilled || prescriptions.length === 0) {
            console.log('Adding new prescription');
            setPrescriptions([...prescriptions, {
                Condition: '',
                DoctorName: '',
                Medications: [{
                    MedicationName: '',
                    Label: '',
                    Dosage: '',
                    NotificationTime: '00:00',
                    Frequency: '',
                    StartDate: '',
                    EndDate: ''
                }]
            }]);
            // Set the newly added prescription as selected and expanded
            setSelectedPrescription(prescriptions.length);
            setIsPrescriptionExpanded(true);
        } else {
            alert('Please fill out the last prescription before adding a new one.');
            console.log('Please fill out the last prescription before adding a new one.');
        }
    };

    const expandPrescription = (index) => {
        setSelectedPrescription(index);
        setIsPrescriptionExpanded(true);
    };

    const savePrescriptionAtIndex = (index, prescription) => {
        setPrescriptions(prescriptions.map((item, i) => {
            if (i === index) {
                return prescription; // Replace the current prescription with the new one
            }
            return item; // Return the item unchanged
        }));
        setIsPrescriptionExpanded(false);
    };



    return (
        <MDBContainer className='mt-3 main-container'>
            <MDBRow className='d-flex justify-content-end'>
                <MDBCol>
                    <h6>{patientName}</h6>
                </MDBCol>
                <MDBCol className='d-flex justify-content-end'>
                    <img src={closeIcon} className='custom-close-icon' onClick={handleClose} />
                </MDBCol>
            </MDBRow>
            <form onSubmit={handleSubmit}>
                {prescriptions.map((prescription, index) => (
                    index === selectedPrescription && isPrescriptionExpanded ?
                        <PrescriptionForm
                            key={index}
                            index={index}
                            savePrescriptionAtIndex={savePrescriptionAtIndex}
                            prescription={prescription}
                        />
                        :
                        <MDBRow key={index} className='mb-3'>
                            <MDBCol>
                                <span onClick={() => expandPrescription(index)}>
                                    {prescription.Condition ? prescription.Condition : 'No Prescription'} →
                                </span>
                            </MDBCol>
                        </MDBRow>

                ))}
                <MDBRow>
                    <MDBCol className='d-flex justify-content-end'>
                        <MDBBtn className='mb-3' size='sm' color='teritiary' onClick={(e) => handleAddPrescription(e)}>Add Another Prescription</MDBBtn>
                    </MDBCol>
                </MDBRow>
                <MDBRow className="mb-3 text-center">
                    <MDBCol>
                        <MDBBtn type="submit" size='lg'>Submit Prescription</MDBBtn>
                    </MDBCol>
                </MDBRow>
            </form>
        </MDBContainer>
    );
}

export default PrescriptionsForm;