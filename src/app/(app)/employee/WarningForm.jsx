import Label from "@/components/Label";
import axios from "@/libs/axios";
import { todayDate } from "@/libs/format";
import { useState } from "react";

const WarningForm = ({ isModalOpen, fetchContacts, notification, employee }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [formData, setFormData] = useState({
        date_issued: todayDate(),
        employee_id: employee.id,
        level: "",
        reason: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/add-warning", formData);
            notification({ type: "success", message: response.data.message });
            isModalOpen(false);
            fetchContacts();
            setFormData({ date_issued: todayDate(), employee_id: employee.id, level: "", reason: "" });
        } catch (error) {
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <h1 className="mb-4 font-semibold">{employee.contact?.name}</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <Label className="">Tanggal:</Label>
                    <input
                        type="date"
                        className="form-control"
                        value={formData.date_issued}
                        onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                    />
                </div>
                <div className="mb-4">
                    <Label className="">Peringatan:</Label>
                    <select className="form-select" onChange={(e) => setFormData({ ...formData, level: e.target.value })} value={formData.level}>
                        <option value="">Pilih Peringatan</option>
                        <option value="SP1">Peringatan 1 (SP1)</option>
                        <option value="SP2">Peringatan 2 (SP2)</option>
                        <option value="SP3">Peringatan 3 (SP3)</option>
                    </select>
                </div>
                <div className="mb-4">
                    <Label className="">Alasan:</Label>
                    <textarea
                        className="form-control"
                        rows="3"
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        value={formData.reason}
                    ></textarea>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WarningForm;
