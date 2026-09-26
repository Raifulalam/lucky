import {
    FaComments,
    FaClipboardList,
    FaHome,
    FaStar,
    FaUsers,
    FaWhatsapp,
    FaBox,
    FaArrowRight,
    FaArrowDown,
    FaExchangeAlt,
    FaTools,
    FaBarcode,
    FaWarehouse,
    FaExclamationTriangle,
    FaHistory,
    FaChartBar,
} from "react-icons/fa";

export const adminRoutes = [
    {
        label: "Overview",
        path: "/admin",
        icon: FaHome,
        description: "Store performance and quick actions",
    },
    {
        label: "Inventory",
        path: "/admin/inventory",
        icon: FaBox,
        description: "Product inventory & stock management",
        isCollapsible: true,
        children: [
            {
                label: "All Products",
                path: "/admin/inventory",
                icon: FaBox,
                description: "Product list & catalog",
            },
            {
                label: "Dashboard",
                path: "/admin/inventory/dashboard",
                icon: FaChartBar,
                description: "Inventory overview & stats",
            },
            {
                label: "Stock In",
                path: "/admin/inventory/stock-in",
                icon: FaArrowDown,
                description: "Add inventory to warehouse",
            },
            {
                label: "Stock Out",
                path: "/admin/inventory/stock-out",
                icon: FaArrowRight,
                description: "Issue inventory from warehouse",
            },
            {
                label: "Stock Transfer",
                path: "/admin/inventory/transfer",
                icon: FaExchangeAlt,
                description: "Transfer stock between locations",
            },
            {
                label: "Stock Adjustment",
                path: "/admin/inventory/adjustment",
                icon: FaTools,
                description: "Correct inventory discrepancies",
            },
            {
                label: "Serial Numbers",
                path: "/admin/inventory/serial-numbers",
                icon: FaBarcode,
                description: "Track individual product serials",
            },
            {
                label: "Warehouses",
                path: "/admin/inventory/warehouses",
                icon: FaWarehouse,
                description: "Manage inventory locations",
            },
            {
                label: "Low Stock",
                path: "/admin/inventory/low-stock",
                icon: FaExclamationTriangle,
                description: "Products needing attention",
            },
            {
                label: "Movement Ledger",
                path: "/admin/inventory/movements",
                icon: FaHistory,
                description: "Complete audit trail",
            },
        ],
    },
    {
        label: "Users",
        path: "/admin/users",
        icon: FaUsers,
        description: "Customer and account management",
    },
    {
        label: "Orders",
        path: "/admin/orders",
        icon: FaClipboardList,
        description: "Order pipeline and fulfillment",
    },
    {
        label: "Complaints",
        path: "/admin/complaints",
        icon: FaComments,
        description: "Customer complaint resolution",
    },
    {
        label: "Contacts",
        path: "/admin/feedback",
        icon: FaStar,
        description: "Contact and review inbox",
    },
    {
        label: "Reviews",
        path: "/admin/reviews",
        icon: FaStar,
        description: "Customer reviews and feedback",
    },
    {
        label: "WhatsApp",
        path: "/admin/whatsapp",
        icon: FaWhatsapp,
        description: "WhatsApp agent & live messages",
    },
];

export const legacyAdminRedirects = [
    { from: "/dashboard", to: "/admin" },
    { from: "/admindashboard", to: "/admin/users" },
    { from: "/orders", to: "/admin/orders" },
    { from: "/complaints", to: "/admin/complaints" },
    { from: "/feedback", to: "/admin/feedback" },

    { from: "/reviews", to: "/admin/reviews" },
   
];
