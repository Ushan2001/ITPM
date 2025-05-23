import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Image } from "primereact/image";
import { ConfirmDialog } from "primereact/confirmdialog";
import config from "../../../config/index";
import "./style.css";

const SellerOrders = () => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [processing, setProcessing] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    paymentStatus: null,
  });
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/order/seller`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        calculateMetrics(data);
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

  const calculateMetrics = (ordersData) => {
    const metrics = {
      totalOrders: ordersData.length,
      pendingOrders: ordersData.filter((order) => order.status === "pending")
        .length,
      completedOrders: ordersData.filter(
        (order) => order.status === "delivered"
      ).length,
      totalRevenue: ordersData.reduce((sum, order) => sum + order.subAmount, 0),
    };
    setMetrics(metrics);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(value);
  };

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const statusFilterOptions = [
    { label: "All Statuses", value: null },
    ...statusOptions,
  ];

  const paymentStatusOptions = [
    { label: "All Payment Statuses", value: null },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
  ];

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

  const openStatusUpdateDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);

    setStatusDialog(true);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setProcessing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/v1/order/${selectedOrder._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Order status updated successfully",
          life: 3000,
        });
        setStatusDialog(false);
        fetchOrders();
      } else {
        const errorData = await response.json();
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: errorData.message || "Failed to update order status",
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
      console.error("Error updating order status:", error);
    } finally {
      setProcessing(false);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailsDialog(true);
  };

  const filteredOrders = orders.filter((order) => {
    return (
      (!filters.status || order.status === filters.status) &&
      (!filters.paymentStatus || order.paymentStatus === filters.paymentStatus)
    );
  });

  const productTemplate = (rowData) => {
    if (!rowData.productId) return null;
    return (
      <div className="product-cell">
        <span className="product-name">{rowData.productId.title}</span>
      </div>
    );
  };

  const customerTemplate = (rowData) => {
    return (
      <div className="customer-cell">
        <span className="customer-name">{rowData.userId.name}</span>
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
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning p-button-outlined"
          onClick={() => openStatusUpdateDialog(rowData)}
          tooltip="Update Status"
          disabled={
            rowData.status === "delivered" || rowData.status === "cancelled"
          }
        />
      </div>
    );
  };

  const statusFilterHeader = (options) => {
    return (
      <div className="filter-header">
        <span>Status</span>
        <Dropdown
          value={filters.status}
          options={statusFilterOptions}
          onChange={(e) => setFilters({ ...filters, status: e.value })}
          placeholder="All Statuses"
          className="p-column-filter"
        />
      </div>
    );
  };

  const paymentFilterHeader = (options) => {
    return (
      <div className="filter-header">
        <span>Payment</span>
        <Dropdown
          value={filters.paymentStatus}
          options={paymentStatusOptions}
          onChange={(e) => setFilters({ ...filters, paymentStatus: e.value })}
          placeholder="All Payment Statuses"
          className="p-column-filter"
        />
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
      {selectedOrder &&
        selectedOrder.status !== "delivered" &&
        selectedOrder.status !== "cancelled" && (
          <Button
            label="Update Status"
            icon="pi pi-pencil"
            onClick={() => {
              setDetailsDialog(false);
              openStatusUpdateDialog(selectedOrder);
            }}
            className="p-button-warning"
          />
        )}
    </div>
  );

  const statusDialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setStatusDialog(false)}
        className="p-button-text"
        disabled={processing}
      />
      <Button
        label="Update Status"
        icon="pi pi-check"
        onClick={updateOrderStatus}
        loading={processing}
        className="p-button-warning"
      />
    </div>
  );

  const MetricsCards = () => (
    <div className="metrics-container">
      <div className="metric-card total-orders">
        <i className="pi pi-shopping-cart"></i>
        <div className="metric-content">
          <span className="metric-value">{metrics.totalOrders}</span>
          <span className="metric-label">Total Orders</span>
        </div>
      </div>
      <div className="metric-card pending-orders">
        <i className="pi pi-clock"></i>
        <div className="metric-content">
          <span className="metric-value">{metrics.pendingOrders}</span>
          <span className="metric-label">Pending Orders</span>
        </div>
      </div>
      <div className="metric-card completed-orders">
        <i className="pi pi-check-circle"></i>
        <div className="metric-content">
          <span className="metric-value">{metrics.completedOrders}</span>
          <span className="metric-label">Completed Orders</span>
        </div>
      </div>
      <div className="metric-card total-revenue">
        <i className="pi pi-money-bill"></i>
        <div className="metric-content">
          <span className="metric-value">
            {formatCurrency(metrics.totalRevenue)}
          </span>
          <span className="metric-label">Total Revenue</span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="seller-orders-container">
        <Toast ref={toast} />
        <ConfirmDialog />

        <h1 className="page-title">Seller Dashboard</h1>

        <MetricsCards />

        <Card
          title="Order Management"
          subTitle="View and manage customer orders"
          className="orders-card"
        >
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
                  <p>You haven't received any orders yet.</p>
                </div>
              ) : (
                <DataTable
                  value={filteredOrders}
                  paginator
                  rows={10}
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
                  <Column
                    field="userId.name"
                    header="Customer"
                    body={customerTemplate}
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
                    header={statusFilterHeader}
                    body={statusTemplate}
                    sortable
                  />
                  <Column
                    field="paymentStatus"
                    header={paymentFilterHeader}
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

              <div className="order-customer-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Customer Name:</span>
                    <span className="info-value">
                      {selectedOrder.userId.name}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Billing Address:</span>
                    <span className="info-value">{selectedOrder.address}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Delivery Address:</span>
                    <span className="info-value">
                      {selectedOrder.deliveryAddress || selectedOrder.address}
                    </span>
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
            </div>
          )}
        </Dialog>

        <Dialog
          header="Update Order Status"
          visible={statusDialog}
          style={{ width: "450px" }}
          footer={statusDialogFooter}
          onHide={() => setStatusDialog(false)}
        >
          {selectedOrder && (
            <div className="status-update-form">
              <div className="form-field">
                <label htmlFor="current-status">Current Status</label>
                <Tag
                  severity={getStatusSeverity(selectedOrder.status)}
                  value={
                    selectedOrder.status.charAt(0).toUpperCase() +
                    selectedOrder.status.slice(1)
                  }
                  className="status-tag"
                />
              </div>

              <div className="form-field">
                <label htmlFor="new-status">New Status</label>
                <Dropdown
                  id="new-status"
                  value={newStatus}
                  options={statusOptions}
                  onChange={(e) => setNewStatus(e.value)}
                  className="w-full"
                  disabled={processing}
                />
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default SellerOrders;
