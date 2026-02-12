import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

/* PAGES */
import LoginComponent from "./Pages/LoginPage/LoginPage";
import SignUpcomponent from "./Pages/SignUp/Signup";
import HomePage from "./Pages/HomePage/Home";
import LuckyImpexServicePage from "./Pages/Service/Service";
import Products from "./Pages/Products/Products";
import Profile from "./Pages/Profile/Profile";
import CartComponent from "./Pages/Cart/Cart";
import { ContactComponent } from "./Pages/Contact/Contact";
import ProductDetails from "./Pages/DetailsPage/Details";
import BrandSearch from "./Pages/Products/Brandserch";
import EMI from "./Pages/EMI/EMI";
import Exchange from "./Pages/Exchange/Exchange";
import StoreComponent from "./Pages/HomePage/StorePage";
import PhoneShop from "./Pages/Products/PhoneShop";
import PhoneDetails from "./Pages/DetailsPage/PhoneDetails";
import OrderPage from "./Pages/Customer/OrderPage";

/* ADMIN / EMPLOYEE */
import Dashboard from "./Pages/Admin/Dashboard";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import OrderComponent from "./Pages/Admin/Orders";
import ComplaintsComponent from "./Pages/Admin/Complaints";
import FeedbackList from "./Pages/Admin/FeedbackMessage/Feedback";
import ManageProducts from "./Pages/Admin/ManageProducts";
import ReviewPage from "./Pages/Admin/ReviewComponent";
import EmployeeManager from "./Pages/Admin/ManageEmployee";
import AdminProduct from "./Pages/Admin/manageProducts/manageProducts";

/* CONTEXTS */
import { CartProvider } from "./Components/CreateReducer";
import { UserProvider } from "./Components/UserContext";
import { NotificationProvider } from "./Components/NotificationContext";
import { ProductProvider } from "./Components/ProductContext";

/* SECURITY */
import ProtectedRoute from './Components/ProtectedRoutes';

function App() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return (

    <NotificationProvider>
      <UserProvider>
        <ProductProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>

                {/* ================= PUBLIC ROUTES ================= */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginComponent />} />
                <Route path="/signup" element={<SignUpcomponent />} />
                <Route path="/service" element={<LuckyImpexServicePage />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:category" element={<Products />} />
                <Route path="/products/brand/:brand" element={<BrandSearch />} />
                <Route path="/productdetails/:id" element={<ProductDetails />} />
                <Route path="/phones" element={<PhoneShop />} />
                <Route path="/phonedetails/:id" element={<PhoneDetails />} />
                <Route path="/contact" element={<ContactComponent />} />
                <Route path="/store" element={<StoreComponent />} />

                {/* ================= USER ROUTES ================= */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute allowedRoles={["user", "admin"]}>
                      <CartComponent />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={["user", "admin"]}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/orderpage"
                  element={
                    <ProtectedRoute allowedRoles={["user"]}>
                      <OrderPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/emi"
                  element={
                    <ProtectedRoute allowedRoles={["user", "admin"]}>
                      <EMI />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/exchange"
                  element={
                    <ProtectedRoute allowedRoles={["user", "admin"]}>
                      <Exchange />
                    </ProtectedRoute>
                  }
                />

                {/* ================= ADMIN ROUTES ================= */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admindashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/manage-products"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminProduct />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/manageproducts"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <ManageProducts />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/employee-manage"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <EmployeeManager />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/feedback"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <FeedbackList />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/complaints"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <ComplaintsComponent />
                    </ProtectedRoute>
                  }
                />

                {/* ================= ADMIN + EMPLOYEE ================= */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "employee"]}>
                      <OrderComponent />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/review/:orderId"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <ReviewPage />
                    </ProtectedRoute>
                  }
                />

              </Routes>
            </BrowserRouter>
          </CartProvider>
        </ProductProvider>
      </UserProvider>
    </NotificationProvider>
  );
}

export default App;
