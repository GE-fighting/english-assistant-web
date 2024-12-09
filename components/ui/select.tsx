interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  options?: { value: string; label: string; }[];
  loading?: boolean;
  placeholder?: string;
}

export function Select({ 
  className = '', 
  options = [], 
  loading = false, 
  placeholder, 
  ...props 
}: SelectProps) {
  // 调试输出
  console.log('Select rendering:', { options, loading, placeholder, value: props.value })

  return (
    <select
      className={`
        w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 
        rounded-md shadow-sm focus:outline-none focus:ring-2 
        focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}
      `}
      disabled={loading}
      {...props}
    >
      {placeholder && (
        <option value="">{loading ? '加载中...' : placeholder}</option>
      )}
      {!loading && options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}