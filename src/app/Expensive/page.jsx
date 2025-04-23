
"use client"

import { useState, useEffect } from "react"
import Sidebar from "../slidebar/page"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import baseURL from "@/utils/api"

const CabExpenses = () => {
  const [expenses, setExpenses] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [loading, setLoading] = useState(false)

  const exportToExcel = () => {
    if (expenses.length === 0) {
      alert("No data to export!")
      return
    }

    setLoading(true)
    try {
      const formattedData = expenses.map((cab, index) => ({
        ID: index + 1,
        "Cab Number": cab.cabNumber || "N/A",
        Date: cab.cabDate ? new Date(cab.cabDate).toLocaleDateString() : "N/A",
        "Fuel (₹)": cab.breakdown.fuel || 0,
        "FastTag (₹)": cab.breakdown.fastTag || 0,
        "Tyre Repair (₹)": cab.breakdown.tyrePuncture || 0,
        "Other Expenses (₹)": cab.breakdown.otherProblems || 0,
        "Total Expense (₹)": cab.totalExpense,
      }))

      const worksheet = XLSX.utils.json_to_sheet(formattedData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Cab Expenses")
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      saveAs(data, "CabExpenses.xlsx")
      alert("Export successful!")
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Failed to export data")
    } finally {
      setLoading(false)
    }
  }

  const fetchExpenses = async (cabNumber = "", dateFilter = {}) => {
    setLoading(true)
    try {
      let url = `${baseURL}api/cabs/cabExpensive`
      const params = new URLSearchParams()

      if (cabNumber) params.append("cabNumber", cabNumber)
      if (dateFilter.fromDate) params.append("fromDate", dateFilter.fromDate)
      if (dateFilter.toDate) params.append("toDate", dateFilter.toDate)

      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setExpenses(data.data || [])
      } else {
        setExpenses([])
      }
    } catch (error) {
      console.error("Error fetching expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchExpenses(searchQuery.trim())
    setFromDate("")
    setToDate("")
  }

  const handleDateFilter = () => {
    if (!fromDate || !toDate) {
      alert("Please select both start and end dates")
      return
    }
    setSearchQuery("")
    fetchExpenses("", { fromDate, toDate })
  }

  return (
    <div className="flex min-h-screen bg-gray-800">
      <Sidebar />

      <div className="flex-1 md:ml-60 p-4 md:p-6 text-white mt-20 sm:mt-0 transition-all duration-300">
        <h1 className="text-xl md:text-2xl font-bold mb-4">Cab Expengo</h1>

        <div className="space-y-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search by Cab Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 rounded w-full sm:w-64 text-white "
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-white ">
              <span>From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border p-2 rounded text-white " 
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-white ">
              <span>To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border p-2 rounded text-white "
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleDateFilter}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Filter by Date
              </button>
              <button
                onClick={() => {
                  setFromDate("")
                  setToDate("")
                  setSearchQuery("")
                  fetchExpenses()
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Reset Filters
              </button>
              <button
                onClick={exportToExcel}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Exporting..." : "Export to Excel"}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-700 h-16 rounded-md"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="hidden md:block bg-gray-700 shadow-lg rounded-lg overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="p-3 text-left">Cab Number</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Breakdown</th>
                    <th className="p-3 text-left">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length > 0 ? (
                    expenses.map((cab, index) => (
                      <tr key={`${cab.cabNumber}-${index}`} className="border-b border-gray-600 hover:bg-gray-600">
                        <td className="p-3 font-medium">{cab.cabNumber}</td>
                        <td className="p-3">{cab.cabDate ? new Date(cab.cabDate).toLocaleDateString() : "N/A"}</td>
                        <td className="p-3 text-sm">
                          <ul className="space-y-1">
                            <li>Fuel: ₹{cab.breakdown.fuel}</li>
                            <li>FastTag: ₹{cab.breakdown.fastTag}</li>
                            <li>Tyre: ₹{cab.breakdown.tyrePuncture}</li>
                            <li>Other: ₹{cab.breakdown.otherProblems}</li>
                          </ul>
                        </td>
                        <td className="p-3 font-medium">₹{cab.totalExpense}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-4 text-center">No expenses found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {expenses.length > 0 ? (
                expenses.map((cab, index) => (
                  <div key={`${cab.cabNumber}-${index}`} className="bg-gray-700 p-4 rounded-lg shadow">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-gray-400 text-sm">Cab Number</p>
                        <p className="font-medium">{cab.cabNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Date</p>
                        <p>{cab.cabDate ? new Date(cab.cabDate).toLocaleDateString() : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total</p>
                        <p className="font-medium">₹{cab.totalExpense}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Breakdown</p>
                      <div className="bg-gray-800 p-3 rounded">
                        <p>Fuel: ₹{cab.breakdown.fuel}</p>
                        <p>FastTag: ₹{cab.breakdown.fastTag}</p>
                        <p>Tyre: ₹{cab.breakdown.tyrePuncture}</p>
                        <p>Other: ₹{cab.breakdown.otherProblems}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-white bg-gray-700 rounded-lg">
                  No expenses found
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CabExpenses
