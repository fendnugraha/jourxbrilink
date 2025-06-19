import { useState } from "react";
import axios from "@/libs/axios";
import Button from "@/components/Button";
import Label from "@/components/Label";

const CreateContact = ({ isModalOpen, notification, fetchContacts }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        phone_number: "",
        address: "",
        type: "",
    });

    const handleCreateContact = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/contacts", formData);
            notification("success", response.data.message);
            isModalOpen(false);
            fetchContacts();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form>
            <div className="mb-4">
                <Label>Name</Label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`form-control ${errors.name ? "border-red-500" : ""}`}
                    autoComplete="off"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div className="mb-4">
                <Label>Phone Number</Label>
                <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className={`form-control ${errors.phone_number ? "border-red-500" : ""}`}
                    autoComplete="off"
                />
                {errors.phone_number && <p className="text-red-500 text-xs">{errors.phone_number}</p>}
            </div>

            <div className="mb-4">
                <Label>Address</Label>
                <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`form-control ${errors.address ? "border-red-500" : ""}`}
                    autoComplete="off"
                />
                {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
            </div>

            <div className="mb-4">
                <Label>Description</Label>
                <textarea
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`form-control ${errors.description ? "border-red-500" : ""}`}
                    autoComplete="off"
                />
                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
            </div>

            <div className="mb-4 w-1/2">
                <Label>Type</Label>
                <select
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    value={formData.type}
                    className={`form-select ${errors.type ? "border-red-500" : ""}`}
                >
                    <option value="">Select type</option>
                    <option value="Customer">Customer (Pelanggan)</option>
                    <option value="Supplier">Supplier (Vendor)</option>
                    <option value="Employee">Employee (Karyawan)</option>
                </select>
                {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
            </div>

            <div className="flex justify-end">
                <Button buttonType="primary" onClick={handleCreateContact} disabled={loading} className={`${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                    {loading ? "Loading..." : "Create Contact"}
                </Button>
            </div>
        </form>
    );
};

export default CreateContact;
