import { supabase } from './supabase';

// --- Farmers API ---

interface GetFarmersParams {
    page?: number;
    limit?: number;
}

export const getFarmers = async ({ page = 1, limit = 10 }: GetFarmersParams = {}) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
        .from('farmers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return { data, count };
};

export const createFarmer = async (farmerData: any) => {
    // Sanitize data: invalid dates (empty strings) should be null
    const sanitizedData = { ...farmerData };
    if (sanitizedData.dob === '') {
        sanitizedData.dob = null;
    }

    const { data, error } = await supabase
        .from('farmers')
        .insert([sanitizedData])
        .select();

    if (error) throw error;
    return data[0];
};

// --- Seed Inspections API ---

export const getSeedInspections = async () => {
    const { data, error } = await supabase
        .from('seed_inspections')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const createSeedInspection = async (inspectionData: any) => {
    // Map frontend camelCase to DB snake_case if necessary, 
    // or just ensure we pass snake_case from the form.
    // For simplicity, we'll assume the form passes data that matches DB columns 
    // OR we do the mapping here. Ideally, keep it consistent.

    const { data, error } = await supabase
        .from('seed_inspections')
        .insert([inspectionData])
        .select();

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
};

export const updateSeedInspectionStatus = async (id: string, is_passed: boolean) => {
    const { data, error } = await supabase
        .from('seed_inspections')
        .update({ is_passed })
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
};

// --- Gyan Vahan API ---

export const getGyanVahanEntries = async () => {
    const { data, error } = await supabase
        .from('gyan_vahan')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const createGyanVahanEntry = async (entryData: any) => {
    const { data, error } = await supabase
        .from('gyan_vahan')
        .insert([entryData])
        .select();

    if (error) throw error;
    return data[0];
};

// --- Update API ---

export const updateFarmer = async (id: string, farmerData: any) => {
    const sanitizedData = { ...farmerData };
    if (sanitizedData.dob === '') {
        sanitizedData.dob = null;
    }
    // Remove id from update payload
    delete sanitizedData.id;
    delete sanitizedData.created_at;

    const { data, error } = await supabase
        .from('farmers')
        .update(sanitizedData)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
};

export const updateInspection = async (id: string, inspectionData: any) => {
    const sanitizedData = { ...inspectionData };
    delete sanitizedData.id;
    delete sanitizedData.created_at;

    const { data, error } = await supabase
        .from('seed_inspections')
        .update(sanitizedData)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
};

// --- Global Search API ---

export interface SearchResult {
    id: string;
    title: string;
    subtitle: string;
    type: 'farmer' | 'inspection' | 'gyan_vahan';
}

export const globalSearch = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.trim().length < 2) return [];

    const searchTerm = `%${query.trim()}%`;
    const results: SearchResult[] = [];

    // Search Farmers
    const { data: farmers } = await supabase
        .from('farmers')
        .select('id, full_name, mobile, village, registration_id')
        .or(`full_name.ilike.${searchTerm},mobile.ilike.${searchTerm},registration_id.ilike.${searchTerm}`)
        .limit(5);

    farmers?.forEach(f => {
        results.push({
            id: f.id,
            title: f.full_name || 'Unknown',
            subtitle: `${f.registration_id || 'No ID'} • ${f.village || 'Unknown Village'}`,
            type: 'farmer'
        });
    });

    // Search Inspections
    const { data: inspections } = await supabase
        .from('seed_inspections')
        .select('id, lot_no, farmer_name, crop, variety')
        .or(`lot_no.ilike.${searchTerm},farmer_name.ilike.${searchTerm},crop.ilike.${searchTerm}`)
        .limit(5);

    inspections?.forEach(i => {
        results.push({
            id: i.id,
            title: `${i.lot_no} - ${i.farmer_name}`,
            subtitle: `${i.crop} • ${i.variety}`,
            type: 'inspection'
        });
    });

    // Search Gyan Vahan
    const { data: gyanVahan } = await supabase
        .from('gyan_vahan')
        .select('id, inspector_name, village, district')
        .or(`inspector_name.ilike.${searchTerm},village.ilike.${searchTerm},district.ilike.${searchTerm}`)
        .limit(5);

    gyanVahan?.forEach(g => {
        results.push({
            id: g.id,
            title: g.inspector_name || 'Unknown Inspector',
            subtitle: `${g.village || 'Unknown'}, ${g.district || 'Unknown'}`,
            type: 'gyan_vahan'
        });
    });

    return results.slice(0, 10); // Return max 10 results
};


export const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
};

// --- Dashboard API ---

export const getDashboardStats = async () => {
    const { count: farmerCount } = await supabase
        .from('farmers')
        .select('*', { count: 'exact', head: true });

    const { count: inspectionCount } = await supabase
        .from('seed_inspections')
        .select('*', { count: 'exact', head: true });

    // For specific stats like 'Passed', 'Failed'
    const { count: passedCount } = await supabase
        .from('seed_inspections')
        .select('*', { count: 'exact', head: true })
        .eq('is_passed', true);

    const { count: failedCount } = await supabase
        .from('seed_inspections')
        .select('*', { count: 'exact', head: true })
        .eq('is_passed', false);

    const { count: vehicleCount } = await supabase
        .from('gyan_vahan')
        .select('*', { count: 'exact', head: true });

    // Calculate Villages Covered (Distinct villages in farmers table)
    // Note: Supabase JS client doesn't support distinct count directly easily without RPC or fetching all.
    // We'll fetch just village names and count unique sets in JS for now (assuming dataset isn't huge yet).
    const { data: villages } = await supabase
        .from('farmers')
        .select('village');

    const uniqueVillages = new Set(villages?.map(v => v.village?.toLowerCase().trim()).filter(Boolean));

    // Calculate Farmer Trend (This Month vs Last Month)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    const { count: currentMonthFarmers } = await supabase
        .from('farmers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth);

    const { count: lastMonthFarmers } = await supabase
        .from('farmers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfLastMonth)
        .lt('created_at', firstDayOfMonth);

    let trendPercentage = 0;
    if (lastMonthFarmers && lastMonthFarmers > 0) {
        trendPercentage = Math.round(((currentMonthFarmers || 0) / lastMonthFarmers) * 100);
    } else if (currentMonthFarmers && currentMonthFarmers > 0) {
        trendPercentage = 100; // 100% growth if starting from 0
    }

    // Gender Breakdown
    const { count: maleFarmers } = await supabase
        .from('farmers')
        .select('*', { count: 'exact', head: true })
        .ilike('gender', 'male');

    const { count: femaleFarmers } = await supabase
        .from('farmers')
        .select('*', { count: 'exact', head: true })
        .ilike('gender', 'female');

    return {
        farmerCount: farmerCount || 0,
        inspectionCount: inspectionCount || 0,
        passedCount: passedCount || 0,
        failedCount: failedCount || 0,
        vehicleCount: vehicleCount || 0,
        villagesCovered: uniqueVillages.size,
        farmerTrend: trendPercentage,
        maleFarmers: maleFarmers || 0,
        femaleFarmers: femaleFarmers || 0
    };
};

export const deleteRecord = async (table: string, id: string) => {
    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

export const getRecentActivity = async () => {
    // Fetch last 5 farmers
    const { data: farmers } = await supabase
        .from('farmers')
        .select('id, full_name, created_at, district')
        .order('created_at', { ascending: false })
        .limit(5);

    // Fetch last 5 inspections
    const { data: inspections } = await supabase
        .from('seed_inspections')
        .select('id, farmer_name, created_at, is_passed, crop')
        .order('created_at', { ascending: false })
        .limit(5);

    const formattedFarmers = (farmers || []).map(f => ({
        id: `FRM-${f.id.substring(0, 4)}`, // Mock ID format or use real if available
        title: `New Farmer: ${f.full_name}`,
        date: f.created_at,
        type: 'Registration',
        status: 'Completed',
        color: 'text-blue-600'
    }));

    const formattedInspections = (inspections || []).map(i => ({
        id: `INS-${i.id.substring(0, 4)}`,
        title: `Inspection: ${i.farmer_name} (${i.crop})`,
        date: i.created_at,
        type: 'Inspection',
        status: i.is_passed === true ? 'Passed' : i.is_passed === false ? 'Failed' : 'Pending',
        color: 'text-green-600'
    }));

    // Merge and Sort
    const combined = [...formattedFarmers, ...formattedInspections]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return combined;
};

// --- Export API ---

export const getAllFarmers = async (fromDate?: string, toDate?: string) => {
    let query = supabase
        .from('farmers')
        .select('*')
        .order('created_at', { ascending: false });

    if (fromDate) {
        query = query.gte('created_at', fromDate);
    }
    if (toDate) {
        query = query.lte('created_at', toDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
};

export const getAllInspections = async (fromDate?: string, toDate?: string) => {
    let query = supabase
        .from('seed_inspections')
        .select('*')
        .order('created_at', { ascending: false });

    if (fromDate) {
        query = query.gte('created_at', fromDate);
    }
    if (toDate) {
        query = query.lte('created_at', toDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
};

export const getAllGyanVahan = async (fromDate?: string, toDate?: string) => {
    let query = supabase
        .from('gyan_vahan')
        .select('*')
        .order('created_at', { ascending: false });

    if (fromDate) {
        query = query.gte('created_at', fromDate);
    }
    if (toDate) {
        query = query.lte('created_at', toDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
};
