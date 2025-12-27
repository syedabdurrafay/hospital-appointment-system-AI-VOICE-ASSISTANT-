import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { 
  HiUserGroup, 
  HiSearch, 
  HiFilter, 
  HiPlus, 
  HiPencil, 
  HiTrash,
  HiPhone,
  HiMail,
  HiCalendar
} from 'react-icons/hi';
import Button from '../Common/Button';
import './Doctors.css';

const Doctors = () => {
  const { language } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDoctors, setSelectedDoctors] = useState([]);

  const translations = {
    en: {
      title: 'Doctors',
      subtitle: 'Manage hospital doctors',
      searchPlaceholder: 'Search doctors...',
      filterAll: 'All',
      filterActive: 'Active',
      filterInactive: 'Inactive',
      addDoctor: 'Add Doctor',
      name: 'Name',
      department: 'Department',
      contact: 'Contact',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
      onLeave: 'On Leave',
      noDoctors: 'No doctors found',
      selectAll: 'Select All',
      deleteSelected: 'Delete Selected',
      phone: 'Phone',
      email: 'Email',
      joined: 'Joined',
      patients: 'Patients',
      rating: 'Rating'
    },
    de: {
      title: 'Ärzte',
      subtitle: 'Krankenhausärzte verwalten',
      searchPlaceholder: 'Ärzte suchen...',
      filterAll: 'Alle',
      filterActive: 'Aktiv',
      filterInactive: 'Inaktiv',
      addDoctor: 'Arzt hinzufügen',
      name: 'Name',
      department: 'Abteilung',
      contact: 'Kontakt',
      status: 'Status',
      actions: 'Aktionen',
      active: 'Aktiv',
      inactive: 'Inaktiv',
      onLeave: 'Im Urlaub',
      noDoctors: 'Keine Ärzte gefunden',
      selectAll: 'Alle auswählen',
      deleteSelected: 'Ausgewählte löschen',
      phone: 'Telefon',
      email: 'E-Mail',
      joined: 'Beigetreten',
      patients: 'Patienten',
      rating: 'Bewertung'
    }
  };

  const t = translations[language];

  // Mock data - replace with API call
  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Smith',
      department: 'Cardiology',
      phone: '+1 234 567 8901',
      email: 'sarah.smith@hospital.com',
      avatar: 'SS',
      status: 'active',
      patients: 245,
      rating: 4.8,
      joined: '2020-05-15'
    },
    {
      id: 2,
      name: 'Dr. Michael Brown',
      department: 'Orthopedics',
      phone: '+1 234 567 8902',
      email: 'michael.brown@hospital.com',
      avatar: 'MB',
      status: 'active',
      patients: 189,
      rating: 4.6,
      joined: '2021-03-20'
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      department: 'Neurology',
      phone: '+1 234 567 8903',
      email: 'emily.davis@hospital.com',
      avatar: 'ED',
      status: 'onLeave',
      patients: 167,
      rating: 4.9,
      joined: '2019-11-10'
    },
    {
      id: 4,
      name: 'Dr. David Wilson',
      department: 'Pediatrics',
      phone: '+1 234 567 8904',
      email: 'david.wilson@hospital.com',
      avatar: 'DW',
      status: 'active',
      patients: 312,
      rating: 4.7,
      joined: '2018-07-25'
    },
    {
      id: 5,
      name: 'Dr. Lisa Taylor',
      department: 'Dermatology',
      phone: '+1 234 567 8905',
      email: 'lisa.taylor@hospital.com',
      avatar: 'LT',
      status: 'inactive',
      patients: 134,
      rating: 4.5,
      joined: '2022-01-15'
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && doctor.status === 'active';
    if (filter === 'inactive') return matchesSearch && doctor.status === 'inactive';
    if (filter === 'onLeave') return matchesSearch && doctor.status === 'onLeave';
    
    return matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedDoctors.length === filteredDoctors.length) {
      setSelectedDoctors([]);
    } else {
      setSelectedDoctors(filteredDoctors.map(d => d.id));
    }
  };

  const handleSelectDoctor = (doctorId) => {
    setSelectedDoctors(prev => 
      prev.includes(doctorId) 
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const getStatusColor = (status) => {
    switch(status) {
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
        <div className="search-filter">
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
            <button 
              className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilter('inactive')}
            >
              {t.filterInactive}
            </button>
            <button 
              className={`filter-btn ${filter === 'onLeave' ? 'active' : ''}`}
              onClick={() => setFilter('onLeave')}
            >
              {t.onLeave}
            </button>
          </div>
        </div>

        {selectedDoctors.length > 0 && (
          <div className="selection-actions">
            <span className="selected-count">
              {selectedDoctors.length} {language === 'en' ? 'selected' : 'ausgewählt'}
            </span>
            <Button variant="danger" onClick={() => setSelectedDoctors([])}>
              <HiTrash />
              {t.deleteSelected}
            </Button>
          </div>
        )}
      </div>

      <div className="doctors-grid">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-header">
              <div className="doctor-avatar">
                {doctor.avatar}
              </div>
              <div className="doctor-info">
                <h3 className="doctor-name">{doctor.name}</h3>
                <span className={`doctor-status ${getStatusColor(doctor.status)}`}>
                  {t[doctor.status]}
                </span>
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
                <span className="detail-label">{t.department}</span>
                <span className="detail-value">{doctor.department}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">{t.rating}</span>
                <div className="rating">
                  <span className="rating-stars">★★★★★</span>
                  <span className="rating-value">{doctor.rating}</span>
                </div>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">{t.patients}</span>
                <span className="detail-value">{doctor.patients}</span>
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

            <div className="doctor-footer">
              <div className="joined-date">
                <HiCalendar className="calendar-icon" />
                <span>{doctor.joined}</span>
              </div>
              <div className="doctor-actions">
                <Button variant="secondary" size="small" icon={<HiPencil />}>
                  {language === 'en' ? 'Edit' : 'Bearbeiten'}
                </Button>
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
    </div>
  );
};

export default Doctors;