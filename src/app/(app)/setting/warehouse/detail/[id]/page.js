"use client";
import MainPage from "@/app/(app)/main";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Notification from "@/components/Notification";
import Pagination from "@/components/PaginateList";
import axios from "@/libs/axios";
import { KeyRoundIcon, LockIcon } from "lucide-react";
import { use, useCallback, useEffect, useState } from "react";

const WarehouseDetail = ({ params }) => {
    const [warehouse, setWarehouse] = useState({});
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [notification, setNotification] = useState({ type: "", message: "" });

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        chart_of_account_id: "",
    });

    const { id } = use(params);

    const fetchWarehouse = useCallback(
        async (url = `/api/warehouse/${id}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url);
                setWarehouse(response.data.data);
                setFormData({
                    name: response.data.data.name,
                    address: response.data.data.address,
                    chart_of_account_id: response.data.data.chart_of_account_id,
                });
            } catch (error) {
                notification(error.response?.data?.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        },
        [id, notification]
    );

    useEffect(() => {
        fetchWarehouse();
    }, [fetchWarehouse]);

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

    const availableAccounts = accounts.filter((item) => item.warehouse_id === null || Number(item.warehouse_id) === Number(id));
    const accountWithSearch = accounts.filter((item) => item?.acc_name?.toLowerCase().includes(search.toLowerCase()));

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Number of items per page

    // Calculate the total number of pages
    const totalItems = accountWithSearch.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get the items for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = accountWithSearch.slice(startIndex, startIndex + itemsPerPage);

    // Handle page change from the Pagination component
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleAddCashBank = async (coa_id) => {
        try {
            await axios.put(`/api/warehouse/${id}/add-cash-bank/${coa_id}`, formData);
            setNotification({ type: "success", message: "Cash & Bank added successfully." });
            fetchAccountByIds({ account_ids: [1, 2] });
        } catch (error) {
            setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        }
    };
    return (
        <MainPage headerTitle={`${warehouse.name}`}>
            <div className="p-8">
                {notification.message && (
                    <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                )}
                <div className="shadow-sm rounded-3xl p-6 bg-white mb-2">
                    <h1 className="text-xl font-bold mb-4">Cash & Bank List</h1>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="w-full border border-gray-300 rounded-md p-2 mb-2"
                            />
                            <table className="table w-full text-xs">
                                <tbody>
                                    {currentItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                {item.acc_name}
                                                <span className="text-xs text-blue-300 block">{item.warehouse?.name}</span>
                                            </td>
                                            <td className="text-center">
                                                <span className="text-xs flex justify-center items-center">
                                                    {warehouse.chart_of_account_id == item.id ? (
                                                        <button>
                                                            <KeyRoundIcon className="size-6 text-red-600" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddCashBank(item.id)}
                                                            disabled={item.warehouse_id !== warehouse.id && item.warehouse_id !== null ? true : false}
                                                            className="disabled:cursor-not-allowed"
                                                        >
                                                            {item.warehouse_id !== warehouse.id && item.warehouse_id !== null ? (
                                                                <LockIcon className="size-5 text-slate-600" />
                                                            ) : (
                                                                <div
                                                                    className={`p-1 w-12 rounded-full flex ${
                                                                        item.warehouse_id ? "justify-end bg-blue-500" : "justify-start bg-slate-400"
                                                                    }`}
                                                                >
                                                                    <div className="bg-white w-4 h-4 rounded-full"></div>
                                                                </div>
                                                            )}
                                                        </button>
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <Pagination
                                    className={""}
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainPage>
    );
};

export default WarehouseDetail;
