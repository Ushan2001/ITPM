import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Skeleton } from "primereact/skeleton";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import config from "../../../config/index";
import AddSupplierProduct from "../SupplierProduct/AddSupplierProduct";

export default function SupplierComponent() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayAddProductDialog, setDisplayAddProductDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const toast = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliersBySellerId();
  }, []);

  const fetchSuppliersBySellerId = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/v1/supplier/seller-by-id`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch supplier data");
      }
      const data = await response.json();
      setSuppliers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error to fetch supplier data", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
      });
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-category/${id}`);
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: "Are you sure you want to delete this supplier?",
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      accept: () => deleteSupplier(id),
    });
  };

  const deleteSupplier = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${config.apiUrl}/api/v1/supplier/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Supplier deleted successfully",
      });
      fetchSuppliersBySellerId();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete supplier",
      });
    }
  };

  const handleAddProductClick = (rowData) => {
    setSelectedSupplier(rowData);
    setDisplayAddProductDialog(true);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <Button
          icon="pi pi-plus"
          className="p-button-rounded p-button-info mr-2"
          onClick={() => handleAddProductClick(rowData)}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-mr-2"
          onClick={() => handleEdit(rowData._id)}
        />
        &nbsp;
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => handleDelete(rowData._id)}
        />
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <span className={`status-badge status-${rowData.status.toLowerCase()}`}>
        {rowData.status}
      </span>
    );
  };

  return (
    <div>
      <div className="user-management-container">
        {loading ? (
          <div>
            <Skeleton height="3rem" className="mb-3" />
            <br />
            <Skeleton height="3rem" className="mb-3" />
            <br />
            <Skeleton height="3rem" className="mb-3" />
            <br />
          </div>
        ) : (
          <DataTable
            value={suppliers}
            paginator
            rows={10}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            responsiveLayout="scroll"
            emptyMessage="No suppliers added yet."
            loading={loading}
            header="SUPPLIERS LIST"
          >
            <Column field="name" header="Name" sortable />
            <Column field="email" header="Email" />
            <Column field="phoneNo" header="Phone No" />
            <Column field="address" header="Address" />
            <Column field="publishDate" header="Publish Date" />
            <Column field="status" header="Status" body={statusBodyTemplate} />
            <Column body={actionBodyTemplate} header="Actions" />
          </DataTable>
        )}
      </div>
      <AddSupplierProduct
        visible={displayAddProductDialog}
        onHide={() => setDisplayAddProductDialog(false)}
        selectedSupplier={selectedSupplier ? selectedSupplier : null}
      />
      <Toast ref={toast} />
    </div>
  );
}
