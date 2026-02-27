"use client";
import axios from "@/libs/axios";
import { DateTimeNow, formatDate, todayDate } from "@/libs/format";
import useGetWarehouses from "@/libs/getAllWarehouse";
import { useEffect, useState } from "react";

const CreateAttendance = ({ isModalOpen, notification, fetchWarehouses }) => {
    const [formData, setFormData] = useState({
        user_id: "",
        contact_id: "",
        date: todayDate(),
        time_in: "",
        warehouse_id: "",
        approval_status: "",
    });

    const { warehouses, warehousesError } = useGetWarehouses();
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [users, setUsers] = useState([]);
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

    const fetchUsers = async (url = "/api/get-all-users") => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            setUsers(response.data.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-attendance-manually", formData);
            notification({ type: "success", message: response.data.message });
            fetchWarehouses();
        } catch (error) {
            console.log(error);
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        } finally {
            setLoading(false);
            setFormData({
                user_id: "",
                contact_id: "",
                date: todayDate(),
                time_in: "",
                warehouse_id: "",
            });
            isModalOpen(false);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-2">
                <div>
                    <label>User ID</label>
                    <select className="form-select" value={formData.user_id} onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}>
                        <option value="">-</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.email}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Karyawan</label>
                    <select className="form-select" value={formData.contact_id} onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}>
                        <option value="">-</option>
                        {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                                {employee.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Date</label>
                    <input
                        type="date"
                        className="form-control"
                        value={formData.date || ""}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
                <div>
                    <label>Time In</label>
                    <input
                        type="time"
                        value={formData.time_in}
                        onChange={(e) => setFormData({ ...formData, time_in: e.target.value })}
                        className="form-control"
                    />
                </div>
                <div>
                    <label>Cabang</label>
                    <select className="form-select" value={formData.warehouse_id} onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}>
                        <option value="">-</option>
                        {warehouses.data?.map((warehouse) => (
                            <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Status</label>
                    <select
                        className="form-select"
                        value={formData.approval_status}
                        onChange={(e) => setFormData({ ...formData, approval_status: e.target.value })}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Good">Good</option>
                        <option value="Late">Terlambat</option>
                        <option value="Overtime">Lembur</option>
                    </select>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Loading..." : "Submit"}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default CreateAttendance;
