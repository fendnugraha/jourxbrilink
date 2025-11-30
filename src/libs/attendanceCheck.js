"use client";
import useSWR from "swr";
import axios from "./axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export const useAttendanceCheck = ({ date, userId }) => {
    const { data, error, mutate } = useSWR(`/api/attendance-check/${date}/${userId}`, fetcher);

    return { data, error, mutate };
};

export default useAttendanceCheck;
