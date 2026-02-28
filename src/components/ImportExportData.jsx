import React, { useState } from 'react';
import { Download, Upload, Server, X } from 'lucide-react';

export default function ImportExportData({ onImport }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleExport = () => {
        const data = {
            portfolio: JSON.parse(localStorage.getItem('investiq_portfolio') || '[]'),
            goal: localStorage.getItem('investiq_portfolio_goal') ? parseFloat(localStorage.getItem('investiq_portfolio_goal')) : null,
            history: JSON.parse(localStorage.getItem('investiq_portfolio_history') || '[]')
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `investiq_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                // Handle raw portfolio arrays (the old default format)
                if (Array.isArray(data)) {
                    onImport(data, undefined, undefined);
                }
                // Handle the new combined export format
                else if (data.portfolio) {
                    onImport(data.portfolio, data.goal, data.history);
                } else {
                    alert('Invalid InvestIQ backup format.');
                }
                setIsOpen(false);
            } catch (err) {
                alert('Could not parse file. Ensure it is a valid JSON backup.');
            }
        };
        reader.readAsText(file);
        e.target.value = null; // reset input
    };

    return (
        <>
            <button className="btn btn-ghost" onClick={() => setIsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Server size={14} /> Data
            </button>

            {isOpen && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsOpen(false)}>
                    <div className="modal" style={{ width: 500 }}>
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Server size={18} /> Manage Your Data
                            </h2>
                            <button className="modal-close" onClick={() => setIsOpen(false)}><X size={18} /></button>
                        </div>

                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
                            Your financial data is stored locally in your browser. You can export it as a JSON file to keep a backup, or import an existing backup.
                        </p>

                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
                                EXACT BACKUP FORMAT
                            </label>
                            <pre style={{
                                background: 'var(--bg-tertiary)',
                                padding: 12,
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 12,
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                overflowX: 'auto',
                                margin: 0
                            }}>
                                {`{
  "portfolio": [
    {
      "id": "AAPL-123",
      "ticker": "AAPL",
      "quantity": 10,
      "avgPrice": 150.00
    }
  ],
  "goal": 100000,
  "history": [
    { "date": "2024-01-01", "value": 1500 }
  ]
}`}
                            </pre>
                        </div>

                        <div className="modal-actions" style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', height: 40, width: '100%' }}>
                                    <Upload size={16} style={{ marginRight: 8 }} /> Import JSON
                                    <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
                                </label>
                            </div>
                            <div style={{ flex: 1 }}>
                                <button className="btn btn-primary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40, width: '100%' }}>
                                    <Download size={16} style={{ marginRight: 8 }} /> Export Backup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
