import Image from "next/image";
import LoginLinks from "./LoginLinks";

export default function Home() {
    return (
        <div
            className={`flex h-screen justify-center items-center flex-col gap-4 p-4 relative`}
            style={{ backgroundImage: "url('/bg.jpg')", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}
        >
            <div className="absolute top-4 left-4 flex justify-center items-center gap-2">
                <Image src="/jour-logo.svg" alt="Logo" width={50} height={50} /> <h1 className="text-lg">Jour Apps x BRIlink</h1>
            </div>
            <h1 className="text-4xl sm:text-7xl text-white font-bold mb-4">
                THREE <span className="font-normal">KOMUNIKA</span>
            </h1>
            <LoginLinks />
        </div>
    );
}
