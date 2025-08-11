"use client";
import Button from "@/components/Button";
import Label from "@/components/Label";
import axios from "@/libs/axios";
import { useState } from "react";

const CreateAccount = ({ isModalOpen, notification, fetchAccount, categoryAccount }) => {
    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        st_balance: 0,
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/accounts", formData);
            notification("success", response.data.message);
            if (response.status === 201) {
                // Reset form fields and close modal on success
                setFormData({
                    name: "",
                    category_id: "",
                    st_balance: 0,
                });
                isModalOpen(false);
                // console.log('Form reset:', newAccount, response.status)
                fetchAccount();
            }
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleCreateAccount}>
            <div className="mb-4">
                <Label htmlFor="name">Account Name</Label>
                <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            name: e.target.value,
                        })
                    }
                    className={`form-control ${errors.name ? "border-red-500" : ""}`}
                    placeholder="Nama Akun"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
            <div className="mb-4">
                <Label htmlFor="category">Category</Label>
                <select
                    id="category"
                    value={formData.category_id}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            category_id: e.target.value,
                        })
                    }
                    className={`form-select ${errors.category_id ? "border-red-500" : ""}`}
                >
                    <option value="">Select Category</option>
                    {categoryAccount?.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-xs">{errors.category_id}</p>}
            </div>
            <div className="mb-4">
                <Label htmlFor="st_balance">Starting Balance</Label>
                <input
                    type="number"
                    id="st_balance"
                    value={formData.st_balance}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            st_balance: e.target.value,
                        })
                    }
                    className={`form-control`}
                    placeholder="0"
                />
                {errors.st_balance && <p className="text-red-500 text-xs">{errors.st_balance}</p>}
            </div>
            <div className="flex justify-end gap-2">
                <Button buttonType="neutral" onClick={() => isModalOpen(false)}>
                    Cancel
                </Button>
                <Button buttonType="primary">Save</Button>
            </div>
        </form>
    );
};

export default CreateAccount;
