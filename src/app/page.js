import LoginLinks from "./LoginLinks";

export default function Home() {
    return (
        <div className="flex h-screen justify-center items-center flex-col">
            <h1 className="text-5xl font-bold mb-4">Home</h1>
            <LoginLinks />
        </div>
    );
}
