"use client";

import Calendar from "@/components/Calendar";
import axios from "@/libs/axios";
import { DateTimeNow } from "@/libs/format";
import { useEffect, useState } from "react";

const AttenndanceCalendar = () => {
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
            status: item.approval_status === "Late" ? "Telat" : "Hadir",
            time_in: item.time_in,
        };
    });

    return (
        <div>
            <Calendar data={calendarData} withHeader={false} maxWidth="sm:max-w-full" />
        </div>
    );
};

export default AttenndanceCalendar;
