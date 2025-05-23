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

const SupplierReportGenerator = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("all");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportOptions, setReportOptions] = useState({
    includeAddress: true,
    includeContact: true,
    includeDates: true,
    includeProducts: true,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [statuses, setStatuses] = useState([
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const toast = useRef(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      
      const response = await fetch(`${config.apiUrl}/api/v1/supplier`, {
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
      setSuppliers(data || []);
      setLoading(false);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to fetch suppliers: ${error.message}`,
        life: 3000,
      });
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesStatus = selectedStatus
      ? supplier.status === selectedStatus
      : true;
    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const calculateProductCount = (suppliers) => {
    return suppliers.reduce((total, supplier) => {
      return total + (supplier.products?.length || 0);
    }, 0);
  };

  const generateReport = () => {
    setGeneratingReport(true);

    setTimeout(() => {
      const suppliersToInclude =
        reportType === "selected" ? selectedSuppliers : filteredSuppliers;

      const processedSuppliers = suppliersToInclude.map((supplier) => {
        const processedSupplier = { ...supplier };

        if (!reportOptions.includeAddress) {
          delete processedSupplier.address;
        }

        if (!reportOptions.includeContact) {
          delete processedSupplier.phoneNo;
        }

        if (!reportOptions.includeDates) {
          delete processedSupplier.publishDate;
          delete processedSupplier.publishTime;
        }

        if (!reportOptions.includeProducts) {
          delete processedSupplier.products;
        }

        return processedSupplier;
      });

      const totalProductCount = calculateProductCount(processedSuppliers);

      setReportData({
        generatedAt: new Date().toLocaleString(),
        supplierCount: processedSuppliers.length,
        suppliers: processedSuppliers,
        totalProductCount: totalProductCount,
      });

      setShowReportDialog(true);
      setGeneratingReport(false);
    }, 1500);
  };

  const exportReport = (format) => {
    if (!reportData) return;

    let content = "";
    let filename = `supplier_report_${new Date().toISOString().split("T")[0]}`;
    let mimeType = "";

    if (format === "json") {
      content = JSON.stringify(reportData, null, 2);
      filename += ".json";
      mimeType = "application/json";
    } else if (format === "csv") {
      let headers = ["ID", "Name", "Email", "Status"];
      if (reportOptions.includeAddress) headers.push("Address");
      if (reportOptions.includeContact) headers.push("Phone Number");
      if (reportOptions.includeDates) headers.push("Created Date");
      if (reportOptions.includeProducts) headers.push("Product Count");

      content = headers.join(",") + "\n";

      reportData.suppliers.forEach((supplier) => {
        let row = [
          supplier._id || "",
          `"${supplier.name}"`,
          supplier.email || "",
          supplier.status || "",
        ];

        if (reportOptions.includeAddress) {
          row.push(`"${supplier.address?.replace(/"/g, '""') || ""}"`);
        }

        if (reportOptions.includeContact) {
          row.push(supplier.phoneNo || "");
        }

        if (reportOptions.includeDates) {
          row.push(supplier.publishDate || "");
        }

        if (reportOptions.includeProducts) {
          row.push(supplier.products?.length || 0);
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
    doc.text("Supplier Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated At: ${reportData.generatedAt}`, 14, 30);
    doc.text(`Total Suppliers: ${reportData.supplierCount}`, 14, 36);
    
    if (reportOptions.includeProducts) {
      doc.text(`Total Products: ${reportData.totalProductCount}`, 14, 42);
    }

    const tableColumn = ["Name", "Email", "Status"];
    if (reportOptions.includeAddress) tableColumn.push("Address");
    if (reportOptions.includeContact) tableColumn.push("Phone");
    if (reportOptions.includeDates) tableColumn.push("Date");
    if (reportOptions.includeProducts) tableColumn.push("Products");

    const tableRows = [];

    reportData.suppliers.forEach((supplier) => {
      const row = [
        supplier.name, 
        supplier.email || "-", 
        supplier.status
      ];

      if (reportOptions.includeAddress) {
        // Truncate long addresses for PDF
        const shortAddress = supplier.address?.length > 30 
          ? supplier.address.substring(0, 30) + "..." 
          : supplier.address || "-";
        row.push(shortAddress);
      }
      
      if (reportOptions.includeContact) row.push(supplier.phoneNo?.toString() || "-");
      if (reportOptions.includeDates) row.push(supplier.publishDate || "-");
      if (reportOptions.includeProducts) row.push(supplier.products?.length || 0);

      tableRows.push(row);
    });

    autoTable(doc, {
      startY: reportOptions.includeProducts ? 48 : 42,
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
        0: { cellWidth: 30 }, // Name
        3: reportOptions.includeAddress ? { cellWidth: 40 } : {}, // Address (if included)
      },
    });

    doc.save(`supplier_report_${new Date().toISOString().split("T")[0]}.pdf`);

    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: "Report exported as PDF",
      life: 3000,
    });
  };

  const productCountTemplate = (rowData) => {
    return rowData.products?.length || 0;
  };

  const statusTemplate = (rowData) => {
    const statusClasses = {
      active: "status-badge status-active",
      inactive: "status-badge status-inactive",
    };

    return (
      <span className={statusClasses[rowData.status] || "status-badge"}>
        {rowData.status?.charAt(0).toUpperCase() + rowData.status?.slice(1)}
      </span>
    );
  };

  const addressTemplate = (rowData) => {
    return (
      <div className="address-cell" title={rowData.address}>
        {rowData.address?.length > 30 
          ? rowData.address.substring(0, 30) + "..." 
          : rowData.address}
      </div>
    );
  };

  const expandedRowTemplate = (data) => {
    return (
      <div className="supplier-products-container p-3">
        <h5>Products ({data.products?.length || 0})</h5>
        {data.products && data.products.length > 0 ? (
          <DataTable value={data.products} className="p-datatable-sm">
            <Column field="name" header="Name" />
            <Column field="sku" header="SKU" />
            <Column field="price" header="Price" body={(rowData) => `$${rowData.price}`} />
            <Column field="quantity" header="Quantity" />
            <Column field="status" header="Status" body={statusTemplate} />
            <Column field="publishDate" header="Publish Date" />
          </DataTable>
        ) : (
          <p>No products available for this supplier</p>
        )}
      </div>
    );
  };

  return (
    <div className="supplier-report-generator">
      <Toast ref={toast} />

      <div className="report-header">
        <h1 className="report-title">Supplier Reports Generator</h1>
        <p className="report-subtitle">
          Generate customized reports for your suppliers
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
              <span>All Filtered Suppliers</span>
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
              <span>Selected Suppliers Only</span>
            </div>
          </div>
        </div>

        <Divider />

        <div className="report-options">
          <h4>Include Information</h4>
          <div className="option-checkboxes">
            <div className="option-checkbox">
              <Checkbox
                inputId="includeAddress"
                checked={reportOptions.includeAddress}
                onChange={(e) =>
                  setReportOptions({
                    ...reportOptions,
                    includeAddress: e.checked,
                  })
                }
              />
              <label htmlFor="includeAddress">Address Information</label>
            </div>
            <div className="option-checkbox">
              <Checkbox
                inputId="includeContact"
                checked={reportOptions.includeContact}
                onChange={(e) =>
                  setReportOptions({
                    ...reportOptions,
                    includeContact: e.checked,
                  })
                }
              />
              <label htmlFor="includeContact">Contact Information</label>
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
                inputId="includeProducts"
                checked={reportOptions.includeProducts}
                onChange={(e) =>
                  setReportOptions({
                    ...reportOptions,
                    includeProducts: e.checked,
                  })
                }
              />
              <label htmlFor="includeProducts">Product Information</label>
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
              (reportType === "selected" && selectedSuppliers.length === 0) ||
              generatingReport
            }
            loading={generatingReport}
          />
        </div>
      </div>

      <div className="supplier-table-container">
        <DataTable
          value={filteredSuppliers}
          selection={selectedSuppliers}
          onSelectionChange={(e) => setSelectedSuppliers(e.value)}
          selectionMode="multiple"
          dataKey="_id"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          loading={loading}
          emptyMessage="No suppliers found"
          className="supplier-data-table"
          header={`${filteredSuppliers.length} Suppliers Found`}
          footer={
            reportType === "selected"
              ? `${selectedSuppliers.length} Suppliers Selected for Report`
              : ""
          }
          expandedRows={reportOptions.includeProducts ? null : null}
          rowExpansionTemplate={expandedRowTemplate}
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column
            field="name"
            header="Name"
            sortable
            filter
            filterPlaceholder="Search by name"
          />
          <Column
            field="email"
            header="Email"
            sortable
            filter
            filterPlaceholder="Search by email"
          />
          {reportOptions.includeAddress && (
            <Column
              field="address"
              header="Address"
              body={addressTemplate}
            />
          )}
          {reportOptions.includeContact && (
            <Column
              field="phoneNo"
              header="Phone Number"
              sortable
            />
          )}
          {reportOptions.includeProducts && (
            <Column
              header="Products"
              body={productCountTemplate}
              sortable
            />
          )}
          {reportOptions.includeDates && (
            <Column
              field="publishDate"
              header="Date Added"
              sortable
            />
          )}
          <Column
            field="status"
            header="Status"
            body={statusTemplate}
            sortable
          />
          {reportOptions.includeProducts && (
            <Column
              expander={true}
              style={{ width: '3em' }}
              header="Products"
            />
          )}
        </DataTable>
      </div>

      <Dialog
        header="Generated Supplier Report"
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
                <span className="label">Suppliers Included:</span>
                <span className="value">{reportData.supplierCount}</span>
              </div>
              {reportOptions.includeProducts && (
                <div className="report-info-item">
                  <span className="label">Total Products:</span>
                  <span className="value">{reportData.totalProductCount}</span>
                </div>
              )}
            </div>

            <Divider />

            <div className="report-preview-table">
              <DataTable
                value={reportData.suppliers}
                scrollable
                scrollHeight="400px"
                className="report-data-table"
                expandedRows={reportOptions.includeProducts ? null : null}
                rowExpansionTemplate={expandedRowTemplate}
              >
                <Column field="name" header="Name" />
                <Column field="email" header="Email" />
                <Column field="status" header="Status" body={statusTemplate} />
                {reportOptions.includeAddress && (
                  <Column 
                    field="address" 
                    header="Address"
                    body={addressTemplate}
                  />
                )}
                {reportOptions.includeContact && (
                  <Column field="phoneNo" header="Phone Number" />
                )}
                {reportOptions.includeDates && (
                  <Column field="publishDate" header="Publish Date" />
                )}
                {reportOptions.includeProducts && (
                  <Column 
                    header="Products" 
                    body={productCountTemplate}
                  />
                )}
                {reportOptions.includeProducts && (
                  <Column
                    expander={true}
                    style={{ width: '3em' }}
                  />
                )}
              </DataTable>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default SupplierReportGenerator;