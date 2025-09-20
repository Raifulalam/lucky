export default function ActionButton({ label, onClick, color = "blue", disabled = false }) {
    const colors = {
        blue: "bg-blue-600 text-white",
        green: "bg-green-600 text-white",
        red: "bg-red-600 text-white",
        gray: "bg-gray-600 text-white",
        yellow: "bg-yellow-500 text-white",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-2 py-1 rounded ${colors[color]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {label}
        </button>
    );
}
