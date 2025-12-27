import { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  HiChatAlt2, 
  HiSearch, 
  HiFilter, 
  HiMail, 
  HiPhone, 
  HiClock, 
  HiStar, 
  HiArchive, 
  HiReply, 
  HiTrash 
} from 'react-icons/hi';
import Button from '../Common/Button';
import './Messages.css';

const Messages = () => {
  const { language } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const translations = {
    en: {
      title: 'Messages',
      subtitle: 'Patient communications',
      searchPlaceholder: 'Search messages...',
      filterAll: 'All',
      filterUnread: 'Unread',
      filterArchived: 'Archived',
      filterStarred: 'Starred',
      inbox: 'Inbox',
      compose: 'Compose',
      from: 'From',
      subject: 'Subject',
      date: 'Date',
      status: 'Status',
      actions: 'Actions',
      unread: 'Unread',
      read: 'Read',
      starred: 'Starred',
      archived: 'Archived',
      reply: 'Reply',
      archive: 'Archive',
      delete: 'Delete',
      markAsRead: 'Mark as Read',
      noMessages: 'No messages found',
      selectAll: 'Select All',
      deleteSelected: 'Delete Selected',
      phone: 'Phone',
      email: 'Email',
      message: 'Message',
      loading: 'Loading...',
      sendReply: 'Send Reply',
      replyPlaceholder: 'Type your reply here...',
      cancel: 'Cancel',
      newMessage: 'New Message'
    },
    de: {
      title: 'Nachrichten',
      subtitle: 'Patientenkommunikation',
      searchPlaceholder: 'Nachrichten suchen...',
      filterAll: 'Alle',
      filterUnread: 'Ungelesen',
      filterArchived: 'Archiviert',
      filterStarred: 'Favorisiert',
      inbox: 'Posteingang',
      compose: 'Verfassen',
      from: 'Von',
      subject: 'Betreff',
      date: 'Datum',
      status: 'Status',
      actions: 'Aktionen',
      unread: 'Ungelesen',
      read: 'Gelesen',
      starred: 'Favorisiert',
      archived: 'Archiviert',
      reply: 'Antworten',
      archive: 'Archivieren',
      delete: 'Löschen',
      markAsRead: 'Als gelesen markieren',
      noMessages: 'Keine Nachrichten gefunden',
      selectAll: 'Alle auswählen',
      deleteSelected: 'Ausgewählte löschen',
      phone: 'Telefon',
      email: 'E-Mail',
      message: 'Nachricht',
      loading: 'Laden...',
      sendReply: 'Antwort senden',
      replyPlaceholder: 'Geben Sie hier Ihre Antwort ein...',
      cancel: 'Abbrechen',
      newMessage: 'Neue Nachricht'
    }
  };

  const t = translations[language];

  // Mock data
  const messages = [
    {
      id: 1,
      from: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 234 567 8901',
      subject: 'Appointment Reschedule Request',
      message: 'Hello, I would like to reschedule my appointment from tomorrow to next week. Please let me know what slots are available.',
      date: '2024-01-15 10:30',
      status: 'unread',
      starred: true,
      archived: false
    },
    {
      id: 2,
      from: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1 234 567 8902',
      subject: 'Prescription Refill',
      message: 'I need a refill for my blood pressure medication. Can you please process it?',
      date: '2024-01-14 14:20',
      status: 'read',
      starred: false,
      archived: false
    },
    {
      id: 3,
      from: 'Robert Johnson',
      email: 'robert.j@email.com',
      phone: '+1 234 567 8903',
      subject: 'Test Results Query',
      message: 'I received my blood test results but need clarification on some values. When can I speak to a doctor?',
      date: '2024-01-14 09:15',
      status: 'read',
      starred: true,
      archived: true
    },
    {
      id: 4,
      from: 'Maria Garcia',
      email: 'maria.g@email.com',
      phone: '+1 234 567 8904',
      subject: 'New Appointment Request',
      message: 'I would like to book an appointment with Dr. Smith for a general check-up.',
      date: '2024-01-13 16:45',
      status: 'unread',
      starred: false,
      archived: false
    },
    {
      id: 5,
      from: 'James Wilson',
      email: 'james.w@email.com',
      phone: '+1 234 567 8905',
      subject: 'Insurance Coverage Question',
      message: 'Does your clinic accept Blue Cross insurance for orthopedic consultations?',
      date: '2024-01-12 11:30',
      status: 'read',
      starred: false,
      archived: false
    }
  ];

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch && !msg.archived;
    if (filter === 'unread') return matchesSearch && msg.status === 'unread' && !msg.archived;
    if (filter === 'archived') return matchesSearch && msg.archived;
    if (filter === 'starred') return matchesSearch && msg.starred && !msg.archived;
    
    return matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map(m => m.id));
    }
  };

  const handleSelectMessage = (messageId) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    // Mark as read when opened
    if (message.status === 'unread') {
      message.status = 'read';
    }
  };

  const handleArchive = (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (message) message.archived = !message.archived;
    setSelectedMessages([]);
  };

  const handleStar = (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (message) message.starred = !message.starred;
  };

  return (
    <div className="messages-page fade-in">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">{t.title}</h1>
          <p className="page-subtitle">{t.subtitle}</p>
        </div>
        <div className="header-right">
          <Button variant="primary" icon={<HiChatAlt2 />}>
            {t.compose}
          </Button>
        </div>
      </div>

      <div className="messages-container">
        {/* Left sidebar - Message list */}
        <div className="messages-sidebar">
          <div className="sidebar-header">
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
            
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <span className="tab-label">{t.inbox}</span>
                <span className="tab-count">{messages.filter(m => !m.archived).length}</span>
              </button>
              <button 
                className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                <span className="tab-label">{t.unread}</span>
                <span className="tab-count">{messages.filter(m => m.status === 'unread' && !m.archived).length}</span>
              </button>
              <button 
                className={`filter-tab ${filter === 'starred' ? 'active' : ''}`}
                onClick={() => setFilter('starred')}
              >
                <span className="tab-label">{t.starred}</span>
                <span className="tab-count">{messages.filter(m => m.starred && !m.archived).length}</span>
              </button>
              <button 
                className={`filter-tab ${filter === 'archived' ? 'active' : ''}`}
                onClick={() => setFilter('archived')}
              >
                <span className="tab-label">{t.archived}</span>
                <span className="tab-count">{messages.filter(m => m.archived).length}</span>
              </button>
            </div>
          </div>

          {selectedMessages.length > 0 && (
            <div className="selection-toolbar">
              <span className="selected-count">
                {selectedMessages.length} {language === 'en' ? 'selected' : 'ausgewählt'}
              </span>
              <div className="selection-actions">
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={() => selectedMessages.forEach(id => handleArchive(id))}
                >
                  {t.archive}
                </Button>
                <Button 
                  variant="danger" 
                  size="small"
                  onClick={() => setSelectedMessages([])}
                >
                  {t.delete}
                </Button>
              </div>
            </div>
          )}

          <div className="messages-list">
            {filteredMessages.length === 0 ? (
              <div className="empty-list">
                <HiChatAlt2 className="empty-icon" />
                <p>{t.noMessages}</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div 
                  key={message.id}
                  className={`message-item ${message.id === selectedMessage?.id ? 'active' : ''} ${message.status === 'unread' ? 'unread' : ''}`}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="message-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectMessage(message.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  <div className="message-content">
                    <div className="message-header">
                      <div className="message-sender">
                        <span className="sender-name">{message.from}</span>
                        {message.starred && (
                          <HiStar className="star-icon starred" />
                        )}
                      </div>
                      <div className="message-time">
                        <HiClock className="time-icon" />
                        <span>{message.date.split(' ')[1]}</span>
                      </div>
                    </div>
                    
                    <div className="message-subject">
                      <span className="subject-text">{message.subject}</span>
                      {message.status === 'unread' && (
                        <span className="unread-badge"></span>
                      )}
                    </div>
                    
                    <div className="message-preview">
                      {message.message.substring(0, 60)}...
                    </div>
                  </div>
                  
                  <div className="message-actions">
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStar(message.id);
                      }}
                      title={message.starred ? 'Unstar' : 'Star'}
                    >
                      <HiStar className={message.starred ? 'starred' : ''} />
                    </button>
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchive(message.id);
                      }}
                      title={message.archived ? 'Unarchive' : 'Archive'}
                    >
                      <HiArchive />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel - Message detail */}
        <div className="message-detail">
          {selectedMessage ? (
            <>
              <div className="detail-header">
                <div className="detail-header-left">
                  <h2 className="message-subject">{selectedMessage.subject}</h2>
                  <div className="message-meta">
                    <span className="sender-info">
                      <strong>{t.from}:</strong> {selectedMessage.from}
                    </span>
                    <span className="date-info">
                      <HiClock className="meta-icon" />
                      {selectedMessage.date}
                    </span>
                  </div>
                </div>
                <div className="detail-header-right">
                  <div className="message-contact">
                    <div className="contact-item">
                      <HiMail className="contact-icon" />
                      <span>{selectedMessage.email}</span>
                    </div>
                    <div className="contact-item">
                      <HiPhone className="contact-icon" />
                      <span>{selectedMessage.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="message-body">
                <div className="message-content">
                  <p>{selectedMessage.message}</p>
                </div>
              </div>

              <div className="message-actions-bar">
                <Button variant="primary" icon={<HiReply />}>
                  {t.reply}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => handleStar(selectedMessage.id)}
                >
                  {selectedMessage.starred ? t.starred : t.starred}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => handleArchive(selectedMessage.id)}
                >
                  {selectedMessage.archived ? t.unread : t.archive}
                </Button>
                <Button variant="danger" icon={<HiTrash />}>
                  {t.delete}
                </Button>
              </div>

              {/* Reply section */}
              <div className="reply-section">
                <h3 className="reply-title">{t.sendReply}</h3>
                <textarea 
                  className="reply-textarea"
                  placeholder={t.replyPlaceholder}
                  rows="4"
                />
                <div className="reply-actions">
                  <Button variant="primary">
                    {t.sendReply}
                  </Button>
                  <Button variant="secondary">
                    {t.cancel}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-message-selected">
              <HiChatAlt2 className="empty-icon" />
              <h3>{t.selectMessage}</h3>
              <p>{language === 'en' ? 'Select a message to read and reply' : 'Wählen Sie eine Nachricht zum Lesen und Antworten aus'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;