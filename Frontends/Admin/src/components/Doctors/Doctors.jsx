import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { userService } from '../../services/api';
import {
  HiUserGroup,
  HiSearch,
  HiPlus,
  HiPencil,
  HiTrash,
  HiPhone,
  HiMail,
  HiCalendar,
  HiCheckCircle,
  HiClock,
  HiXCircle
} from 'react-icons/hi';
import Button from '../Common/Button';
import './Doctors.css';

const Doctors = () => {
  const { language } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      title: 'Doctors',
      subtitle: 'Manage clinic doctors',
      searchPlaceholder: 'Search doctors...',
      filterAll: 'All',
      filterActive: 'Active',
      filterInactive: 'Inactive',
      addDoctor: 'Add Doctor',
      name: 'Name',
      specialization: 'Specialization',
      contact: 'Contact',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
      onLeave: 'On Leave',
      noDoctors: 'No doctors found',
      deleteSelected: 'Delete Selected',
      phone: 'Phone',
      email: 'Email',
      experience: 'Experience',
      years: 'years',
      patientsToday: 'Patients Today',
      availability: 'Availability'
    },
    de: {
      title: 'Ärzte',
      subtitle: 'Klinikärzte verwalten',
      searchPlaceholder: 'Ärzte suchen...',
      filterAll: 'Alle',
      filterActive: 'Aktiv',
      filterInactive: 'Inaktiv',
      addDoctor: 'Arzt hinzufügen',
      name: 'Name',
      specialization: 'Spezialisierung',
      contact: 'Kontakt',
      status: 'Status',
      actions: 'Aktionen',
      active: 'Aktiv',
      inactive: 'Inaktiv',
      onLeave: 'Im Urlaub',
      noDoctors: 'Keine Ärzte gefunden',
      deleteSelected: 'Ausgewählte löschen',
      phone: 'Telefon',
      email: 'E-Mail',
      experience: 'Erfahrung',
      years: 'Jahre',
      patientsToday: 'Patienten heute',
      availability: 'Verfügbarkeit'
    }
  };

  const t = translations[language];

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const data = await userService.getDoctors();

        let doctorsList = [];
        if (data.success && data.doctors) {
          doctorsList = data.doctors;
        } else if (Array.isArray(data)) {
          doctorsList = data;
        } else if (Array.isArray(data.doctors)) {
          doctorsList = data.doctors;
        }

        // Transform backend data to match component state
        const formattedDoctors = doctorsList.map(doc => ({
          id: doc._id || doc.id,
          firstName: doc.firstName,
          lastName: doc.lastName,
          specialization: doc.specialization || 'General Physician',
          phone: doc.phone,
          email: doc.email,
          avatar: doc.doctrAvatar?.url ? (
            <img src={doc.doctrAvatar.url} alt={`${doc.firstName}`} className="doctor-avatar-img" />
          ) : (
            <div className="doctor-initials">{doc.firstName?.charAt(0)}{doc.lastName?.charAt(0)}</div>
          ),
          status: doc.isActive ? 'active' : 'inactive',
          experience: doc.experience || '0',
          patientsToday: 0, // Not available in simple doctor list
          availability: doc.availability || 'Mon-Fri, 9AM-5PM',
          qualification: doc.qualification || 'MBBS'
        }));

        setDoctors(formattedDoctors);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
        // Don't fall back to mock data to respect user request
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.phone.includes(searchQuery);

    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && doctor.status === 'active';
    if (filter === 'inactive') return matchesSearch && doctor.status === 'inactive';
    if (filter === 'onLeave') return matchesSearch && doctor.status === 'onLeave';

    return matchesSearch;
  });

  const handleSelectDoctor = (doctorId) => {
    setSelectedDoctors(prev =>
      prev.includes(doctorId)
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <HiCheckCircle />;
      case 'inactive': return <HiClock />;
      case 'onLeave': return <HiXCircle />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'onLeave': return 'status-onleave';
      default: return '';
    }
  };

  return (
    <div className="doctors-page fade-in">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">{t.title}</h1>
          <p className="page-subtitle">{t.subtitle}</p>
          <div className="stats-badge">
            {filteredDoctors.length} {language === 'en' ? 'doctors' : 'Ärzte'}
          </div>
        </div>
        <div className="header-right">
          <Link to="/doctors/add">
            <Button variant="primary" icon={<HiPlus />}>
              {t.addDoctor}
            </Button>
          </Link>
        </div>
      </div>

      <div className="doctors-controls">
        <div className="search-section">
          <div className="search-box">
            <HiSearch className="search-icon" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {t.filterAll}
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              {t.filterActive}
            </button>
          </div>
        </div>
      </div>

      <div className="doctors-grid">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-header">
              <div className="doctor-avatar">
                {doctor.avatar}
              </div>
              <div className="doctor-info">
                <h3 className="doctor-name">Dr. {doctor.firstName} {doctor.lastName}</h3>
                <p className="doctor-specialization">{doctor.specialization}</p>
                <div className="doctor-status">
                  <span className={`status-badge ${getStatusColor(doctor.status)}`}>
                    {getStatusIcon(doctor.status)}
                    {t[doctor.status]}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedDoctors.includes(doctor.id)}
                onChange={() => handleSelectDoctor(doctor.id)}
                className="doctor-checkbox"
              />
            </div>

            <div className="doctor-details">
              <div className="detail-row">
                <span className="detail-label">{t.qualification}</span>
                <span className="detail-value">{doctor.qualification}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t.experience}</span>
                <span className="detail-value">{doctor.experience} {t.years}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t.patientsToday}</span>
                <span className="detail-value patients-count">{doctor.patientsToday}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t.availability}</span>
                <span className="detail-value availability-text">{doctor.availability}</span>
              </div>
            </div>

            <div className="doctor-contact">
              <div className="contact-item">
                <HiPhone className="contact-icon" />
                <span className="contact-text">{doctor.phone}</span>
              </div>
              <div className="contact-item">
                <HiMail className="contact-icon" />
                <span className="contact-text">{doctor.email}</span>
              </div>
            </div>

            <div className="doctor-actions">
              <div className="action-buttons">
                <Link to={`/doctors/edit/${doctor.id}`}>
                  <Button variant="secondary" size="small" icon={<HiPencil />}>
                    {language === 'en' ? 'Edit' : 'Bearbeiten'}
                  </Button>
                </Link>
                <Button variant="danger" size="small" icon={<HiTrash />}>
                  {language === 'en' ? 'Delete' : 'Löschen'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="empty-state">
          <HiUserGroup className="empty-icon" />
          <h3>{t.noDoctors}</h3>
          <p>{language === 'en' ? 'Try adjusting your search or filter' : 'Versuchen Sie, Ihre Suche oder Filter anzupassen'}</p>
          <Link to="/doctors/add">
            <Button variant="primary" icon={<HiPlus />}>
              {t.addDoctor}
            </Button>
          </Link>
        </div>
      )}

      {selectedDoctors.length > 0 && (
        <div className="selection-actions-bar">
          <div className="selection-info">
            <span className="selected-count">
              {selectedDoctors.length} {language === 'en' ? 'doctors selected' : 'Ärzte ausgewählt'}
            </span>
          </div>
          <div className="selection-buttons">
            <Button
              variant="danger"
              size="small"
              icon={<HiTrash />}
              onClick={() => {
                setSelectedDoctors([]);
                // In real app, delete selected doctors
                console.log('Delete doctors:', selectedDoctors);
              }}
            >
              {t.deleteSelected}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;