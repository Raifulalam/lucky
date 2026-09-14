import {React}from 'react'
import './mobile.css';
import { featuredMobiles } from './data';
export default function Featured() {


    
  return (
    <div className='featured-container'>
        <div className="line"></div>
      <div className='featured-header'>
           
        <h1>Featured Mobiles
          
        </h1>
      <button>
            View All →
          </button>

      </div>
      <div className='featured-wrapper'>
          {featuredMobiles.map((item)=>{
        return(
            <div key={item._id} className='featured-item'>
              <div className="featured-card">
                <div className="mobile-image">
                    <img src={item.image} alt={item.name} />
                </div>
                <div className="mobile-details">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <h4>₹{item.price}</h4>
                </div>
              <div className="action">
                <button> → </button>
              </div>
              </div>
              
                
            </div>
        )
    })}
        </div>
</div>
  )
}
