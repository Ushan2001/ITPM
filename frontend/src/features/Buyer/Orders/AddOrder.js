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
  const [orderId, setOrderId] = useState("");
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
  const [hash, setHash] = useState("");
  const [user, setUser] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

  const fetchaUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/user/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      setUser(data);
      setLoading(false);
    } catch (error) {
      console.error("Error to fetch user data", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchaUser();
    }
  }, []);

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

  const fetchHash = async (productId, amount) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/payment/generate-hash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant_id: "1226658",
          order_id: productId,
          amount: amount,
          currency: "LKR",
          merchant_secret: "MzQyMDQwNDU0NTE4ODU4NTA2ODAyMTI0NzczNjI2MjUzNzc5NTc5Mg==",
        }),
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
      setHash(data.hash);
      return data.hash;
  
    } catch (error) {
      console.error("Error fetching hash:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to initialize payment",
        life: 3000,
      });
      return null;
    }
  };
  

  console.log("Hash generated:", hash);
  console.log("Order Id:", orderId);

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

  const initiatePayment = async (createdOrderId) => {
    const hashValue = await fetchHash(createdOrderId, orderData.subAmount);

    if (!hashValue || !window.payhere) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Payment service not available",
        life: 3000,
      });
      return;
    }

    const payment = {
      sandbox: true,
      merchant_id: "1226658",
      return_url: `${window.location.origin}/order-confirmation`,
      cancel_url: `${window.location.origin}/my-orders`,
      notify_url: `${config.apiUrl}/api/v1/payments/notify`,
      order_id: createdOrderId,
      items: product.title,
      amount: orderData.subAmount,
      currency: "LKR",
      first_name: user.name || "Customer",
      last_name: user.name || "",
      email: user.email || "customer@example.com",
      phone: user.phoneNo || "0771234567",
      address: orderData.address,
      city: orderData.address.split(",").pop()?.trim() || "Colombo",
      country: "Sri Lanka",
      delivery_address: orderData.deliveryAddress || orderData.address,
      delivery_city:
        orderData.deliveryAddress?.split(",").pop()?.trim() || "Colombo",
      delivery_country: "Sri Lanka",
      custom_1: product._id,
      custom_2: "",
      hash: hashValue,
    };

    window.payhere.onCompleted = function onCompleted(orderId) {
      console.log("Payment completed. OrderID:" + orderId);

      updateOrderPaymentStatus(createdOrderId, "completed");

      toast.current.show({
        severity: "success",
        summary: "Payment Successful",
        detail: "Your payment has been completed successfully!",
        life: 3000,
      });

      setTimeout(() => navigate("/my-orders"), 3000);
    };

    window.payhere.onDismissed = function onDismissed() {
      console.log("Payment dismissed");
      toast.current.show({
        severity: "info",
        summary: "Payment Cancelled",
        detail: "You can complete the payment later from your orders page.",
        life: 3000,
      });
    };

    window.payhere.onError = function onError(error) {
      console.log("Error:" + error);
      toast.current.show({
        severity: "error",
        summary: "Payment Error",
        detail: "There was an error processing your payment. Please try again.",
        life: 3000,
      });
    };

    window.payhere.startPayment(payment);
  };

  const updateOrderPaymentStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${config.apiUrl}/api/v1/order/${orderId}/payment-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentStatus: status }),
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
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
      console.log("Payment initiated for order:", data);

      if (response.ok) {
        if (orderData.paymentStatus === "completed") {
          setOrderId(data.orderId);
          initiatePayment(data.orderId);
        } else {
          toast.current.show({
            severity: "success",
            summary: "Order Placed!",
            detail: "Your order has been placed successfully!",
            life: 3000,
          });
          setTimeout(() => navigate("/my-orders"), 3000);
        }
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

  console.log("User data:", user);

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
                        { label: "Pay Now (PayHere)", value: "completed" },
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
                  label={
                    orderData.paymentStatus === "completed"
                      ? "Place Order & Pay Now"
                      : "Place Order"
                  }
                  icon={
                    orderData.paymentStatus === "completed"
                      ? "pi pi-credit-card"
                      : "pi pi-check"
                  }
                  className={
                    orderData.paymentStatus === "completed"
                      ? "p-button-primary"
                      : "p-button-success"
                  }
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
