

/* ===================== PDF DOWNLOAD ===================== */


/* ===================== PRINT INVOICE ===================== */
export const printInvoice = (orderId) => {
    const element = document.getElementById(`invoice-${orderId}`);
    if (!element) return alert("Invoice not found");

    const printWindow = window.open("", "_blank", "width=900,height=650");

    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        color: #000;
                    }
                    .invoice {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto;
                        border: 1px solid #ddd;
                        padding: 10px;
                    }
                    .invoice-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        padding:20px;
                    }
                    .invoice-header img {
                        max-width: 150px;
                    }
                    .invoice-details {
                        margin-bottom: 20px;
                    }
                    .invoice-details p {
                        margin: 4px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    table, th, td {
                        border: 1px solid #ddd;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                    }
                    .total {
                        text-align: right;
                        font-weight: bold;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .invoice {
                            border: none;
                            margin: 0;
                        }
                    }
                </style>
            </head>
            <body>
                ${element.outerHTML}
            </body>
        </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    };
};


/* ===================== SHIPPING SLIP ===================== */
export const printShippingSlip = (order) => {
    const win = window.open("", "_blank", "width=600,height=500");

    win.document.open();
    win.document.write(`
    <html>
      <head>
        <title>Shipping Slip</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h2 {
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          p {
            margin: 8px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <h2>Shipping Label</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Name:</strong> ${order.name || "Customer"}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p><strong>Address:</strong><br/>${order.address}</p>
      </body>
    </html>
  `);

    win.document.close();

    win.onload = () => {
        win.focus();
        win.print();
        win.close();
    };
};
