import axios from "@/libs/axios";
import { useEffect, useState } from "react";

const UpdateZone = ({ zone, closeModal, notification, fetchZones }) => {
    const [formData, setFormData] = useState({
        zone_name: zone?.zone_name || "",
        employee_id: zone?.employee_id || "",
    });
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchContacts = async () => {
        try {
            const response = await axios.get("/api/get-all-contacts/Employee");
            setContacts(response.data.data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/zones/${zone?.id}`, formData);
            notification({
                type: "success",
                message: response.data.message,
            });
            fetchZones();
            closeModal();
        } catch (error) {
            notification({
                type: "error",
                message: error.response?.data?.message || "Update failed",
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="zone_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Zone Name
                </label>
                <input
                    type="text"
                    value={formData.zone_name}
                    onChange={(e) => setFormData({ ...formData, zone_name: e.target.value })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Zone Name"
                    required
                />
            </div>
            <div>
                <label htmlFor="employee_id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Contact Person
                </label>
                <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                >
                    <option value="">Select Contact Person</option>
                    {contacts.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                            {contact.name}
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                disabled={loading}
            >
                {loading ? "Updating..." : "Update Zone"}
            </button>
        </form>
    );
};
export default UpdateZone;
