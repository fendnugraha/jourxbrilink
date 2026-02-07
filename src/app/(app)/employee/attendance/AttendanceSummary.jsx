import axios from "@/libs/axios";
import { formatNumber } from "@/libs/format";
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
    return (
        <>
            <div>
                <input type="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="form-control" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {employees
                    .filter((employee) => employee.contact?.name.toLowerCase().includes(search.toLowerCase()))
                    .map((employee) => (
                        <div key={employee.id} className="card p-4 relative">
                            <span className="absolute top-2 right-3 bg-yellow-300 text-lime-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                                {formatNumber(employee.attendance_rating?.rating ?? 0)}
                            </span>
                            <h2 className="font-semibold mb-2">{employee.contact?.name}</h2>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>Lebih Awal:</div>
                                <div className="font-medium">{employee.attendance_rating?.good ?? 0}</div>
                                <div>Terlambat:</div>
                                <div className="font-medium">{employee.attendance_rating?.late ?? 0}</div>
                            </div>
                        </div>
                    ))}
            </div>
        </>
    );
};

export default AttendanceSummary;
