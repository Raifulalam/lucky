// In App.js
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
import ProductDetails from './Pages/DetailsPage/Details';  // Default import
// Note the absence of curly braces here

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/signup" element={<SignUpcomponent />} />
          <Route path="/service" element={<LuckyImpexServicePage />} />
          <Route path='/products' element={<Products />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/cart' element={<CartComponent />} />
          <Route path='/contact' element={<ContactComponent />} />
          <Route path='/productdetails/:id' element={<ProductDetails />} /> {/* Use default import */}
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
