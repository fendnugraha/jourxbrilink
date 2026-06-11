import MainPage from "../../main";
import MutationContent from "./MutationContent";

export const metadata = {
    title: "Jour x BRILink - Mutation",
    description: "Journal Apps for AgenBRI Link",
};

const MutationPage = () => {
    return (
        <MainPage headerTitle="Mutation">
            <div className="py-4 sm:py-8 px-4 sm:px-12 overflow-x-auto">
                <MutationContent />
            </div>
        </MainPage>
    );
};

export default MutationPage;
