import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Check } from 'lucide-react';
import { Input } from './ui/Input';
import { uploadImage } from '../lib/api';

interface InspectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    inspection?: any; // For edit mode
}

const initialFormState = {
    lot_no: '',
    crop: '',
    variety: '',
    inspector_name: '',
    officer_mobile: '',
    farmer_name: '',
    farmer_id: '',
    district: '',
    block: '',
    village: '',
    sowing_status: '',
    inspection_date: new Date().toISOString().split('T')[0],
    is_passed: true,
    remarks: '',
    photo_url: ''
};

export const InspectionModal: React.FC<InspectionModalProps> = ({ isOpen, onClose, onSave, inspection }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [customCrop, setCustomCrop] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const isEditMode = !!inspection;

    // Pre-fill form when editing
    useEffect(() => {
        if (isOpen && inspection) {
            const standardCrops = ['Wheat', 'Rice', 'Maize', 'Mustard'];
            const isCustomCrop = !standardCrops.includes(inspection.crop);

            setFormData({
                lot_no: inspection.lot_no || '',
                crop: isCustomCrop ? 'Other' : (inspection.crop || ''),
                variety: inspection.variety || '',
                inspector_name: inspection.inspector_name || '',
                officer_mobile: inspection.officer_mobile || '',
                farmer_name: inspection.farmer_name || '',
                farmer_id: inspection.farmer_id || '',
                district: inspection.district || '',
                block: inspection.block || '',
                village: inspection.village || '',
                sowing_status: inspection.sowing_status || '',
                inspection_date: inspection.inspection_date || new Date().toISOString().split('T')[0],
                is_passed: inspection.is_passed ?? true,
                remarks: inspection.remarks || '',
                photo_url: inspection.photo_url || ''
            });

            if (isCustomCrop) {
                setCustomCrop(inspection.crop || '');
            }

            if (inspection.photo_url) {
                setUploadSuccess(true);
            }
        } else if (isOpen && !inspection) {
            setFormData(initialFormState);
            setCustomCrop('');
            setUploadSuccess(false);
        }
    }, [isOpen, inspection]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'Other') {
            setFormData(prev => ({ ...prev, crop: 'Other' }));
        } else {
            setFormData(prev => ({ ...prev, crop: value }));
            setCustomCrop('');
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsUploading(true);
        setUploadSuccess(false);

        try {
            const publicUrl = await uploadImage(file);
            setFormData(prev => ({ ...prev, photo_url: publicUrl }));
            setUploadSuccess(true);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload photo. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const finalCropName = formData.crop === 'Other' ? customCrop : formData.crop;

        if (!finalCropName) {
            alert("Please specify the crop name");
            return;
        }

        const submissionData = {
            ...formData,
            crop: finalCropName
        };

        onSave(submissionData);
        onClose();

        // Reset form
        setFormData(initialFormState);
        setCustomCrop('');
        setUploadSuccess(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
                    >
                        <div className="bg-white pointer-events-auto w-full h-full sm:h-auto sm:rounded-xl shadow-2xl sm:max-w-5xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {isEditMode ? 'Edit Inspection' : 'New Seed Inspection'}
                                    </h2>
                                    <p className="text-xs text-gray-500 hidden sm:block">
                                        {isEditMode ? 'Update inspection details below.' : 'Enter inspection details below. All fields are required unless optional.'}
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-gray-50/50">
                                <div className="flex-1 overflow-y-auto sm:overflow-visible p-3 sm:p-5 space-y-3">

                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">

                                        {/* Section: Farmer Information */}
                                        <div className="sm:col-span-4 bg-white p-3 rounded-lg border border-gray-200/60 shadow-sm">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-vivid"></span> Farmer Information
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div className="sm:col-span-2">
                                                    <Input label="Farmer Name" name="farmer_name" value={formData.farmer_name} onChange={handleChange} placeholder="Name" required />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Input label="Farmer ID" name="farmer_id" value={formData.farmer_id} onChange={handleChange} placeholder="FID/REG-XXXXX" required />
                                                </div>
                                                <Input label="District" name="district" value={formData.district} onChange={handleChange} required />
                                                <Input label="Block" name="block" value={formData.block} onChange={handleChange} required />
                                                <Input label="Village" name="village" value={formData.village} onChange={handleChange} required />
                                            </div>
                                        </div>

                                        {/* Section: Crop Details */}
                                        <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-gray-200/60 shadow-sm">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Crop Details
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Input label="Lot Number" name="lot_no" value={formData.lot_no} onChange={handleChange} placeholder="e.g. S-2023-101" required />
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">Crop</label>
                                                    <select
                                                        name="crop"
                                                        value={formData.crop}
                                                        onChange={handleCropChange}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-vivid/20 focus:border-primary-vivid outline-none"
                                                        required
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Wheat">Wheat</option>
                                                        <option value="Rice">Rice</option>
                                                        <option value="Maize">Maize</option>
                                                        <option value="Mustard">Mustard</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                {formData.crop === 'Other' && (
                                                    <div className="sm:col-span-2">
                                                        <Input
                                                            label="Specify Crop Name"
                                                            name="customCrop"
                                                            value={customCrop}
                                                            onChange={(e) => setCustomCrop(e.target.value)}
                                                            placeholder="Enter crop name"
                                                            required
                                                        />
                                                    </div>
                                                )}

                                                <Input label="Variety" name="variety" value={formData.variety} onChange={handleChange} placeholder="e.g. HD-2967" required />
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">Sowing Status</label>
                                                    <select name="sowing_status" value={formData.sowing_status} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-vivid/20 focus:border-primary-vivid outline-none" required>
                                                        <option value="">Select</option>
                                                        <option value="Not Sown">Not Sown</option>
                                                        <option value="Sowing">Sowing</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Germination">Germination</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Inspection Details */}
                                        <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-gray-200/60 shadow-sm">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Report
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Input label="Inspector" name="inspector_name" value={formData.inspector_name} onChange={handleChange} required />
                                                <Input label="Date" type="date" name="inspection_date" value={formData.inspection_date} onChange={handleChange} required />

                                                <div className="sm:col-span-2 flex items-end gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">Result</label>
                                                        <div className="flex gap-2">
                                                            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex-1 justify-center">
                                                                <input type="radio" name="is_passed" checked={formData.is_passed === true} onChange={() => setFormData(prev => ({ ...prev, is_passed: true }))} className="w-3.5 h-3.5 text-green-600 focus:ring-green-500" />
                                                                <span className="text-xs font-medium text-gray-900">Pass</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex-1 justify-center">
                                                                <input type="radio" name="is_passed" checked={formData.is_passed === false} onChange={() => setFormData(prev => ({ ...prev, is_passed: false }))} className="w-3.5 h-3.5 text-red-600 focus:ring-red-500" />
                                                                <span className="text-xs font-medium text-gray-900">Fail</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">Photo Evidence</label>
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handlePhotoUpload}
                                                                className="hidden"
                                                                id="photo-upload"
                                                            />
                                                            <label
                                                                htmlFor="photo-upload"
                                                                className={`w-full py-2.5 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-colors h-[38px] ${uploadSuccess
                                                                    ? 'border-green-300 bg-green-50 text-green-700'
                                                                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {isUploading ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : uploadSuccess ? (
                                                                    <><Check className="w-4 h-4" /> <span className="text-xs font-medium">Uploaded</span></>
                                                                ) : (
                                                                    <><Upload className="w-4 h-4" /> <span className="text-xs font-medium">Upload</span></>
                                                                )}
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Remarks */}
                                        <div className="sm:col-span-4">
                                            <textarea
                                                name="remarks"
                                                value={formData.remarks}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-vivid/20 focus:border-primary-vivid min-h-[60px] resize-none pb-0"
                                                placeholder="Add any additional remarks or notes here..."
                                                rows={1}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-gray-100 bg-white flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200 sm:border-transparent"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold text-black bg-primary-vivid hover:bg-primary-hover shadow-lg shadow-primary-vivid/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isEditMode ? 'Save Changes' : 'Save Inspection'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div >
                </>
            )}
        </AnimatePresence >
    );
};
