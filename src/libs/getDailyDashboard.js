"use client";
import axios from "@/libs/axios";
import useSWR from "swr";

const fetcher = ([url, params]) => axios.get(url, { params }).then((res) => res.data);

export const useGetDailyDashboard = (warehouse, startDate, endDate) => {
    const shouldFetch = warehouse && startDate && endDate;

    const {
        data: dailyDashboard,
        error,
        isValidating,
    } = useSWR(shouldFetch ? ["/api/daily-dashboard", { warehouse, startDate, endDate }] : null, fetcher, {
        fallbackData: [],
        revalidateOnFocus: true,
        dedupingInterval: 60000,
    });

    if (error) return { error: error.response?.data?.errors || ["Something went wrong."] };
    if (!dailyDashboard && !isValidating) return { loading: true };

    return { dailyDashboard, loading: isValidating, error };
};
