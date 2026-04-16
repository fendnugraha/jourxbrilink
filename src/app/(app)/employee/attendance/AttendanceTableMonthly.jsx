import { getDay } from "@/libs/format";
import { AlarmClockPlus, Check, CheckCheck, Clock, Star, X } from "lucide-react";

const AttendanceTableMonthly = ({ selectedZone, warehouseMonthly }) => {
    const days = warehouseMonthly.days;

    const getColor = (status) => {
        if (status === "Approved") return { style: "bg-green-500 dark:bg-green-600 text-white", icon: <CheckCheck size={20} /> };
        if (status === "Good")
            return {
                style: "bg-yellow-300 dark:bg-yellow-500 text-slate-800",
                icon: <Star size={26} strokeWidth={2} className="text-orange-700 rotate-45" fill="orange" />,
            };
        if (status === "Late") return { style: "bg-red-500 dark:bg-red-600 text-white", icon: <Clock size={20} /> };
        if (status === "Overtime") return { style: "bg-violet-500 dark:bg-violet-600 text-white", icon: <AlarmClockPlus size={20} /> };
        if (status === "Alpha") return { style: "bg-red-500 dark:bg-red-600 text-white", icon: <X size={20} /> };
        return { style: "bg-gray-500 dark:bg-gray-700", icon: null };
    };

    const filteredWarehouses = warehouseMonthly.employees?.filter((warehouse) => {
        const zoneMatch = Number(warehouse.warehouse?.warehouse_zone_id) === Number(selectedZone) || Number(warehouse.zone?.id) === Number(selectedZone);
        return !selectedZone || zoneMatch;
    });

    return (
        <>
            {filteredWarehouses?.map((employee) => (
                <div key={employee?.id} className="">
                    <h3 className="text-sm font-bold">{employee?.name}</h3>
                    {/* Kotak tanggal berjajar */}
                    <div className="border border-slate-200 dark:border-slate-600 p-1.5 rounded-xl flex flex-wrap justify-between gap-1 overflow-x-auto">
                        {days.map((day) => {
                            const att = employee?.attendance_by_date[day];
                            const dateNum = day.split("-")[2];

                            return (
                                <div
                                    key={day}
                                    className={`
                                min-w-9 h-9 rounded-lg 
                                flex items-center justify-center 
                                text-white text-xs font-semibold
                                ${getColor(att?.status).style}
                            `}
                                >
                                    {getColor(att?.status).icon ?? dateNum}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </>
    );
};
export default AttendanceTableMonthly;
