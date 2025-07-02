const Label = ({ className, children, ...props }) => (
    <label className={`${className} block font-medium text-xs text-gray-700 mb-1`} {...props}>
        {children}
    </label>
);

export default Label;
