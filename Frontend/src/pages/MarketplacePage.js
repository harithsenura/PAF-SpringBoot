"use client"

import { useState } from "react"
import ProductCard from "../components/ProductCard"
import "./MarketplacePage.css"

const MarketplacePage = () => {
  const [activeCategory, setActiveCategory] = useState("all")

  const categories = [
    { id: "all", name: "All Products" },
    { id: "clothing", name: "Clothing" },
    { id: "art", name: "Artwork" },
    { id: "crafts", name: "Handmade Crafts" },
    { id: "digital", name: "Digital Products" },
    { id: "accessories", name: "Accessories" },
  ]

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Hand-painted Batik Shirt",
      category: "clothing",
      price: 45.99,
      originalPrice: 59.99,
      discount: 23,
      image: "/placeholder.svg?key=w34k5",
      seller: {
        name: "Lakshmi Crafts",
        avatar: "/diverse-woman-portrait.png",
      },
    },
    {
      id: 2,
      name: "Digital Illustration - Sri Lankan Landscape",
      category: "art",
      price: 29.99,
      image: "/placeholder.svg?key=of3nz",
      seller: {
        name: "Amal Designs",
        avatar: "/thoughtful-man.png",
      },
    },
    {
      id: 3,
      name: "Handmade Ceramic Tea Set",
      category: "crafts",
      price: 79.99,
      originalPrice: 99.99,
      discount: 20,
      image: "/placeholder.svg?height=300&width=300&query=ceramic tea set handmade",
      seller: {
        name: "Kumari Pottery",
        avatar: "/placeholder.svg?height=25&width=25&query=woman artisan",
      },
    },
    {
      id: 4,
      name: "Digital Marketing E-Book",
      category: "digital",
      price: 12.99,
      image: "/placeholder.svg?height=300&width=300&query=ebook cover digital marketing",
      seller: {
        name: "Dinesh Digital",
        avatar: "/placeholder.svg?height=25&width=25&query=professional man",
      },
    },
    {
      id: 5,
      name: "Handcrafted Silver Jewelry Set",
      category: "accessories",
      price: 89.99,
      originalPrice: 120.99,
      discount: 25,
      image: "/placeholder.svg?height=300&width=300&query=silver jewelry set",
      seller: {
        name: "Silva Jewelers",
        avatar: "/placeholder.svg?height=25&width=25&query=jeweler",
      },
    },
    {
      id: 6,
      name: "Traditional Mask Wall Art",
      category: "art",
      price: 65.99,
      image: "/placeholder.svg?height=300&width=300&query=traditional mask wall art",
      seller: {
        name: "Heritage Crafts",
        avatar: "/placeholder.svg?height=25&width=25&query=craftsman",
      },
    },
    {
      id: 7,
      name: "Hand-woven Basket Set",
      category: "crafts",
      price: 49.99,
      image: "/placeholder.svg?height=300&width=300&query=handwoven basket set",
      seller: {
        name: "Rural Artisans",
        avatar: "/placeholder.svg?height=25&width=25&query=rural woman",
      },
    },
    {
      id: 8,
      name: "Designer Saree - Modern Collection",
      category: "clothing",
      price: 129.99,
      originalPrice: 159.99,
      discount: 18,
      image: "/placeholder.svg?height=300&width=300&query=modern designer saree",
      seller: {
        name: "Priya Fashion",
        avatar: "/fashion-designer-sketching.png",
      },
    },
  ])

  const filteredProducts =
    activeCategory === "all" ? products : products.filter((product) => product.category === activeCategory)

  return (
    <div className="marketplace-page">
      <div className="marketplace-header">
        <h1 className="section-title">Talent Marketplace</h1>
        <p className="marketplace-description">Discover and purchase unique products created by talented individuals</p>
      </div>

      <div className="marketplace-filters">
        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? "active" : ""}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="sort-filter">
          <select className="sort-select">
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default MarketplacePage
