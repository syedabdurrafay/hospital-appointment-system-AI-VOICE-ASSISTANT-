import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'Cardiology Patient',
      content: 'The cardiology department provided exceptional care during my treatment. The doctors were thorough, compassionate, and the facilities are world-class.',
      rating: 5,
      initials: 'SJ'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Orthopedics Patient',
      content: 'Professional staff and advanced technology made my recovery smooth. The orthopedic team explained everything clearly and provided excellent post-operative care.',
      rating: 5,
      initials: 'MC'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      role: 'Pediatrics Parent',
      content: 'The pediatric team made my child feel comfortable and safe throughout the treatment. Their expertise and kindness made a difficult time much easier.',
      rating: 5,
      initials: 'EW'
    },
    {
      id: 4,
      name: 'Robert Davis',
      role: 'Neurology Patient',
      content: 'Outstanding neurological care with cutting-edge diagnostics. The team was knowledgeable, responsive, and provided comprehensive follow-up.',
      rating: 5,
      initials: 'RD'
    }
  ];

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <h2>Patient Experiences</h2>
          <p>Read what our patients say about their care at our facility</p>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="quote-mark">"</div>
              <div className="testimonial-content">
                <p>"{testimonial.content}"</p>
              </div>
              
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>
              
              <div className="testimonial-header">
                <div className="patient-avatar">
                  {testimonial.initials}
                </div>
                <div className="patient-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;