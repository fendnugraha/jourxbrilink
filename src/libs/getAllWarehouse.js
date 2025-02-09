import useSWR from "swr";
import axios from "@/libs/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const useGetWarehouses = () => {
    const { data: warehouses, error: warehousesError } = useSWR("/api/get-all-warehouses", fetcher, {
        revalidateOnFocus: true, // Refetch data when the window is focused
        dedupingInterval: 60000, // Avoid duplicate requests for the same data within 1 minute
        fallbackData: [], // Optional: you can specify default data here while it's loading
    });

    return { warehouses, warehousesError };
};

export default useGetWarehouses;
