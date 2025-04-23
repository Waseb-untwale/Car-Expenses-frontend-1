"use client";
import { useState, useEffect } from "react";
import Sidebar from "../slidebar/page";
import axios from "axios";
import { motion } from "framer-motion";
import baseURL from "@/utils/api";

export default function CabService() {
  const [drivers, setDrivers] = useState([]);
  const [cabs, setCabs] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedCab, setSelectedCab] = useState("");
  const [receiptImage, setReceiptImage] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const token = typeof window !== "undefined" && localStorage.getItem("token");
  const assignedBy = typeof window !== "undefined" && localStorage.getItem("id");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [driversRes, cabsRes, servicesRes] = await Promise.all([
        axios.get(`${baseURL}api/driver/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseURL}api/assigncab`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseURL}api/servicing`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDrivers(driversRes.data);
      setCabs(cabsRes.data);

      // 🔁 Merge each service with corresponding cab data
      const mergedServices = servicesRes.data.services.map((srv) => {
        const matchingCab = cabsRes.data.find((cab) => cab._id === srv.cab?._id);
        return {
          ...srv,
          vehicleServicing: matchingCab?.vehicleServicing || {},
        };
      });

      setServices(mergedServices);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  const handleAssignServicing = async () => {
    if (!selectedCab || !selectedDriver) return alert("Select both cab and driver.");

    try {
      await axios.post(
        `${baseURL}api/servicing/assign`,
        { cabId: selectedCab, driverId: selectedDriver, assignedBy },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Servicing assigned successfully");
      setShowAssignModal(false);
      setSelectedCab("");
      setSelectedDriver("");
      fetchInitialData(); // refresh list
    } catch (err) {
      console.error("Assign error:", err);
      alert("Failed to assign servicing.");
    }
  };

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar />
      <div className="flex-1 p-6 mt-20 sm:mt-0 md:ml-60">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Servicing Assignments</h2>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Assign Servicing
          </button>
        </div>

        {/* ✅ Table */}
        <div className="bg-gray-800 rounded-lg shadow p-4 space-y-4">
          {/* Header - Visible on mobile */}
          <div className="md:hidden grid grid-cols-2 gap-2 text-sm text-gray-400 font-medium">
            <div># & Cab No</div>
            <div>Driver & Status</div>
          </div>

          {services.map((srv, i) => (
            <div
              key={srv._id}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200"
            >
              {/* Mobile View (2 columns) */}
              <div className="md:hidden grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">#</span>
                    <span>{i + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Cab No</span>
                    <span>{srv?.cab?.cabNumber || "-"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Driver</span>
                    <span>{srv?.driver?.name || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Status</span>
                    <span className="capitalize">{srv.status}</span>
                  </div>
                </div>
              </div>

              {/* Amount and Receipt - Full width on mobile */}
              <div className="mt-3 md:mt-0">
                <div className="flex justify-between items-center border-t border-gray-600 pt-3 md:hidden">
                  <span className="text-gray-400">Amount</span>
                  <span>
                    {srv.servicingAmount ? `₹${srv.servicingAmount}` : "-"}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-600 pt-3 md:hidden">
                  <span className="text-gray-400">Receipt</span>
                  <span>
                    {srv.receiptImage ? (
                      <button
                        onClick={() => {
                          setReceiptImage(srv.receiptImage);
                          setShowReceiptModal(true);
                        }}
                        className="text-blue-400 underline hover:text-blue-300 mr-2"
                      >
                        View Receipt
                      </button>
                    ) : (
                      "-"
                    )}
                  </span>
                </div>
              </div>

              {/* Desktop View (hidden on mobile) */}
              <div className="hidden md:grid grid-cols-6 gap-4">
                <div className="text-center">{i + 1}</div>
                <div className="text-center">{srv?.cab?.cabNumber || "-"}</div>
                <div className="text-center">{srv?.driver?.name || "-"}</div>
                <div className="text-center capitalize">{srv.status}</div>
                <div className="text-center">
                  {srv.servicingAmount ? `₹${srv.servicingAmount}` : "-"}
                </div>
                <div className="text-center">
                  {srv.receiptImage ? (
                    <button
                      onClick={() => {
                        setReceiptImage(srv.receiptImage);
                        setShowReceiptModal(true);
                      }}
                      className="text-blue-400 underline hover:text-blue-300 mr-2"
                    >
                      View Receipt
                    </button>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-gradient-to-b bg-black/50 to-transparent backdrop-blur-md flex justify-center items-center z-50 p-4">
            <motion.div
              className="bg-gray-800 p-6 rounded-lg w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-lg font-bold mb-4">Assign Servicing</h3>

              <label className="block mb-2">Select Driver:</label>
              <select
                className="w-full p-2 mb-4 rounded bg-gray-700"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
              >
                <option value="">-- Select Driver --</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name}
                  </option>
                ))}
              </select>

              <label className="block mb-2">Select Cab:</label>
              <select
                className="w-full p-2 mb-4 rounded bg-gray-700"
                value={selectedCab}
                onChange={(e) => setSelectedCab(e.target.value)}
              >
                <option value="">-- Select Cab --</option>
                {cabs
                  .filter((cab) => {
                    const kmTravelled = calculateKmTravelled(cab.tripDetails?.vehicleServicing?.meter || []);
                    return kmTravelled > 10000;
                  })
                  .map((cab) => {
                    const kmTravelled = calculateKmTravelled(cab.tripDetails?.vehicleServicing?.meter || []);
                    return (
                      <option key={cab._id} value={cab._id}>
                        {cab.cabNumber} ({kmTravelled} km)
                      </option>
                    );
                  })}
              </select>

              <div className="flex justify-between gap-3">
                <button
                  onClick={handleAssignServicing}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 w-full"
                >
                  Assign
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 w-full"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ✅ Receipt Modal */}
        {showReceiptModal && (
           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
           <div className="bg-white rounded-lg shadow-lg p-4 w-[90%] md:w-[600px] h-[80%] max-h-[90%] overflow-auto relative">
       
              <h3 className="text-xl font-semibold mb-4">Receipt Image</h3>
              <img
                src={receiptImage}
                alt="Receipt"
                className="w-full max-w-xs mx-auto"
              />
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="bg-red-600 px-4 py-2 rounded text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to calculate km travelled from meter readings
const calculateKmTravelled = (meterReadings) => {
  let totalKm = 0;
  for (let i = 1; i < meterReadings.length; i++) {
    const diff = meterReadings[i] - meterReadings[i - 1];
    if (diff > 0) totalKm += diff;
  }
  return totalKm / 1000;
};


