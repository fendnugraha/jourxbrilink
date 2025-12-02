"use client";

import Calendar from "@/components/Calendar";
import axios from "@/libs/axios";
import { DateTimeNow } from "@/libs/format";
import { Clock, IdCardLanyard, Star, User } from "lucide-react";
import { useEffect, useState } from "react";

const AttendanceCalendar = () => {
    const { today } = DateTimeNow();
    const [attendanceData, setAttendanceData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(today);
    const [emplyeeId, setEmployeeId] = useState(null);

    const fetchAttendanceData = async () => {
        try {
            const response = await axios.get("/api/get-attendance-by-contact", {
                params: {
                    contact_id: emplyeeId,
                    date: selectedDate,
                },
            });
            setAttendanceData(response.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
    }, [selectedDate, emplyeeId]);

    console.log(attendanceData);
    const calendarData = {};

    attendanceData.forEach((item) => {
        calendarData[item.date] = {
            type: "attendance",
            status: item.approval_status === "Late" ? "Telat" : item.approval_status === "Good" ? "Good" : "Hadir",
            time_in: item.time_in,
        };
    });
    const attGood = attendanceData.filter((item) => item.approval_status === "Good").length;
    const attLate = attendanceData.filter((item) => item.approval_status === "Late").length;
    return (
        <div>
            <div className="px-4 flex gap-2">
                <span className="flex gap-1 items-center w-fit justify-between bg-slate-500 text-white rounded-full px-3 py-0.5">
                    <IdCardLanyard size={15} strokeWidth={2} /> {attendanceData?.[0]?.contact?.name ?? "N/A"}
                </span>
                <span className="flex gap-1 items-center w-16 justify-between bg-yellow-300 text-yellow-800 rounded-full px-2 py-0.5">
                    <Star size={15} strokeWidth={2} fill="orange" /> {attGood}
                </span>
                <span className="flex gap-1 items-center w-16 justify-between bg-red-500 text-white rounded-full px-2 py-0.5">
                    <Clock size={15} /> {attLate}
                </span>
            </div>
            <Calendar data={calendarData} withHeader={false} maxWidth="sm:max-w-full" />
        </div>
    );
};

export default AttendanceCalendar;
