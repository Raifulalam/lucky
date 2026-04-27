import {
    FaComments,
    FaClipboardList,
    FaCube,
    FaHome,
    FaStar,
    FaUserCog,
    FaUserTie,
    FaUsers,
} from "react-icons/fa";

export const adminRoutes = [
    {
        label: "Overview",
        path: "/admin",
        icon: FaHome,
        description: "Workforce and operations overview",
    },
    {
        label: "Users",
        path: "/admin/users",
        icon: FaUsers,
        description: "Customer and account management",
    },
    {
        label: "Employees",
        path: "/admin/employees",
        icon: FaUserTie,
        description: "HR workspace and employee operations",
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
        label: "Feedback",
        path: "/admin/feedback",
        icon: FaStar,
        description: "Contact and review inbox",
    },
    {
        label: "Products",
        path: "/admin/products",
        icon: FaCube,
        description: "Primary catalog management",
    },
    {
        label: "Inventory Lab",
        path: "/admin/inventory",
        icon: FaUserCog,
        description: "Quick product CRUD workspace",
    },
];

export const legacyAdminRedirects = [
    { from: "/dashboard", to: "/admin" },
    { from: "/admindashboard", to: "/admin/users" },
    { from: "/employee-manage", to: "/admin/employees" },
    { from: "/orders", to: "/admin/orders" },
    { from: "/complaints", to: "/admin/complaints" },
    { from: "/feedback", to: "/admin/feedback" },
    { from: "/manage-products", to: "/admin/products" },
    { from: "/manageproducts", to: "/admin/inventory" },
];
