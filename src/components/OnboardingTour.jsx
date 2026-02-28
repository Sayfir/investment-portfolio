import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Sparkles, Plus, Settings, FlaskConical, Download } from 'lucide-react';

const TOUR_STEPS = [
    {
        title: 'Welcome to InvestIQ! 🚀',
        description: 'Your personal, private investment dashboard. Built with a sleek, dark-mode glassmorphism interface. All financial data is securely stored locally on your device, giving you total peace of mind.',
        details: [
            'All your assets, goals, and history stay right here in your browser.',
            'Navigate between Dashboard and Portfolio views using the glowing sidebar.',
            'Keep your connection active to get live market price updates automatically.'
        ],
        icon: <Sparkles size={24} color="var(--accent-blue)" />,
        image: '/onboarding/welcome.png'
    },
    {
        title: 'Add Your Assets',
        description: 'Easily track your portfolio by adding your holdings. We automatically fetch the latest live market prices for you.',
        details: [
            'Click the glowing "Add Asset" button in the top right corner.',
            'Search for your favorite stocks, ETFs, or cryptocurrencies by Ticker (e.g. AAPL, NVDA).',
            'Enter your current quantity and the average price you paid.',
            'Set an optional "Goal Price" to track milestones!'
        ],
        icon: <Plus size={24} color="var(--accent-green)" />,
        image: '/onboarding/add_asset.png'
    },
    {
        title: 'Customize Your View',
        description: 'Got a specific way you like your data? Tailor the dashboard widgets to fit your unique financial focus.',
        details: [
            'Click the "Customize" button on the Dashboard top bar.',
            'Toggle the eye icon to show or hide individual widgets (like Risk Score, Top Movers, etc).',
            'Use the up and down arrows to rearrange exactly how the widgets flow on your screen.',
            'Changes save instantly, so your dashboard always looks how you want it.'
        ],
        icon: <Settings size={24} color="var(--text-secondary)" />,
        image: '/onboarding/customize.png'
    },
    {
        title: '"What If" Simulator',
        description: 'Safely test buying or selling scenarios and see their impact without risking a dime.',
        details: [
            'Click the "What If" button (flask icon) on the Dashboard.',
            'Select whether you want to simulate Buying or Selling an asset.',
            'Choose an existing asset or type a new ticker, and enter an amount.',
            'See instantly how that move would change your overall portfolio value, allocations, and risk score!'
        ],
        icon: <FlaskConical size={24} color="var(--accent-purple)" />,
        image: '/onboarding/what_if.png'
    },
    {
        title: 'Import & Export',
        description: 'Since your data never leaves your browser, use the Import/Export feature to seamlessly backup your portfolio to a file.',
        details: [
            'Click the Download cloud icon on the top bar of the Dashboard.',
            'Click "Export Data" to save a secure JSON file to your Downloads folder.',
            'Store that file somewhere safe, like Google Drive or a USB drive.',
            'Moving to a new laptop? Click "Import Data" and load that same JSON file to instantly restore your entire portfolio!'
        ],
        icon: <Download size={24} color="var(--accent-orange)" />,
        image: '/onboarding/import_export.png'
    }
];

export default function OnboardingTour() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('investiq_has_seen_tour');
        if (!hasSeenTour) {
            // Slight delay so it doesn't pop up instantly jarringly
            const timer = setTimeout(() => setIsVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!isVisible) return null;

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep(s => s + 1);
                setIsTransitioning(false);
            }, 200);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep(s => s - 1);
                setIsTransitioning(false);
            }, 200);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('investiq_has_seen_tour', 'true');
    };

    const step = TOUR_STEPS[currentStep];

    return (
        <div className="modal-overlay" style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}>
            <div className="modal onboarding-modal">
                <div className="onboarding-content-container">
                    {/* Left Pane - Image/Screenshot */}
                    <div className="onboarding-left-pane">
                        <div style={{
                            position: 'absolute',
                            width: '150%',
                            height: '150%',
                            background: 'radial-gradient(circle at center, rgba(79, 107, 255, 0.15) 0%, transparent 60%)',
                            top: '-25%',
                            left: '-25%',
                            zIndex: 0
                        }}></div>

                        <img
                            src={step.image}
                            alt={step.title}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: 350,
                                objectFit: 'contain',
                                borderRadius: 12,
                                boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                position: 'relative',
                                zIndex: 1,
                                opacity: isTransitioning ? 0 : 1,
                                transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
                                transition: 'all 0.2s ease-in-out'
                            }}
                        />
                    </div>

                    {/* Right Pane - Content */}
                    <div className="onboarding-right-pane">
                        <div style={{
                            opacity: isTransitioning ? 0 : 1,
                            transform: isTransitioning ? 'translateX(10px)' : 'translateX(0)',
                            transition: 'all 0.2s ease-in-out'
                        }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                                border: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}>
                                {step.icon}
                            </div>

                            <h2 style={{ fontSize: 26, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
                                {step.title}
                            </h2>
                            <p style={{
                                color: 'var(--text-secondary)',
                                lineHeight: 1.6,
                                fontSize: 15,
                                letterSpacing: '0.2px',
                                marginBottom: step.details ? 20 : 0
                            }}>
                                {step.description}
                            </p>

                            {step.details && (
                                <ul style={{
                                    listStyleType: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12
                                }}>
                                    {step.details.map((detail, idx) => (
                                        <li key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 12,
                                            fontSize: 14,
                                            color: 'var(--text-secondary)',
                                            lineHeight: 1.5
                                        }}>
                                            <div style={{
                                                marginTop: 4,
                                                minWidth: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--accent-blue)',
                                                boxShadow: '0 0 8px rgba(79, 107, 255, 0.6)'
                                            }} />
                                            <span>{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer / Navigation */}
                <div className="onboarding-footer">
                    <button
                        className="btn btn-ghost"
                        onClick={handleClose}
                        style={{ color: 'var(--text-muted)', fontSize: 14, padding: '8px 12px' }}
                    >
                        Skip Tour
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        {/* Dots */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            {TOUR_STEPS.map((_, idx) => (
                                <div key={idx} style={{
                                    width: idx === currentStep ? 24 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    background: idx === currentStep ? 'var(--accent-blue)' : 'var(--border)',
                                    transition: 'all 0.3s ease-in-out',
                                    boxShadow: idx === currentStep ? '0 0 10px rgba(79, 107, 255, 0.4)' : 'none'
                                }} />
                            ))}
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            {currentStep > 0 && (
                                <button className="btn btn-outline" onClick={handlePrev} style={{ padding: '8px 12px' }}>
                                    <ChevronLeft size={18} /> Back
                                </button>
                            )}
                            <button
                                className="btn btn-primary"
                                onClick={handleNext}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', fontWeight: 500 }}
                            >
                                {currentStep === TOUR_STEPS.length - 1 ? (
                                    <>Get Started <Check size={18} /></>
                                ) : (
                                    <>Next <ChevronRight size={18} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
