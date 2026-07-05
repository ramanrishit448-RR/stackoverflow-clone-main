import PDFDocument from "pdfkit";

export const generateInvoicePdf = (invoice, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on("error", (err) => {
      reject(err);
    });

    // Draw invoice layout
    // Title & Logo
    doc.fillColor("#f97316").fontSize(20).text("StackOverflow Clone", 50, 50);
    doc.fillColor("#475569").fontSize(10).text("Premium Membership Invoice", 50, 75);
    
    // Metadata on the right
    doc.fillColor("#2d3748").fontSize(10);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 350, 50);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 350, 68);
    doc.text(`Status: Paid`, 350, 86);

    // Line separator
    doc.moveTo(50, 115).lineTo(550, 115).strokeColor("#cbd5e1").stroke();

    // Bill To details
    doc.fillColor("#2d3748").fontSize(11).text("Bill To:", 50, 130, { underline: true });
    doc.fontSize(10).text(`Name: ${invoice.billingName || user.name}`, 50, 150);
    doc.text(`Email: ${invoice.billingEmail || user.email}`, 50, 165);
    doc.text(`Address: ${invoice.billingAddress || "N/A"}`, 50, 180, { width: 250 });

    // Payment details on the right
    doc.fontSize(11).text("Payment Details:", 350, 130, { underline: true });
    doc.fontSize(10).text("Gateway: Razorpay Online Payment", 350, 150);
    doc.text(`Transaction ID: ${invoice.paymentId}`, 350, 165);

    // Table header
    doc.moveTo(50, 220).lineTo(550, 220).strokeColor("#cbd5e1").stroke();
    doc.fillColor("#1a202c").fontSize(10);
    doc.text("Plan Description", 60, 230);
    doc.text("Billing Cycle", 250, 230);
    doc.text("Amount (INR)", 450, 230);
    doc.moveTo(50, 245).lineTo(550, 245).strokeColor("#cbd5e1").stroke();

    // Table rows
    doc.fillColor("#4a5568");
    doc.text(`${invoice.planName.toUpperCase()} Plan Subscription`, 60, 260);
    doc.text("Monthly", 250, 260);
    doc.text(`INR ${invoice.amount}.00`, 450, 260);

    doc.moveTo(50, 280).lineTo(550, 280).strokeColor("#cbd5e1").stroke();

    // Total
    doc.fillColor("#1a202c").fontSize(11).text("Total Amount Paid:", 300, 300, { align: "right", width: 130 });
    doc.text(`INR ${invoice.amount}.00`, 450, 300);

    // Footer note
    doc.fillColor("#718096").fontSize(9).text("Thank you for your premium membership!", 50, 360, { align: "center", width: 500 });
    doc.text("This is a computer-generated invoice. No signature is required.", 50, 375, { align: "center", width: 500 });

    doc.end();
  });
};
