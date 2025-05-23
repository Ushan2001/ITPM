import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Image } from "primereact/image";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config/index";
import NavBar from "../../../pages/NavBar";
import "./style.css";

const MyOrders = () => {
  const navigate = useNavigate();
  const toast = useRef(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/order/buyer`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        const errorData = await response.json();
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: errorData.message || "Failed to fetch orders",
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
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(value);
  };

  const getStatusSeverity = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "shipped":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPaymentStatusSeverity = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "completed":
        return "success";
      case "refunded":
        return "info";
      case "failed":
        return "danger";
      default:
        return "secondary";
    }
  };

  const handleCancelOrder = (orderId) => {
    confirmDialog({
      message: "Are you sure you want to cancel this order?",
      header: "Cancel Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => cancelOrder(orderId),
    });
  };

  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/v1/order/${orderId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Order cancelled successfully",
          life: 3000,
        });
        fetchOrders();
      } else {
        const errorData = await response.json();
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: errorData.message || "Failed to cancel order",
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
      console.error("Error cancelling order:", error);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailsDialog(true);
  };

  const goToMyReport = () => {
    navigate("/my-report");
  };

  const productTemplate = (rowData) => {
    return (
      <div className="product-cell">
        <span className="product-name">
          {rowData.productId?.title || "No Product Available"}
        </span>
      </div>
    );
  };

  const statusTemplate = (rowData) => {
    return (
      <Tag
        severity={getStatusSeverity(rowData.status)}
        value={rowData.status.charAt(0).toUpperCase() + rowData.status.slice(1)}
      />
    );
  };

  const paymentStatusTemplate = (rowData) => {
    return (
      <Tag
        severity={getPaymentStatusSeverity(rowData.paymentStatus)}
        value={
          rowData.paymentStatus.charAt(0).toUpperCase() +
          rowData.paymentStatus.slice(1)
        }
      />
    );
  };

  const amountTemplate = (rowData) => {
    return formatCurrency(rowData.subAmount);
  };

  const dateTemplate = (rowData) => {
    return (
      <div>
        <div>{rowData.orderDate}</div>
        <div className="text-sm text-gray-500">{rowData.orderTime}</div>
      </div>
    );
  };

  const actionsTemplate = (rowData) => {
    return (
      <div className="order-actions-cell">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-info p-button-outlined p-mr-2"
          onClick={() => viewOrderDetails(rowData)}
          tooltip="View Details"
        />
        {rowData.status === "pending" && (
          <Button
            icon="pi pi-times"
            className="p-button-rounded p-button-danger p-button-outlined"
            onClick={() => handleCancelOrder(rowData._id)}
            tooltip="Cancel Order"
          />
        )}
      </div>
    );
  };

  const dialogFooter = (
    <div>
      <Button
        label="Close"
        icon="pi pi-times"
        onClick={() => setDetailsDialog(false)}
        className="p-button-text"
      />
      {selectedOrder && selectedOrder.status === "pending" && (
        <Button
          label="Cancel Order"
          icon="pi pi-times"
          onClick={() => {
            setDetailsDialog(false);
            handleCancelOrder(selectedOrder._id);
          }}
          className="p-button-danger"
        />
      )}
    </div>
  );

  return (
    <div>
      <div style={{ marginTop: "-5%" }}>
        <NavBar />
      </div>
      <div className="my-orders-container">
        <Toast ref={toast} />
        <ConfirmDialog />

        <Card
          title="My Orders"
          subTitle="View and manage your order history"
          className="orders-card"
        >
          <div className="flex justify-end mb-4">
            <Button onClick={goToMyReport}>
              <i className="pi pi-file" />
              <span className="ml-2">Report</span>
            </Button>
          </div>

          {loading ? (
            <div className="loading-container">
              <ProgressSpinner />
              <h3>Loading orders...</h3>
            </div>
          ) : (
            <div>
              {orders.length === 0 ? (
                <div className="empty-orders">
                  <i className="pi pi-shopping-cart empty-icon"></i>
                  <h3>No Orders Found</h3>
                  <p>You haven't placed any orders yet.</p>
                  <Button
                    label="Browse Products"
                    icon="pi pi-search"
                    onClick={() => navigate("/buyer-product")}
                  />
                </div>
              ) : (
                <DataTable
                  value={orders}
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10, 25]}
                  className="orders-table"
                  emptyMessage="No orders found"
                  responsiveLayout="scroll"
                >
                  <Column
                    field="productId.title"
                    header="Product"
                    body={productTemplate}
                    sortable
                  />
                  <Column field="quantity" header="Quantity" sortable />
                  <Column
                    field="subAmount"
                    header="Amount"
                    body={amountTemplate}
                    sortable
                  />
                  <Column
                    field="orderDate"
                    header="Order Date"
                    body={dateTemplate}
                    sortable
                  />
                  <Column
                    field="status"
                    header="Status"
                    body={statusTemplate}
                    sortable
                  />
                  <Column
                    field="paymentStatus"
                    header="Payment"
                    body={paymentStatusTemplate}
                    sortable
                  />
                  <Column
                    body={actionsTemplate}
                    headerStyle={{ width: "10em" }}
                  />
                </DataTable>
              )}
            </div>
          )}
        </Card>

        <Dialog
          header="Order Details"
          visible={detailsDialog}
          style={{ width: "90%", maxWidth: "800px" }}
          footer={dialogFooter}
          onHide={() => setDetailsDialog(false)}
        >
          {selectedOrder && (
            <div className="order-details-dialog">
              <div className="order-info-section">
                <h3>Order Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Order ID:</span>
                    <span className="info-value">{selectedOrder._id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date:</span>
                    <span className="info-value">
                      {selectedOrder.orderDate} at {selectedOrder.orderTime}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <Tag
                      severity={getStatusSeverity(selectedOrder.status)}
                      value={
                        selectedOrder.status.charAt(0).toUpperCase() +
                        selectedOrder.status.slice(1)
                      }
                    />
                  </div>
                  <div className="info-item">
                    <span className="info-label">Payment Status:</span>
                    <Tag
                      severity={getPaymentStatusSeverity(
                        selectedOrder.paymentStatus
                      )}
                      value={
                        selectedOrder.paymentStatus.charAt(0).toUpperCase() +
                        selectedOrder.paymentStatus.slice(1)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="order-product-section">
                <h3>Product Details</h3>
                <div className="product-details-container">
                  <div className="product-image-container">
                    <Image
                      src={`${config.apiUrl}/api/v1/uploads/image/product/${selectedOrder.productId.productPic}`}
                      alt={selectedOrder.productId.title}
                      imageClassName="product-preview-image"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/150x150?text=No+Image")
                      }
                    />
                  </div>
                  <div className="product-info">
                    <h4>{selectedOrder.productId.title}</h4>
                    <div className="product-meta">
                      <div className="meta-item">
                        <span className="meta-label">Seller:</span>
                        <span className="meta-value">
                          {selectedOrder.sellerId.name}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Unit Price:</span>
                        <span className="meta-value">
                          {formatCurrency(selectedOrder.unitAmount)}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Quantity:</span>
                        <span className="meta-value">
                          {selectedOrder.quantity}
                        </span>
                      </div>
                      <div className="meta-item total">
                        <span className="meta-label">Total Amount:</span>
                        <span className="meta-value">
                          {formatCurrency(selectedOrder.subAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-shipping-section">
                <h3>Shipping Information</h3>
                <div className="shipping-details">
                  <div className="address-item">
                    <span className="address-label">Billing Address:</span>
                    <span className="address-value">
                      {selectedOrder.address}
                    </span>
                  </div>
                  <div className="address-item">
                    <span className="address-label">Delivery Address:</span>
                    <span className="address-value">
                      {selectedOrder.deliveryAddress || selectedOrder.address}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default MyOrders;
