import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config/index";

export default function ProductComponent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductsBySellerId();
  }, []);

  const fetchProductsBySellerId = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/v1/product/seller-by`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch product data");
      }
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error to fetch product data", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
      });
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`);
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: "Are you sure you want to delete this product?",
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      accept: () => deleteProduct(id),
    });
  };

  const deleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${config.apiUrl}/api/v1/product/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Product deleted successfully",
      });
      fetchProductsBySellerId(); // ✅ Fixed function call
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete product",
      });
    }
  };

  const imageBodyTemplate = (rowData) => {
    return (
      <img
        src={`${config.apiUrl}/api/v1/uploads/image/product/${rowData.productPic}`}
        alt="Profile"
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: "inline-flex", alignItems: "center" }}>
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
            value={products}
            paginator
            rows={10}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            responsiveLayout="scroll"
            emptyMessage="No products added yet."
            loading={loading}
            header="Products LIST"
          >
            <Column
              field="productPic"
              header="Product Picture"
              body={imageBodyTemplate}
            />
            <Column field="title" header="title" sortable />
            <Column field="description" header="description" />
            <Column field="price" header="price" />
            <Column field="quantity" header="quantity" />
            <Column field="categoryType" header="categoryType" />
            <Column field="publishDate" header="Publish Date" />
            <Column field="status" header="Status" body={statusBodyTemplate} />
            <Column body={actionBodyTemplate} header="Actions" />
          </DataTable>
        )}
      </div>

      <Toast ref={toast} />
    </div>
  );
}
