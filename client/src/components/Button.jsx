export function Button({ children, className = '', type = 'submit', ...props }) { return <button className={`button ${className}`.trim()} type={type} {...props}>{children}</button>; }
