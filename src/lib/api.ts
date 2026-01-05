import { supabase } from './supabase';

// --- Farmers API ---

export const getFarmers = async () => {
    const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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
