"use client";
import Button from "@/components/Button";
import Label from "@/components/Label";
import axios from "@/libs/axios";
import { useState } from "react";

const UpdateAccount = ({ isModalOpen, findSelectedAccountId, notification, fetchAccount }) => {
    const [formData, setFormData] = useState({
        id: findSelectedAccountId?.id,
        acc_name: findSelectedAccountId?.acc_name,
        account_group: findSelectedAccountId?.account_group || "",
        st_balance: findSelectedAccountId?.st_balance,
    });

    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/accounts/${findSelectedAccountId.id}`, formData);
            notification("success", response.data.message);
            isModalOpen(false);
            fetchAccount();
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
        }
    };

    return (
        <form onSubmit={handleUpdateAccount}>
            <div className="mb-4">
                <Label htmlFor="name">Account Name</Label>
                <input
                    type="text"
                    value={formData.acc_name}
                    onChange={(e) => setFormData({ ...formData, acc_name: e.target.value })}
                    className="form-control"
                    required
                />
            </div>
            <div className="mb-4">
                <Label htmlFor="name">Account Group</Label>
                <input
                    type="text"
                    value={formData.account_group}
                    onChange={(e) => setFormData({ ...formData, account_group: e.target.value })}
                    className="form-control"
                    required
                />
            </div>
            <div className="mb-4">
                <Label htmlFor="st_balance">Starting Balance</Label>
                <input
                    type="number"
                    value={formData.st_balance}
                    onChange={(e) => setFormData({ ...formData, st_balance: e.target.value })}
                    className="form-control"
                    required
                />
            </div>
            <Button buttonType="success">Update Account</Button>
        </form>
    );
};

export default UpdateAccount;
