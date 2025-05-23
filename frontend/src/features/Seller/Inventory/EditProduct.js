import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { FileUpload } from "primereact/fileupload";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../../config";

export default function EditProduct() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    categoryType: "",
    quantity: "",
    status: "active",
    productPic: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  const categoryOptions = [
    { label: "Electronic", value: "Electronic" },
    { label: "Beauty And Health", value: "Beauty And Health" },
    { label: "Jewelry & Accessories", value: "Jewelry & Accessories" },
    { label: "Mens Accessories", value: "Mens Accessories" },
    { label: "Tools", value: "Tools" },
    { label: "Ladies Shoes", value: "Ladies Shoes" },
    { label: "Womens Clothing", value: "Womens Clothing" },
    { label: "Home & Kitchen", value: "Home & Kitchen" },
  ];

  useEffect(() => {
    fetchProductsById(id);
  }, [id]);

  const fetchProductsById = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/api/v1/inventory/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch supplier data");
      }
      const data = await response.json();
      setFormData(data);
      setImagePreview(
        `${config.apiUrl}/api/v1/uploads/image/product/${data.productPic}`
      );
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

  const onFileSelect = (e) => {
    const file = e.files[0];
    setFormData((prevData) => ({
      ...prevData,
      productPic: file,
    }));
    setImagePreview(URL.createObjectURL(file));
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
    if (!formData.title) validationErrors.title = "Title is required";
    if (!formData.description)
      validationErrors.description = "Description is required";
    if (!formData.price) validationErrors.price = "Price is required";
    if (!formData.categoryType)
      validationErrors.categoryType = "CategoryType is required";
    if (!formData.quantity) validationErrors.quantity = "Quantity is required";
    if (!formData.status) validationErrors.status = "Status is required";
    if (!formData.productPic)
      validationErrors.productPic = "ProductPic is required";

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

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("categoryType", formData.categoryType);
      formDataToSend.append("quantity", formData.quantity);
      formDataToSend.append("status", formData.status);

      if (formData.productPic instanceof File) {
        formDataToSend.append("productPic", formData.productPic);
      }

      const response = await fetch(`${config.apiUrl}/api/v1/inventory/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      const data = await response.json();

      if (response.ok) {
        toast.current.show({
          severity: "success",
          summary: "Product Added",
          detail: "Product updated successfully!",
          life: 3000,
        });
        setLoading(false);
        fetchProductsById(id);
        navigate("/products");
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: data.message || "Error updating Product",
          life: 3000,
        });
        setLoading(false);
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while upding product",
        life: 3000,
      });
      setLoading(false);
    }
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
          <b>Product Management</b>
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
          Edit Prodict
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
                    htmlFor="title"
                    className="mb-2 block"
                    style={{ fontWeight: "500" }}
                  >
                    Product Title&nbsp;
                    <small style={{ color: "red", fontStyle: "italic" }}>
                      *
                    </small>
                  </label>
                  <InputText
                    id="title"
                    name="title"
                    value={formData.title}
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
                    htmlFor="quantity"
                    className="mb-2 block"
                    style={{ fontWeight: "500" }}
                  >
                    Quantity&nbsp;
                    <small style={{ color: "red", fontStyle: "italic" }}>
                      *
                    </small>
                  </label>
                  <InputText
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
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
                    htmlFor="categoryType"
                    className="mb-2 block"
                    style={{ fontWeight: "500" }}
                  >
                    Category Type&nbsp;
                    <small style={{ color: "red", fontStyle: "italic" }}>
                      *
                    </small>
                  </label>
                  <Dropdown
                    id="categoryType"
                    name="categoryType"
                    value={formData.categoryType}
                    options={categoryOptions}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        categoryType: e.value,
                      }))
                    }
                    placeholder="Select a Category"
                    style={{
                      marginTop: "20px",
                      marginBottom: "20px",
                      width: "100%",
                    }}
                    required
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
                    <small style={{ color: "red", fontStyle: "italic" }}>
                      *
                    </small>
                  </label>
                  <InputText
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
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
              <div className="col-6" style={{ flex: 1 }}>
                <div className="p-field mb-4">
                  <label
                    htmlFor="description"
                    className="mb-2 block"
                    style={{ fontWeight: "500" }}
                  >
                    Description&nbsp;
                    <small style={{ color: "red", fontStyle: "italic" }}>
                      *
                    </small>
                  </label>
                  <InputTextarea
                    id="description"
                    type="text"
                    name="description"
                    value={formData.description}
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

            <div className="p-field upload-field">
              <label htmlFor="productPic">Product Picture</label>
              {imagePreview && (
                <div>
                  <img
                    src={imagePreview}
                    alt="Product"
                    style={{
                      width: "150px",
                      height: "150px",
                      marginBottom: "10px",
                    }}
                  />
                </div>
              )}
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
                label={loading ? "Updating" : "Update"}
                icon="pi pi-check"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "12%",
                }}
              />
            </div>

            <br />
          </>
        )}
        <Toast ref={toast} />
      </div>
    </div>
  );
}
