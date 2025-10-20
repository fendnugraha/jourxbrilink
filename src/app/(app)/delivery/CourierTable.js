"use client";

import Paginator from "@/components/Paginator";
import axios from "@/libs/axios";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const CourierTable = ({ filteredJournals, itemsPerPage, currentPage, setCurrentPage }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async (url = "/api/users") => {
        setLoading(true);
        try {
            const response = await axios.get(url, {
                params: {
                    role: "Courier",
                },
            });
            setUsers(response.data.data);
        } catch (error) {
            // setNotification("error", error.response?.data?.message || "Something went wrong.");
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleChangePage = (url) => {
        fetchUsers(url);
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th className="">Name</th>
                            <th className="">Update location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td className="text-center" colSpan={2}>
                                    Loading ...
                                </td>
                            </tr>
                        ) : (
                            users?.data?.map((user) => (
                                <tr key={user.id}>
                                    <td className="">
                                        <span className="font-bold">{user.name}</span>
                                        <span className="block">
                                            <Mail className="h-4 w-4 inline" /> {user.email}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        {user.role?.latitude && user.role?.longitude && (
                                            <Link target="_blank" href={`https://www.google.com/maps?q=${user.role?.latitude},${user.role?.longitude}`}>
                                                Buka di Maps
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="px-4">{users?.last_page > 1 && <Paginator links={users} handleChangePage={handleChangePage} />}</div>
            </div>
        </>
    );
};

export default CourierTable;
