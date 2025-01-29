"use client";
import { useState, useEffect } from "react";
import Header from "../../Header";
import Notification from "@/components/notification";
import axios from "@/libs/axios";
import formatDateTime from "@/libs/formatDateTime";
import Modal from "@/components/Modal";
import CreateUser from "./CreateUser";
import Paginator from "@/components/Paginator";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BuildingIcon, MailIcon, PencilIcon, PlusCircleIcon, SmileIcon, StoreIcon, Trash2Icon } from "lucide-react";

const User = () => {
    const router = useRouter();
    const [notification, setNotification] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchUsers = async (url = "/api/get-all-users") => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            setUsers(response.data.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        }
    };

    useEffect(() => {
        fetchUsers();
        setLoading(false);
    }, []);

    const handleChangePage = (url) => {
        fetchUsers(url);
    };

    const [isModalCreateUserOpen, setIsModalCreateUserOpen] = useState(false);
    const closeModal = () => {
        setIsModalCreateUserOpen(false);
    };

    const handleDeleteUser = async (id) => {
        try {
            const response = await axios.delete(`/api/users/${id}`);
            setNotification(response.data.message);
            fetchUsers();
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        }
    };

    return (
        <>
            <Header title="User Management" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="mb-2">
                                <button onClick={() => setIsModalCreateUserOpen(true)} className="bg-indigo-500 text-white py-2 px-6 rounded-lg">
                                    Tambah User <PlusCircleIcon className="size-4 inline" />
                                </button>
                                <Modal isOpen={isModalCreateUserOpen} onClose={closeModal} modalTitle="Create User">
                                    <CreateUser
                                        isModalOpen={setIsModalCreateUserOpen}
                                        notification={(message) => setNotification(message)}
                                        fetchUsers={fetchUsers}
                                    />
                                </Modal>
                            </div>
                            <table className="table w-full text-xs">
                                <thead>
                                    <tr>
                                        <th className="border-b-2 p-2">Name</th>
                                        <th className="border-b-2 p-2">Created at</th>
                                        <th className="border-b-2 p-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.map((user) => (
                                        <tr key={user.id}>
                                            <td className="border-b p-2">
                                                <span className="font-bold">{user.name}</span>
                                                <span className="text-xs block">
                                                    <MailIcon className="h-4 w-4 inline" /> {user.email} <SmileIcon className="h-4 w-4 inline" />{" "}
                                                    {user.role?.role} <StoreIcon className="h-4 w-4 inline" /> {user.role?.warehouse?.name}
                                                </span>
                                            </td>
                                            <td className="border-b p-2">{formatDateTime(user.created_at)}</td>
                                            <td className="border-b p-2">
                                                <span className="flex gap-2 justify-center items-center">
                                                    <Link href={`/setting/user/edit/${user.id}`} className="bg-green-500 text-white py-2 px-6 rounded-lg">
                                                        <PencilIcon className="size-4" />
                                                    </Link>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 text-white py-2 px-6 rounded-lg">
                                                        <Trash2Icon className="size-4" />
                                                    </button>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users?.links && <Paginator links={users} handleChangePage={handleChangePage} />}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default User;
