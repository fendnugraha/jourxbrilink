"use client";

import Calendar from "@/components/Calendar";
import axios from "@/libs/axios";
import { DateTimeNow, formatNumber } from "@/libs/format";
import { AlarmClockPlus, Clock, IdCardLanyard, Star, User } from "lucide-react";
import { useEffect, useState } from "react";

const AttendanceCalendar = () => {
    const { today } = DateTimeNow();
    const [attendanceData, setAttendanceData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(today);
    const [employeeId, setEmployeeId] = useState(null);

    const fetchAttendanceData = async () => {
        try {
            const response = await axios.get("/api/get-attendance-by-contact", {
                params: {
                    contact_id: employeeId,
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
    }, [selectedDate, employeeId]);

    console.log(attendanceData);

    const calendarData = {};

    attendanceData.forEach((item) => {
        calendarData[item.date] = {
            type: "attendance",
            status:
                item.approval_status === "Late" ? "Telat" : item.approval_status === "Good" ? "Good" : item.approval_status === "Overtime" ? "Lembur" : "Hadir",
            time_in: item.time_in,
        };
    });
    const attGood = attendanceData.filter((item) => item.approval_status === "Good").length;
    const attLate = attendanceData.filter((item) => item.approval_status === "Late").length;
    const overtime = attendanceData.filter((item) => item.approval_status === "Overtime").length;

    return (
        <div>
            <div className="px-4 flex justify-between flex-col sm:flex-row gap-2">
                <div className="flex gap-2 flex-col sm:flex-row">
                    <span className="flex gap-1 items-center w-fit justify-between bg-slate-500 text-white rounded-full px-3 py-0.5">
                        <IdCardLanyard size={15} strokeWidth={2} /> {attendanceData?.[0]?.contact?.name ?? "N/A"}
                    </span>
                    <div className="flex gap-2">
                        <span className="flex gap-1 items-center w-full sm:w-16 justify-between bg-yellow-300 text-yellow-800 rounded-full px-2 py-0.5">
                            <Star size={15} strokeWidth={2} fill="orange" /> {attGood}
                        </span>
                        <span className="flex gap-1 items-center w-full sm:w-16 justify-between bg-violet-300 text-violet-800 rounded-full px-2 py-0.5">
                            <AlarmClockPlus size={15} strokeWidth={2} fill="orange" /> {overtime}
                        </span>
                        <span className="flex gap-1 items-center w-full sm:w-16 justify-between bg-red-500 text-white rounded-full px-2 py-0.5">
                            <Clock size={15} /> {attLate}
                        </span>
                    </div>
                </div>
                {(attendanceData?.[0]?.contact?.employee_receivables_sum || attendanceData?.[0]?.contact?.installment_receivables_sum) && (
                    <div className="flex gap-2 items-center justify-between border text-sm border-slate-300 rounded-full px-2 py-1">
                        {attendanceData?.[0]?.contact?.employee_receivables_sum && (
                            <h1>
                                Kasbon: Rp <span className="font-bold">{formatNumber(attendanceData?.[0]?.contact?.employee_receivables_sum?.total) ?? 0}</span>
                            </h1>
                        )}
                        {attendanceData?.[0]?.contact?.installment_receivables_sum && (
                            <h1>
                                Cicilan: Rp{" "}
                                <span className="font-bold">{formatNumber(attendanceData?.[0]?.contact?.installment_receivables_sum?.total) ?? 0}</span>
                            </h1>
                        )}
                    </div>
                )}
            </div>
            <Calendar data={calendarData} withHeader={false} maxWidth="sm:max-w-full" />
        </div>
    );
};

export default AttendanceCalendar;
