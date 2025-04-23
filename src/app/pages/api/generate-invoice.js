import { renderToStream } from "@react-pdf/renderer"
import InvoicePDF from "../../components/InvoicePDF"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const {
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
    } = req.body

    // Create the PDF document
    const document = (
      <InvoicePDF
        trip={trip}
        cabData={cabData}
        cabExpense={cabExpense}
        companyLogo={companyLogo}
        invoiceNumber={invoiceNumber}
        signature={signature}
        companyInfo={companyInfo}
        companyPrefix={companyPrefix}
        companyName={companyName}
        invoiceDate={invoiceDate}
      />
    )

    // Set appropriate headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=Invoice-${trip?.cab?.cabNumber || "cab"}.pdf`)

    // Stream the PDF directly to the response
    const stream = await renderToStream(document)
    stream.pipe(res)
  } catch (error) {
    console.error("Error generating PDF:", error)
    res.status(500).json({ error: "Failed to generate PDF" })
  }
}
