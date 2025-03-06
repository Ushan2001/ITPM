import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Polygon,
  Marker,
} from "@react-google-maps/api";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useLocation } from "react-router-dom";
import config from "../../../config/index";

const MapComponent = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: config.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [polygons, setPolygons] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 });
  const [zoomLevel] = useState(10);
  const [selectedPolygons, setSelectedPolygons] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const toastRef = useRef(null);
  const mapRef = useRef(null);
  const authToken = localStorage.getItem("token");
  const location = useLocation();
  const { sellerId } = location.state || {};

  const fetchPolygons = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/polygon`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      const polygonsData = data.map((item) => ({
        id: item._id,
        coordinates: item.coordinates,
        name: item.name,
      }));

      setPolygons(polygonsData);
    } catch (error) {
      console.error("Error fetching polygons:", error);
      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load polygons.",
      });
    }
  };

  const fetchTrainerSelectedPolygons = async () => {
    try {
      const response = await fetch(
        `${config.apiUrl}/api/v1/available-location/${sellerId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();
      const trainerPolygons = data.locations.map((location) => ({
        id: location._id,
        name: location.name,
      }));

      setSelectedPolygons(trainerPolygons);
    } catch (error) {
      console.error("Error fetching trainer-selected polygons:", error);
      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load trainer-selected polygons.",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchPolygons();
      if (sellerId) {
        await fetchTrainerSelectedPolygons();
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  const getCenterOfPolygon = (coordinates) => {
    const latitudes = coordinates.map((coord) => coord.lat);
    const longitudes = coordinates.map((coord) => coord.lng);
    const centerLat =
      latitudes.reduce((acc, lat) => acc + lat, 0) / latitudes.length;
    const centerLng =
      longitudes.reduce((acc, lng) => acc + lng, 0) / longitudes.length;
    return { lat: centerLat, lng: centerLng };
  };

  const togglePolygonSelection = (polygon) => {
    const isSelected = selectedPolygons.some((item) => item.id === polygon.id);
    setSelectedPolygons((prevSelected) => {
      if (isSelected) {
        return prevSelected.filter((item) => item.id !== polygon.id);
      } else {
        return [...prevSelected, polygon];
      }
    });
    toastRef.current.show({
      severity: isSelected ? "info" : "success",
      summary: isSelected ? "Polygon Deselected" : "Polygon Selected",
      detail: `You ${isSelected ? "deselected" : "selected"}: ${polygon.name}`,
    });
  };

  const saveSelectedPolygons = async () => {
    if (selectedPolygons.length === 0) {
      toastRef.current.show({
        severity: "warn",
        summary: "No Polygons Selected",
        detail: "Please select at least one polygon before saving.",
      });
      return;
    }

    try {
      const response = await fetch(
        `${config.apiUrl}/api/v1/available-location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            userId: sellerId,
            locations: selectedPolygons.map((polygon) => polygon.id),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save selected polygons.");
      }

      toastRef.current.show({
        severity: "success",
        summary: "Success",
        detail: "Selected polygons saved successfully.",
      });
      setSelectedPolygons([]);
      fetchTrainerSelectedPolygons();
    } catch (error) {
      console.error("Error saving polygons:", error);
      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to save selected polygons.",
      });
    }
  };

  const RestButton = () => {
    setSelectedPolygons([]);
  };

  const dialogFooter = (
    <div>
      <Button
        label="Close"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setShowDialog(false)}
      />
    </div>
  );

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ marginTop: "2%" }}>
      <Toast ref={toastRef} />
      <Card title="Google Map Polygon Display">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "500px" }}
          center={mapCenter}
          zoom={zoomLevel}
          options={{
            disableDoubleClickZoom: true,
            gestureHandling: "greedy",
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => (mapRef.current = map)}
          onDragEnd={() => {
            if (mapRef.current) {
              const newCenter = mapRef.current.getCenter();
              setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
            }
          }}
        >
          {polygons.map((polygon, index) => {
            const isSelected = selectedPolygons.some(
              (selectedPolygon) => selectedPolygon.id === polygon.id
            );

            return (
              <React.Fragment key={polygon.id}>
                <Polygon
                  paths={polygon.coordinates}
                  options={{
                    fillColor: isSelected ? "#FFD700" : "#8BFFFF",
                    fillOpacity: 0.5,
                    strokeColor: isSelected ? "#FFD700" : "#8BFFFF",
                    strokeWeight: 2,
                  }}
                  onClick={() => togglePolygonSelection(polygon)}
                />
                <Marker
                  key={`${polygon.id}-marker`}
                  position={getCenterOfPolygon(polygon.coordinates)}
                  icon={{
                    url: config.ICON_URL,
                  }}
                  label={{
                    text: polygon.name,
                    color: "black",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
              </React.Fragment>
            );
          })}
        </GoogleMap>
      </Card>

      <Card title="Saved Polygons" style={{ marginTop: "20px" }}>
        <Button
          label="Save Selected Polygons"
          icon="pi pi-save"
          className="p-button-success"
          onClick={saveSelectedPolygons}
          disabled={selectedPolygons.length === 0}
          style={{ marginBottom: "10px" }}
        />{" "}
        &nbsp;&nbsp;
        <Button
          label="Clear Current Polygon"
          icon="pi pi-times"
          className="p-button-warning"
          onClick={RestButton}
          disabled={selectedPolygons.length === 0}
          style={{ marginBottom: "10px" }}
        />{" "}
        &nbsp;&nbsp;
        <Button
          label="View All Polygons"
          icon="pi pi-eye"
          className="p-button-primary"
          onClick={() => setShowDialog(true)}
          style={{ marginBottom: "10px" }}
        />
        <Dialog
          visible={showDialog}
          header="All Polygons"
          footer={dialogFooter}
          style={{ width: "80vw" }}
          onHide={() => setShowDialog(false)}
          maximizable
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {polygons.map((polygon) => {
              const isSelected = selectedPolygons.some(
                (item) => item.id === polygon.id
              );

              return (
                <Card
                  key={polygon.id}
                  title={polygon.name}
                  style={{
                    border: isSelected ? "2px solid #FFD700" : "1px solid #ccc",
                    backgroundColor: isSelected ? "#FFF9D6" : "#f9f9f9",
                    color: "#000",
                  }}
                  footer={
                    <Button
                      label={isSelected ? "Deselect" : "Select"}
                      icon={isSelected ? "pi pi-times" : "pi pi-check"}
                      className={`p-button-${
                        isSelected ? "danger" : "success"
                      }`}
                      onClick={() => togglePolygonSelection(polygon)}
                    />
                  }
                >
                  <p
                    style={{
                      color: isSelected ? "#FF4500" : "#333",
                      fontWeight: isSelected ? "bold" : "normal",
                    }}
                  >
                    {isSelected
                      ? "This polygon is currently selected."
                      : "Click Select to include this polygon."}
                  </p>
                </Card>
              );
            })}
          </div>
        </Dialog>
      </Card>
      <br />
      <br />
    </div>
  );
};

export default MapComponent;
