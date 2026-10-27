import React from "react";
import "./invoice.css";

const Invoice = ({ order, company }) => {
    return (
        <div id={`invoice-${order._id}`} className="invoice">
            <div className="invoice-header">
                <img src={company.logo} alt="Logo" />
                <div>
                    <h2>{company.name}</h2>
                    <p>{company.address}</p>
                    <p>PAN No.: {company.gst}</p>
                </div>
            </div>

            <hr />

            <div className="invoice-info">
                <div>
                    <p><strong>Invoice No:</strong> {order._id}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                    <p><strong>Customer:</strong> {order.name}</p>
                    <p><strong>Phone:</strong> {order.phone}</p>
                    <p><strong>Address:</strong> {order.address}</p>
                </div>
            </div>

            <table className="invoice-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, i) => (
                        <tr key={i}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price}</td>
                            <td>₹{item.price * item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="invoice-total">
                <h3>Grand Total: ₹{order.totalPrice}</h3>
            </div>

            <p className="invoice-footer">
                Thank you for shopping with us 🙏
            </p>
        </div>
    );
};

export default Invoice;
