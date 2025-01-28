import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginComponent from './Pages/LoginPage/LoginPage';
import SignUpcomponent from './Pages/SignUp/Signup';
import HomePage from './Pages/HomePage/Home';
import LuckyImpexServicePage from './Pages/Service/Service';
import Products from './Pages/Products/Products';
import Profile from './Pages/Profile/Profile';
import { CartProvider } from './Components/CreateReducer';
import CartComponent from './Pages/Cart/Cart';
import { ContactComponent } from './Pages/Contact/Contact';
import ProductDetails from './Pages/DetailsPage/Details';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import { UserProvider } from './Components/UserContext';
import OrderComponent from './Pages/Admin/Orders';
import ComplaintsComponent from './Pages/Admin/Complaints';
import FeedbackList from './Pages/Admin/FeedbackMessage/Feedback';
import ManageProducts from './Pages/Admin/ManageProducts';
import BrandSearch from './Pages/Products/Brandserch';
import EMI from './Pages/EMI/EMI';
import Exchange from './Pages/Exchange/Exchange';
import StoreComponent from './Pages/HomePage/StorePage';
import ReviewPage from './Pages/Admin/ReviewComponent';
import PhoneShop from './Pages/Products/PhoneShop';
import PhoneDetails from './Pages/DetailsPage/PhoneDetails';
import OrderPage from './Pages/Customer/OrderPage';
import { NotificationProvider } from './Components/NotificationContext';
function App() {
  return (
    <NotificationProvider>
      <UserProvider> {/* Make sure UserProvider is the outermost context */}
        <CartProvider> {/* CartProvider wraps all components that need cart context */}
          <BrowserRouter>
            <Routes>
              {/* Route for Home page */}
              <Route path='/' element={<HomePage />} />
              <Route path="/login" element={<LoginComponent />} />
              <Route path="/signup" element={<SignUpcomponent />} />
              <Route path="/service" element={<LuckyImpexServicePage />} />
              <Route path='/products' element={<Products />} />
              <Route path='/products/:category' element={<Products />} />
              <Route path='/products/brand/:brand' element={<BrandSearch />} />
              <Route path='/cart' element={<CartComponent />} />
              <Route path='/contact' element={<ContactComponent />} />
              <Route path='/productdetails/:id' element={<ProductDetails />} />
              <Route path='/admindashboard' element={<AdminDashboard />} />
              <Route path='/orders' element={<OrderComponent />} />
              <Route path='/complaints' element={<ComplaintsComponent />} />
              <Route path='/feedback' element={<FeedbackList />} />
              <Route path='/manageproducts' element={<ManageProducts />} />
              <Route path='/emi' element={<EMI />} />
              <Route path='/exchange' element={<Exchange />} />
              <Route path='/store' element={<StoreComponent />} />
              <Route path="/review/:orderId" element={<ReviewPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path='/phones' element={<PhoneShop />} />
              <Route path='/phonedetails/:id' element={<PhoneDetails />} />
              <Route path='/orderpage' element={<OrderPage />} />

            </Routes>
          </BrowserRouter>
        </CartProvider>
      </UserProvider>
    </NotificationProvider>
  );
}

export default App;
