import { NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
// import fetch from "node-fetch"
import { readFile } from "fs/promises"
import { join } from "path"

export const POST = async (req) => {
  const bodyText = await req.text()
  try {
    const {
      trip,
      cabData,
      companyLogo,
      signature,
      companyName,
      companyInfo,
      invoiceNumber,
      invoiceDate,
    } = JSON.parse(bodyText)

    const extractAmount = (data, paths) => {
      if (!data) return 0
      for (const path of paths) {
        const parts = path.split(".")
        let current = data
        for (const part of parts) {
          if (!current || typeof current !== "object") {
            current = null
            break
          }
          current = current[part]
        }
        if (Array.isArray(current)) {
          const sum = current.reduce((sum, amt) => {
            if (amt === null || amt === undefined) return sum
            if (typeof amt === "string") {
              const cleaned = amt.replace(/[^\d.-]/g, "")
              return sum + (Number(cleaned) || 0)
            }
            return sum + (Number(amt) || 0)
          }, 0)
          if (sum > 0) return sum
        } else if (current !== undefined && current !== null) {
          if (typeof current === "string") {
            const cleaned = current.replace(/[^\d.-]/g, "")
            return Number(cleaned) || 0
          }
          return Number(current) || 0
        }
      }
      return 0
    }

    const formatIndianNumber = (num) => {
      if (num == null || isNaN(Number(num))) return "0.00"
      const parts = num.toFixed(2).split(".")
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      return parts.join(".")
    }

    const numberToWords = (num) => {
      const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ]
      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

      const numToWords = (n) => {
        if (n < 20) return ones[n]
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "")
        if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + numToWords(n % 100) : "")
        if (n < 100000)
          return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "")
        if (n < 10000000)
          return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "")
        return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numToWords(n % 10000000) : "")
      }

      return numToWords(Math.floor(num)) + " Rupees Only"
    }

    const fuel =
      extractAmount(cabData, ["fuel.amount", "tripDetails.fuel.amount"]) ||
      extractAmount(trip, ["cab.fuel.amount", "tripDetails.fuel.amount"]) ||
      0

    const fastTag =
      extractAmount(cabData, ["fastTag.amount", "tripDetails.fastTag.amount"]) ||
      extractAmount(trip, ["cab.fastTag.amount", "tripDetails.fastTag.amount"]) ||
      0

    const tyre =
      extractAmount(cabData, ["tyrePuncture.repairAmount", "tripDetails.tyrePuncture.repairAmount"]) ||
      extractAmount(trip, ["cab.tyrePuncture.repairAmount", "tripDetails.tyrePuncture.repairAmount"]) ||
      0

    const other =
      extractAmount(cabData, ["otherProblems.amount", "tripDetails.otherProblems.amount"]) ||
      extractAmount(trip, ["cab.otherProblems.amount", "tripDetails.otherProblems.amount"]) ||
      0

    const subtotal = fuel + fastTag + tyre + other
    const gst = subtotal * 0.05
    const total = subtotal + gst

    const doc = new jsPDF()
    doc.setProperties({
      title: `Invoice-${trip?.cab?.cabNumber || "Cab"}`,
      author: companyName || "Company",
    })

    if (companyLogo) {
      const imgBuffer = await fetch(companyLogo).then((res) => res.arrayBuffer())
      const base64Logo = Buffer.from(imgBuffer).toString("base64")
      doc.addImage(`data:image/jpeg;base64,${base64Logo}`, "JPEG", 20, 20, 40, 30)
    }

    doc.setFont("helvetica", "bold").setFontSize(16).text(companyName || "Company Name", 70, 30)
    doc.setFont("helvetica", "normal").setFontSize(10)

    if (companyInfo) {
      companyInfo.split("\n").forEach((line, i) => {
        doc.text(line, 70, 40 + i * 5)
      })
    }

    doc.line(20, 65, 190, 65)
    doc.setFontSize(14).text("TAX INVOICE", 105, 72, { align: "center" })
    doc.line(20, 75, 190, 75)

    doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(0, 123, 255)
    doc.text("WTL TOURISM PRIVATE LIMITED", 20, 85)
    doc.setTextColor(0, 0, 0).setFont("helvetica", "normal").setFontSize(10)
    doc.text("Floor No.: First Floor", 20, 92)
    doc.text("Office No. 09, A-Building, S No.53/2A/1, City Vista, Fountain Road, Pune", 20, 99)
    doc.text("State: Maharashtra - 27", 20, 106)
    doc.text("Phone: 8237257618", 20, 113)
    doc.text("GSTIN: 27AADCW8531C1ZD", 20, 120)

    doc.text("Original for Recipient", 150, 85)
    doc.text(`Invoice Number: ${invoiceNumber || "RADIANT-000000"}`, 150, 92)
    doc.text(`Invoice Date: ${invoiceDate || new Date().toLocaleDateString("en-IN")}`, 150, 99)
    doc.text(`Cab Number: ${trip?.cab?.cabNumber || "N/A"}`, 150, 106)

    autoTable(doc, {
      startY: 130,
      head: [["Expense Type", "Amount"]],
      body: [
        ["Fuel", `₹${formatIndianNumber(fuel)}`],
        ["FastTag", `₹${formatIndianNumber(fastTag)}`],
        ["Tyre Puncture", `₹${formatIndianNumber(tyre)}`],
        ["Other Problems", `₹${formatIndianNumber(other)}`],
        ["Subtotal", `₹${formatIndianNumber(subtotal)}`],
        ["GST (5%)", `₹${formatIndianNumber(gst)}`],
        ["Total", `₹${formatIndianNumber(total)}`],
      ],
      theme: "grid",
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 50, halign: "right" },
      },
      styles: { fontSize: 10 },
    })

    const endY = doc.lastAutoTable.finalY + 10
    doc.setFont("helvetica", "italic").text(`Amount in words: ${numberToWords(total)}`, 20, endY)

    doc.setFont("helvetica", "bold").text("Terms & Conditions:", 20, endY + 10)
    doc.setFont("helvetica", "normal")
    const terms = [
      "1. Minimum ₹500 will be charged if trip is canceled.",
      "2. Invoice will be cancelled if not paid in 7 days.",
      "3. Diesel above ₹90/ltr may incur extra charges.",
      "4. Payment due within 15 days of invoice date.",
      "5. Late payments incur 2% monthly interest.",
    ]
    terms.forEach((line, i) => doc.text(line, 20, endY + 17 + i * 7))

    if (signature) {
      const sigBuffer = await fetch(signature).then((res) => res.arrayBuffer())
      const base64Sig = Buffer.from(sigBuffer).toString("base64")
      doc.addImage(`data:image/jpeg;base64,${base64Sig}`, "JPEG", 150, endY + 15, 30, 30)
    }

    doc.setFontSize(8)
    doc.text(`For ${companyName || "________________"}`, 150, endY + 50)
    doc.text("Authorized Signatory", 150, endY + 55)

    const pdfOutput = doc.output("arraybuffer")
    return new NextResponse(Buffer.from(pdfOutput), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${trip?.cab?.cabNumber || "generated"}.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}
