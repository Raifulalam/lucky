import "./App.css";
import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

/* CONTEXTS & HELPERS (Static Imports) */
import { legacyAdminRedirects } from "./Pages/Admin/adminRoutes";
import { CartProvider } from "./Components/CreateReducer";
import { UserProvider } from "./Components/UserContext";
import { NotificationProvider } from "./Components/NotificationContext";
import { ProductProvider } from "./Components/ProductContext";
import ProtectedRoute from './Components/ProtectedRoutes';
import ErrorBoundary from "./Components/ErrorBoundary";

/* PAGES (Lazy Loaded) */
const LoginComponent = lazy(() => import("./Pages/LoginPage/LoginPage"));
const SignUpcomponent = lazy(() => import("./Pages/SignUp/Signup"));
const HomePage = lazy(() => import("./Pages/HomePage/Home"));
const LuckyImpexServicePage = lazy(() => import("./Pages/Service/Service"));
const Products = lazy(() => import("./Pages/Products/Products"));
const Profile = lazy(() => import("./Pages/Profile/Profile"));
const CartComponent = lazy(() => import("./Pages/Cart/Cart"));
const ContactComponent = lazy(() => import("./Pages/Contact/Contact").then(module => ({ default: module.ContactComponent })));
const ProductDetails = lazy(() => import("./Pages/DetailsPage/Details"));
const BrandSearch = lazy(() => import("./Pages/Products/Brandserch"));
const EMI = lazy(() => import("./Pages/EMI/EMI"));
const Exchange = lazy(() => import("./Pages/Exchange/Exchange"));
const StoreComponent = lazy(() => import("./Pages/HomePage/StorePage"));
const PhoneShop = lazy(() => import("./Pages/Products/PhoneShop"));
const PhoneDetails = lazy(() => import("./Pages/DetailsPage/PhoneDetails"));
const OrderPage = lazy(() => import("./Pages/Customer/OrderPage"));

/* ADMIN / EMPLOYEE (Lazy Loaded) */
const Dashboard = lazy(() => import("./Pages/Admin/Dashboard"));
const AdminDashboard = lazy(() => import("./Pages/Admin/AdminDashboard"));
const OrderComponent = lazy(() => import("./Pages/Admin/Orders"));
const ComplaintsComponent = lazy(() => import("./Pages/Admin/Complaints"));
const FeedbackList = lazy(() => import("./Pages/Admin/FeedbackMessage/Feedback"));
const ManageProducts = lazy(() => import("./Pages/Admin/ManageProducts"));
const ReviewPage = lazy(() => import("./Pages/Admin/ReviewComponent"));
const EmployeeManager = lazy(() => import("./Pages/Admin/ManageEmployee"));
const AdminProduct = lazy(() => import("./Pages/Admin/manageProducts/manageProducts"));
const AdminLayout = lazy(() => import("./Pages/Admin/AdminLayout"));

function App() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <UserProvider>
          <ProductProvider>
            <CartProvider>
              <BrowserRouter>
                <Suspense fallback={
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontFamily: 'sans-serif',
                    color: '#2563eb',
                    fontSize: '1.25rem',
                    fontWeight: '500'
                  }}>
                    <div style={{
                      border: '3px solid #e2e8f0',
                      borderTop: '3px solid #2563eb',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      animation: 'spin 1s linear infinite',
                      marginRight: '12px'
                    }}></div>
                    Loading Lucky Impex...
                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </div>
                }>
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
                </Suspense>
              </BrowserRouter>
            </CartProvider>
          </ProductProvider>
        </UserProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
