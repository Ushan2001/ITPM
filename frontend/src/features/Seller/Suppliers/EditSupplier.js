import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { Skeleton } from "primereact/skeleton";
import config from "../../../config";
import SupplierProductComponent from "../SupplierProduct/SupplierProductComponent";
import AddSupplierProduct from "../SupplierProduct/AddSupplierProduct";

export default function EditSupplier() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    address: "",
    status: "active",
  });
  const [displayAddProductDialog, setDisplayAddProductDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliersById(id);
  }, [id]);

  const fetchSuppliersById = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/supplier/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch supplier data");
      }
      const data = await response.json();
      setFormData(data);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const validationErrors = {};
    if (!formData.name) validationErrors.name = "Name is required";
    if (!formData.email) validationErrors.email = "Email is required";
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
      const response = await fetch(`${config.apiUrl}/api/v1/supplier/${id}`, {
        method: "PUT",
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
          detail: "Supplier updated successfully!",
          life: 3000,
        });
        setLoading(false);
        fetchSuppliersById(id);
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: data.message || "Error updating supplier",
          life: 3000,
        });
        setLoading(false);
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while upding supplier",
        life: 3000,
      });
      setLoading(false);
    }
  };

  const handleAddProductClick = () => {
    setSelectedSupplier(formData);
    setDisplayAddProductDialog(true);
  };

  return (
    <div>
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
          Edit Supplier
        </h3>

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
          <>
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
                    <small style={{ color: "red", fontStyle: "italic" }}>
                      *
                    </small>
                  </label>
                  <InputText
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
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
                    htmlFor="email"
                    className="mb-2 block"
                    style={{ fontWeight: "500" }}
                  >
                    Email&nbsp;
                    <small style={{ color: "red", fontStyle: "italic" }}>
                      *
                    </small>
                  </label>
                  <InputText
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    htmlFor="phoneNo"
                    className="mb-2 block"
                    style={{ fontWeight: "500" }}
                  >
                    Phone Number&nbsp;
                    <small style={{ color: "red", fontStyle: "italic" }}>
                      *
                    </small>
                  </label>
                  <InputText
                    id="phoneNo"
                    name="phoneNo"
                    type="number"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    required
                    style={{
                      marginTop: "20px",
                      marginBottom: "20px",
                      width: "100%",
                    }}
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
                    <small style={{ color: "red", fontStyle: "italic" }}>
                      *
                    </small>
                  </label>
                  <InputText
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
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
                    htmlFor="address"
                    className="mb-2 block"
                    style={{ fontWeight: "500" }}
                  >
                    Status&nbsp;
                    <small style={{ color: "red", fontStyle: "italic" }}>
                      *
                    </small>
                  </label>
                  <Dropdown
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
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
                label={loading ? "Updating" : "Update"}
                icon="pi pi-check"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "12%",
                }}
              />
            </div>
            <div>
              <Button
                icon="pi pi-plus"
                label="Add Product"
                className="p-button p-button-info mr-2"
                onClick={() => handleAddProductClick()}
                style={{
                  width: "15%",
                }}
              />
            </div>
            <br />
          </>
        )}
        <Toast ref={toast} />
      </div>
      <SupplierProductComponent selectedSupplierId={id ? id : null} />
      <AddSupplierProduct
        visible={displayAddProductDialog}
        onHide={() => setDisplayAddProductDialog(false)}
        selectedSupplier={selectedSupplier ? selectedSupplier : null}
      />
    </div>
  );
}
