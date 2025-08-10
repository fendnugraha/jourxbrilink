const Button = ({ children, buttonType = "primary", className, ...props }) => {
    const buttonTypes = {
        primary: "bg-violet-500 dark:bg-violet-600 hover:bg-violet-400 dark:hover:bg-violet-500 text-white",
        secondary: "bg-gray-500 hover:bg-gray-400 text-white",
        danger: "bg-red-500 hover:bg-red-400 text-white",
        warning: "bg-yellow-500 hover:bg-yellow-400 text-white",
        success: "bg-green-500 hover:bg-green-400 text-white",
    };
    return (
        <button
            {...props}
            className={`px-6 py-2 min-w-40 hover:drop-shadow-md ${buttonTypes[buttonType]} ${className} rounded-xl text-sm cursor-pointer transition duration-300 ease-in-out`}
        >
            {children}
        </button>
    );
};

export default Button;
