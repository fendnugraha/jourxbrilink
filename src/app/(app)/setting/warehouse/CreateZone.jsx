const { default: axios } = require("@/libs/axios");
const { useState, useEffect } = require("react");

const CreateZone = ({ isModalOpen, notification, fetchZones, zones }) => {
    const [newZone, setNewZone] = useState({
        zone_name: "",
        employee_id: "",
    });

    const [loading, setLoading] = useState(true);

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

    const handleCreateZone = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/zones", newZone);
            notification({ type: "success", message: response.data.message });
            if (response.status === 201) {
                // Reset form fields and close modal on success
                setNewZone({
                    name: "",
                    employee_id: "",
                });
                isModalOpen(false);
            }
            fetchZones();
        } catch (error) {
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleCreateZone}>
            <div className="space-y-2">
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        value={newZone.zone_name}
                        onChange={(e) => setNewZone({ ...newZone, zone_name: e.target.value })}
                        className="form-control"
                        required
                    />
                </div>
                <div>
                    <label>Kasir (Backup)</label>
                    <select
                        value={newZone.employee_id}
                        onChange={(e) => setNewZone({ ...newZone, employee_id: e.target.value })}
                        className="form-select"
                        required
                    >
                        <option value="">Pilih Kasir</option>
                        {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                                {employee.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <button type="submit" className="btn btn-primary mt-4">
                Create
            </button>
        </form>
    );
};

export default CreateZone;
