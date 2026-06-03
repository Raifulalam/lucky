import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import './Details.css';
import '../../Components/Modal.css'
import useGoBack from '../../hooks/useGoback';
import { BASE_URL } from '../../api/api';
import PageSeo from '../../Components/PageSeo';
import { buildCatalogCacheKey, readCatalogCache, writeCatalogCache } from '../../utils/catalogCache';

const PhoneDetails = () => {
    const { id } = useParams(); // Get the product ID from URL
    const goBack = useGoBack();

    const { data: productData, error, isLoading } = useQuery({
        queryKey: ["mobile-product-details", id],
        queryFn: async ({ signal }) => {
            const cacheKey = buildCatalogCacheKey("mobile-product-details", id);
            const cached = await readCatalogCache(cacheKey);

            try {
                const response = await fetch(`${BASE_URL}/mobiles/mobile/${id}`, { signal });
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Product not found');
                    }
                    throw new Error('Failed to fetch product details');
                }
                const data = await response.json();
                await writeCatalogCache(cacheKey, data.data);
                return data.data;
            } catch (err) {
                if (cached) return cached;
                throw err;
            }
        },
        staleTime: 5 * 60 * 1000,
    });


    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>


            </div>
        );
    }

    if (error) {
        return <div className="error">{error.message}</div>; // Display error message if product is not found or any other error occurs
    }

    // Construct the full image path from the relative path
    const imageUrl = productData?.image ? `${productData.image}` : 'https://via.placeholder.com/150';

    return (
        <div className="product-detail-container">
            <button onClick={goBack}>⬅ Back</button>
            <PageSeo
                title={productData?.name || "Phone Details"}
                description={`Buy ${productData?.name || "this phone"} from Lucky Impex.`}
                canonicalPath={`/phonedetails/${productData?.slug || id}`}
                image={productData?.image || undefined}
            />

            <div className="product-details-content">

                <div className="product-image-container">
                    <img
                        className="detailsProduct-image"
                        src={imageUrl}
                        alt={productData?.name || 'Product Image'}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150';
                        }}
                    />
                </div>

                <div className="detailsProduct-info-container">
                    <h3>{productData.name}</h3>
                    <p className="mrp"><strong>MRP:</strong> {productData.price}</p>
                    <p><strong>Model:</strong> {productData.model}</p>
                    <p><strong>Brand:</strong> {productData.brand}</p>
                    <p><strong>Display:</strong> {productData.display}</p>
                    <p><strong>RAM:</strong> {productData.ram} GB</p>
                    <p><strong>Storage:</strong> {productData.storage} GB</p>
                    <p><strong>Battery:</strong> {productData.battery}</p>
                    <p><strong>Processor:</strong> {productData.processor}</p>
                    <p><strong>Operating System:</strong> {productData.operatingSystem || 'N/A'}</p>
                    <p><strong>Charging:</strong> {productData.charging}</p>
                    <p className="product-color"><strong>Color:</strong> {productData.color || 'N/A'}</p>
                    <p><strong>Specifications:</strong> {productData.description}</p>




                </div>
            </div>
        </div>
    );
};

export default PhoneDetails;
