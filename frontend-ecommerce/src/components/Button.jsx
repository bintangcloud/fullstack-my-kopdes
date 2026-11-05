export default function Button({ children, variant = "primary", onClick, className = "", type = "button", disabled = false }) {
const baseStyle = "py-2.5 px-4 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-1 text-sm shadow-sm";
  const variants = {
    primary: "bg-[#8B0000] text-white hover:bg-red-800",
    outline: "bg-white border border-gray-200 text-gray-700 hover:border-[#8B0000] hover:text-[#8B0000]",
    danger: "bg-red-100 text-red-600 hover:bg-red-200", // Hapus keranjang
    dangerSolid: "bg-red-600 text-white hover:bg-red-700", // Hapus tabel admin
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200", 
    dark: "bg-gray-800 text-white hover:bg-gray-900", // Tambah kategori admin
    warning: "bg-yellow-500 text-white hover:bg-yellow-600", // Edit tabel admin
    disabled: "bg-gray-400 text-white cursor-not-allowed"
};

const currentVariant = disabled ? variants.disabled : (variants[variant] || variants.primary);

return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${currentVariant} ${className}`}>
    {children}
    </button>
);
}