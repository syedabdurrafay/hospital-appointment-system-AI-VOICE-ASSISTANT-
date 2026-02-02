import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  disabled = false,
  loading = false,
  icon,
  type = 'button',
  className = '',
  ...props 
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${className} ${loading ? 'loading' : ''}`;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner"></span>
      )}
      {icon && !loading && (
        <span className="btn-icon">{icon}</span>
      )}
      <span className="btn-text">{children}</span>
    </button>
  );
};

export default Button;