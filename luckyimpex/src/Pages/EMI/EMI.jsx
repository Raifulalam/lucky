import React, { useState } from 'react';
import './EMI.css';

export default function EMI() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [emiDetails, setEmiDetails] = useState(null);

    // List of products (same as before)
    const items = [
        { name: 'TV', image: 'icon-tv.png', options: ['OLED TV', 'QNED TV', '4K UHD LED TV', 'Smart LED TV', 'Normal LED TV', 'QLED TV'], brands: ['Samsung', 'LG', 'GC', 'Whirlpool'] },
        { name: 'Refrigerator', image: 'icon-refrigerator.png', options: ['Single Door Refrigerator', 'Double Door Refrigerator', 'Side By Side Refrigerator', 'Multi Door Refrigerator'], brands: ['Samsung', 'LG', 'GC', 'Whirlpool'] },
        { name: 'AC', image: 'icon-ac.png', options: ['Ceiling Cassette Split Type', 'Wall Mount Split Type AC', 'Floor Standing'], brands: ['Samsung', 'LG', 'GC'] },
        { name: 'Washing Machine', image: 'icon-washing-machine.png', options: ['Twin Tub Washing Machine', 'Top Loading Washing Machine', 'Front Loading Washing Machine'], brands: ['LG', 'Samsung', 'Haier'] },
        { name: 'Washer & Dryer', image: 'icon-washer.png', options: [], brands: ['Samsung'] },
        { name: 'Chest Freezer', image: 'icon-freezer.png', options: [], brands: ['Samsung', 'Hyundai'] },
    ];

    // EMI Calculation function (same as before)
    const calculateEMI = (principal, rate, months) => {
        const monthlyRate = rate / 12 / 100; // Convert annual rate to monthly
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        return emi.toFixed(2); // Round to 2 decimal places
    };

    // Handle product selection
    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setSelectedOption(null);
        setSelectedBrand(null);
        setEmiDetails(null);
    };


    // Handle option selection (for products with options)
    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    // Handle brand selection
    const handleBrandSelect = (brand) => {
        setSelectedBrand(brand);
        fetchEMIDetails(selectedProduct.name, selectedOption, brand);
    };

    // Fetch EMI details from the backend
    const fetchEMIDetails = async (product, option, brand) => {
        try {
            // Ensure the selected product, option, and brand match what is available in the backend
            const productData = items.find((item) => item.name === product);

            if (!productData) {
                console.error('Product not found!');
                return;
            }

            // Check if the selected option and brand are valid for the selected product
            if (
                (productData.options.length && !option) ||
                !productData.brands.includes(brand)
            ) {
                console.error('Invalid option or brand for the selected product.');
                return;
            }

            // Build the query string with selected product, option, and brand
            const query = new URLSearchParams({
                product,
                option: option || '', // Handle case when option is not selected
                brand,
            }).toString();

            // Replace with actual API endpoint
            const response = await fetch(`https://lucky-back-2.onrender.com/api/products?${query}`, {
                method: 'GET',
            });

            const data = await response.json();

            if (response.ok) {
                // Assuming response contains EMI details (price, interest rate, tenure, etc.)
                const emi = calculateEMI(data.price, data.rate, data.tenure);
                setEmiDetails({
                    emi,
                    rate: data.rate,
                    price: data.price,
                    months: data.tenure,
                });
            } else {
                console.error('Failed to fetch EMI details', data);
            }
        } catch (error) {
            console.error('Error fetching EMI details:', error);
        }
    };

    return (
        <div className='emi-container'>
            <h3>Choose the product for EMI</h3>
            <section>
                <div className="emi-card">
                    <div className="thm-container">
                        {items.map((item) => (
                            <div
                                key={item.name}
                                className="product-card"
                                onClick={() => handleProductClick(item)}
                            >
                                <img src={item.image} alt={item.name} />
                                <p>{item.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedProduct && (
                    <div className="thr-container">
                        <h4>Choose a type for {selectedProduct.name}</h4>
                        <div className="product-options">
                            {selectedProduct.options.length > 0 ? (
                                selectedProduct.options.map((option) => (
                                    <div
                                        key={option}
                                        className={`product-option ${selectedOption === option ? 'selected' : ''}`}
                                        onClick={() => handleOptionSelect(option)}
                                    >
                                        <p>{option}</p>
                                        <input type="radio" name={selectedProduct.name} />
                                    </div>
                                ))
                            ) : (
                                <p>No options available for this product.</p>
                            )}
                        </div>
                    </div>
                )}

                {selectedOption && (
                    <div className="emi-type-container">
                        <h4>Choose a brand for {selectedProduct.name}</h4>
                        <div className="product-options">
                            {selectedProduct.brands.length > 0 ? (
                                selectedProduct.brands.map((brand) => (
                                    <div
                                        key={brand}
                                        className={`product-option ${selectedBrand === brand ? 'selected' : ''}`}
                                        onClick={() => handleBrandSelect(brand)}
                                    >
                                        <p>{brand}</p>
                                        <input type="radio" name={selectedProduct.name} />
                                    </div>
                                ))
                            ) : (
                                <p>No brands available for this product.</p>
                            )}
                        </div>
                    </div>
                )}

                {emiDetails && (
                    <div className="emi-details">
                        <h4>EMI Details for {selectedProduct.name}</h4>
                        <p><strong>Product Price:</strong> ₹{emiDetails.price}</p>
                        <p><strong>EMI Amount:</strong> ₹{emiDetails.emi} per month</p>
                        <p><strong>Rate of Interest:</strong> {emiDetails.rate}% annually</p>
                        <p><strong>Tenure:</strong> {emiDetails.months} months</p>
                    </div>
                )}
            </section>
        </div>
    );
}
