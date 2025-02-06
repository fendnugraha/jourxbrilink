import Image from "next/image";
import LoginLinks from "./LoginLinks";

export default function Home() {
    return (
        <div className="flex h-screen justify-center items-center flex-col gap-4 p-4">
            <Image src="/jour-logo.svg" alt="Logo" width={400} height={400} />
            {/* <h1 className="text-7xl text-blue-800 font-bold mb-4">
                JOUR <span className="text-orange-600 font-normal">APPS</span>
            </h1> */}
            <LoginLinks />
        </div>
    );
}
