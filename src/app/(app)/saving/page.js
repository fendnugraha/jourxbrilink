import MainPage from "../main";
import SavingContent from "./SavingContent";

export const metadata = {
    title: "Jour x BRILink - Saving",
    description: "Journal Apps for AgenBRI Link",
};

const Saving = () => {
    return (
        <MainPage headerTitle="Saving">
            <div className="py-4 sm:py-8 px-4 sm:px-12">
                <div className="grid grid-cols-1 gap-4">
                    <SavingContent />
                </div>
            </div>
        </MainPage>
    );
};

export default Saving;
