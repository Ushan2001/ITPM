import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { Image } from "primereact/image";
import { ProgressSpinner } from "primereact/progressspinner";
import NavBar from "../../../pages/NavBar";
import config from "../../../config/index";
import "./style.css";

const AddOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState({
    productId: "",
    unitAmount: 0,
    quantity: 1,
    subAmount: 0,
    sellerId: "",
    address: "",
    deliveryAddress: "",
    status: "pending",
    paymentStatus: "pending",
  });
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (location.state && location.state.product) {
      const productData = location.state.product;
      setProduct(productData);

      setOrderData({
        ...orderData,
        productId: productData._id,
        unitAmount: productData.price,
        subAmount: productData.price,
        sellerId: productData.addedBy?._id || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    const calculatedSubAmount = orderData.quantity * orderData.unitAmount;

    if (calculatedSubAmount !== orderData.subAmount) {
      setOrderData((prevState) => ({
        ...prevState,
        subAmount: calculatedSubAmount,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData.quantity, orderData.unitAmount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData({
      ...orderData,
      [name]: value,
    });
  };

  const handleNumberChange = (e, field) => {
    setOrderData((prevState) => ({
      ...prevState,
      [field]: e.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Order Placed!",
          detail: "Your order has been placed successfully!",
          life: 3000,
        });
        setTimeout(() => navigate("/my-orders"), 3000);
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: data.message || "Failed to place order",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An unexpected error occurred",
        life: 3000,
      });
      console.error("Error placing order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="loading-container">
        <ProgressSpinner />
        <h3>Loading product information...</h3>
      </div>
    );
  }

  const headerContent = (
    <div className="order-header">
      <h2>Complete Your Order</h2>
      <p>Please review and confirm your order details below</p>
    </div>
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(value);
  };

  return (
    <div>
      <div style={{ marginTop: "-5%" }}>
        <NavBar />
      </div>
      <div className="add-order-container">
        <Toast ref={toast} />

        <Card className="order-card" header={headerContent}>
          <div className="order-content">
            <div className="product-summary">
              <h3>Product Information</h3>
              <div className="product-details-container">
                <div className="order-product-image-container">
                  <Image
                    src={`${config.apiUrl}/api/v1/uploads/image/product/${product.productPic}`}
                    alt={product.title}
                    imageClassName="order-product-preview-image"
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/300x300?text=No+Image")
                    }
                  />
                </div>
                <div className="product-details">
                  <h4>{product.title}</h4>
                  <p className="product-description">{product.description}</p>
                  <div className="product-meta">
                    <span>
                      <i className="pi pi-tag"></i> {product.categoryType}
                    </span>
                    <span>
                      <i className="pi pi-credit-card"></i>{" "}
                      {formatCurrency(product.price)} per unit
                    </span>
                    <span>
                      <i className="pi pi-box"></i> SKU: {product.sku}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            <form onSubmit={handleSubmit} className="order-form">
              <div className="order-fields-container">
                <div className="order-column">
                  <h3>Order Details</h3>

                  <div className="form-field">
                    <label htmlFor="quantity">Quantity</label>
                    <InputNumber
                      id="quantity"
                      value={orderData.quantity}
                      onValueChange={(e) => handleNumberChange(e, "quantity")}
                      showButtons
                      min={1}
                      max={product.quantity || 99}
                    />
                  </div>

                  <div className="form-field price-summary">
                    <div className="price-item">
                      <span>Unit Price:</span>
                      <span>{formatCurrency(orderData.unitAmount)}</span>
                    </div>
                    <div className="price-item">
                      <span>Quantity:</span>
                      <span>× {orderData.quantity}</span>
                    </div>
                    <Divider />
                    <div className="price-item total">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(orderData.subAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-column">
                  <h3>Shipping Information</h3>

                  <div className="form-field">
                    <label htmlFor="address">Billing Address</label>
                    <InputText
                      id="address"
                      name="address"
                      value={orderData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="deliveryAddress">Delivery Address</label>
                    <InputText
                      id="deliveryAddress"
                      name="deliveryAddress"
                      value={orderData.deliveryAddress}
                      onChange={handleInputChange}
                      placeholder="Same as billing address if left empty"
                      className="w-full"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="paymentStatus">Payment Method</label>
                    <Dropdown
                      id="paymentStatus"
                      name="paymentStatus"
                      value={orderData.paymentStatus}
                      options={[
                        { label: "Pay Later", value: "pending" },
                        { label: "Pay Now", value: "completed" },
                      ]}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="order-actions">
                <Button
                  label="Cancel"
                  icon="pi pi-times"
                  className="p-button-outlined p-button-danger"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                />
                <Button
                  type="submit"
                  label="Place Order"
                  icon="pi pi-check"
                  className="p-button-success"
                  loading={loading}
                />
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AddOrder;
