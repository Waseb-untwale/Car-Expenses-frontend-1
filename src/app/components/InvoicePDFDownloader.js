// "use client"

// import { useState } from "react"
// import baseURL from "@/utils/api";

// const InvoicePDFDownloader = ({
//     trip,
//     cabData,
//     cabExpense,
//     companyLogo,
//     invoiceNumber,
//     signature,
//     companyInfo,
//     companyPrefix,
//     companyName,
//     invoiceDate,
// }) => {
//     const [generating, setGenerating] = useState(false)

//     const handleDownload = async () => {
//         try {
//             setGenerating(true)

//             // Create a form data object to send to the server
//             const payload = {
//                 trip,
//                 cabData,
//                 cabExpense,
//                 companyLogo,
//                 invoiceNumber,
//                 signature,
//                 companyInfo,
//                 companyPrefix,
//                 companyName,
//                 invoiceDate,
//             }

//             // Make a POST request to the API route
//             const response = await fetch(`${baseURL}api/assigncab`, {
//                 method: "POST",
//                 headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },

//             })


//             if (!response.ok) {
//                 throw new Error("Failed to generate PDF")
//             }

//             // Get the PDF as a blob
//             const blob = await response.blob()

//             // Create a URL for the blob
//             const url = window.URL.createObjectURL(blob)

//             // Create a temporary link element
//             const link = document.createElement("a")
//             link.href = url
//             link.download = `Invoice-${trip?.cab?.cabNumber || "cab"}.pdf`

//             // Append the link to the body
//             document.body.appendChild(link)

//             // Click the link to trigger the download
//             link.click()

//             // Clean up
//             window.URL.revokeObjectURL(url)
//             document.body.removeChild(link)
//         } catch (error) {
//             console.error("Error downloading PDF:", error)
//             alert("Failed to generate PDF. Please try again.")
//         } finally {
//             setGenerating(false)
//         }
//     }

//     return (
//         <button
//             onClick={handleDownload}
//             disabled={generating}
//             className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
//         >
//             {generating ? "Generating PDF..." : "Download Invoice"}
//         </button>
//     )
// }

// export default InvoicePDFDownloader







"use client";

import { useState } from "react";
import baseURL from "@/utils/api";

const InvoicePDFDownloader = ({
  trip,
  cabData,
  cabExpense,
  companyLogo,
  invoiceNumber,
  signature,
  companyInfo,
  companyPrefix,
  companyName,
  invoiceDate,
}) => {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    // Basic validation before request
    if (!trip || !trip.driverId || !trip.cab?.cabNumber) {
      alert("Missing required trip or cab data. Please check.");
      return;
    }

    try {
      setGenerating(true);

      const payload = {
        driverId: trip.driverId,
        cabNumber: trip.cab.cabNumber,
        assignedBy: trip.assignedBy,
        trip,
        cabData,
        cabExpense,
        companyLogo,
        invoiceNumber,
        signature,
        companyInfo,
        companyPrefix,
        companyName,
        invoiceDate,
      };

      const response = await fetch(`${baseURL}api/assigncab`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText || response.statusText);
        alert(`PDF generation failed: ${errorText || "Unknown error"}`);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const cabNumber = trip.cab.cabNumber || "cab";
      link.href = url;
      link.download = `Invoice-${cabNumber}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download the invoice. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
    >
      {generating ? "Generating PDF..." : "Download Invoice"}
    </button>
  );
};

export default InvoicePDFDownloader;
