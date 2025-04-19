import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import config from "../../../config";

export default function AddSupplier() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    address: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name) validationErrors.name = "Name is required";
    if (!formData.email) {
      validationErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      validationErrors.email = "Invalid email format";
    }
    if (!formData.phoneNo) validationErrors.phoneNo = "Phone No is required";
    if (!formData.address) validationErrors.address = "Address is required";
    if (!formData.status) validationErrors.status = "Status is required";

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
      const response = await fetch(`${config.apiUrl}/api/v1/supplier`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
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
          email: "",
          phoneNo: "",
          address: "",
          status: "active",
        });
        setLoading(false);
        navigate("/suppliers");
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
        <b>Supplier Management</b>
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
        Add Supplier
      </h3>

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
              Supplier's Name&nbsp;
              <small style={{ color: "red", fontStyle: "italic" }}>*</small>
            </label>
            <InputText
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{ marginTop: "20px", marginBottom: "20px", width: "100%" }}
            />
          </div>
        </div>
        <div className="col-6" style={{ flex: 1 }}>
          <div className="p-field mb-4">
            <label
              htmlFor="email"
              className="mb-2 block"
              style={{ fontWeight: "500" }}
            >
              Email&nbsp;
              <small style={{ color: "red", fontStyle: "italic" }}>*</small>
            </label>
            <InputText
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{ marginTop: "20px", marginBottom: "20px", width: "100%" }}
            />
          </div>
        </div>
        <div className="col-6" style={{ flex: 1 }}>
          <div className="p-field mb-4">
            <label
              htmlFor="phoneNo"
              className="mb-2 block"
              style={{ fontWeight: "500" }}
            >
              Phone Number&nbsp;
              <small style={{ color: "red", fontStyle: "italic" }}>*</small>
            </label>
            <InputText
              id="phoneNo"
              name="phoneNo"
              type="number"
              value={formData.phoneNo}
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
              Address&nbsp;
              <small style={{ color: "red", fontStyle: "italic" }}>*</small>
            </label>
            <InputText
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              style={{ marginTop: "20px", marginBottom: "20px", width: "100%" }}
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
              style={{ marginTop: "26px", marginBottom: "20px", width: "100%" }}
              required
            />
          </div>
        </div>
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
          onClick={() => navigate("/suppliers")}
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
