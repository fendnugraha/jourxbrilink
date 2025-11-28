"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Label from "@/components/Label";
import axios from "@/libs/axios";
import { useCallback, useEffect, useState } from "react";

const UpdateWarehouse = ({ isModalOpen, notification, findSelectedWarehouseId, fetchWarehouses }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: findSelectedWarehouseId?.name || "",
        address: findSelectedWarehouseId?.address || "",
        chart_of_account_id: findSelectedWarehouseId?.chart_of_account_id || "",
        contact_id: findSelectedWarehouseId?.contact_id || "",
        zone_name: findSelectedWarehouseId?.zone_name || "",
    });
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

    const fetchAccountByIds = useCallback(
        async ({ account_ids }) => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/get-account-by-account-id`, { params: { account_ids } });
                setAccounts(response.data.data);
            } catch (error) {
                notification(error.response?.data?.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        },
        [notification]
    );

    useEffect(() => {
        fetchAccountByIds({ account_ids: [1, 2] });
    }, [fetchAccountByIds]);

    const availableAccounts = accounts.filter((item) => item.warehouse_id === null || Number(item.warehouse_id) === Number(findSelectedWarehouseId?.id));

    const handleUpdateWarehouse = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/warehouse/${findSelectedWarehouseId.id}`, formData);
            notification("success", response.data.message);
            fetchWarehouses();
            isModalOpen(false);
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleUpdateWarehouse}>
            <div>
                <Label>Name</Label>
                <Input type="text" className={"form-control"} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="mt-4">
                <Label>Akun</Label>
                <select
                    className="form-select"
                    value={formData.chart_of_account_id}
                    onChange={(e) => setFormData({ ...formData, chart_of_account_id: e.target.value })}
                >
                    <option value="">Select Account</option>
                    {availableAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.acc_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mt-4">
                <Label>Kasir</Label>
                <select className="form-select" value={formData.contact_id} onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}>
                    <option value="">Pilih Kasir</option>
                    {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                            {emp.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mt-4">
                <Label>Address</Label>
                <textarea className="form-control" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div>
                <Label>Zona</Label>
                <Input
                    type="text"
                    className={"form-control"}
                    value={formData.zone_name}
                    onChange={(e) => setFormData({ ...formData, zone_name: e.target.value })}
                />
            </div>
            <div className="mt-4">
                <Button buttonType="success">Update</Button>
            </div>
        </form>
    );
};

export default UpdateWarehouse;
