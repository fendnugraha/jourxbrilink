import MainPage from "../main";
import AttendanceForm from "./attendanceForm";
import SimpleLeaveCalendar from "./SimpleCalendar";

const EmployeePage = () => {
    return (
        <MainPage headerTitle="Employee">
            <div className="py-4 sm:py-8 px-4 sm:px-12 overflow-x-auto">
                {/* <SimpleLeaveCalendar /> */}
                <AttendanceForm />
            </div>
        </MainPage>
    );
};

export default EmployeePage;
