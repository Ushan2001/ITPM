import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { Paginator } from "primereact/paginator";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import config from "../../../config/index";
import "./style.css";
import NavBar from "../../../pages/NavBar";
import { useLocation } from "react-router-dom";

const ProductPage = () => {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(8);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortOption, setSortOption] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const location = useLocation();
  const sellerId = location.state?.sellerId;
  const navigate = useNavigate();

  console.log("sellerId", sellerId);

  const sortOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Price: Low to High", value: "priceAsc" },
    { label: "Price: High to Low", value: "priceDesc" },
    { label: "Name: A-Z", value: "nameAsc" },
    { label: "Name: Z-A", value: "nameDesc" },
  ];

  useEffect(() => {
    if (sellerId) {
      fetchProducts(sellerId);
    }
  }, [sellerId]);

  useEffect(() => {
    let result = [...product];
    if (searchQuery) {
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter(
        (product) => product.categoryType === selectedCategory
      );
    }

    switch (sortOption) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(`${b.publishDate} ${b.publishTime}`) -
            new Date(`${a.publishDate} ${a.publishTime}`)
        );
        break;
      case "priceAsc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "nameAsc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "nameDesc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setTotalRecords(result.length);
  }, [product, searchQuery, sortOption, selectedCategory]);

  const fetchProducts = async (sellerId) => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const response = await fetch(
        `${config.apiUrl}/api/v1/inventory/buyer/${sellerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setProduct(data);

      const uniqueCategories = [
        ...new Set(data.map((product) => product.categoryType)),
      ];
      setCategories(
        uniqueCategories.map((category) => ({
          label: category,
          value: category,
        }))
      );

      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const getStockStatus = (quantity) => {
    if (quantity > 10) {
      return { label: "In Stock", severity: "success" };
    } else if (quantity > 0) {
      return { label: "Low Stock", severity: "warning" };
    } else {
      return { label: "Out of Stock", severity: "danger" };
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(value);
  };

  const header = (
    <div className="product-page-header">
      <h2>Discover Quality Products</h2>

      <div className="filter-container">
        <div className="search-box">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </span>
        </div>

        <div className="filter-controls">
          <Dropdown
            value={selectedCategory}
            options={[{ label: "All Categories", value: null }, ...categories]}
            onChange={(e) => setSelectedCategory(e.value)}
            placeholder="Select Category"
            className="category-dropdown"
          />

          <Dropdown
            value={sortOption}
            options={sortOptions}
            onChange={(e) => setSortOption(e.value)}
            placeholder="Sort By"
            className="sort-dropdown"
          />
        </div>
      </div>
    </div>
  );

  const renderProductCards = () => {
    const currentProducts = filteredProducts.slice(first, first + rows);

    if (loading) {
      return <div className="loading">Loading products...</div>;
    }

    if (currentProducts.length === 0) {
      return <div className="no-products">No products found</div>;
    }

    return (
      <div className="product-grid">
        {currentProducts.map((product) => {
          const stockStatus = getStockStatus(product.quantity);

          const footer = (
            <div className="product-card-footer">
              <Button
                label="Add to Cart"
                icon="pi pi-shopping-cart"
                className="p-button-rounded"
                onClick={() => navigate("/add-order", { state: { product } })}
                style={{
                  paddingTop: "8%",
                  paddingBottom: "8%",
                }}
              />
              <Button
                label="View Details"
                icon="pi pi-eye"
                className="p-button-rounded p-button-outlined"
                style={{
                  paddingTop: "8%",
                  paddingBottom: "8%",
                }}
              />
            </div>
          );

          const sellerName =
            product.addedBy && product.addedBy.name
              ? product.addedBy.name
              : "Unknown";

          return (
            <Card key={product._id} className="product-card" footer={footer}>
              <div className="product-image-container">
                <img
                  src={`${config.apiUrl}/api/v1/uploads/image/product/${product.productPic}`}
                  alt={product.title}
                  className="product-image"
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/300x300?text=No+Image")
                  }
                />
                <Badge
                  value={stockStatus.label}
                  severity={stockStatus.severity}
                  className="stock-badge"
                />
              </div>
              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-details">
                  <span className="product-price">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="product-sku">SKU: {product.sku}</span>
                </div>
                <div className="product-meta">
                  <span className="product-category">
                    {product.categoryType}
                  </span>
                  <span className="product-seller">Seller: {sellerName}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginTop: "-5%" }}>
        <NavBar />
      </div>
      <div className="product-page-container">
        {header}
        {renderProductCards()}
        <Paginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          rowsPerPageOptions={[4, 8, 12, 16]}
          onPageChange={onPageChange}
          className="product-paginator"
        />
      </div>
    </div>
  );
};

export default ProductPage;
