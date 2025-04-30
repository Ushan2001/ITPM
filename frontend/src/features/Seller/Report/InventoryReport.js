import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import config from "../../../config/index";
import "./style.css";

const InventoryReportGenerator = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("all");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportOptions, setReportOptions] = useState({
    includeDescription: true,
    includeSupplier: true,
    includeDates: true,
    includeInventoryValue: true,
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [statuses, setStatuses] = useState([
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const toast = useRef(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map((product) => product.categoryType))];
      setCategories(
        uniqueCategories.map((category) => ({
          label: category.charAt(0).toUpperCase() + category.slice(1),
          value: category,
        }))
      );
    }
  }, [products]);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      
      // Using the seller specific endpoint as indicated in your API routes
      const response = await fetch(`${config.apiUrl}/api/v1/inventory/seller-by`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data || []);
      setLoading(false);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to fetch inventory: ${error.message}`,
        life: 3000,
      });
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory
      ? product.categoryType === selectedCategory
      : true;
    const matchesStatus = selectedStatus
      ? product.status === selectedStatus
      : true;
    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const calculateTotalValue = (products) => {
    return products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  const generateReport = () => {
    setGeneratingReport(true);

    setTimeout(() => {
      const productsToInclude =
        reportType === "selected" ? selectedProducts : filteredProducts;

      const processedProducts = productsToInclude.map((product) => {
        const processedProduct = { ...product };

        if (!reportOptions.includeDescription) {
          delete processedProduct.description;
        }

        if (!reportOptions.includeSupplier) {
          delete processedProduct.supplierId;
        }

        if (!reportOptions.includeDates) {
          delete processedProduct.publishDate;
          delete processedProduct.publishTime;
          delete processedProduct.createdAt;
          delete processedProduct.updatedAt;
        }

        return processedProduct;
      });

      const totalInventoryValue = calculateTotalValue(processedProducts);

      setReportData({
        generatedAt: new Date().toLocaleString(),
        productCount: processedProducts.length,
        products: processedProducts,
        totalValue: totalInventoryValue,
      });

      setShowReportDialog(true);
      setGeneratingReport(false);
    }, 1500);
  };

  const exportReport = (format) => {
    if (!reportData) return;

    let content = "";
    let filename = `inventory_report_${new Date().toISOString().split("T")[0]}`;
    let mimeType = "";

    if (format === "json") {
      content = JSON.stringify(reportData, null, 2);
      filename += ".json";
      mimeType = "application/json";
    } else if (format === "csv") {
      let headers = ["SKU", "Title", "Category", "Price", "Quantity", "Status"];
      if (reportOptions.includeDescription) headers.push("Description");
      if (reportOptions.includeSupplier) headers.push("Supplier ID");
      if (reportOptions.includeDates) headers.push("Publish Date");
      if (reportOptions.includeInventoryValue) headers.push("Total Value");

      content = headers.join(",") + "\n";

      reportData.products.forEach((product) => {
        let row = [
          product.sku || "",
          `"${product.title}"`,
          product.categoryType,
          product.price,
          product.quantity,
          product.status,
        ];

        if (reportOptions.includeDescription) {
          row.push(`"${product.description.replace(/"/g, '""')}"`);
        }

        if (reportOptions.includeSupplier) {
          row.push(product.supplierId || "");
        }

        if (reportOptions.includeDates) {
          row.push(product.publishDate || "");
        }

        if (reportOptions.includeInventoryValue) {
          row.push(product.price * product.quantity);
        }

        content += row.join(",") + "\n";
      });

      filename += ".csv";
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: `Report exported as ${format.toUpperCase()}`,
      life: 3000,
    });
  };

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Inventory Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated At: ${reportData.generatedAt}`, 14, 30);
    doc.text(`Total Products: ${reportData.productCount}`, 14, 36);
    
    if (reportOptions.includeInventoryValue) {
      doc.text(`Total Inventory Value: $${reportData.totalValue.toFixed(2)}`, 14, 42);
    }

    const tableColumn = ["SKU", "Title", "Category", "Price", "Quantity", "Status"];
    if (reportOptions.includeDescription) tableColumn.push("Description");
    if (reportOptions.includeSupplier) tableColumn.push("Supplier");
    if (reportOptions.includeDates) tableColumn.push("Date");

    const tableRows = [];

    reportData.products.forEach((product) => {
      const row = [
        product.sku || "-", 
        product.title, 
        product.categoryType, 
        `$${product.price.toFixed(2)}`,
        product.quantity,
        product.status
      ];

      if (reportOptions.includeDescription) {
        // Truncate long descriptions for PDF
        const shortDesc = product.description.length > 50 
          ? product.description.substring(0, 50) + "..." 
          : product.description;
        row.push(shortDesc);
      }
      
      if (reportOptions.includeSupplier) row.push(product.supplierId || "-");
      if (reportOptions.includeDates) row.push(product.publishDate || "-");

      tableRows.push(row);
    });

    autoTable(doc, {
      startY: reportOptions.includeInventoryValue ? 48 : 42,
      head: [tableColumn],
      body: tableRows,
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [67, 56, 202],
      },
      columnStyles: {
        0: { cellWidth: 25 }, // SKU
        1: { cellWidth: 30 }, // Title
        6: reportOptions.includeDescription ? { cellWidth: 40 } : {}, // Description (if included)
      },
    });

    doc.save(`inventory_report_${new Date().toISOString().split("T")[0]}.pdf`);

    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: "Report exported as PDF",
      life: 3000,
    });
  };

  const categoryTemplate = (rowData) => {
    const categoryColors = {
      electronics: "bg-blue-600",
      clothing: "bg-green-600",
      furniture: "bg-purple-600",
      groceries: "bg-yellow-600",
      books: "bg-red-600",
    };

    return (
      <span
        className={`category-badge ${
          categoryColors[rowData.categoryType?.toLowerCase()] || "bg-gray-600"
        }`}
      >
        {rowData.categoryType.charAt(0).toUpperCase() + rowData.categoryType.slice(1)}
      </span>
    );
  };

  const productImageTemplate = (rowData) => {
    return (
      <div className="product-image-container">
        {rowData.productPic ? (
          <img
            src={`${config.apiUrl}/api/v1/uploads/image/product/${rowData.productPic}`}
            alt={rowData.title}
            className="product-image"
            onError={(e) => (e.target.src = "/images/products/default.png")}
          />
        ) : (
          <div className="product-placeholder">
            <i className="pi pi-box"></i>
          </div>
        )}
      </div>
    );
  };

  const priceTemplate = (rowData) => {
    return `$${rowData.price.toFixed(2)}`;
  };

  const valueTemplate = (rowData) => {
    return `$${(rowData.price * rowData.quantity).toFixed(2)}`;
  };

  const statusTemplate = (rowData) => {
    const statusClasses = {
      active: "status-badge status-active",
      inactive: "status-badge status-inactive",
    };

    return (
      <span className={statusClasses[rowData.status] || "status-badge"}>
        {rowData.status.charAt(0).toUpperCase() + rowData.status.slice(1)}
      </span>
    );
  };

  return (
    <div className="inventory-report-generator">
      <Toast ref={toast} />

      <div className="report-header">
        <h1 className="report-title">Inventory Reports Generator</h1>
        <p className="report-subtitle">
          Generate customized reports for your inventory
        </p>
      </div>

      <div className="report-options-card">
        <h3>Report Settings</h3>
        <div className="report-type-selection">
          <div className="report-type-option">
            <div
              className={`report-type-box ${
                reportType === "all" ? "selected" : ""
              }`}
              onClick={() => setReportType("all")}
            >
              <i className="pi pi-list"></i>
              <span>All Filtered Products</span>
            </div>
          </div>
          <div className="report-type-option">
            <div
              className={`report-type-box ${
                reportType === "selected" ? "selected" : ""
              }`}
              onClick={() => setReportType("selected")}
            >
              <i className="pi pi-check-square"></i>
              <span>Selected Products Only</span>
            </div>
          </div>
        </div>

        <Divider />

        <div className="report-options">
          <h4>Include Information</h4>
          <div className="option-checkboxes">
            <div className="option-checkbox">
              <Checkbox
                inputId="includeDescription"
                checked={reportOptions.includeDescription}
                onChange={(e) =>
                  setReportOptions({
                    ...reportOptions,
                    includeDescription: e.checked,
                  })
                }
              />
              <label htmlFor="includeDescription">Product Descriptions</label>
            </div>
            <div className="option-checkbox">
              <Checkbox
                inputId="includeSupplier"
                checked={reportOptions.includeSupplier}
                onChange={(e) =>
                  setReportOptions({
                    ...reportOptions,
                    includeSupplier: e.checked,
                  })
                }
              />
              <label htmlFor="includeSupplier">Supplier Information</label>
            </div>
            <div className="option-checkbox">
              <Checkbox
                inputId="includeDates"
                checked={reportOptions.includeDates}
                onChange={(e) =>
                  setReportOptions({
                    ...reportOptions,
                    includeDates: e.checked,
                  })
                }
              />
              <label htmlFor="includeDates">Publish Dates</label>
            </div>
            <div className="option-checkbox">
              <Checkbox
                inputId="includeInventoryValue"
                checked={reportOptions.includeInventoryValue}
                onChange={(e) =>
                  setReportOptions({
                    ...reportOptions,
                    includeInventoryValue: e.checked,
                  })
                }
              />
              <label htmlFor="includeInventoryValue">Inventory Values</label>
            </div>
          </div>
        </div>

        <div className="generate-button-container">
          <Button
            label="Generate Report"
            icon="pi pi-file"
            className="p-button-raised p-button-primary generate-button"
            onClick={generateReport}
            disabled={
              (reportType === "selected" && selectedProducts.length === 0) ||
              generatingReport
            }
            loading={generatingReport}
          />
        </div>
      </div>

      <div className="inventory-table-container">
        <DataTable
          value={filteredProducts}
          selection={selectedProducts}
          onSelectionChange={(e) => setSelectedProducts(e.value)}
          selectionMode="multiple"
          dataKey="_id"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          loading={loading}
          emptyMessage="No products found"
          className="inventory-data-table"
          header={`${filteredProducts.length} Products Found`}
          footer={
            reportType === "selected"
              ? `${selectedProducts.length} Products Selected for Report`
              : ""
          }
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column
            header="Image"
            body={productImageTemplate}
            style={{ width: "70px" }}
          />
          <Column
            field="sku"
            header="SKU"
            sortable
            filter
            filterPlaceholder="Search by SKU"
          />
          <Column
            field="title"
            header="Title"
            sortable
            filter
            filterPlaceholder="Search by title"
          />
          <Column
            field="categoryType"
            header="Category"
            body={categoryTemplate}
            sortable
            filter
            filterPlaceholder="Search by category"
          />
          <Column
            field="price"
            header="Price"
            body={priceTemplate}
            sortable
          />
          <Column
            field="quantity"
            header="Quantity"
            sortable
          />
          {reportOptions.includeInventoryValue && (
            <Column
              header="Value"
              body={valueTemplate}
              sortable
            />
          )}
          <Column
            field="status"
            header="Status"
            body={statusTemplate}
            sortable
          />
        </DataTable>
      </div>

      <Dialog
        header="Generated Inventory Report"
        visible={showReportDialog}
        style={{ width: "80vw" }}
        onHide={() => setShowReportDialog(false)}
        footer={
          <div>
            <Button
              label="Export as JSON"
              icon="pi pi-download"
              className="p-button-primary mr-2"
              onClick={() => exportReport("json")}
            />
            <Button
              label="Export as CSV"
              icon="pi pi-file-excel"
              className="p-button-success mr-2"
              onClick={() => exportReport("csv")}
            />
            <Button
              label="Export as PDF"
              icon="pi pi-file-pdf"
              className="p-button-danger mr-2"
              onClick={exportToPDF}
            />

            <Button
              label="Close"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setShowReportDialog(false)}
            />
          </div>
        }
      >
        {reportData && (
          <div className="report-preview">
            <div className="report-info">
              <div className="report-info-item">
                <span className="label">Report Generated:</span>
                <span className="value">{reportData.generatedAt}</span>
              </div>
              <div className="report-info-item">
                <span className="label">Products Included:</span>
                <span className="value">{reportData.productCount}</span>
              </div>
              {reportOptions.includeInventoryValue && (
                <div className="report-info-item">
                  <span className="label">Total Inventory Value:</span>
                  <span className="value">${reportData.totalValue.toFixed(2)}</span>
                </div>
              )}
            </div>

            <Divider />

            <div className="report-preview-table">
              <DataTable
                value={reportData.products}
                scrollable
                scrollHeight="400px"
                className="report-data-table"
              >
                <Column field="sku" header="SKU" />
                <Column field="title" header="Title" />
                <Column field="categoryType" header="Category" body={categoryTemplate} />
                <Column field="price" header="Price" body={priceTemplate} />
                <Column field="quantity" header="Quantity" />
                {reportOptions.includeInventoryValue && (
                  <Column header="Value" body={valueTemplate} />
                )}
                <Column field="status" header="Status" body={statusTemplate} />
                {reportOptions.includeDescription && (
                  <Column 
                    field="description" 
                    header="Description"
                    body={(rowData) => (
                      <div className="description-cell" title={rowData.description}>
                        {rowData.description.length > 50 
                          ? rowData.description.substring(0, 50) + "..." 
                          : rowData.description}
                      </div>
                    )}
                  />
                )}
                {reportOptions.includeSupplier && (
                  <Column field="supplierId" header="Supplier ID" />
                )}
                {reportOptions.includeDates && (
                  <Column field="publishDate" header="Publish Date" />
                )}
              </DataTable>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default InventoryReportGenerator;