import React from 'react'
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Features from './Accessories';
import './mobile.css';
import { MoveRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductListingSection from '../Pages/HomePage/ProductListingSection';
import Featured from './Featured';
export default function MobileLanding() {
    const navigate = useNavigate();
    const handleExplore = () => {
        navigate('/mobile products');
    }

  return (
    <div>
        <Header/>
       <div className='mobile-container'>
            <div className="mobile-wrapper">
                <div className="mobile-header">
                    <div className="left-content">
                        <div className='left-top'>
                             <div className="line"></div>
                            <h4>LATEST & BEST</h4>
                        </div>
                        <div className="left-middle">
                                <h1>Mobile Phones</h1>
                        <p>Stay Connected, Staty Ahead</p>
                            </div>
                        
                        <div className="explore-button">
                            <button onClick={handleExplore}>
                                Explore Mobiles <MoveRightIcon/>
                            </button>
                        </div>

                    </div>
                    <div className="right-content">
                        <div className="image-conatiner">
                            <img src="./mobile.png" alt="mobile-image" />
                        </div>
                    </div>
                </div>
                <Featured/>
                {/* <ProductListingSection/> */}
                <Features/>
            </div>
       </div>
    <Footer/>
    </div>
  )
}
