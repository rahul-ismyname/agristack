import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Building, Sprout } from 'lucide-react';
import { Input } from './ui/Input';

interface FarmerRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    farmer?: any; // For edit mode
}

const initialFormState = {
    full_name: '',
    gender: 'Male',
    dob: '',
    mobile: '',
    aadhaar: '',
    district: '',
    block: '',
    panchayat: '',
    village: '',
    ifsc: '',
    account_no: '',
    khata: '',
    khesra: '',
    area: '',
    registration_id: ''
};

export const FarmerRegistrationModal: React.FC<FarmerRegistrationModalProps> = ({ isOpen, onClose, onSave, farmer }) => {
    const [formData, setFormData] = useState(initialFormState);
    const isEditMode = !!farmer;

    // Pre-fill form when editing
    useEffect(() => {
        if (isOpen && farmer) {
            setFormData({
                full_name: farmer.full_name || '',
                gender: farmer.gender || 'Male',
                dob: farmer.dob || '',
                mobile: farmer.mobile || '',
                aadhaar: farmer.aadhaar || '',
                district: farmer.district || '',
                block: farmer.block || '',
                panchayat: farmer.panchayat || '',
                village: farmer.village || '',
                ifsc: farmer.ifsc || '',
                account_no: farmer.account_no || '',
                khata: farmer.khata || '',
                khesra: farmer.khesra || '',
                area: farmer.area || '',
                registration_id: farmer.registration_id || ''
            });
        } else if (isOpen && !farmer) {
            // Generate new ID for new farmer
            const uniqueId = `FRM-${Math.floor(100000 + Math.random() * 900000)}`;
            setFormData({ ...initialFormState, registration_id: uniqueId });
        }
    }, [isOpen, farmer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
        setFormData(initialFormState);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
                    >
                        <div className="bg-white pointer-events-auto w-full h-full sm:h-auto sm:rounded-xl shadow-2xl sm:max-w-4xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {isEditMode ? 'Edit Farmer' : 'New Farmer Registration'}
                                    </h2>
                                    <p className="text-xs text-gray-500 hidden sm:block">
                                        {isEditMode ? 'Update farmer details below.' : 'Add complete farmer details to the registry.'}
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-gray-50/50">
                                <div className="flex-1 overflow-y-auto sm:overflow-visible p-4 sm:p-5 space-y-3">

                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">

                                        {/* Personal Details */}
                                        <div className="sm:col-span-4 bg-white p-3 rounded-lg border border-gray-200/60 shadow-sm">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <User className="w-3 h-3 text-blue-500" /> Personal Information
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div className="sm:col-span-2">
                                                    <Input
                                                        label="Registration ID"
                                                        name="registration_id"
                                                        value={formData.registration_id}
                                                        onChange={() => { }}
                                                        disabled
                                                        className="bg-gray-100/50"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Input label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} required />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">Gender</label>
                                                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-vivid/20 focus:border-primary-vivid outline-none">
                                                            <option>Male</option>
                                                            <option>Female</option>
                                                            <option>Other</option>
                                                        </select>
                                                    </div>

                                                </div>
                                                <Input label="DOB" type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                                                <Input label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} maxLength={10} required />
                                            </div>
                                        </div>

                                        {/* Location Details */}
                                        <div className="sm:col-span-4 bg-white p-3 rounded-lg border border-gray-200/60 shadow-sm">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <MapPin className="w-3 h-3 text-green-500" /> Residential Address & Aadhaar
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                                <Input label="District" name="district" value={formData.district} onChange={handleChange} required />
                                                <Input label="Block" name="block" value={formData.block} onChange={handleChange} required />
                                                <Input label="Panchayat" name="panchayat" value={formData.panchayat} onChange={handleChange} required />
                                                <Input label="Village" name="village" value={formData.village} onChange={handleChange} required />
                                                <Input label="Aadhaar No" name="aadhaar" value={formData.aadhaar} onChange={handleChange} maxLength={12} required />
                                            </div>
                                        </div>

                                        {/* Bank Details */}
                                        <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-gray-200/60 shadow-sm">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Building className="w-3 h-3 text-purple-500" /> Bank Details
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Input label="IFSC Code" name="ifsc" value={formData.ifsc} onChange={handleChange} required />
                                                <Input label="Account No" name="account_no" value={formData.account_no} onChange={handleChange} required />
                                            </div>
                                        </div>

                                        {/* Land Details */}
                                        <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-gray-200/60 shadow-sm">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Sprout className="w-3 h-3 text-amber-500" /> Land Information
                                            </h3>
                                            <div className="grid grid-cols-3 gap-3">
                                                <Input label="Khata" name="khata" value={formData.khata} onChange={handleChange} required />
                                                <Input label="Khesra" name="khesra" value={formData.khesra} onChange={handleChange} required />
                                                <Input label="Area (Acres)" name="area" value={formData.area} onChange={handleChange} required />
                                            </div>
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
                                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold text-black bg-primary-vivid hover:bg-primary-hover shadow-lg shadow-primary-vivid/20 transition-all transform active:scale-95"
                                    >
                                        {isEditMode ? 'Save Changes' : 'Register Farmer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
