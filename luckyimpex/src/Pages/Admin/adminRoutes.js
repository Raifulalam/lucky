import {
    FaComments,
    FaClipboardList,

    FaHome,
    FaStar,
    FaUsers,
} from "react-icons/fa";

export const adminRoutes = [
    {
        label: "Overview",
        path: "/admin",
        icon: FaHome,
        description: "Store performance and quick actions",
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
    }
  
];

export const legacyAdminRedirects = [
    { from: "/dashboard", to: "/admin" },
    { from: "/admindashboard", to: "/admin/users" },
    { from: "/orders", to: "/admin/orders" },
    { from: "/complaints", to: "/admin/complaints" },
    { from: "/feedback", to: "/admin/feedback" },

    { from: "/reviews", to: "/admin/reviews" },
   
];
