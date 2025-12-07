"use client";
import axios from "@/libs/axios";
import { DateTimeNow, formatDate, todayDate } from "@/libs/format";
import { useEffect, useState } from "react";

const CreateAttendance = ({ isModalOpen, notification, fetchWarehouses }) => {
    const [formData, setFormData] = useState({
        contact_id: "",
        date: todayDate(),
        time_in: "",
    });
    console.log(formData.date);

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
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-2">
                <div>
                    <label>Employee ID</label>
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
                    <input type="time" className="form-control" />
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
