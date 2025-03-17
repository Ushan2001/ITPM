import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: null,
    categoryType: "",
    productPic: null,
    quantity: null,
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" || name === "quantity" ? Number(value) : value,
    });
  };

  const onFileSelect = (e) => {
    const file = e.files[0];
    setFormData((prevData) => ({
      ...prevData,
      productPic: file,
    }));

    toast.current.show({
      severity: "info",
      summary: "Image Selected",
      detail: `${file.name} uploaded successfully`,
      life: 3000,
    });
  };

  const handleDropdownChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      status: e.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = {};
    if (!formData.title) validationErrors.title = "Title is required";
    if (!formData.description) validationErrors.description = "Description is required";
    if (!formData.price) validationErrors.price = "Price is required";
    if (!formData.categoryType) validationErrors.categoryType = "CategoryType is required";
    if (!formData.quantity) validationErrors.quantity = "Quantity is required";
    if (!formData.status) validationErrors.status = "Status is required";
    if (!formData.productPic) validationErrors.productPic = "ProductPic is required";

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

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);
    payload.append("price", formData.price);
    payload.append("categoryType", formData.categoryType);
    payload.append("quantity", formData.quantity);
    payload.append("status", formData.status);

    if (formData.productPic) {
      payload.append("productPic", formData.productPic);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/inventory`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await response.json();

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Product Added",
          detail: "Product added successfully!",
          life: 3000,
        });

        setFormData({
          title: "",
          description: "",
          price: 0,
          categoryType: "",
          quantity: 0,
          status: "active",
          productPic: null,
        });
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: data.message || "Error adding product",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while adding the product",
        life: 3000,
      });
    }

    setLoading(false);
  };

  return (
    <div
      className="p-fluid"
      style={{ paddingLeft: "25px", paddingRight: "25px" }}
    >
      <h3
        style={{
          color: "#03a6e9",
          fontSize: "24px",
          fontWeight: "lighter",
          marginTop: "50px",
          marginBottom: "25px",
        }}
      >
        <b>Inventory Management</b>
      </h3>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "lighter",
          marginTop: "25px",
          marginBottom: "50px",
          color: "#F01059",
        }}
      >
        Add Product
      </h3>

      <div
        className="grid"
        style={{ display: "flex", gap: "20px", width: "100%" }}
      >
        <div className="col-6" style={{ flex: 1 }}>
          <div className="p-field mb-4">
            <label
              htmlFor="title"
              className="mb-2 block"
              style={{ fontWeight: "500" }}
            >
              Product Title&nbsp;
              <small style={{ color: "red", fontStyle: "italic" }}>*</small>
            </label>
            <InputText
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={{ marginTop: "20px", marginBottom: "20px", width: "100%" }}
            />
          </div>
        </div>
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
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              style={{ marginTop: "20px", marginBottom: "20px", width: "100%" }}
            />
          </div>
        </div>
        <div className="col-6" style={{ flex: 1 }}>
          <div className="p-field mb-4">
            <label
              htmlFor="categoryType"
              className="mb-2 block"
              style={{ fontWeight: "500" }}
            >
              Category Type&nbsp;
              <small style={{ color: "red", fontStyle: "italic" }}>*</small>
            </label>
            <InputText
              id="categoryType"
              type="text"
              name="categoryType"
              value={formData.categoryType}
              onChange={handleInputChange}
              required
              style={{ marginTop: "20px", marginBottom: "20px", width: "100%" }}
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
              Price&nbsp;
              <small style={{ color: "red", fontStyle: "italic" }}>*</small>
            </label>
            <InputText
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              required
              style={{ marginTop: "20px", marginBottom: "20px", width: "100%" }}
            />
          </div>
        </div>
      </div>
      <br />

      <div
        className="grid"
        style={{ display: "flex", gap: "20px", width: "100%" }}
      >
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
              onChange={handleDropdownChange}
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
              style={{ marginTop: "26px", marginBottom: "20px", width: "100%" }}
              required
            />
          </div>
        </div>

        <div className="col-6" style={{ flex: 1 }}>
          <div className="p-field mb-4">
            <label
              htmlFor="description"
              className="mb-2 block"
              style={{ fontWeight: "500" }}
            >
              Description&nbsp;
              <small style={{ color: "red", fontStyle: "italic" }}>*</small>
            </label>
            <InputTextarea
              id="description"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              style={{ marginTop: "20px", marginBottom: "20px", width: "100%" }}
            />
          </div>
        </div>
      </div>
      <div className="p-field upload-field">
        <label htmlFor="productPic">Product Picture</label>
        <FileUpload
          name="productPic"
          accept="image/*"
          customUpload
          auto
          uploadHandler={onFileSelect}
          chooseLabel="Select Image"
          className="animate-upload"
        />
      </div>
      <div
        className="p-field"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
          marginBottom: "80px",
        }}
      >
        <Button
          label="Cancel"
          icon="pi pi-times"
          className="p-button-danger"
          onClick={() => navigate("/products")}
          style={{
            marginRight: "10px",
            width: "12%",
          }}
        />
        &nbsp;
        <Button
          label={loading ? "Saving" : "Save"}
          icon="pi pi-check"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "12%",
          }}
        />
      </div>
      <Toast ref={toast} />
    </div>
  );
}
