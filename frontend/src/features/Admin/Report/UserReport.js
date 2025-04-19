import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import config from "../../../config/index";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./style.css";

const UserReportGenerator = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("all");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportOptions, setReportOptions] = useState({
    includeLocation: true,
    includeProducts: true,
    includeContactInfo: true,
  });
  const [userTypes, setUserTypes] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);

  const toast = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const types = [...new Set(users.map((user) => user.type))];
      setUserTypes(
        types.map((type) => ({
          label: type.charAt(0).toUpperCase() + type.slice(1),
          value: type,
        }))
      );
    }
  }, [users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/api/v1/user/active`, {
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
      setUsers(data.users || []);
      setLoading(false);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to fetch users: ${error.message}`,
        life: 3000,
      });
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesType = selectedUserType
      ? user.type === selectedUserType
      : true;
    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  const generateReport = () => {
    setGeneratingReport(true);

    setTimeout(() => {
      const usersToInclude =
        reportType === "selected" ? selectedUsers : filteredUsers;

      const processedUsers = usersToInclude.map((user) => {
        const processedUser = { ...user };

        if (!reportOptions.includeLocation) {
          delete processedUser.location;
        }

        if (!reportOptions.includeProducts) {
          delete processedUser.products;
        }

        if (!reportOptions.includeContactInfo) {
          delete processedUser.phoneNo;
          delete processedUser.email;
        }

        return processedUser;
      });

      setReportData({
        generatedAt: new Date().toLocaleString(),
        userCount: processedUsers.length,
        users: processedUsers,
      });

      setShowReportDialog(true);
      setGeneratingReport(false);
    }, 1500);
  };

  const exportReport = (format) => {
    if (!reportData) return;

    let content = "";
    let filename = `user_report_${new Date().toISOString().split("T")[0]}`;
    let mimeType = "";

    if (format === "json") {
      content = JSON.stringify(reportData, null, 2);
      filename += ".json";
      mimeType = "application/json";
    } else if (format === "csv") {
      let headers = ["ID", "Name", "Email", "Type", "Status"];
      if (reportOptions.includeLocation) headers.push("Location");
      if (reportOptions.includeContactInfo) headers.push("Phone");

      content = headers.join(",") + "\n";

      reportData.users.forEach((user) => {
        let row = [
          user._id,
          `"${user.name}"`,
          user.email,
          user.type,
          user.status,
        ];

        if (reportOptions.includeLocation) {
          row.push(user.location ? `"${user.location.name}"` : '""');
        }

        if (reportOptions.includeContactInfo) {
          row.push(user.phoneNo || "");
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
    doc.text("User Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated At: ${reportData.generatedAt}`, 14, 30);
    doc.text(`Total Users: ${reportData.userCount}`, 14, 36);

    const tableColumn = ["Name", "Email", "Type", "Status"];
    if (reportOptions.includeContactInfo) tableColumn.push("Phone");
    if (reportOptions.includeLocation) tableColumn.push("Location");

    const tableRows = [];

    reportData.users.forEach((user) => {
      const row = [user.name, user.email, user.type, user.status];

      if (reportOptions.includeContactInfo) row.push(user.phoneNo || "-");
      if (reportOptions.includeLocation) row.push(user.location?.name || "-");

      tableRows.push(row);
    });

    autoTable(doc, {
      startY: 45,
      head: [tableColumn],
      body: tableRows,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [67, 56, 202],
      },
    });

    doc.save(`user_report_${new Date().toISOString().split("T")[0]}.pdf`);

    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: "Report exported as PDF",
      life: 3000,
    });
  };

  const userTypeTemplate = (rowData) => {
    const typeColors = {
      admin: "bg-blue-600",
      buyer: "bg-green-600",
      seller: "bg-purple-600",
    };

    return (
      <span
        className={`user-type-badge ${
          typeColors[rowData.type] || "bg-gray-600"
        }`}
      >
        {rowData.type.charAt(0).toUpperCase() + rowData.type.slice(1)}
      </span>
    );
  };

  const userImageTemplate = (rowData) => {
    return (
      <div className="user-image-container">
        {rowData.profilePic ? (
          <img
            src={`${config.apiUrl}/api/v1/uploads/image/profile/${rowData.profilePic}`}
            alt={rowData.name}
            className="user-profile-image"
            onError={(e) => (e.target.src = "/images/profiles/default.png")}
          />
        ) : (
          <div className="user-initials">
            {rowData.name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="user-report-generator">
      <Toast ref={toast} />

      <div className="report-header">
        <h1 className="report-title">User Reports Generator</h1>
        <p className="report-subtitle">
          Generate customized reports for active users
        </p>
      </div>

      <Card className="filters-card">
        <div className="filter-container">
          <div className="filter-item">
            <span className="p-input-icon-left">
              <InputText
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </span>
          </div>

          <div className="filter-item">
            <Dropdown
              value={selectedUserType}
              options={userTypes}
              onChange={(e) => setSelectedUserType(e.value)}
              placeholder="Select User Type"
              className="w-full"
              showClear
            />
          </div>

          <div className="filter-item">
            <Button
              label="Reset Filters"
              icon="pi pi-filter-slash"
              className="p-button-outlined"
              onClick={() => {
                setSelectedUserType(null);
                setSearchQuery("");
              }}
            />
          </div>
        </div>
      </Card>

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
              <i className="pi pi-users"></i>
              <span>All Filtered Users</span>
            </div>
          </div>
          <div className="report-type-option">
            <div
              className={`report-type-box ${
                reportType === "selected" ? "selected" : ""
              }`}
              onClick={() => setReportType("selected")}
            >
              <i className="pi pi-user-edit"></i>
              <span>Selected Users Only</span>
            </div>
          </div>
        </div>

        <Divider />

        <div className="report-options">
          <h4>Include Information</h4>
          <div className="option-checkboxes">
            <div className="option-checkbox">
              <Checkbox
                inputId="includeLocation"
                checked={reportOptions.includeLocation}
                onChange={(e) =>
                  setReportOptions({
                    ...reportOptions,
                    includeLocation: e.checked,
                  })
                }
              />
              <label htmlFor="includeLocation">Location Data</label>
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
            <div className="option-checkbox">
              <Checkbox
                inputId="includeContactInfo"
                checked={reportOptions.includeContactInfo}
                onChange={(e) =>
                  setReportOptions({
                    ...reportOptions,
                    includeContactInfo: e.checked,
                  })
                }
              />
              <label htmlFor="includeContactInfo">Contact Information</label>
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
              (reportType === "selected" && selectedUsers.length === 0) ||
              generatingReport
            }
            loading={generatingReport}
          />
        </div>
      </div>

      <div className="user-table-container">
        <DataTable
          value={filteredUsers}
          selection={selectedUsers}
          onSelectionChange={(e) => setSelectedUsers(e.value)}
          selectionMode="multiple"
          dataKey="_id"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          loading={loading}
          emptyMessage="No users found"
          className="user-data-table"
          header={`${filteredUsers.length} Users Found`}
          footer={
            reportType === "selected"
              ? `${selectedUsers.length} Users Selected for Report`
              : ""
          }
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column
            header="Profile"
            body={userImageTemplate}
            style={{ width: "60px" }}
          />
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
          <Column field="phoneNo" header="Phone" />
          <Column
            field="type"
            header="Type"
            body={userTypeTemplate}
            sortable
            filter
            filterPlaceholder="Search by type"
          />
          <Column field="status" header="Status" sortable />
          <Column
            field="address"
            header="Address"
            style={{ maxWidth: "200px" }}
            body={(rowData) => (
              <div className="address-cell" title={rowData.address}>
                {rowData.address || "-"}
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header="Generated Report"
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
                <span className="label">Users Included:</span>
                <span className="value">{reportData.userCount}</span>
              </div>
            </div>

            <Divider />

            <div className="report-preview-table">
              <DataTable
                value={reportData.users}
                scrollable
                scrollHeight="400px"
                className="report-data-table"
              >
                <Column field="name" header="Name" />
                <Column field="email" header="Email" />
                <Column field="type" header="Type" body={userTypeTemplate} />
                <Column field="status" header="Status" />
                {reportOptions.includeContactInfo && (
                  <Column field="phoneNo" header="Phone" />
                )}
                {reportOptions.includeLocation && (
                  <Column
                    header="Location"
                    body={(rowData) =>
                      rowData.location ? rowData.location.name : "-"
                    }
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

export default UserReportGenerator;
