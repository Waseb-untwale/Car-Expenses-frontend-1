import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer"
import { toWords } from "number-to-words"

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    border: "2 solid #007BFF",
  },
  logo: {
    width: 90,
    height: 80,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  companyTextWrapper: {
    flex: 1,
    marginLeft: 20,
  },
  companyInfo: {
    fontSize: 10,
    lineHeight: 1.3,
    textAlign: "left",
  },
  doubleLineContainer: {
    marginVertical: 8,
  },
  line: {
    borderBottomWidth: 1,
    borderColor: "#000",
    marginVertical: 1,
  },
  invoiceTitleCentered: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 11,
    marginVertical: 2,
  },
  infoBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  leftInfo: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.3,
  },
  rightInfo: {
    fontSize: 9,
    textAlign: "right",
    lineHeight: 1.5,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#eeeeee",
    padding: 5,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  tableAmount: {
    flex: 1,
    fontSize: 10,
    textAlign: "right",
  },
  rowDivider: {
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    marginHorizontal: 5,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  totalWords: {
    flex: 1,
    fontStyle: "italic",
  },
  totalNumber: {
    flex: 1,
    textAlign: "right",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  terms: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
  },
  signBox: {
    width: 110,
    marginTop: 20,
    height: 100,
  },
})

const numberToWords = (amount) => {
  try {
    // Handle decimal part properly
    const integerPart = Math.floor(amount)
    return toWords(integerPart).replace(/\b\w/g, (l) => l.toUpperCase()) + " Rupees Only"
  } catch (error) {
    console.error("Error converting number to words:", error)
    return "Amount in words unavailable"
  }
}

// Helper function to safely extract and sum amounts from various possible locations
const extractAmounts = (data, paths) => {
  if (!data) return 0

  // Try each possible path to find the amount data
  for (const path of paths) {
    const parts = path.split(".")
    let current = data

    // Navigate through the object path
    for (const part of parts) {
      if (!current || typeof current !== "object") {
        current = null
        break
      }
      current = current[part]
    }

    // If we found an array of amounts, sum them
    if (Array.isArray(current)) {
      // Convert each item to a number, handling string formatting
      const sum = current.reduce((sum, amt) => {
        if (amt === null || amt === undefined) return sum
        
        // If it's a string with currency symbols or commas, clean it up
        if (typeof amt === 'string') {
          // Remove currency symbols, commas, and other non-numeric characters except decimal point
          const cleanedAmount = amt.replace(/[^\d.-]/g, '')
          return sum + (Number(cleanedAmount) || 0)
        }
        
        return sum + (Number(amt) || 0)
      }, 0)
      
      if (sum > 0) return sum
    }
    // If we found a single amount, return it
    else if (current !== undefined && current !== null) {
      if (typeof current === 'string') {
        // Remove currency symbols, commas, and other non-numeric characters except decimal point
        const cleanedAmount = current.replace(/[^\d.-]/g, '')
        return Number(cleanedAmount) || 0
      }
      return Number(current) || 0
    }
  }

  return 0
}

// Function to directly access a nested property using a path string
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined
  
  const parts = path.split('.')
  let current = obj
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = current[part]
  }
  
  return current
}


const InvoicePDF = ({
  cabData,
  trip,
  cabExpense,
  companyLogo,
  invoiceNumber,
  signature,
  companyInfo,
  companyPrefix,
  companyName,
  invoiceDate,
}) => {
  if (!trip) return null

  // Debug the data structure
  console.log("INVOICE DATA:", {
    tripData: trip,
    cabData: cabData,
    cabExpense: cabExpense,
  })

  // First try to use the cabExpense data from the API if available
  let fuelAmount = 0
  let fastTagAmount = 0
  let tyreAmount = 0
  let otherAmount = 0

  // Direct access to specific paths that might contain the amounts
  // For fuel amount
  const directFuelPaths = [
    'cab.fuel.amount',
    'tripDetails.fuel.amount',
    'fuel.amount'
  ]
  
  // Try to find fuel amount directly in the trip object
  for (const path of directFuelPaths) {
    const value = getNestedValue(trip, path)
    if (value) {
      console.log(`Found fuel amount at ${path}:`, value)
      if (Array.isArray(value)) {
        fuelAmount = value.reduce((sum, amt) => {
          if (typeof amt === 'string') {
            // Clean the string value
            const cleanedAmount = amt.replace(/[^\d.-]/g, '')
            return sum + (Number(cleanedAmount) || 0)
          }
          return sum + (Number(amt) || 0)
        }, 0)
      } else if (typeof value === 'string') {
        fuelAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
      } else {
        fuelAmount = Number(value) || 0
      }
      
      if (fuelAmount > 0) break
    }
  }
  
  if (fuelAmount === 0 && cabData && cabData.fuel && cabData.fuel.amount) {
    const value = cabData.fuel.amount
    console.log("Found fuel amount in cabData:", value)
    if (Array.isArray(value)) {
      fuelAmount = value.reduce((sum, amt) => {
        if (typeof amt === 'string') {
          const cleanedAmount = amt.replace(/[^\d.-]/g, '')
          return sum + (Number(cleanedAmount) || 0)
        }
        return sum + (Number(amt) || 0)
      }, 0)
    } else if (typeof value === 'string') {
      fuelAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
    } else {
      fuelAmount = Number(value) || 0
    }
  }

  // For FastTag amount
  const directFastTagPaths = [
    'cab.fastTag.amount',
    'tripDetails.fastTag.amount',
    'fastTag.amount'
  ]
  
  // Try to find FastTag amount directly
  for (const path of directFastTagPaths) {
    const value = getNestedValue(trip, path)
    if (value) {
      console.log(`Found FastTag amount at ${path}:`, value)
      if (Array.isArray(value)) {
        fastTagAmount = value.reduce((sum, amt) => {
          if (typeof amt === 'string') {
            const cleanedAmount = amt.replace(/[^\d.-]/g, '')
            return sum + (Number(cleanedAmount) || 0)
          }
          return sum + (Number(amt) || 0)
        }, 0)
      } else if (typeof value === 'string') {
        fastTagAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
      } else {
        fastTagAmount = Number(value) || 0
      }
      
      if (fastTagAmount > 0) break
    }
  }
  
  // If not found in trip, try cabData
  if (fastTagAmount === 0 && cabData && cabData.fastTag && cabData.fastTag.amount) {
    const value = cabData.fastTag.amount
    console.log("Found FastTag amount in cabData:", value)
    if (Array.isArray(value)) {
      fastTagAmount = value.reduce((sum, amt) => {
        if (typeof amt === 'string') {
          const cleanedAmount = amt.replace(/[^\d.-]/g, '')
          return sum + (Number(cleanedAmount) || 0)
        }
        return sum + (Number(amt) || 0)
      }, 0)
    } else if (typeof value === 'string') {
      fastTagAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
    } else {
      fastTagAmount = Number(value) || 0
    }
  }

  // For Tyre amount
  const directTyrePaths = [
    'cab.tyrePuncture.repairAmount',
    'tripDetails.tyrePuncture.repairAmount',
    'tyrePuncture.repairAmount'
  ]
  
  // Try to find tyre amount directly
  for (const path of directTyrePaths) {
    const value = getNestedValue(trip, path)
    if (value) {
      console.log(`Found tyre amount at ${path}:`, value)
      if (Array.isArray(value)) {
        tyreAmount = value.reduce((sum, amt) => {
          if (typeof amt === 'string') {
            const cleanedAmount = amt.replace(/[^\d.-]/g, '')
            return sum + (Number(cleanedAmount) || 0)
          }
          return sum + (Number(amt) || 0)
        }, 0)
      } else if (typeof value === 'string') {
        tyreAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
      } else {
        tyreAmount = Number(value) || 0
      }
      
      if (tyreAmount > 0) break
    }
  }
  
  // If not found in trip, try cabData
  if (tyreAmount === 0 && cabData && cabData.tyrePuncture && cabData.tyrePuncture.repairAmount) {
    const value = cabData.tyrePuncture.repairAmount
    console.log("Found tyre amount in cabData:", value)
    if (Array.isArray(value)) {
      tyreAmount = value.reduce((sum, amt) => {
        if (typeof amt === 'string') {
          const cleanedAmount = amt.replace(/[^\d.-]/g, '')
          return sum + (Number(cleanedAmount) || 0)
        }
        return sum + (Number(amt) || 0)
      }, 0)
    } else if (typeof value === 'string') {
      tyreAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
    } else {
      tyreAmount = Number(value) || 0
    }
  }

  // For Other Problems amount
  const directOtherPaths = [
    'cab.otherProblems.amount',
    'tripDetails.otherProblems.amount',
    'otherProblems.amount'
  ]
  
  // Try to find other problems amount directly
  for (const path of directOtherPaths) {
    const value = getNestedValue(trip, path)
    if (value) {
      console.log(`Found other problems amount at ${path}:`, value)
      if (Array.isArray(value)) {
        otherAmount = value.reduce((sum, amt) => {
          if (typeof amt === 'string') {
            const cleanedAmount = amt.replace(/[^\d.-]/g, '')
            return sum + (Number(cleanedAmount) || 0)
          }
          return sum + (Number(amt) || 0)
        }, 0)
      } else if (typeof value === 'string') {
        otherAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
      } else {
        otherAmount = Number(value) || 0
      }
      
      if (otherAmount > 0) break
    }
  }
  
  // If not found in trip, try cabData
  if (otherAmount === 0 && cabData && cabData.otherProblems && cabData.otherProblems.amount) {
    const value = cabData.otherProblems.amount
    console.log("Found other problems amount in cabData:", value)
    if (Array.isArray(value)) {
      otherAmount = value.reduce((sum, amt) => {
        if (typeof amt === 'string') {
          const cleanedAmount = amt.replace(/[^\d.-]/g, '')
          return sum + (Number(cleanedAmount) || 0)
        }
        return sum + (Number(amt) || 0)
      }, 0)
    } else if (typeof value === 'string') {
      otherAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
    } else {
      otherAmount = Number(value) || 0
    }
  }

  // Log the extracted amounts for debugging
  console.log("Extracted Amounts:", {
    fuelAmount,
    fastTagAmount,
    tyreAmount,
    otherAmount,
  })

  const subtotal = fuelAmount + fastTagAmount + tyreAmount + otherAmount
  const gst = subtotal * 0.05
  const totalAmount = subtotal + gst

  // Format number with commas for Indian numbering system (e.g., 1,00,000)
  const formatIndianNumber = (num) => {
    console.log("my fuel payment is null",num)
    console.log("my fuel isNan",isNaN(num))
    if (num == null  || isNaN(Number(num))) return '0.00';
    const parts = num.toFixed(2).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  }
 
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <Image style={styles.logo} src={companyLogo || "/placeholder.svg"} />
          <View style={styles.companyTextWrapper}>
            {companyInfo ? (
              <>
                <Text style={[styles.companyInfo, { fontWeight: "bold", fontSize: 11 }]}>
                  {companyName || "Company Name"}
                </Text>
                <Text style={styles.companyInfo}>{companyInfo}</Text>
              </>
            ) : (
              <>
                <Text style={[styles.companyInfo, { fontWeight: "bold", fontSize: 11 }]}>Company Name</Text>
                <Text style={styles.companyInfo}>Address Line 1</Text>
                <Text style={styles.companyInfo}>City, State, Zip</Text>
                <Text style={styles.companyInfo}>Phone: 0000000000</Text>
                <Text style={styles.companyInfo}>GSTIN: XXXXXXXXXXXX</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.doubleLineContainer}>
          <View style={styles.line} />
          <Text style={styles.invoiceTitleCentered}>TAX INVOICE</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.infoBlock}>
          <View style={styles.leftInfo}>
            <Text style={{ fontWeight: "bold", color: "#007BFF" }}>WTL TOURISM PRIVATE LIMITED</Text>
            <Text>Floor No.: First Floor</Text>
            <Text>Office No. 09, A-Building, S No.53/2A/1, City Vista, Fountain Road, Pune</Text>
            <Text>State: Maharashtra - 27</Text>
            <Text>Phone: 8237257618</Text>
            <Text>GSTIN: 27AADCW8531C1ZD</Text>
          </View>
          <View style={styles.rightInfo}>
            <Text>Original for Recipient</Text>
            <Text>Invoice Number: {invoiceNumber || "RADIANT-000000"}</Text>
            <Text>Invoice Date: {invoiceDate || new Date().toLocaleDateString("en-IN")}</Text>
            <Text>Cab Number: {trip.cab?.cabNumber || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.tableCellHeader}>Expense Type</Text>
          <Text style={[styles.tableCellHeader, { textAlign: "right" }]}>Amount</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Fuel</Text>
          <Text style={styles.tableAmount}>₹{formatIndianNumber(fuelAmount)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>FastTag</Text>
          <Text style={styles.tableAmount}>₹{formatIndianNumber(fastTagAmount)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Tyre Puncture</Text>
          <Text style={styles.tableAmount}>₹{formatIndianNumber(tyreAmount)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Other Problems</Text>
          <Text style={styles.tableAmount}>₹{formatIndianNumber(otherAmount)}</Text>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Subtotal</Text>
          <Text style={styles.tableAmount}>₹{formatIndianNumber(subtotal)}</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { fontWeight: "bold" }]}>GST (5%)</Text>
          <Text style={styles.tableAmount}>₹{formatIndianNumber(gst)}</Text>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.totalsRow}>
          <Text style={styles.totalWords}>
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>{numberToWords(totalAmount)}</Text>
          </Text>
          <Text style={styles.totalNumber}>₹{formatIndianNumber(totalAmount)}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.terms}>
            <Text style={{ fontWeight: "bold" }}>Terms & Conditions:</Text>
            <Text>1. Minimum ₹500 will be charged if trip is canceled.</Text>
            <Text>2. Invoice will be cancelled if not paid in 7 days.</Text>
            <Text>3. Diesel above ₹90/ltr may incur extra charges.</Text>
            <Text>4. Payment due within 15 days of invoice date.</Text>
            <Text>5. Late payments incur 2% monthly interest.</Text>
          </View>

          <View style={styles.signBox}>
            <Text style={{ fontSize: 8, textAlign: "center", marginTop: 10 }}>
              For {companyName || "________________"}
            </Text>
            {signature && <Image style={styles.signBox} src={signature || "/placeholder.svg"} />}
            <Text style={{ fontSize: 8, textAlign: "center", marginTop: 4 }}>Authorized Signatory</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default InvoicePDF
