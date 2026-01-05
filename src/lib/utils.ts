import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
                return value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const exportToPDF = (data: any[], filename: string, title: string) => {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    const doc = new jsPDF();
    const headers = Object.keys(data[0]).map(header =>
        header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, ' ')
    );
    const rows = data.map(row => Object.values(row));

    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    // Sub-title / Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Table
    autoTable(doc, {
        head: [headers],
        body: rows as any[], // Casting to any[] to bypass strict type check for now
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [40, 167, 69] }, // Green
        styles: { fontSize: 8 },
    });

    doc.save(`${filename}.pdf`);
};
