import Label from "@/components/Label";
import axios from "@/libs/axios";
import { formatNumber } from "@/libs/format";
import { useEffect, useState } from "react";

const CreateRcvPayment = ({ isModalOpen, fetchFinance, notification, selectedContactId }) => {
    const [formData, setFormData] = useState({
        contact_id: selectedContactId,
        account_id: 1,
        amount: "",
        notes: "",
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [financeData, setFinanceData] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState("");

    const fetchFinanceData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-finance-by-contact-id/${selectedContactId}`, {
                params: {
                    type: "EmployeeReceivable",
                },
            });
            setFinanceData(response.data.data);
        } catch (error) {
            console.error("Error fetching finance data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinanceData();
    }, [selectedContactId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/employee-rcv-payment", formData);
            notification({ type: "success", message: response.data.message });
            fetchFinance();
            fetchFinanceData();
            isModalOpen(false);
        } catch (error) {
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
            setErrors(error.response?.data?.errors);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const contactName = financeData[0]?.contact.name;
    const filterDataByInvoice = financeData.filter((finance) => finance.invoice === selectedInvoice);
    return (
        <div>
            <h1 className="text-lg mb-4">Nama: {contactName}</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Jumlah Bayar (Rp)</Label>
                            <input
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                value={formData.amount}
                                type="number"
                                className="form-control"
                                placeholder="Rp"
                                required
                            />
                        </div>
                        {errors.amount && <span className="text-red-500 text-sm">{errors.amount}</span>}
                    </div>
                </div>
                <div className="mb-4">
                    <div>
                        <Label>Keterangan</Label>
                        <textarea
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            value={formData.notes}
                            rows="2"
                            className="form-control"
                            required
                        />
                    </div>
                    {errors.notes && <span className="text-red-500 text-sm">{errors.notes}</span>}
                </div>
                <button
                    type="submit"
                    className="bg-indigo-500 hover:bg-indigo-600 rounded-xl px-8 py-3 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                    disabled={loading || !formData.amount}
                >
                    {loading ? "Loading..." : "Simpan"}
                </button>
            </form>
        </div>
    );
};

export default CreateRcvPayment;
