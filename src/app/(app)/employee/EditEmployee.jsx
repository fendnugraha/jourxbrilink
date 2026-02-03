import Label from "@/components/Label";
import axios from "@/libs/axios";
import { useCallback, useEffect, useState } from "react";

const EditEmployee = ({ isModalOpen, fetchContacts, notification, employee }) => {
    const [formData, setFormData] = useState({
        contact_id: employee?.contact_id,
        salary: employee?.salary,
        commission: employee?.commission,
        hire_date: employee?.hire_date,
        status: employee?.status,
    });
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const getContacts = useCallback(async (url = "/api/get-all-contacts/Employee") => {
        try {
            const response = await axios.get(url);
            setContacts(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        getContacts();
    }, [getContacts]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/employees/${employee.id}`, formData);
            console.log(response);
            notification({ type: "success", message: response.data.message });
            isModalOpen(false);
            fetchContacts();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="">
                <Label htmlFor="name">Contact</Label>
                <select
                    className="form-select"
                    id="name"
                    value={formData.contact_id}
                    onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                >
                    <option value="">Select Contact</option>
                    {contacts.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                            {contact.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="">
                <Label htmlFor="salary">Gaji Pokok</Label>
                <input
                    className="form-control"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    type="number"
                    id="salary"
                />
            </div>
            <div className="">
                <Label htmlFor="commission">Tunjangan Tetap</Label>
                <input
                    className="form-control"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                    type="number"
                    id="commission"
                />
            </div>
            <div className="">
                <Label htmlFor="hire_date">Tanggal Bergabung</Label>
                <input
                    className="form-control"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    type="date"
                    id="hire_date"
                />
            </div>
            <div className="">
                <Label htmlFor="status">Status</Label>
                <select className="form-select" id="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="resigned">Resigned</option>
                    <option value="terminated">Kicked Out</option>
                </select>
            </div>
            <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Loading..." : "Update"}
                </button>
            </div>
        </form>
    );
};

export default EditEmployee;
