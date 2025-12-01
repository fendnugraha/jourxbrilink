"use client";

const AttenndanceCalendar = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [emplyeeId, setEmployeeId] = useState(null);

    const fetchAttendanceData = async () => {
        try {
            const response = await axios.get("/api/get-attendance-by-contact/{date}/{contactId}");
            setAttendanceData(response.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
    }, [selectedDate]);
    return <div>AttenndanceCalendar</div>;
};

export default AttenndanceCalendar;
