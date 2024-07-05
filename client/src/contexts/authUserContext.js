//create an auth user context using react implemented with server side protection from django
import React, { useState, createContext, useContext, useEffect } from "react";
import axios from "axios";
const AuthUserContext = createContext(null);

export const AuthUserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const inactivityTimeout = 1000 * 60 * 90; //90 min
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get("/check_login/");
        if (response.data.isAuthenticated) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkLoginStatus();
  }, []);

  //Function to logout the user after a period of inactivity
  useEffect(() => {
    let timer;
    if (isAuthenticated) {
      const logoutOnInactivity = async () => {
        try {
          await axios.post("/logout/");
          localStorage.clear();
          setIsAuthenticated(false);
          setUser(null);
          window.location.href = "/";
          console.log("Logged out due to inactivity");
        } catch (err) {
          console.log(err);
        }
      };
      //Function to restart the timer
      const resetTimer = () => {
        clearTimeout(timer);
        timer = setTimeout(logoutOnInactivity, inactivityTimeout);
      };

      //Add event listeners for mouse movement and key presses
      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("keydown", resetTimer);

      //Start the timer
      resetTimer();

      return () => {
        //Remove event listeners
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("keydown", resetTimer);
        //Clear the timer
        clearTimeout(timer);
      };
    }
  }, [isAuthenticated]);

  return (
    <AuthUserContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, user, setUser }}
    >
      {children}
    </AuthUserContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthUserContext);
};
