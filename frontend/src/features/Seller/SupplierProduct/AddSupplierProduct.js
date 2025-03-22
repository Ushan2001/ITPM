import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import config from "../../../config/index";

export default function AddSupplierProduct({
  visible,
  onHide,
  selectedSupplier,
}) {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    status: "active",
    supplierId: selectedSupplier?._id || "",
  });

  useEffect(() => {
    if (selectedSupplier?._id) {
      setFormData((prev) => ({
        ...prev,
        supplierId: selectedSupplier._id,
      }));
    }
  }, [selectedSupplier]);

  const handleInputChange = (e) => {
    const { name, value } = e.target || e;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const validationErrors = {};
    if (!formData.name) validationErrors.name = "Name is required";
    if (!formData.price) {
      validationErrors.price = "Price is required";
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      validationErrors.price = "Price must be a positive number";
    }
    if (!formData.quantity) {
      validationErrors.quantity = "Quantity is required";
  } else if (!Number.isInteger(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      validationErrors.quantity = "Quantity must be a positive integer";
  }
    if (!formData.status) validationErrors.status = "Status is required";
    if (!formData.supplierId)
      validationErrors.supplierId = "Supplier Id is required";

    if (Object.keys(validationErrors).length > 0) {
      for (let errorKey in validationErrors) {
        toast.current.show({
          severity: "error",
          summary: "Validation Error",
          detail: validationErrors[errorKey],
          life: 3000,
        });
      }
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/v1/supplier-product/${formData.supplierId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Supplier Added",
          detail: "Supplier added successfully!",
          life: 3000,
        });

        setFormData({
          name: "",
          price: "",
          quantity: "",
          status: "active",
          supplierId: selectedSupplier?._id || "",
        });
        setLoading(false);
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: data.message || "Error adding supplier",
          life: 3000,
        });
        setLoading(false);
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while adding supplier",
        life: 3000,
      });
      setLoading(false);
    }
  };

  const footer = (
    <div>
      <Button
        label={loading ? "Saving.." : "Save"}
        icon="pi pi-check"
        onClick={handleSubmit}
        disabled={loading}
      />
    </div>
  );

  return (
    <Dialog
      header={
        <span
          style={{
            color: "#03a6e9",
            fontSize: "22px",
            fontWeight: "lighter",
          }}
        >
          Add Product into Supplier List
        </span>
      }
      visible={visible}
      style={{ width: "60vw" }}
      footer={footer}
      onHide={() => {
        onHide();
        setFormData((prev) => ({
          ...prev,
          name: "",
          price: "",
          quantity: "",
          status: "active",
        }));
      }}
      modal
      maximizable
    >
      <div
        className="p-fluid"
        style={{ marginTop: "20px", marginBottom: "20px" }}
      >
        <div
          className="grid"
          style={{ display: "flex", gap: "20px", width: "100%" }}
        >
          <div className="col-6" style={{ flex: 1 }}>
            <div className="p-field mb-4">
              <label
                htmlFor="name"
                className="mb-2 block"
                style={{ fontWeight: "500" }}
              >
                Product Name&nbsp;
                <small style={{ color: "red", fontStyle: "italic" }}>*</small>
              </label>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  marginTop: "20px",
                  marginBottom: "20px",
                  width: "100%",
                }}
              />
            </div>
          </div>
          <div className="col-6" style={{ flex: 1 }}>
            <div className="p-field mb-4">
              <label
                htmlFor="price"
                className="mb-2 block"
                style={{ fontWeight: "500" }}
              >
                Product's Price&nbsp;
                <small style={{ color: "red", fontStyle: "italic" }}>*</small>
              </label>
              <InputText
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                style={{
                  marginTop: "20px",
                  marginBottom: "20px",
                  width: "100%",
                }}
                min={0}
              />
            </div>
          </div>
        </div>

        <div
          className="grid"
          style={{ display: "flex", gap: "20px", width: "100%" }}
        >
          <div className="col-6" style={{ flex: 1 }}>
            <div className="p-field mb-4">
              <label
                htmlFor="quantity"
                className="mb-2 block"
                style={{ fontWeight: "500" }}
              >
                Quantity&nbsp;
                <small style={{ color: "red", fontStyle: "italic" }}>*</small>
              </label>
              <InputText
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                style={{
                  marginTop: "20px",
                  marginBottom: "20px",
                  width: "100%",
                }}
                min={1}
              />
            </div>
          </div>
          <div className="col-6" style={{ flex: 1 }}>
            <div className="p-field mb-4">
              <label
                htmlFor="address"
                className="mb-2 block"
                style={{ fontWeight: "500" }}
              >
                Status&nbsp;
                <small style={{ color: "red", fontStyle: "italic" }}>*</small>
              </label>
              <Dropdown
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                style={{
                  marginTop: "26px",
                  marginBottom: "20px",
                  width: "100%",
                }}
                required
              />
            </div>
          </div>
        </div>
      </div>
      <Toast ref={toast} />
    </Dialog>
  );
}
