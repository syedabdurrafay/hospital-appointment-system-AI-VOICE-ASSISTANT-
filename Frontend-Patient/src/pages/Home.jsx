import React from 'react';
import Hero from '../components/Home/Hero';
import Departments from '../components/Home/Departments';
import Testimonials from '../components/Home/Testimonials';
import CTA from '../components/Home/CTA';
import './Home.css';

const Home = () => {
    return (
        <>
            <Hero />
            <div className="features-section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🏥</div>
                            <h3>24/7 Emergency</h3>
                            <p>Round-the-clock emergency services with expert medical care</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">👨‍⚕️</div>
                            <h3>Expert Doctors</h3>
                            <p>500+ certified specialists with advanced medical training</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💻</div>
                            <h3>Online Booking</h3>
                            <p>Easy appointment scheduling from anywhere, anytime</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🏆</div>
                            <h3>Quality Care</h3>
                            <p>98% patient satisfaction rate with personalized treatment</p>
                        </div>
                    </div>
                </div>
            </div>
            <Departments />
            <Testimonials />
            <CTA />
        </>
    );
}

export default Home;