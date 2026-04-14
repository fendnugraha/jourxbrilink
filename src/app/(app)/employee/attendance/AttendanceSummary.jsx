import axios from "@/libs/axios";
import { formatNumber, toOrdinal } from "@/libs/format";
import { ArrowBigDown, ArrowBigUp, ChartNoAxesColumn, ChessQueen, Clock, Gift, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const AttendanceSummary = ({ dateString }) => {
    const [search, setSearch] = useState("");
    const date = new Date(dateString);

    const month = date.getMonth() + 1; // 1–12
    const year = date.getFullYear();
    const [employees, setEmployees] = useState([]);

    const fetchEmployees = useCallback(async ({ month = null, year = null } = {}) => {
        try {
            const response = await axios.get("/api/employees", {
                params: { month, year },
            });
            setEmployees(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchEmployees({ month, year });
    }, [month, year, fetchEmployees]);

    console.log(employees);
    const checkUpOrDown = (rating, lastRating) => {
        if (rating > lastRating) {
            return <ArrowBigUp fill="green" strokeWidth={2} className="text-green-600 absolute bottom-4 right-4" size={28} />;
        } else if (rating < lastRating) {
            return <ArrowBigDown fill="red" strokeWidth={2} className="text-red-600 absolute bottom-4 right-4" size={28} />;
        } else {
            return "";
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                {/* <button className="small-button">
                    <ChartNoAxesColumn strokeWidth={2} size={18} />
                </button> */}
                <input type="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="form-control" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {employees
                    .filter((employee) => employee.contact?.name.toLowerCase().includes(search.toLowerCase()))
                    .sort((a, b) => b.attendance_rating?.rating - a.attendance_rating?.rating)
                    .map((employee, index) => (
                        <div
                            key={employee.id}
                            className="group p-4 border drop-shadow-sm border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-4xl"
                            hidden={employee.attendance_rating?.rating === 0}
                        >
                            <div className="flex flex-col items-center gap-2 mt-4">
                                <span className="text-5xl font-black mb-1">
                                    {formatNumber(employee.attendance_rating?.rating ?? 0)}
                                    <sub className="font-normal text-xs">/10</sub>
                                </span>
                                <h2 className="font-semibold text-center mb-4 text-sm">{employee.contact?.name}</h2>
                                {checkUpOrDown(employee.attendance_rating?.rating ?? 0, employee.attendance_rating_last_month?.rating ?? 0)}
                                <div className="absolute top-4 right-4">
                                    <Gift
                                        fill={employee.attendance_rating?.good > 0 && employee.attendance_rating?.late === 0 ? "yellow" : "none"}
                                        strokeWidth={2}
                                        className={`${employee.attendance_rating?.good > 0 && employee.attendance_rating?.late === 0 ? "text-yellow-600" : "text-slate-300 dark:text-slate-600"} text-orange-600 group-hover:rotate-12 transform duration-300`}
                                        size={24}
                                    />
                                </div>
                                <h1 className="absolute top-4 left-4 font-bold">
                                    {index + 1 === 1 ? <ChessQueen size={24} fill="yellow" /> : <>{toOrdinal(index + 1)}</>}
                                </h1>
                                <div className="flex gap-4 w-full">
                                    <div className="flex gap-1 justify-center items-center">
                                        <div>
                                            <Star fill="orange" strokeWidth={2} className="text-yellow-600" size={20} />
                                        </div>
                                        <div className="font-medium">{employee.attendance_rating?.good ?? 0}</div>
                                    </div>
                                    <div className="flex gap-1 justify-center items-center">
                                        <div>
                                            <Clock fill="red" strokeWidth={2} className="text-red-300" size={20} />
                                        </div>
                                        <div className="font-medium">{employee.attendance_rating?.late ?? 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </>
    );
};

export default AttendanceSummary;
