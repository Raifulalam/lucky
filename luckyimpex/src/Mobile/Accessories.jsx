import React from 'react'
import './mobile.css';
export default function Features() {
   const accessories = [
    {
        id: 1,
        name: "Wireless Earbuds",
        description:
            "High-quality wireless earbuds with noise cancellation.",
        link:"/mobile products",
        image:
            "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&auto=format&fit=crop&q=80",
    },
    {
        id: 2,
        name: "Phone Case",
        description:
            "Durable and stylish phone case to protect your device.",
        link:"/mobile products",
       
        image:
            "https://images.unsplash.com/photo-1601593346740-925612772716?w=500&auto=format&fit=crop&q=80",
    },
    {
        id: 3,
        name: "Portable Charger",
        description:
            "Compact and powerful portable charger for on-the-go charging.",
        link:"./mobile products",
        image:
            "https://images.unsplash.com/photo-1609592424847-7d6a7a6e4b1e?w=500&auto=format&fit=crop&q=80",
    },
    {
        id: 4,
        name: "Screen Protector",
        description:
            "Tempered glass screen protector for maximum protection.",
        link:"./mobile products",
      
        image:
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=80",
    },
];
  return (
    <div className='features-container'>
        <div className="features">
            {accessories.map((item) => (
                <div key={item.id} className="feature-card">
                        
                   <div className="info">
                     <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  <button onClick={() => window.location.href = item.link}>Explore</button>
                   </div>
                    
                    <div className="image-conatiner">
                        <img src={item.image} alt={item.name} />
                    </div>
                </div>
            ))}
        </div>
    </div>
  )
}
