import MainPage from "../../main";
import MutationContent from "./MutationContent";

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
