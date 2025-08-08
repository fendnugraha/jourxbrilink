import MainPage from "../main";
import SummaryContent from "./components/SummaryContent";

export const metadata = {
    title: "Jour x BRILink - Summary",
    description: "Journal Apps for AgenBRI Link",
};

const SummaryPage = () => {
    return (
        <MainPage headerTitle="Summary">
            <div className="py-4 sm:py-8 px-4 sm:px-12">
                <SummaryContent />
            </div>
        </MainPage>
    );
};

export default SummaryPage;
