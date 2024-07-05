import React, { useState,useEffect } from 'react';
import { MDBRow, MDBCol, MDBInput, MDBContainer, MDBBtn } from 'mdb-react-ui-kit';

const MedicationForm = ({ medication, index, saveMedicationAtIndex }) => {
    const [MedicationName, setMedicationName] = useState(medication.MedicationName);
    const [Label, setLabel] = useState(medication.Label);
    const [Dosage, setDosage] = useState(medication.Dosage);
    const [NotificationTime, setNotificationTime] = useState(medication.NotificationTime);
    const [Frequency, setFrequency] = useState(medication.Frequency);
    const [StartDate, setStartDate] = useState(medication.StartDate);
    const [EndDate, setEndDate] = useState(medication.EndDate);

    useEffect(() => {
        setMedicationName(medication.MedicationName);
        setLabel(medication.Label);
        setDosage(medication.Dosage);
        setNotificationTime(medication.NotificationTime);
        setFrequency(medication.Frequency);
        setStartDate(medication.StartDate);
        setEndDate(medication.EndDate);
    }, [medication]);
    const handleMedicationChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'MedicationName':
                setMedicationName(value);
                break;
            case 'Label':
                setLabel(value);
                break;
            case 'Dosage':
                setDosage(value);
                break;
            case 'NotificationTime':
                setNotificationTime(value);
                break;
            case 'Frequency':
                setFrequency(value);
                break;
            case 'StartDate':
                setStartDate(value);
                break;
            case 'EndDate':
                setEndDate(value);
                break;
            default:
                break;
        }
    };

    const handleSaveMedication = () => {
        saveMedicationAtIndex(index, {
            MedicationName,
            Label,
            Dosage,
            NotificationTime,
            Frequency,
            StartDate,
            EndDate
        });
    };

    return (
        <MDBContainer className='medication-container'>
            <MDBRow className="mb-3">
                <MDBCol>
                    <MDBInput label="Medication Name" type="text" name="MedicationName" value={MedicationName} onChange={handleMedicationChange} required />
                </MDBCol>
                <MDBCol>
                    <MDBInput label="Label" type="text" name="Label" value={Label} onChange={handleMedicationChange} required />
                </MDBCol>
            </MDBRow>
            <MDBRow className="mb-3">
                <MDBCol>
                    <MDBInput label="Dosage" type="text" name="Dosage" value={Dosage} onChange={handleMedicationChange} required />
                </MDBCol>
                <MDBCol>
                    <MDBInput label="Notification Time" type="time" name="NotificationTime" value={NotificationTime} onChange={handleMedicationChange} required />
                </MDBCol>
            </MDBRow>
            <MDBRow className="mb-3">
                <MDBCol>
                    <MDBInput label="Frequency" type="text" name="Frequency" value={Frequency} onChange={handleMedicationChange} required />
                </MDBCol>
                <MDBCol>
                    <MDBInput label="Start Date" type="date" name="StartDate" value={StartDate} onChange={handleMedicationChange} required />
                </MDBCol>
                <MDBCol>
                    <MDBInput label="End Date" type="date" name="EndDate" value={EndDate} onChange={handleMedicationChange} required />
                </MDBCol>
            </MDBRow>
            <MDBRow className="mb-3 text-center">
                <MDBCol>
                    <MDBBtn onClick={handleSaveMedication} color='secondary'>Save Medication</MDBBtn>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
}

export default MedicationForm;