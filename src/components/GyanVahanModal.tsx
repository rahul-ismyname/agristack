import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, Loader2 } from 'lucide-react';
import { Input } from './ui/Input';
import { uploadImage } from '../lib/api';

interface GyanVahanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export const GyanVahanModal: React.FC<GyanVahanModalProps> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        inspector_name: '',
        inspector_role: '',
        inspector_mobile: '',
        district: '',
        village: '',
        block: '',
        landmark: '',
        farmers_count: '',
        remarks: '',
        photo_url: ''
    });

    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        onSave({
            ...formData,
            farmers_count: Number(formData.farmers_count) || 0
        });
        onClose();
        setFormData({
            inspector_name: '',
            inspector_role: '',
            inspector_mobile: '',
            district: '',
            village: '',
            block: '',
            landmark: '',
            farmers_count: '',
            remarks: '',
            photo_url: ''
        });
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
                        <div className="bg-white pointer-events-auto w-full h-full sm:h-auto sm:rounded-xl shadow-2xl sm:max-w-2xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">New Gyan Vahan Unit</h2>
                                    <p className="text-xs text-gray-500 hidden sm:block">Register a new mobile knowledge vehicle and its route.</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-gray-50/50">
                                <div className="flex-1 overflow-y-auto sm:overflow-visible p-4 sm:p-6 space-y-4">

                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

                                        {/* Inspector Details - Row 1 */}
                                        <div className="sm:col-span-4 bg-white p-3 rounded-lg border border-gray-200/60 shadow-sm">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Inspector
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div className="sm:col-span-2">
                                                    <Input label="Name" name="inspector_name" value={formData.inspector_name} onChange={handleChange} placeholder="Inspector Name" required />
                                                </div>
                                                <Input label="Role" name="inspector_role" value={formData.inspector_role} onChange={handleChange} placeholder="e.g. Officer" required />
                                                <Input label="Mobile" name="inspector_mobile" type="tel" value={formData.inspector_mobile} onChange={handleChange} placeholder="+91..." required />
                                            </div>
                                        </div>

                                        {/* Location Details - Row 2 */}
                                        <div className="sm:col-span-4 bg-white p-3 rounded-lg border border-gray-200/60 shadow-sm">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Location
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <Input label="District" name="district" value={formData.district} onChange={handleChange} required />
                                                <Input label="Block" name="block" value={formData.block} onChange={handleChange} required />
                                                <Input label="Village" name="village" value={formData.village} onChange={handleChange} required />
                                                <Input label="Landmark" name="landmark" value={formData.landmark} onChange={handleChange} required />
                                            </div>
                                        </div>

                                        {/* Achievement & Photo - Row 3 */}
                                        <div className="sm:col-span-4 bg-white p-3 rounded-lg border border-gray-200/60 shadow-sm">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Report
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div className="sm:col-span-2">
                                                    <Input label="Summary" name="remarks" value={formData.remarks} onChange={handleChange} required />
                                                </div>
                                                <Input label="Farmers Count" name="farmers_count" type="number" value={formData.farmers_count} onChange={handleChange} required />

                                                <div className="flex items-end">
                                                    <div className="w-full relative">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handlePhotoUpload}
                                                            className="hidden"
                                                            id="gv-photo-upload"
                                                        />
                                                        <label
                                                            htmlFor="gv-photo-upload"
                                                            className={`w-full py-2.5 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-colors h-[42px] mt-1 ${uploadSuccess
                                                                    ? 'border-green-300 bg-green-50 text-green-700'
                                                                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {isUploading ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : uploadSuccess ? (
                                                                <><Check className="w-4 h-4" /> <span className="text-xs font-medium">Uploaded</span></>
                                                            ) : (
                                                                <><Upload className="w-4 h-4" /> <span className="text-xs font-medium">Photo</span></>
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Remarks - Full Width */}
                                        <div className="sm:col-span-4">
                                            <textarea
                                                name="remarks"
                                                value={formData.remarks}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-vivid/20 focus:border-primary-vivid min-h-[40px] resize-none text-sm"
                                                placeholder="Remarks (Optional)..."
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
                                        Register Unit
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
