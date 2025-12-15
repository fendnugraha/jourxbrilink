"use client";
import Button from "@/components/Button";
import axios from "@/libs/axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import ShareAttendanceButton from "./ShareAttendance";

const AttendanceDetail = ({ selectedWarehouse, fetchWarehouses, notification, isModalOpen, userRole }) => {
    const [formData, setFormData] = useState({
        contact_id: "",
        time_in: "",
        approval_status: "",
    });

    useEffect(() => {
        setFormData({
            contact_id: selectedWarehouse?.attendance?.[0]?.contact_id,
            time_in: selectedWarehouse?.attendance?.[0]?.time_in,
            approval_status: selectedWarehouse?.attendance?.[0]?.approval_status,
        });
    }, [selectedWarehouse]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const fetchContacts = async (url = "/api/get-all-contacts/Employee") => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            setEmployees(response.data.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/attendance/${selectedWarehouse?.attendance?.[0]?.id}`, formData);
            notification({ type: "success", message: response.data.message });
            isModalOpen(false);
            fetchContacts();
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
            console.log(error);
        } finally {
            setLoading(false);
            fetchWarehouses();
        }
    };
    return (
        <div className="flex gap-2">
            {selectedWarehouse?.attendance?.[0]?.photo ? (
                <div className="relative w-[250px] h-auto">
                    <img src={selectedWarehouse.attendance[0].photo_url} alt={selectedWarehouse.name} className="object-contain w-full h-full" />
                </div>
            ) : (
                <div className="text-gray-400 border border-gray-300 rounded-2xl dark:border-gray-500 p-2 h-[250px] w-[150px]">Tidak ada foto</div>
            )}

            <div className="flex-1">
                <label className="text-sm font-bold">{selectedWarehouse?.name}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {selectedWarehouse?.address}
                    <Link
                        target="_blank"
                        className="hover:underline block"
                        href={`https://www.google.com/maps?q=${selectedWarehouse?.attendance?.[0]?.latitude},${selectedWarehouse?.attendance?.[0]?.longitude}`}
                    >
                        Buka di Maps
                    </Link>
                </p>

                <label className="text-sm font-bold">Kasir</label>
                <select
                    className="form-select"
                    value={formData.contact_id}
                    onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                    disabled={!["Administrator", "Super Admin"].includes(userRole)}
                >
                    <option value="">-</option>
                    {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                            {employee.name}
                        </option>
                    ))}
                </select>
                <label className="text-sm font-bold">Check In</label>
                <p className={`text-sm text-gray-500 dark:text-gray-400`}>
                    {selectedWarehouse?.attendance?.[0]?.created_at && (
                        <input
                            type="time"
                            className="form-control !w-fit"
                            value={formData.time_in}
                            onChange={(e) => setFormData({ ...formData, time_in: e.target.value })}
                            disabled={!["Administrator", "Super Admin"].includes(userRole)}
                        />
                    )}
                </p>
                <label className="text-sm font-bold">Status</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedWarehouse?.attendance?.[0]?.created_at ? (
                        <select
                            className="form-select"
                            value={formData.approval_status}
                            onChange={(e) => setFormData({ ...formData, approval_status: e.target.value })}
                            disabled={!["Administrator", "Super Admin"].includes(userRole)}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Good">Good</option>
                            <option value="Late">Terlambat</option>
                            <option value="Overtime">Lembur</option>
                        </select>
                    ) : (
                        "Belum absen"
                    )}
                </p>
                {["Administrator", "Super Admin"].includes(userRole) && (
                    <Button buttonType="success" className={"mt-4 w-full"} onClick={handleUpdate} disabled={loading || !formData.approval_status}>
                        {loading ? "Loading..." : "Update"}
                    </Button>
                )}
                <div className="flex gap-1">
                    <ShareAttendanceButton attendance={selectedWarehouse?.attendance?.[0]} style="px-4 py-2 w-full" buttonWithText={false} />
                </div>
            </div>
        </div>
    );
};
export default AttendanceDetail;
