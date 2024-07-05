import React, { useState, useEffect } from 'react';
import './home.css';
import axios from 'axios';
import { useAuth } from '../../contexts/authUserContext';
import Profile from './subComponents/profile/Profile';
import dropdown from '../../resources/home/dropdownIcon.png';
import upIcon from '../../resources/home/upIcon.png';
import navigationIcon from '../../resources/home/navigationIcon.png';
import profileIcon from '../../resources/home/profileIcon.png';
import PatientDetails from './subComponents/patientDetails/PatientDetails';
import Dashboard from './subComponents/dashboard/Dashboard';
import {
  MDBBtn,
  MDBCollapse,
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBNavbarToggler,
  MDBNavbarNav,
  MDBCardImage,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";


export default function Home() {
  const [openNav, setOpenNav] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  //const [name,setName]=useState('');
  const [guardianDetails,setGuardianDetails]=useState(null);
  const {setUser, setIsAuthenticated } = useAuth();
  const [navOption, setNavOption] = useState(1);
  useEffect(() => {
    const fetchGuardianId = async () => {
      try {
        const response = await axios.get('/guardian/view/');
        if (!response.data.profileEmpty) {
          //setName(response.data.FirstName);
          setGuardianDetails({
            GuardianID: response.data.GuardianID,
            FirstName: response.data.FirstName,
            LastName: response.data.LastName,
            Email: response.data.Email,
            PhoneNumber: response.data.PhoneNumber,
            Address: response.data.Address,
            RelationshipToPatient: response.data.RelationshipToPatient
          });

        } else {
          setShowProfile(true);
        }
      } catch (err) {
        if (err.response && err.response.data && err.response.data.profileEmpty) {
          setShowProfile(true);
        } else {
          console.log(err);
        }
      }
    };
    fetchGuardianId();
  }, [showProfile]);



  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/logout/');
      localStorage.clear();
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = '/';
    }
    catch (err) {
      console.log(err);
    }
  };

  return (
    <div >
      <MDBContainer fluid className={`homepage-content ${showProfile ? 'blur' : ''}`}>
        <MDBRow>
          <MDBCol size='auto'>
            <img src={profileIcon} alt='profile Icon' className='profile-icon' loading='lazy' onClick={() => setShowProfile(!showProfile)} />
          </MDBCol>
          <MDBCol size='auto' className='d-flex justify-content-center align-items-center'>
            <h4 className='username'>{guardianDetails ? guardianDetails.FirstName : 'Name'}</h4>
          </MDBCol>
          <MDBCol className='d-flex justify-content-end'>
            <MDBBtn className='me-1 custom-button' color='dark' onClick={handleLogout} >
              Logout
            </MDBBtn>
          </MDBCol>
        </MDBRow>
        <MDBNavbar expand='md' light bgColor='light' style={{ marginBottom: '20px' }} >
          <MDBContainer fluid>
            <MDBNavbarBrand href='#'> <img
              src={navigationIcon}
              height='30'
              alt='nav icon'
              loading='lazy'
            /></MDBNavbarBrand>
            <MDBNavbarToggler
              type='button'
              aria-expanded='false'
              aria-label='Toggle navigation'
              onClick={() => setOpenNav(!openNav)}
            >
              <MDBCardImage key={openNav} src={openNav ? dropdown : upIcon} alt='dropdown' className='dropdown-img' />
            </MDBNavbarToggler>
            <MDBCollapse navbar open={openNav}>
              <MDBNavbarNav>
                <MDBNavbarItem>
                  <MDBNavbarLink href='#' onClick={() => setNavOption(1)}>Dashboard</MDBNavbarLink>
                </MDBNavbarItem>
                <MDBNavbarItem>
                  <MDBNavbarLink href='#' onClick={() => setNavOption(2)}>Patient Details</MDBNavbarLink>
                </MDBNavbarItem>
              </MDBNavbarNav>
            </MDBCollapse>
          </MDBContainer>
        </MDBNavbar>
        {navOption === 1 ? <Dashboard /> : <PatientDetails />}
      </MDBContainer>
      {showProfile && <Profile setShowProfile={setShowProfile} guardianData={guardianDetails} />}
    </div>

  );
}