"use client";
import axios from "@/libs/axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);
// pastikan .data.data kalau API kamu pakai struktur { data: [...] }

const useGetMutationJournal = (startDate, endDate) => {
    const {
        data: journals, // <- ini yang benar
        error,
        isValidating,
        mutate,
    } = useSWR(startDate && endDate ? `/api/mutation-journal/${startDate}/${endDate}` : null, fetcher, {
        revalidateOnFocus: true, // Revalidate kalau user kembali ke tab
        refreshInterval: 30000, // Auto-refresh tiap 30 detik
        dedupingInterval: 10000, // Cegah fetch dobel dalam 10 detik
        revalidateIfStale: true, // Pastikan data tidak basi
        revalidateOnReconnect: true, // Revalidate kalau koneksi internet nyambung lagi
        fallbackData: [],
    });
    if (error) return { error: error.response?.data?.errors };
    return {
        journals,
        loading: !journals && !error,
        error: error?.response?.data?.errors || null,
        isValidating,
        mutate,
    };
};

export default useGetMutationJournal;
