import React from "react";
import AppointmentForm from "../components/Appointment/AppointmentForm";
import Hero from "../components/Home/Hero";
import Login from "./Login.jsx";
import { useAuth } from "../context/AuthContext";

const Appointment = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <Hero
        title="Get the Best Care Possible: Book an Appointment at Life Care Hospital"
        imageUrl="/signin.png"
      />

      {/* If user is not authenticated, show login form first */}
      {!isAuthenticated ? <Login /> : <AppointmentForm />}
    </>
  );
};

export default Appointment;
