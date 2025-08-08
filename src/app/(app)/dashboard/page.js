import MainPage from "../main";
import DashboardContent from "./components/DashboardContent";

export const metadata = {
    title: "Jour x BRILink - Dashboard",
    description: "Journal Apps for AgenBRI Link",
};

const Dashboard = () => {
    return (
        <MainPage headerTitle="Dashboard">
            <div className="py-4 sm:py-8 px-4 sm:px-12 overflow-x-auto">
                <DashboardContent />
            </div>
        </MainPage>
    );
};

export default Dashboard;
