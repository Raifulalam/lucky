import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

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
import AdminLayout from "./Pages/Admin/AdminLayout";
import { legacyAdminRedirects } from "./Pages/Admin/adminRoutes";

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
                <Route path="/about" element={<StoreComponent />} />
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
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="users" element={<AdminDashboard />} />
                  <Route path="employees" element={<EmployeeManager />} />
                  <Route path="orders" element={<OrderComponent />} />
                  <Route path="orders/:orderId" element={<ReviewPage />} />
                  <Route path="complaints" element={<ComplaintsComponent />} />
                  <Route path="feedback" element={<FeedbackList />} />
                  <Route path="products" element={<AdminProduct />} />
                  <Route path="inventory" element={<ManageProducts />} />
                </Route>

                {legacyAdminRedirects.map((route) => (
                  <Route
                    key={route.from}
                    path={route.from}
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <Navigate to={route.to} replace />
                      </ProtectedRoute>
                    }
                  />
                ))}

                <Route
                  path="/review/:orderId"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Navigate to="/admin/orders" replace />
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
