const AuthLayout = ({ children }) => {
    return (
        <div
            style={{
                backgroundImage: "url('/bgr.png')",
                backgroundColor: "rgba(222 ,222 ,222 ,.5)",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}
            className="flex justify-center items-center h-screen bg-white dark:bg-slate-800 p-4"
        >
            {children}
        </div>
    );
};

export default AuthLayout;
