import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { FaUsers, FaUserCheck, FaBoxOpen } from "react-icons/fa";
import config from "../../../config/index";
import "./style.css";

const SupplierDashboard = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [supplierDistribution, setSupplierDistribution] = useState({});
  const [productGrowthData, setProductGrowthData] = useState({});
  const [supplierStatusData, setSupplierStatusData] = useState({});
  const toast = useRef(null);

  useEffect(() => {
    fetchAllSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllSuppliers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/api/v1/supplier/seller-by-id`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch suppliers");

      const data = await response.json();
      setSuppliers(data);
      prepareChartData(data);
      prepareSupplierDistribution(data);
      prepareProductGrowthData(data);
      prepareSupplierStatusData(data);

      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Data Loaded",
          detail: "All suppliers loaded successfully",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (data) => {
    let productMap = {};
    data.forEach((supplier) => {
      supplier.products.forEach((product) => {
        if (productMap[product.name]) {
          productMap[product.name] += product.quantity;
        } else {
          productMap[product.name] = product.quantity;
        }
      });
    });

    setChartData({
      labels: Object.keys(productMap),
      datasets: [
        {
          label: "Total Product Quantities",
          data: Object.values(productMap),
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderWidth: 1,
        },
      ],
    });
  };

  const prepareSupplierDistribution = (data) => {
    const supplierNames = data.map((supplier) => supplier.name);
    const productCounts = data.map((supplier) => supplier.products.length);

    setSupplierDistribution({
      labels: supplierNames,
      datasets: [
        {
          data: productCounts,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
        },
      ],
    });
  };

  const prepareProductGrowthData = (data) => {
    let timeline = {};
    data.forEach((supplier) => {
      supplier.products.forEach((product) => {
        const dateKey = product.publishDate;
        timeline[dateKey] = (timeline[dateKey] || 0) + product.quantity;
      });
    });

    const sortedDates = Object.keys(timeline).sort();
    const cumulativeQuantities = [];
    let total = 0;
    sortedDates.forEach((date) => {
      total += timeline[date];
      cumulativeQuantities.push(total);
    });

    setProductGrowthData({
      labels: sortedDates,
      datasets: [
        {
          label: "Total Products Over Time",
          data: cumulativeQuantities,
          fill: true,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgb(54, 162, 235)",
          tension: 0.4,
        },
      ],
    });
  };

  const prepareSupplierStatusData = (data) => {
    const statusCounts = data.reduce((acc, supplier) => {
      acc[supplier.status] = (acc[supplier.status] || 0) + 1;
      return acc;
    }, {});

    setSupplierStatusData({
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
        },
      ],
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
        <h2>Loading Supplier Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Toast ref={toast} />

      {/* Header Section */}
      <div className="supplier-header">
        <h1>Suppliers Dashboard</h1>
      </div>

      {/* Topic Section */}
      <div className="topic-section">
        <h2>Key Insights</h2>
        <div className="topic-cards">
          <Card title="Total Suppliers" className="topic-card">
            <div className="icon">
              <FaUsers />
            </div>
            <h3>{suppliers.length}</h3>
          </Card>
          <Card title="Active Suppliers" className="topic-card">
            <div className="icon">
              <FaUserCheck />
            </div>
            <h3>
              {
                suppliers.filter((supplier) => supplier.status === "active")
                  .length
              }
            </h3>
          </Card>
          <Card title="Total Products" className="topic-card">
            <div className="icon">
              <FaBoxOpen />
            </div>
            <h3>
              {suppliers.reduce(
                (acc, supplier) => acc + supplier.products.length,
                0
              )}
            </h3>
          </Card>
        </div>
      </div>

      {/* Graph Section */}
      <div className="graph-section">
        <h2>Analytics</h2>
        <div className="dashboard-charts">
          <Card title="Total Product Quantities" className="chart-card">
            <Chart type="bar" data={chartData} />
          </Card>
          <Card title="Supplier Distribution" className="chart-card">
            <Chart type="pie" data={supplierDistribution} />
          </Card>
        </div>
        <br />
        <div className="dashboard-charts">
          <Card title="Product Growth Over Time" className="chart-card">
            <Chart type="line" data={productGrowthData} />
          </Card>
          <Card title="Supplier Status Distribution" className="chart-card">
            <Chart type="doughnut" data={supplierStatusData} />
          </Card>
        </div>
      </div>

      {/* Supplier Details Section */}
      <div className="supplier-section">
        <h2>Supplier Details</h2>
        <div className="supplier-cards">
          {suppliers.map((supplier) => (
            <Card
              key={supplier._id}
              title={supplier.name}
              className="supplier-card"
            >
              <div className="supplier-details">
                <p>
                  <strong>Email:</strong> {supplier.email}
                </p>
                <p>
                  <strong>Phone:</strong> {supplier.phoneNo}
                </p>
                <p>
                  <strong>Address:</strong> {supplier.address}
                </p>
                <p>
                  <strong>Status:</strong> {supplier.status}
                </p>
                <p>
                  <strong>Products:</strong>
                </p>
                <ul>
                  {supplier.products.map((product) => (
                    <li key={product._id}>
                      {product.name} - {product.quantity} units
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
