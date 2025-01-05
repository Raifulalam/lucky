import React, { useState, useEffect } from 'react';
import './Exchange.css';

// Handle Product Info - Return questions for the product details
const handleProductInfo = () => {
    return (
        <div className="product-info">
            <h2>Please fill out the details of your product</h2>
            <div className="product-info-form">
                <div className="form-item">
                    <label htmlFor="working">Is the product working properly?</label>
                    <div className="options">
                        <input type="radio" name="working" value="yes" id="working-yes" />
                        <label htmlFor="working-yes">Yes</label>
                        <input type="radio" name="working" value="no" id="working-no" />
                        <label htmlFor="working-no">No</label>
                    </div>

                </div>

                <div className="form-item">
                    <label htmlFor="damages">Does it have any damages or defects?</label>
                    <div className="options">
                        <input type="radio" name="damages" value="yes" id="damages-yes" />
                        <label htmlFor="damages-yes">Yes</label>
                        <input type="radio" name="damages" value="no" id="damages-no" />
                        <label htmlFor="damages-no">No</label>
                    </div>

                </div>

                <div className="form-item">
                    <label htmlFor="maintenance">Is the product clean and well-maintained?</label>
                    <div className="options">
                        <input type="radio" name="maintenance" value="yes" id="maintenance-yes" />
                        <label htmlFor="maintenance-yes">Yes</label>
                        <input type="radio" name="maintenance" value="no" id="maintenance-no" />
                        <label htmlFor="maintenance-no">No</label>
                    </div>

                </div>

                <div className="form-item">
                    <label htmlFor="accessories">Does it come with all original accessories?</label>
                    <div className="options">
                        <input type="radio" name="accessories" value="yes" id="accessories-yes" />
                        <label htmlFor="accessories-yes">Yes</label>
                        <input type="radio" name="accessories" value="no" id="accessories-no" />
                        <label htmlFor="accessories-no">No</label>
                    </div>

                </div>


                <div className="form-item">
                    <label htmlFor="issues">Have you ever faced issues with it?</label>
                    <div className="options">
                        <input type="radio" name="issues" value="yes" id="issues-yes" />
                        <label htmlFor="issues-yes">Yes</label>
                        <input type="radio" name="issues" value="no" id="issues-no" />
                        <label htmlFor="issues-no">No</label>
                    </div>

                </div>

                <div className="form-item">
                    <label htmlFor="missing-parts">Are there any missing parts or components?</label>
                    <div className="options">
                        <input type="radio" name="missing-parts" value="yes" id="missing-parts-yes" />
                        <label htmlFor="missing-parts-yes">Yes</label>
                        <input type="radio" name="missing-parts" value="no" id="missing-parts-no" />
                        <label htmlFor="missing-parts-no">No</label>
                    </div>

                </div>

                <div className="form-item">
                    <label htmlFor="age">What is the age of the product?</label>
                    <input type="number" name="age" id="age" placeholder="Enter the product's age" />
                </div>
                <div className="form-item">
                    <label htmlFor="notes">Any other important notes?</label>
                    <textarea name="notes" id="notes" placeholder="Enter any other important details"></textarea>
                </div>
            </div>
        </div>
    );
};

const Exchange = () => {
    const [oldProduct, setOldProduct] = useState(null);
    const [newProduct, setNewProduct] = useState(null); // Track selected new product

    const Oldproducts = [
        { name: 'TV', image: 'icon-tv.png' },
        { name: 'Refrigerator', image: 'icon-refrigerator.png' },
        { name: 'AC', image: 'icon-ac.png' },
        { name: 'Washer & Dryer', image: 'icon-washer.png' },
        { name: 'Chest Freezer', image: 'icon-freezer.png' },
    ];

    const NewProducts = [
        { name: 'TV', image: 'icon-tv.png' },
        { name: 'Refrigerator', image: 'icon-refrigerator.png' },
        { name: 'AC', image: 'icon-ac.png' },
    ];

    const handleProductClick = (product) => {
        setOldProduct(product);
        setNewProduct(null); // Reset new product selection when changing old product
    };

    const handleNewProductClick = (product) => {
        setNewProduct(product); // Set selected new product
    };

    // Log the updated oldProduct after it changes
    useEffect(() => {
        if (oldProduct) {
            console.log("Selected Old Product: ", oldProduct);
        }
    }, [oldProduct]);

    return (
        <div className="exc-container">
            <div className="old-product-info">
                <h2>Your Old Product</h2>
                {oldProduct ? (
                    <div>
                        <p>You have selected: <strong>{oldProduct.name}</strong></p>
                    </div>
                ) : (
                    <p>No product selected yet</p>
                )}
            </div>

            <div className="exc-header">
                <h1>Exchange</h1>
                <p>Exchange your product with another user</p>
                <h3>Choose your old product</h3>
                <div className="exc-products">
                    {Oldproducts.length > 0 ? (
                        Oldproducts.map((product, index) => (
                            <div
                                key={index}
                                onClick={() => handleProductClick(product)}
                                className={`exc-product ${oldProduct?.name === product.name ? 'selected' : ''}`}
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
                        <h3>Select New Products</h3>
                        <div className="exc-products">
                            {NewProducts.length > 0 ? (
                                NewProducts.map((product, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleNewProductClick(product)}
                                        className={`exc-product ${newProduct?.name === product.name ? 'selected' : ''}`}
                                    >
                                        <img src={product.image} alt={product.name} />
                                        <h4>{product.name}</h4>
                                    </div>
                                ))
                            ) : (
                                <p>No products available for exchange</p>
                            )}
                        </div>
                    </div>
                )}

                {newProduct && (
                    <div className="product-questions">
                        <h3>Provide Details for Selected New Product</h3>
                        {handleProductInfo()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Exchange;
