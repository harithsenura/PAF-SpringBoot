import "./ProductCard.css"

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img src={product.image || "/placeholder.svg"} alt={product.name} className="product-image" />
        {product.discount && <span className="discount-badge">{product.discount}% OFF</span>}
      </div>

      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-seller">
          <img src={product.seller.avatar || "/placeholder.svg"} alt={product.seller.name} className="seller-avatar" />
          <span className="seller-name">by {product.seller.name}</span>
        </div>

        <div className="product-price-container">
          {product.originalPrice && <span className="original-price">${product.originalPrice}</span>}
          <span className="current-price">${product.price}</span>
        </div>

        <div className="product-actions">
          <button className="add-to-cart-btn">
            <i className="fas fa-shopping-cart"></i> Add to Cart
          </button>
          <button className="wishlist-btn">
            <i className="far fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
