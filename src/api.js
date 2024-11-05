async function fetchProducts() {
    try {
        const response = await fetch('http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline');
        const data = await response.json();
        
        // Transform the API data to match our structure
        return data.map(product => ({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: parseFloat(product.price || 0),
            image: product.image_link,
            description: product.description,
            rating: product.rating || 0,
            category: product.category || 'Uncategorized',
            productType: product.product_type,
            tags: [
                product.product_type,
                product.category,
                ...product.tag_list || []
            ].filter(Boolean),
            colors: product.product_colors || [],
            apiUrl: product.product_api_url,
            productLink: product.product_link
        }));
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

module.exports = { fetchProducts };