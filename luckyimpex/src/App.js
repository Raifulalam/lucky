import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";

/* CONTEXTS & HELPERS (Static Imports) */
import { legacyAdminRedirects } from "./Pages/Admin/adminRoutes";
import { CartProvider } from "./Components/CreateReducer";
import { UserProvider } from "./Components/UserContext";
import { NotificationProvider } from "./Components/NotificationContext";
import CookieConsentBanner from "./Components/CookieConsentBanner";
import ProtectedRoute from './Components/ProtectedRoutes';
import ErrorBoundary from "./Components/ErrorBoundary";
import GoogleAnalytics from "./Components/GoogleAnalytics";

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
const OrderPage = lazy(() => import("./Pages/Customer/OrderPage"));
const CustomerReviewPage= lazy(()=> import("./Pages/Reviews/Reviews"))

/* ADMIN / EMPLOYEE (Lazy Loaded) */
const Dashboard = lazy(() => import("./Pages/Admin/Dashboard"));
const AdminDashboard = lazy(() => import("./Pages/Admin/AdminDashboard"));
const OrderComponent = lazy(() => import("./Pages/Admin/Orders"));
const ComplaintsComponent = lazy(() => import("./Pages/Admin/Complaints"));
const FeedbackList = lazy(() => import("./Pages/Admin/FeedbackMessage/Feedback"));
const ManageProducts = lazy(() => import("./Pages/Admin/ManageProducts"));
const ReviewPage = lazy(() => import("./Pages/Admin/ReviewComponent"));
const AdminLayout = lazy(() => import("./Pages/Admin/AdminLayout"));
const Reviews=lazy(()=>import("./Pages/Admin/Reviews/Reviews"));
const LegacyAboutRedirect = () => <Navigate to="/store" replace />;

const LegacyProductDetailsRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/product/${id}`} replace />;
};

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
          <CartProvider>
            <CookieConsentBanner />
            <BrowserRouter>
              <GoogleAnalytics />
              <Suspense fallback={
                <div style={{
                  minHeight: '100vh',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(180deg, #f7f9fc 0%, #eef3f8 100%)',
                  color: '#17324d',
                  fontFamily: 'system-ui, sans-serif'
                }}>
                  <div style={{
                    width: 'min(720px, calc(100vw - 40px))',
                    padding: '28px',
                    borderRadius: '24px',
                    background: '#fff',
                    boxShadow: '0 18px 40px rgba(16, 33, 58, 0.08)',
                    border: '1px solid rgba(217, 225, 232, 0.9)'
                  }}>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div style={{ width: '48%', height: '18px', borderRadius: '999px', background: '#e9eef4' }} />
                      <div style={{ width: '72%', height: '34px', borderRadius: '14px', background: '#e9eef4' }} />
                      <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                        <div style={{ height: '120px', borderRadius: '18px', background: '#eef3f8' }} />
                        <div style={{ height: '120px', borderRadius: '18px', background: '#eef3f8' }} />
                        <div style={{ height: '120px', borderRadius: '18px', background: '#eef3f8' }} />
                      </div>
                    </div>
                  </div>
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
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/productdetails/:id" element={<LegacyProductDetailsRedirect />} />
                    <Route path="/contact" element={<ContactComponent />} />
                    <Route path="/about" element={<LegacyAboutRedirect />} />
                    <Route path="/store" element={<StoreComponent />} />
                    <Route path="/review" element={<CustomerReviewPage/>}/>

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
                      <Route path="orders" element={<OrderComponent />} />
                      <Route path="orders/:orderId" element={<ReviewPage />} />
                      <Route path="complaints" element={<ComplaintsComponent />} />
                      <Route path="feedback" element={<FeedbackList />} />
                      <Route path="products" element={<ManageProducts />} />
                      <Route path="reviews" element={<Reviews />} />
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
        </UserProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
