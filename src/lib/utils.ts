import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (data: any[], filename: string): boolean => {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return false;
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
        return true;
    }
    return false;
};

type ReportType = 'farmers' | 'inspections' | 'gyan_vahan';

const COLUMN_CONFIGS: Record<ReportType, { header: string; key: string; width?: number }[]> = {
    farmers: [
        { header: 'Registration ID', key: 'registration_id' },
        { header: 'Farmer Name', key: 'full_name' },
        { header: 'Mobile', key: 'mobile' },
        { header: 'Gender', key: 'gender' },
        { header: 'Village', key: 'village' },
        { header: 'Block', key: 'block' },
        { header: 'District', key: 'district' },
        { header: 'Date Reg.', key: 'created_at' }
    ],
    inspections: [
        { header: 'Lot No', key: 'lot_no' },
        { header: 'Farmer', key: 'farmer_name' },
        { header: 'Crop', key: 'crop' },
        { header: 'Variety', key: 'variety' },
        { header: 'Inspector', key: 'inspector_name' },
        { header: 'Date', key: 'inspection_date' },
        { header: 'Result', key: 'is_passed' }
    ],
    gyan_vahan: [
        { header: 'Inspector', key: 'inspector_name' },
        { header: 'Role', key: 'inspector_role' },
        { header: 'District', key: 'district' },
        { header: 'Village', key: 'village' },
        { header: 'Farmers', key: 'farmers_count' },
        { header: 'Remarks', key: 'remarks' },
        { header: 'Date', key: 'visit_date' }
    ]
};

export const exportToPDF = (
    data: any[],
    filename: string,
    title: string,
    type: ReportType,
    fromDate?: string,
    toDate?: string
): boolean => {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return false;
    }

    // Use landscape for better table fit
    const doc = new jsPDF({ orientation: 'landscape' });

    // Get columns for specific report type
    const columns = COLUMN_CONFIGS[type] || [];

    // Fallback if type doesn't match (shouldn't happen with strict types)
    if (columns.length === 0) {
        // Fallback: Use all keys except internal ones
        const keys = Object.keys(data[0]).filter(k => !['id', 'updated_at', 'avatar_url'].includes(k));
        keys.forEach(k => columns.push({ header: k.toUpperCase(), key: k }));
    }

    const tableHeaders = columns.map(c => c.header);
    const tableBody = data.map(row =>
        columns.map(col => {
            const val = row[col.key];

            // Format Dates
            if (col.key.includes('date') || col.key.includes('_at')) {
                if (!val) return '-';
                return new Date(val).toLocaleDateString('en-GB');
            }

            // Format Booleans
            if (typeof val === 'boolean') {
                return val ? 'Passed/Yes' : 'Failed/No';
            }

            return val || '-';
        })
    );

    // --- Header Design ---
    doc.setFillColor(27, 94, 32); // Brand Green
    doc.rect(0, 0, 297, 40, 'F'); // Landscape width is 297mm

    // Logo Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('AGRISTACK', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Government of India - Department of Agriculture', 14, 28);

    // Report Title Block
    doc.setFillColor(240, 240, 240);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(14, 45, 269, 24, 3, 3, 'FD');

    doc.setTextColor(33, 33, 33);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 20, 58);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    const dateRangeText = fromDate && toDate
        ? `Period: ${new Date(fromDate).toLocaleDateString('en-GB')} - ${new Date(toDate).toLocaleDateString('en-GB')}`
        : `Generated: ${new Date().toLocaleDateString('en-GB')}`;

    doc.text(dateRangeText, 20, 64);

    // Count Badge
    doc.setFillColor(27, 94, 32);
    doc.roundedRect(240, 50, 35, 14, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.length} Records`, 257.5, 59, { align: 'center' });


    // --- Table ---
    autoTable(doc, {
        head: [tableHeaders],
        body: tableBody,
        startY: 75,
        theme: 'grid', // Cleaner look than striped for data density
        headStyles: {
            fillColor: [27, 94, 32],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 4
        },
        styles: {
            fontSize: 9,
            cellPadding: 4,
            valign: 'middle',
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        },
        alternateRowStyles: {
            fillColor: [250, 252, 250] // Very subtle green tint
        },
        margin: { top: 75, left: 14, right: 14 },
        didDrawPage: (data) => {
            // Footer
            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150);
            const footerText = `Page ${pageCount} | Agristack Official Report | ${new Date().toLocaleString()}`;
            doc.text(footerText, 14, 200); // Bottom of landscape
        }
    });

    doc.save(`${filename}.pdf`);
    return true;
};
