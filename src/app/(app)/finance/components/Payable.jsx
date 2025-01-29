"use client";
import { PlusCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import Modal from "@/components/Modal";
import CreateContact from "../../setting/contact/CreateContact";
import Notification from "@/components/notification";
import CreatePayable from "./CreatePayable";
const Payable = () => {
    const [isModalCreateContactOpen, setIsModalCreateContactOpen] = useState(false);
    const [isModalCreatePayableOpen, setIsModalCreatePayableOpen] = useState(false);
    const [notification, setNotification] = useState("");

    const [loading, setLoading] = useState(true);

    const closeModal = () => {
        setIsModalCreateContactOpen(false);
        setIsModalCreatePayableOpen(false);
    };

    return (
        <div className="grid grid-cols-3 gap-4">
            {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl col-span-2">
                <div className="p-4 flex justify-between">
                    <h1 className="text-2xl font-bold mb-4">Hutang</h1>
                    <div>
                        <button onClick={() => setIsModalCreatePayableOpen(true)} className="btn-primary text-xs mr-2">
                            <PlusCircleIcon className="w-4 h-4 mr-2 inline" /> Hutang
                        </button>
                        <Modal isOpen={isModalCreatePayableOpen} onClose={closeModal} modalTitle="Create Payable">
                            <CreatePayable isModalOpen={setIsModalCreatePayableOpen} notification={(message) => setNotification(message)} />
                        </Modal>
                        <button onClick={() => setIsModalCreateContactOpen(true)} className="btn-primary text-xs">
                            <PlusCircleIcon className="w-4 h-4 mr-2 inline" /> Contact
                        </button>
                        <Modal isOpen={isModalCreateContactOpen} onClose={closeModal} modalTitle="Create Contact">
                            <CreateContact isModalOpen={setIsModalCreateContactOpen} notification={(message) => setNotification(message)} />
                        </Modal>
                    </div>
                </div>
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th>Contact</th>
                            <th>Tagihan</th>
                            <th>Dibayar</th>
                            <th>Sisa</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>2</td>
                            <td>3</td>
                            <td>4</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl">
                <div className="p-4 flex justify-between">
                    <button className="btn-primary text-xs">
                        <PlusCircleIcon className="w-4 h-4 mr-2 inline" /> Bayar
                    </button>
                </div>
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th>Keterangan</th>
                            <th>Jumlah</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>2</td>
                            <td>3</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payable;
