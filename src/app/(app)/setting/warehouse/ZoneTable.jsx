import Modal from "@/components/Modal";
import { useAuth } from "@/libs/auth";
import { useState } from "react";
import UpdateZone from "./UpdateZone";

const ZoneTable = ({ zones, notification, fetchZones }) => {
    const { user } = useAuth();
    const [isModalEditZoneOpen, setIsModalEditZoneOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState(null);

    const closeModal = () => {
        setIsModalEditZoneOpen(false);
        setSelectedZone(null);
    };
    const handleDeleteZone = async (id) => {
        if (!confirm("Are you sure you want to delete this zone?")) return;
        try {
            const response = await axios.delete(`/api/zones/${id}`);
            notification({ type: "success", message: response.data.message });
            fetchZones();
        } catch (error) {
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
            console.error("Error deleting zone:", error);
        }
    };
    return (
        <>
            <div className="overflow-x-auto card">
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th className="text-center">Nama Zona</th>
                            <th className="text-center" hidden={!["Super Admin"].includes(user?.role?.role)}>
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {zones.map((zone, index) => (
                            <tr key={index}>
                                <td className="font-bold">
                                    {zone.zone_name}
                                    <span className="block font-normal">{zone.contact?.name}</span>
                                </td>
                                <td className="text-center" hidden={!["Super Admin"].includes(user?.role?.role)}>
                                    <button
                                        onClick={() => {
                                            setIsModalEditZoneOpen(true);
                                            setSelectedZone(zone);
                                        }}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalEditZoneOpen} onClose={closeModal} modalTitle="Edit Zone" maxWidth="max-w-md">
                <UpdateZone zone={selectedZone} notification={notification} fetchZones={fetchZones} closeModal={closeModal} />
            </Modal>
        </>
    );
};

export default ZoneTable;
