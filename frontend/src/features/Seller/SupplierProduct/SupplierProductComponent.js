import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Skeleton } from "primereact/skeleton";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import config from "../../../config/index";

export default function SupplierProductComponent({ selectedSupplierId }) {
  const [suppliersProduct, setSuppliersProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    fetchSuppliersBySupplierId(selectedSupplierId);
  }, [selectedSupplierId]);

  const fetchSuppliersBySupplierId = async (selectedSupplierId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/v1/supplier-product/${selectedSupplierId}`,
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
      setSuppliersProduct(data.products);
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

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsDialogVisible(true);
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: "Are you sure you want to delete this supplier's product?",
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      accept: () => deleteSupplier(id),
    });
  };

  const deleteSupplier = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${config.apiUrl}/api/v1/supplier-product//${id}`, {
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
      fetchSuppliersBySupplierId(selectedSupplierId);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete supplier",
      });
    }
  };

  const updateSupplierProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/v1/supplier-product/${selectedProduct._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedProduct),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update supplier product");
      }
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Supplier product updated successfully",
      });
      setIsDialogVisible(false);
      fetchSuppliersBySupplierId(selectedSupplierId);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
      });
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-mr-2"
          onClick={() => handleEdit(rowData)}
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
            value={suppliersProduct}
            paginator
            rows={10}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            responsiveLayout="scroll"
            emptyMessage="No supplier's product added yet."
            loading={loading}
            header="SUPPLIER'S PRODUCT LIST"
          >
            <Column field="name" header="Name" sortable />
            <Column field="price" header=" Unit Price" />
            <Column field="sku" header="SKU" />
            <Column field="quantity" header="Quantity" />
            <Column field="publishDate" header="Publish Date" />
            <Column field="status" header="Status" body={statusBodyTemplate} />
            <Column body={actionBodyTemplate} header="Actions" />
          </DataTable>
        )}
      </div>
      <Dialog
        visible={isDialogVisible}
        style={{ width: "450px" }}
        header="Edit Supplier Product"
        modal
        footer={
          <div>
            <Button
              label="Cancel"
              onClick={() => setIsDialogVisible(false)}
              className="p-button-text"
            />
            <Button
              label="Save"
              onClick={updateSupplierProduct}
              className="p-button-primary"
            />
          </div>
        }
        onHide={() => setIsDialogVisible(false)}
      >
        {selectedProduct && (
          <div className="p-fluid">
            <div className="p-field">
              <label>Name</label>
              <InputText
                value={selectedProduct.name}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="p-field">
              <label>Price</label>
              <InputNumber
                value={selectedProduct?.price ?? 0}
                onValueChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    price: e.value ?? 0,
                  })
                }
                mode="currency"
                currency="LKR"
                locale="en-US"
              />
            </div>

            <div className="p-field">
              <label>Quantity</label>
              <InputNumber
                value={selectedProduct.quantity}
                onValueChange={(e) =>
                  setSelectedProduct({ ...selectedProduct, quantity: e.value })
                }
              />
            </div>
          </div>
        )}
      </Dialog>
      <Toast ref={toast} />
    </div>
  );
}
