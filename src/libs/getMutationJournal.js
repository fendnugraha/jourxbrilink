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
    } = useSWR(startDate && endDate ? `/api/mutation-journal/${startDate}/${endDate}` : null, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 60000,
        fallbackData: [],
    });
    if (error) return { error: error.response?.data?.errors };
    return {
        journals,
        loading: !journals && !error,
        error: error?.response?.data?.errors || null,
        isValidating,
    };
};

export default useGetMutationJournal;
