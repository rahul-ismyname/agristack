import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, FileText, Download, X, Loader2, CheckCircle2 } from 'lucide-react';
import { exportToCSV, exportToPDF } from '../lib/utils';
import { getAllFarmers, getAllInspections, getAllGyanVahan } from '../lib/api';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ExportType = 'farmers' | 'inspections' | 'gyan_vahan';
type ExportFormat = 'csv' | 'pdf';

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
    const [selectedType, setSelectedType] = useState<ExportType>('farmers');
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            let data: any[] = [];
            let filename = '';
            let title = '';

            // Fetch Data
            switch (selectedType) {
                case 'farmers':
                    data = await getAllFarmers(fromDate, toDate);
                    filename = `farmers_export_${new Date().toISOString().split('T')[0]}`;
                    title = 'Registered Farmers List';
                    break;
                case 'inspections':
                    data = await getAllInspections(fromDate, toDate);
                    filename = `inspections_export_${new Date().toISOString().split('T')[0]}`;
                    title = 'Seed Inspection Reports';
                    break;
                case 'gyan_vahan':
                    data = await getAllGyanVahan(fromDate, toDate);
                    filename = `gyan_vahan_export_${new Date().toISOString().split('T')[0]}`;
                    title = 'Gyan Vahan Campaign Logs';
                    break;
            }

            let success = false;
            // Export
            if (selectedFormat === 'csv') {
                success = exportToCSV(data, filename);
            } else {
                success = exportToPDF(data, filename, title, selectedType, fromDate, toDate);
            }

            if (!success) {
                alert('No data found for the selected range.');
                setIsLoading(false);
                return;
            }

            // Success Animation
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 1500);

        } catch (error) {
            console.error(error);
            alert('Export failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
                                <p className="text-sm text-gray-500">Select data type and format</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Data Type Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Data Source</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { id: 'farmers', label: 'Farmers Registry', desc: 'Full list of registered farmers' },
                                        { id: 'inspections', label: 'Inspection Reports', desc: 'Seed verification outcomes' },
                                        { id: 'gyan_vahan', label: 'Gyan Vahan Logs', desc: 'Campaign tracking data' },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id as ExportType)}
                                            className={`flex items-center p-3 rounded-xl border text-left transition-all ${selectedType === type.id
                                                ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${selectedType === type.id ? 'border-green-500' : 'border-gray-400'
                                                }`}>
                                                {selectedType === type.id && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{type.label}</div>
                                                <div className="text-xs text-gray-500">{type.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Format Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Export Format</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setSelectedFormat('csv')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${selectedFormat === 'csv'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <FileSpreadsheet className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-medium">CSV (Excel)</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedFormat('pdf')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${selectedFormat === 'pdf'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <FileText className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-medium">PDF (Print)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Date Filter Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Date Range (Optional)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">From</label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">To</label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Leave blank to export all records.</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={handleExport}
                                disabled={isLoading || isSuccess}
                                className={`w-full flex items-center justify-center py-3 rounded-xl text-white font-bold transition-all ${isSuccess
                                    ? 'bg-green-600'
                                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-200'
                                    } disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Generating File...
                                    </>
                                ) : isSuccess ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Download Started!
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5 mr-2" />
                                        Download {selectedFormat.toUpperCase()}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
