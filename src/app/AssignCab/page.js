
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Sidebar from "../slidebar/page"
import { motion } from "framer-motion"
import { FaCar, FaClipboardList, FaCalendarAlt, FaUpload, FaPlus } from "react-icons/fa"
import baseURL from "@/utils/api"

export default function AssignCab() {
  const [drivers, setDrivers] = useState([])
  const [cabs, setCabs] = useState([])
  const [selectedDriver, setSelectedDriver] = useState("")
  const [selectedCab, setSelectedCab] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  // Add Cab form state
  const [showAddCabForm, setShowAddCabForm] = useState(false)
  const [cabFormData, setCabFormData] = useState({
    cabNumber: "",
    insuranceNumber: "",
    insuranceExpiry: "",
    registrationNumber: "",
    cabImage: null,
    addedBy: "",
  })
  const [cabFormErrors, setCabFormErrors] = useState({})
  const [cabFormSuccess, setCabFormSuccess] = useState("")

  useEffect(() => {
    // Set the addedBy from localStorage when component mounts
    if (typeof window !== "undefined") {
      setCabFormData((prev) => ({
        ...prev,
        addedBy: localStorage.getItem("id") || "",
      }))
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (typeof window === "undefined") return

        const token = localStorage.getItem("token")

        if (!token) {
          setMessage("⚠️ Authentication token missing.")
          setLoading(false)
          return
        }

        const [driversRes, cabsRes] = await Promise.all([
          axios.get(`${baseURL}api/driver/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseURL}api/cabDetails`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        setDrivers(driversRes.data || [])
        setCabs(cabsRes.data || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setMessage("❌ Failed to load drivers and cabs.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [cabFormSuccess]) // Refetch cabs when a new cab is added

  const handleAssign = async () => {
    if (!selectedDriver || !selectedCab) {
      setMessage("⚠️ Please select both driver and cab.")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const assignedBy = localStorage.getItem("id")

      if (!token || !assignedBy) {
        setMessage("⚠️ Authentication failed. Please log in again.")
        return
      }

      const response = await axios.post(
        `${baseURL}api/assigncab/`,
        {
          driverId: selectedDriver,
          cabNumber: selectedCab,
          assignedBy,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setMessage("✅ Cab assigned successfully!")
      setSelectedDriver("")
      setSelectedCab("")

      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error assigning cab:", error.response?.data || error)
      setMessage(`❌ ${error.response?.data?.message || "Error assigning cab."}`)
    }
  }

  // Add Cab form handlers
  const handleCabFormChange = (e) => {
    if (e.target.name === "cabImage") {
      setCabFormData({ ...cabFormData, cabImage: e.target.files[0] })
    } else {
      setCabFormData({ ...cabFormData, [e.target.name]: e.target.value })
    }
    setCabFormErrors({ ...cabFormErrors, [e.target.name]: "" })
  }

  const validateCabForm = () => {
    const newErrors = {}
    if (!cabFormData.cabNumber.trim()) newErrors.cabNumber = "Cab Number is required"
    if (!cabFormData.insuranceNumber.trim()) newErrors.insuranceNumber = "Insurance Number is required"
    if (!cabFormData.insuranceExpiry.trim()) newErrors.insuranceExpiry = "Insurance Expiry is required"
    if (!cabFormData.registrationNumber.trim()) newErrors.registrationNumber = "Registration Number is required"
    if (!cabFormData.cabImage) newErrors.cabImage = "Cab image is required"

    setCabFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddCabSubmit = async (e) => {
    e.preventDefault()
    if (!validateCabForm()) return
  
    setLoading(true)
    setCabFormSuccess("")
  
    try {
      const token = localStorage.getItem("token")
      const formDataToSend = new FormData()
  
      Object.keys(cabFormData).forEach((key) => {
        if (typeof cabFormData[key] === "object" && !(cabFormData[key] instanceof File)) {
          formDataToSend.append(key, JSON.stringify(cabFormData[key])) // Convert nested objects to JSON
        } else {
          formDataToSend.append(key, cabFormData[key]) // Append normal values
        }
      })
  
      const response = await fetch(`${baseURL}api/cabDetails/add`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }, // Do NOT set 'Content-Type' manually
        body: formDataToSend,
      })
  
      const data = await response.json()
  
      if (response.ok) {
        setCabFormSuccess("Cab added successfully!")
        setCabFormData({
          cabNumber: "",
          insuranceNumber: "",
          insuranceExpiry: "",
          registrationNumber: "",
          cabImage: "", // Keep it empty string to prevent file upload issues
          addedBy: localStorage.getItem("id") || "",
        })
        setTimeout(() => {
          setShowAddCabForm(false)
        }, 1500)
      } else {
        setCabFormErrors({ apiError: data.error || "Something went wrong" })
      }
    } catch (error) {
      setCabFormErrors({ apiError: "Server error, try again later" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="flex min-h-screen bg-gray-900 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 md:mt-46 md:ml-60 mt-20 sm:mt-0 transition-all duration-300">
        <motion.div
          className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-auto shadow-lg"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-center text-white mb-6">Assign Cab</h2>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block font-medium mb-2 text-white">Driver:</label>
                  <select
                    className="border border-gray-600 p-3 w-full bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                  >
                    <option value="">Select Driver</option>
                    {drivers.length > 0 ? (
                      drivers.map((driver) => (
                        <option key={driver._id} value={driver._id}>
                          {driver.name} - {driver.licenseNumber}
                        </option>
                      ))
                    ) : (
                      <option disabled>No drivers available</option>
                    )}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-medium text-white">Cab:</label>
                    <button
                      onClick={() => setShowAddCabForm(true)}
                      className="flex items-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded"
                    >
                      <FaPlus className="mr-1" /> Add Cab
                    </button>
                  </div>
                  <select
                    className="border border-gray-600 p-3 w-full bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCab}
                    onChange={(e) => setSelectedCab(e.target.value)}
                  >
                    <option value="">Select Cab</option>
                    {cabs.length > 0 ? (
                      cabs.map((cab) => (
                        <option key={cab._id} value={cab._id}>
                          {cab.cabNumber} - {cab.model}
                        </option>
                      ))
                    ) : (
                      <option disabled>No cabs available</option>
                    )}
                  </select>
                </div>
              </div>

              <button
                onClick={handleAssign}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300 font-medium"
              >
                Assign Cab
              </button>


              {message && (
                <motion.p
                  className={`mt-4 text-center font-medium text-sm md:text-base ${message.startsWith("✅")
                      ? "text-green-400"
                      : message.startsWith("⚠️")
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {message}
                </motion.p>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Add Cab Modal */}
      {showAddCabForm && (
        <div className="fixed inset-0 bg-gradient-to-b bg-black/50 to-transparent backdrop-blur-md  flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add New Cab</h3>
              <button
                onClick={() => {
                  setShowAddCabForm(false)
                  setCabFormErrors({})
                  setCabFormSuccess("")
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {cabFormSuccess && <p className="text-green-500 text-center mb-4">{cabFormSuccess}</p>}

            <form onSubmit={handleAddCabSubmit} encType="multipart/form-data">
              {[
                { name: "cabNumber", icon: <FaCar />, placeholder: "Cab Number" },
                { name: "insuranceNumber", icon: <FaClipboardList />, placeholder: "Insurance Number" },
                {
                  name: "insuranceExpiry",
                  icon: <FaCalendarAlt />,
                  placeholder: "Insurance Expiry Date",
                  type: "date",
                },
                { name: "registrationNumber", icon: <FaClipboardList />, placeholder: "Registration Number" },
              ].map(({ name, icon, placeholder, type = "text" }, index) => (
                <div key={index} className="relative mt-4">
                  <div className="absolute left-3 top-3 text-white">{icon}</div>
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    className="w-full bg-gray-700 text-white pl-10 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onChange={handleCabFormChange}
                    value={cabFormData[name]}
                  />
                  {cabFormErrors[name] && <p className="text-red-500 text-sm mt-1">{cabFormErrors[name]}</p>}
                </div>
              ))}

              <div className="relative mt-4">
                <FaUpload className="absolute left-3 top-3 text-white" />
                <input
                  type="file"
                  name="cabImage"
                  accept="image/*"
                  className="w-full bg-gray-700 text-white p-3 pl-10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={handleCabFormChange}
                />
                {cabFormErrors.cabImage && <p className="text-red-500 text-sm mt-1">{cabFormErrors.cabImage}</p>}
              </div>

              {cabFormErrors.apiError && <p className="text-red-500 text-sm mt-4">{cabFormErrors.apiError}</p>}

              <button
                type="submit"
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg mt-4 font-medium"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Cab"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}



