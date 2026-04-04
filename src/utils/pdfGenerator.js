import PDFDocument from "pdfkit";

export const generateInvoicePDF = (data) => {
   return new Promise((resolve, reject) => {
      try {
         const {
            order,
            item,
            finalItemTotal,
            finalPrice,
            originalPrice,
            originalTotal,
            productDiscount,
            couponDiscount,
            itemDiscount,
            offer
         } = data;

         const doc = new PDFDocument({ margin: 50, size: "A4" });
         const buffers = [];

         doc.on("data", (chunk) => buffers.push(chunk));
         doc.on("end", () => resolve(Buffer.concat(buffers)));
         doc.on("error", (err) => reject(err));


         doc.fillColor("#000000")
            .fontSize(25)
            .text("Quavix", { align: "center" });

         doc.moveDown(2);

         const startY = doc.y;


         doc.fontSize(10)
            .fillColor("#000000")
            .text("Quavix Technologies Pvt. Ltd.", 50, startY)
            .fontSize(9)
            .fillColor("#555555")
            .text("Cyberpark, 4th Floor", 50)
            .text("Kozhikode, Kerala - 673016", 50)
            .text("GSTIN: 32AAAAA0000A1Z5", 50)
            .text("Email: support@quavix.com", 50);

         const metaX = 400;
         doc.fillColor("#000000")
            .fontSize(11)
            .text(`#${order.orderId}`, metaX, startY, { align: "right", width: 145 })
            .fontSize(9)
            .fillColor("#555555")
            .text(`Date of Issue: ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, metaX, doc.y, { align: "right", width: 145 })
            .text(`Payment Term: ${order.paymentMethod === "cod" ? "Cash On Delivery" : "Prepaid"}`, metaX, doc.y, { align: "right", width: 145 });

         doc.moveDown(2);
         doc.strokeColor("#000000").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
         doc.moveDown(1.5);

         const addressY = doc.y;


         doc.fillColor("#000000")
            .fontSize(8)
            .text("BILL TO", 50, addressY)
            .moveDown(0.5)
            .fontSize(10)
            .text(order.shippingAddress.fullname)
            .fontSize(9)
            .fillColor("#555555")
            .text(order.shippingAddress.street)
            .text(`${order.shippingAddress.city} - ${order.shippingAddress.pincode}`)
            .text(order.shippingAddress.state)
            .text(`Phone: ${order.shippingAddress.phone}`);


         doc.fillColor("#000000")
            .fontSize(8)
            .text("SHIPPING ADDRESS", 300, addressY)
            .moveDown(0.5)
            .fontSize(10)
            .text(order.shippingAddress.fullname)
            .fontSize(9)
            .fillColor("#555555")
            .text(order.shippingAddress.street)
            .text(`${order.shippingAddress.city} - ${order.shippingAddress.pincode}`)
            .text(order.shippingAddress.state)
            .text(`Phone: ${order.shippingAddress.phone}`);

         doc.moveDown(3);


         const tableTop = doc.y;
         const itemColX = 50;
         const priceColX = 300;
         const qtyColX = 400;
         const totalColX = 480;


         doc.fillColor("#000000")
            .fontSize(9)
            .text("PRODUCT", itemColX, tableTop)
            .text("PRICE", priceColX, tableTop)
            .text("QTY", qtyColX, tableTop)
            .text("TOTAL", totalColX, tableTop, { align: "right" });

         doc.moveDown(0.5);
         doc.strokeColor("#000000").lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
         doc.moveDown(0.8);


         const rowY = doc.y;
         doc.fontSize(10)
            .text(item.productName, itemColX, rowY, { width: 230 });

         if (item.attributes && item.attributes.length > 0) {
            doc.fontSize(8)
               .fillColor("#777777")
               .text(item.attributes.map(a => a.value).join(" | "), itemColX, doc.y + 2);
         }

         doc.fillColor("#000000")
            .fontSize(10)
            .text(`${finalPrice.toLocaleString("en-IN")}`, priceColX, rowY)
            .text(item.quantity.toString(), qtyColX, rowY)
            .text(`${finalItemTotal.toLocaleString("en-IN")}`, totalColX, rowY, { align: "right" });

         doc.moveDown(2);
         doc.strokeColor("#eeeeee").lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
         doc.moveDown(1.5);


         const summaryX = 350;
         const summaryValueX = 480;


         doc.fontSize(9)
            .fillColor("#555555")
            .text("Sub Total", summaryX, doc.y)
            .fillColor("#000000")
            .text(`${originalTotal.toLocaleString("en-IN")}`, summaryValueX, doc.y - 9, { align: "right" });

         doc.moveDown(0.8);


         doc.fontSize(9)
            .fillColor("#555555")
            .text("Discount", summaryX, doc.y)
            .fillColor("#2d6a4f")
            .text(`- ${itemDiscount.toLocaleString("en-IN")}`, summaryValueX, doc.y - 9, { align: "right" });

         doc.moveDown(0.8);

         doc.fontSize(9)
            .fillColor("#555555")
            .text("Shipping", summaryX, doc.y)
            .fillColor("#000000")
            .text("0", summaryValueX, doc.y - 9, { align: "right" });

         doc.moveDown(1.5);
         doc.strokeColor("#000000").lineWidth(1).moveTo(summaryX, doc.y).lineTo(545, doc.y).stroke();
         doc.moveDown(1);

         doc.fontSize(12)
            .fillColor("#000000")
            .text("Grand Total", summaryX, doc.y)
            .text(`${finalItemTotal.toLocaleString("en-IN")}`, summaryValueX, doc.y - 12, { align: "right" });


         doc.fontSize(8)
            .fillColor("#777777")
            .text("Thank you for shopping with Quavix!", 50, 750, { align: "center", width: 500 });

         doc.end();

      } catch (error) {
         reject(error);
      }
   });
};
