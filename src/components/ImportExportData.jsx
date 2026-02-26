import { Download, Upload } from 'lucide-react';

export default function ImportExportData({ onImport }) {
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
            } catch (err) {
                alert('Could not parse file. Ensure it is a valid JSON backup.');
            }
        };
        reader.readAsText(file);
        e.target.value = null; // reset input
    };

    return (
        <div style={{ display: 'flex', gap: 6 }}>
            <label className="btn btn-ghost" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 13 }}>
                <Upload size={14} style={{ marginRight: 6 }} /> Import
                <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            </label>
            <button className="btn btn-ghost" onClick={handleExport} style={{ padding: '6px 12px', fontSize: 13 }}>
                <Download size={14} style={{ marginRight: 6 }} /> Export
            </button>
        </div>
    );
}
