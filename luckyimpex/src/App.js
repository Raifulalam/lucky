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

function App() {
  return (
    <UserProvider> {/* Make sure UserProvider is the outermost context */}
      <CartProvider> {/* CartProvider wraps all components that need cart context */}
        <BrowserRouter>
          <Routes>
            {/* Route for Home page */}
            <Route path='/' element={<HomePage />} />

            {/* Route for Login */}
            <Route path="/login" element={<LoginComponent />} />

            {/* Route for Signup */}
            <Route path="/signup" element={<SignUpcomponent />} />

            {/* Route for Service Page */}
            <Route path="/service" element={<LuckyImpexServicePage />} />

            {/* Category-based Routes */}
            <Route path='/products' element={<Products />} />  {/* All products page */}
            <Route path='/products/:category' element={<Products />} />  {/* Category-based products */}
            <Route path='/products/brand/:brand' element={<BrandSearch />} />

            {/* Route for Profile page */}
            <Route path='/profile' element={<Profile />} />

            {/* Cart Route */}
            <Route path='/cart' element={<CartComponent />} />

            {/* Contact Route */}
            <Route path='/contact' element={<ContactComponent />} />
            <Route path='/productdetails/:id' element={<ProductDetails />} />
            <Route path='/admindashboard' element={<AdminDashboard />} />
            <Route path='/orders' element={<OrderComponent />} />
            <Route path='/complaints' element={<ComplaintsComponent />} />
            <Route path='/feedback' element={<FeedbackList />} />
            <Route path='/manageproducts' element={<ManageProducts />} />
            <Route path='/emi' element={<EMI />} />
            <Route path='/exchange' element={<Exchange />} />

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
