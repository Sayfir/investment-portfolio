import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, Plus, Settings, FlaskConical, Download } from 'lucide-react';

const TOUR_STEPS = [
    {
        title: 'Welcome to InvestIQ! 🚀',
        description: 'Your personal, private investment dashboard. All data is securely stored locally on your device.',
        icon: <Sparkles size={24} color="var(--accent-blue)" />
    },
    {
        title: 'Add Your Assets',
        description: 'Click the "Add Asset" button to start tracking your stocks, ETFs, or crypto. We fetch live market data automatically.',
        icon: <Plus size={24} color="var(--accent-green)" />
    },
    {
        title: 'Customize Your View',
        description: 'Use the "Customize" button to show, hide, or rearrange widgets on your dashboard to fit your needs.',
        icon: <Settings size={24} color="var(--text-secondary)" />
    },
    {
        title: '"What If" Simulator',
        description: 'Wondering how a new stock would affect your portfolio? Use the "What If" tool to safely test scenarios before buying.',
        icon: <FlaskConical size={24} color="var(--accent-purple)" />
    },
    {
        title: 'Import & Export',
        description: 'Since your data never leaves your browser, use the Import/Export feature to backup your portfolio or move it to another device.',
        icon: <Download size={24} color="var(--accent-orange)" />
    }
];

export default function OnboardingTour() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

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
            setCurrentStep(s => s + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(s => s - 1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('investiq_has_seen_tour', 'true');
    };

    const step = TOUR_STEPS[currentStep];

    return (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal" style={{ width: 450, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '32px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-tertiary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        {step.icon}
                    </div>
                    <h2 style={{ fontSize: 22, marginBottom: 12 }}>{step.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: 14 }}>
                        {step.description}
                    </p>
                </div>

                {/* Dots indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
                    {TOUR_STEPS.map((_, idx) => (
                        <div key={idx} style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: idx === currentStep ? 'var(--accent-blue)' : 'var(--border)',
                            transition: 'all 0.3s'
                        }} />
                    ))}
                </div>

                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)'
                }}>
                    <button className="btn btn-ghost" onClick={handleClose} style={{ color: 'var(--text-muted)' }}>
                        Skip Tour
                    </button>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {currentStep > 0 && (
                            <button className="btn btn-outline" onClick={handlePrev} style={{ padding: '8px' }}>
                                <ChevronLeft size={18} />
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {currentStep === TOUR_STEPS.length - 1 ? (
                                <>Finish <Check size={16} /></>
                            ) : (
                                <>Next <ChevronRight size={16} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
