const AuthLayout = ({ children }) => {
    return (
        <div
            style={{
                backgroundImage: "url('/bg-new-t.png')",
                backgroundColor: "rgba(222 ,222 ,222 ,1)",
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
