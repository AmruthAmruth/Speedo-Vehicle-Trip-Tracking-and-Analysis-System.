import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../../constants/constants';
import SpeedIcon from '@mui/icons-material/Speed';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <nav
            className={`navbar ${isScrolled ? 'scrolled' : ''}`}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                transition: 'all 0.3s ease',
                backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                backdropFilter: isScrolled ? 'blur(10px)' : 'none',
                boxShadow: isScrolled ? `0 4px 20px ${COLORS.shadow}` : 'none',
                borderBottom: isScrolled ? '1px solid #e4e4e7' : 'none',
                padding: '1rem 2rem',
            }}
        >
            <div
                style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                {/* Logo */}
                <div
                    className="logo-container"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                    }}
                    onClick={() => scrollToSection('hero')}
                >
                    <div
                        className="logo-icon"
                        style={{
                            background: isScrolled ? '#000000' : '#ffffff',
                            borderRadius: '12px',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 4px 15px rgba(0, 0, 0, 0.1)`,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <SpeedIcon style={{ color: isScrolled ? '#ffffff' : '#000000', fontSize: '1.75rem', transition: 'all 0.3s ease' }} />
                    </div>
                    <span
                        className="logo-text"
                        style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            color: isScrolled ? '#09090b' : '#ffffff',
                            transition: 'color 0.3s ease',
                        }}
                    >
                        Speedo
                    </span>
                </div>

                {/* Desktop Navigation */}
                <div
                    className="nav-links-desktop"
                    style={{
                        display: 'flex',
                        gap: '2rem',
                        alignItems: 'center',
                    }}
                >
                    {['Features', 'How It Works', 'Benefits'].map((item) => (
                        <button
                            key={item}
                            onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: isScrolled ? '#09090b' : 'rgba(255, 255, 255, 0.85)',
                                fontSize: '1rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                            }}
                            className="nav-link"
                        >
                            {item}
                        </button>
                    ))}
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: isScrolled ? '#000000' : '#ffffff',
                            color: isScrolled ? '#ffffff' : '#000000',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: `0 4px 15px rgba(0,0,0,0.1)`,
                            transition: 'all 0.3s ease',
                        }}
                        className="login-btn"
                    >
                        Get Started
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                    }}
                >
                    {isMobileMenuOpen ? (
                        <CloseIcon style={{ color: isScrolled ? '#09090b' : '#ffffff', fontSize: '1.75rem' }} />
                    ) : (
                        <MenuIcon style={{ color: isScrolled ? '#09090b' : '#ffffff', fontSize: '1.75rem' }} />
                    )}
                </button>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div
                    className="nav-links-mobile animate-slide-down"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#ffffff',
                        borderBottom: `1px solid ${COLORS.border}`,
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        boxShadow: `0 10px 25px rgba(0,0,0,0.1)`,
                    }}
                >
                    {['Features', 'How It Works', 'Benefits'].map((item) => (
                        <button
                            key={item}
                            onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, '-'))}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#09090b',
                                fontSize: '1.125rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                padding: '0.5rem 0',
                                textAlign: 'left',
                                width: '100%',
                            }}
                        >
                            {item}
                        </button>
                    ))}
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: '#000000',
                            color: '#ffffff',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '10px',
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textAlign: 'center',
                            width: '100%',
                            boxShadow: `0 4px 15px rgba(0,0,0,0.1)`,
                        }}
                    >
                        Get Started
                    </button>
                </div>
            )}</nav>
    );
};

export default Navbar;
