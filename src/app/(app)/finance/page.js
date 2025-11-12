import Payable from "./components/Payable";
import MainPage from "../main";
import FinanceContent from "./components/FinanceContent";

export const metadata = {
    title: "Jour x BRILink - Finance",
    description: "Journal Apps for AgenBRI Link",
};

const Finance = () => {
    return (
        <MainPage headerTitle="Finance">
            <div className="py-4 sm:py-8 px-4 sm:px-12">
                <div className="grid grid-cols-1 gap-4">
                    {/* <Payable /> */}
                    <FinanceContent />
                </div>
            </div>
        </MainPage>
    );
};

export default Finance;
