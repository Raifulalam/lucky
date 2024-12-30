import React, { useState, useEffect } from 'react';
import './Exchange.css';

const Exchange = () => {
    const [oldProduct, setOldProduct] = useState(null);

    const products = [
        { name: 'TV', image: 'icon-tv.png' },
        { name: 'Refrigerator', image: 'icon-refrigerator.png' },
        { name: 'AC', image: 'icon-ac.png' },
        { name: 'Washer & Dryer', image: 'icon-washer.png' },
        { name: 'Chest Freezer', image: 'icon-freezer.png' },
    ];

    const handleProductClick = (product) => {
        setOldProduct(product);
    };

    // Log the updated oldProduct after it changes
    useEffect(() => {
        if (oldProduct) {
            console.log("Selected Product: ", oldProduct);
        }
    }, [oldProduct]); // This will run every time `oldProduct` changes

    return (
        <div className="exc-container">
            <div className="exc-header">
                <h1>Exchange</h1>
                <p>Exchange your product with another user</p>
                <h3>Choose your old product</h3>
                <div className="exc-products">
                    {products.length > 0 ? (
                        products.map((product, index) => (
                            <div
                                key={index}
                                onClick={() => handleProductClick(product)}
                                className="exc-product"
                            >
                                <img src={product.image} alt={product.name} />
                                <h4>{product.name}</h4>
                            </div>
                        ))
                    ) : (
                        <p>No products available for exchange</p>
                    )}
                </div>
                {oldProduct && (
                    <div className="selected-product">
                        <h3>Selected Product: {oldProduct.name}</h3>
                        <img src={oldProduct.image} alt={oldProduct.name} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Exchange;
