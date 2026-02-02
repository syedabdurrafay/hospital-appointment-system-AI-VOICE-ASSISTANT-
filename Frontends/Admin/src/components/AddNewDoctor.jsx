import React, { useContext, useState } from "react";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "./Common/loading";
import { toast } from "react-toastify";

import {
  HiUpload,
  HiUser,
  HiMail,
  HiPhone,
  HiCalendar,
  HiLockClosed,
  HiBriefcase
} from "react-icons/hi";

const AddNewDoctor = () => {
  const { language } = useContext(Context);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    aadhar: "",
    gender: "",
    password: "",
    specialization: "General Physician",
    experience: "",
    qualification: "MBBS",
    licenseNumber: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const specializations = [
    "General Physician",
    "Family Medicine",
    "Internal Medicine",
    "Pediatrics",
    "Geriatrics",
    "Emergency Medicine"
  ];

  const qualifications = [
    "MBBS",
    "MD",
    "MS",
    "DNB",
    "MCh",
    "DM"
  ];

  const translations = {
    en: {
      title: "Add New Doctor",
      subtitle: "Register a new doctor for the clinic",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      dob: "Date of Birth",
      aadhar: "Aadhar Number",
      gender: "Gender",
      selectGender: "Select Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      password: "Password",
      specialization: "Specialization",
      selectSpecialization: "Select Specialization",
      experience: "Experience (Years)",
      qualification: "Qualification",
      licenseNumber: "Medical License Number",
      uploadPhoto: "Upload Photo",
      changePhoto: "Change Photo",
      submit: "Register Doctor",
      success: "Doctor registered successfully",
      error: "Registration failed",
      required: "This field is required",
      emailInvalid: "Please enter a valid email",
      phoneInvalid: "Please enter a valid 10-digit phone number"
    },
    de: {
      title: "Neuen Arzt hinzufügen",
      subtitle: "Registrieren Sie einen neuen Arzt für die Klinik",
      firstName: "Vorname",
      lastName: "Nachname",
      email: "E-Mail-Adresse",
      phone: "Telefonnummer",
      dob: "Geburtsdatum",
      aadhar: "Aadhar-Nummer",
      gender: "Geschlecht",
      selectGender: "Geschlecht auswählen",
      male: "Männlich",
      female: "Weiblich",
      other: "Andere",
      password: "Passwort",
      specialization: "Spezialisierung",
      selectSpecialization: "Spezialisierung auswählen",
      experience: "Erfahrung (Jahre)",
      qualification: "Qualifikation",
      licenseNumber: "Medizinische Lizenznummer",
      uploadPhoto: "Foto hochladen",
      changePhoto: "Foto ändern",
      submit: "Arzt registrieren",
      success: "Arzt erfolgreich registriert",
      error: "Registrierung fehlgeschlagen",
      required: "Dieses Feld ist erforderlich",
      emailInvalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      phoneInvalid: "Bitte geben Sie eine gültige 10-stellige Telefonnummer ein"
    }
  };

  const t = translations[language];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      toast.error(t.required);
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error(t.emailInvalid);
      return;
    }
    
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error(t.phoneInvalid);
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) =>
        formDataToSend.append(key, formData[key])
      );

      if (avatar) {
        formDataToSend.append("doctrAvatar", avatar);
      }

      await axios.post(
        "/api/user/doctor/addnew",
        formDataToSend,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(t.success);
      navigate("/doctors");
    } catch (error) {
      toast.error(error.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">{t.title}</h1>
        <p className="page-subtitle">{t.subtitle}</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Photo Upload */}
            <div className="lg:col-span-1">
              <div className="flex flex-col items-center p-8 border-2 border-dashed rounded-xl">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    className="w-48 h-48 rounded-full object-cover mb-4"
                    alt="Preview"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    <HiUser className="w-24 h-24 text-gray-400" />
                  </div>
                )}

                <label className="btn btn-secondary cursor-pointer">
                  <HiUpload className="w-5 h-5 mr-2" />
                  {avatarPreview ? t.changePhoto : t.uploadPhoto}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* First Name */}
                <div className="form-group">
                  <label className="form-label">{t.firstName}</label>
                  <div className="relative">
                    <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      className="form-input pl-10"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="form-group">
                  <label className="form-label">{t.lastName}</label>
                  <div className="relative">
                    <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      className="form-input pl-10"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">{t.email}</label>
                  <div className="relative">
                    <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      className="form-input pl-10"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label className="form-label">{t.phone}</label>
                  <div className="relative">
                    <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      className="form-input pl-10"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* DOB */}
                <div className="form-group">
                  <label className="form-label">{t.dob}</label>
                  <div className="relative">
                    <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="dob"
                      className="form-input pl-10"
                      value={formData.dob}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Aadhar */}
                <div className="form-group">
                  <label className="form-label">{t.aadhar}</label>
                  <input
                    type="text"
                    name="aadhar"
                    className="form-input"
                    value={formData.aadhar}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Gender */}
                <div className="form-group">
                  <label className="form-label">{t.gender}</label>
                  <select
                    name="gender"
                    className="form-input"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">{t.selectGender}</option>
                    <option value="Male">{t.male}</option>
                    <option value="Female">{t.female}</option>
                    <option value="Other">{t.other}</option>
                  </select>
                </div>

                {/* Specialization */}
                <div className="form-group">
                  <label className="form-label">{t.specialization}</label>
                  <select
                    name="specialization"
                    className="form-input"
                    value={formData.specialization}
                    onChange={handleInputChange}
                  >
                    <option value="">{t.selectSpecialization}</option>
                    {specializations.map((spec, idx) => (
                      <option key={idx} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience */}
                <div className="form-group">
                  <label className="form-label">{t.experience}</label>
                  <input
                    type="number"
                    name="experience"
                    className="form-input"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                  />
                </div>

                {/* Qualification */}
                <div className="form-group">
                  <label className="form-label">{t.qualification}</label>
                  <select
                    name="qualification"
                    className="form-input"
                    value={formData.qualification}
                    onChange={handleInputChange}
                  >
                    {qualifications.map((qual, idx) => (
                      <option key={idx} value={qual}>
                        {qual}
                      </option>
                    ))}
                  </select>
                </div>

                {/* License Number */}
                <div className="form-group">
                  <label className="form-label">{t.licenseNumber}</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    className="form-input"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Password */}
                <div className="form-group md:col-span-2">
                  <label className="form-label">{t.password}</label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      className="form-input pl-10"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button type="submit" className="btn btn-primary px-8 py-3">
                  {t.submit}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewDoctor;