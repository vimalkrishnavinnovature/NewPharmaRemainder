import React, { useState,useEffect } from 'react';
import { MDBRow, MDBCol, MDBInput, MDBBtn, MDBContainer } from 'mdb-react-ui-kit';
import MedicationForm from './MedicationForm'; // Update the import path as necessary

const PrescriptionForm = ({ prescription, index, savePrescriptionAtIndex }) => {
    const [DoctorName, setDoctorName] = useState(prescription.DoctorName);
    const [Condition, setCondition] = useState(prescription.Condition);
    const [Medications, setMedications] = useState(prescription.Medications || []);
    const [selectedMedication, setSelectedMedication] = useState(0);
    const [isMedicationExpanded, setIsMedicationExpanded] = useState(true);

    useEffect(() => {
        setDoctorName(prescription.DoctorName);
        setCondition(prescription.Condition);
        setMedications(prescription.Medications || []);
        console.log("Inside Prescription Form\n: ", prescription);
    },[prescription]);

    const handlePrescriptionChange = (e) => {
        const { name, value } = e.target;
        if (name === "DoctorName") {
            setDoctorName(value);
        } else if (name === "Condition") {
            setCondition(value);
        }
    };

    const handleSavePrescription = (e) => {
        e.preventDefault();
        savePrescriptionAtIndex(index, {
            Condition,
            DoctorName,
            Medications
        });
    }

    const expandMedication = (index) => {
        setSelectedMedication(index);
        setIsMedicationExpanded(true);
    }

    const saveMedicationAtIndex = (index, medication) => {
        setMedications(Medications.map((item, i) => {
            if (i === index) {
                return medication;
            }
            return item;
        }));
        setIsMedicationExpanded(false);
    };

    const handleAddMedication = (e) => {
        e.preventDefault();
        const lastMedication = Medications[Medications.length - 1];
        const isLastMedicationFilled = lastMedication && Object.values(lastMedication).every(value => value.trim() !== '');

        if (isLastMedicationFilled || Medications.length === 0) {
            console.log('Adding new medication');
            setMedications([...Medications, {
                MedicationName: '',
                Label: '',
                Dosage: '',
                NotificationTime: '00:00',
                Frequency: '',
                StartDate: '',
                EndDate: ''
            }]);
            setSelectedMedication(Medications.length);
            setIsMedicationExpanded(true);
        } else {
            alert('Please fill out the last medication before adding a new one.');
            console.log('Please fill out the last medication before adding a new one.');
        }
    };

    return (
        <MDBContainer className='mt-3 prescription-container'>
            <MDBRow className="mb-3 mt-3">
                <MDBCol>
                    <MDBInput label="Condition" type="text" name="Condition" value={Condition} onChange={handlePrescriptionChange} required />
                </MDBCol>
            </MDBRow>
            <MDBRow className='mb-3'>
                <MDBCol>
                    <MDBInput label="Doctor Name" type="text" name="DoctorName" value={DoctorName} onChange={handlePrescriptionChange} required />
                </MDBCol>
            </MDBRow>

            {Medications.map((medication, index) => (
                index === selectedMedication && isMedicationExpanded ? <MedicationForm key={index} medication={medication} index={index} saveMedicationAtIndex={saveMedicationAtIndex} /> :
                    <MDBRow key={index} className='mb-3'>
                        <MDBCol>
                            <span onClick={() => expandMedication(index)}>
                                {medication.MedicationName ? medication.MedicationName : 'No Medication'} →
                            </span>
                        </MDBCol>
                    </MDBRow>
            ))}
            <MDBRow>
                <MDBCol className='d-flex justify-content-end'>
                    <MDBBtn className='mb-3' size='sm' color='teritiary' onClick={handleAddMedication}>Add Medication</MDBBtn>
                </MDBCol>
            </MDBRow>
            <MDBRow className="mb-3 text-center">
                <MDBCol>
                    <MDBBtn onClick={handleSavePrescription} color='secondary'>Save Prescription</MDBBtn>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
};

export default PrescriptionForm;