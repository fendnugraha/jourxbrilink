import Link from "next/link";

const NavLink = ({ active = false, children, isOpen, ...props }) => (
    <Link
        {...props}
        className={`flex items-center hover:bg-slate-200 hover:text-slate-700 ${
            active ? "bg-lime-300 dark:bg-lime-500 text-slate-700" : ""
        } transition-all duration-200 origin-left ease-in`}
    >
        {children}
    </Link>
);

export default NavLink;
