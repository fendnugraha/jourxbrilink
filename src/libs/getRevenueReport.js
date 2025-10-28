import useSWR from "swr";
import axios from "@/libs/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export const useGetRevenueReport = (startDate, endDate) => {
    const shouldFetch = startDate && endDate;

    const {
        data: revenue,
        error,
        isValidating,
        mutate,
    } = useSWR(shouldFetch ? `/api/get-revenue-report/${startDate}/${endDate}` : null, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 60000, // 1 menit
        fallbackData: [], // data awal kosong
    });

    return {
        revenue,
        revenueError: error,
        isLoading: !revenue && !error, // ini ganti isLoading
        isValidating,
        mutateRevenue: mutate,
    };
};

export default useGetRevenueReport;
