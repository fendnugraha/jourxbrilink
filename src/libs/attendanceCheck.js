"use client";
import useSWR from "swr";
import axios from "./axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export const useAttendanceCheck = ({ date, userId }) => {
    const { data, error } = useSWR(`/api/attendance-check/${date}/${userId}`, fetcher);

    return { data, error };
};

export default useAttendanceCheck;
