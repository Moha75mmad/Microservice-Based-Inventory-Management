import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../src/components/ui/card.js";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from "react-chartjs-2";
import { Table, TableHead, TableRow, TableCell, TableBody } from "../src/components/ui/table.js";

// ثبت مقیاس‌های مورد نیاز
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [streamData, setStreamData] = useState([]);
  const [inventoryForm, setInventoryForm] = useState({
    product_code: "",
    name: "",
    category: "",
    quantity: 0,
    price: 0.0,
  });
  const [transactionForm, setTransactionForm] = useState({
    product_code: "",
    change: 0,
    transaction_type: "",
    timestamp: "",
  });
  const [orderForm, setOrderForm] = useState({
    customer_name: "",
    product_code: "",
    quantity: 0,
  });
  const [currentPage, setCurrentPage] = useState(1); // صفحه‌ی فعال
  const [itemsPerPage] = useState(50); // تعداد آیتم‌ها در هر صفحه
  const [currentAlertPage, setCurrentAlertPage] = useState(1);
  const [alertsPerPage] = useState(50); // تعداد هشدارها در هر صفحه
  const [currentOrderPage, setCurrentOrderPage] = useState(1); // صفحه‌ی فعال برای سفارش‌ها
  const [ordersPerPage] = useState(50); // تعداد سفارش‌ها در هر صفحه
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1); // صفحه‌ی فعال برای تراکنش‌ها
  const [transactionsPerPage] = useState(50); // تعداد تراکنش‌ها در هر صفحه

  useEffect(() => {
    // Fetch dashboard data
    fetch("http://localhost:8003/dashboard")
      .then((res) => res.json())
      .then((data) => setDashboardData(data))
      .catch((err) => console.error("Failed to fetch dashboard data:", err));

    // Fetch alerts
    fetch("http://localhost:8000/alerts")
      .then((res) => res.json())
      .then((data) => setAlerts(data.alerts || [])) // اگر data.alerts وجود نداشته باشد، آرایه‌ی خالی استفاده می‌شود
      .catch((err) => console.error("Failed to fetch alerts:", err));

    // Fetch orders
    fetch("http://localhost:8001/orders")  // تغییر پورت به 8001
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Failed to fetch orders:", err));
      
    // Fetch inventory
    fetch("http://localhost:8000/inventory/analyze")  // تغییر پورت به 8000
      .then((res) => res.json())
      .then((data) => {
        console.log("Inventory Data:", data);
        setInventory(data.inventory_items || []); // اگر data.inventory_items وجود نداشته باشد، آرایه‌ی خالی استفاده می‌شود
      })
      .catch((err) => console.error("Failed to fetch inventory:", err));

    // Fetch transactions
    fetch("http://localhost:8005/transactions")  // تغییر پورت به 8002
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error("Failed to fetch transactions:", err));
  }, []);

  useEffect(() => {
    const fetchStreamData = async () => {
      try {
        const response = await fetch("http://localhost:8004/stream_data");  // تغییر پورت به 8004
        const data = await response.json();
        setStreamData(data.slice(-20)); // فقط 20 سطر آخر را نگه دارید
      } catch (error) {
        console.error("Failed to fetch stream data:", error);
      }
    };
  
    // فراخوانی اولیه
    fetchStreamData();
  
    // تنظیم interval برای فراخوانی هر 5 ثانیه
    const interval = setInterval(fetchStreamData, 5000);
  
    // پاک کردن interval هنگام unmount کامپوننت
    return () => clearInterval(interval);
  }, []);

  // محاسبه آیتم‌های نمایش داده شده در صفحه‌ی فعال
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(inventory) ? inventory.slice(indexOfFirstItem, indexOfLastItem) : [];

  // محاسبه هشدارهای نمایش داده شده در صفحه‌ی فعال برای alerts
  const indexOfLastAlert = currentAlertPage * alertsPerPage;
  const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
  const currentAlerts = Array.isArray(alerts) ? alerts.slice(indexOfFirstAlert, indexOfLastAlert) : [];

  // محاسبه آیتم‌های نمایش داده شده در صفحه‌ی فعال برای سفارش‌ها
  const indexOfLastOrder = currentOrderPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = Array.isArray(orders) ? orders.slice(indexOfFirstOrder, indexOfLastOrder) : [];

  // محاسبه آیتم‌های نمایش داده شده در صفحه‌ی فعال برای تراکنش‌ها
  const indexOfLastTransaction = currentTransactionPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = Array.isArray(transactions) ? transactions.slice(indexOfFirstTransaction, indexOfLastTransaction) : [];

  // توابع صفحه‌بندی برای محصولات
  const nextPage = () => {
    if (currentPage < Math.ceil(inventory.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // توابع صفحه‌بندی برای alerts
  const nextAlertPage = () => {
    if (currentAlertPage < Math.ceil(alerts.length / alertsPerPage)) {
      setCurrentAlertPage(currentAlertPage + 1);
    }
  };

  const prevAlertPage = () => {
    if (currentAlertPage > 1) {
      setCurrentAlertPage(currentAlertPage - 1);
    }
  };

  // توابع صفحه‌بندی برای سفارش‌ها
  const nextOrderPage = () => {
    if (currentOrderPage < Math.ceil(orders.length / ordersPerPage)) {
      setCurrentOrderPage(currentOrderPage + 1);
    }
  };

  const prevOrderPage = () => {
    if (currentOrderPage > 1) {
      setCurrentOrderPage(currentOrderPage - 1);
    }
  };

  // توابع صفحه‌بندی برای تراکنش‌ها
  const nextTransactionPage = () => {
    if (currentTransactionPage < Math.ceil(transactions.length / transactionsPerPage)) {
      setCurrentTransactionPage(currentTransactionPage + 1);
    }
  };

  const prevTransactionPage = () => {
    if (currentTransactionPage > 1) {
      setCurrentTransactionPage(currentTransactionPage - 1);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8001/orders/place", {  // تغییر پورت به 8001
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderForm),
      });
      if (response.ok) {
        alert("Order placed successfully!");
        setOrderForm({
          customer_name: "",
          product_code: "",
          quantity: 0,
        });
        // بروزرسانی لیست سفارش‌ها
        fetch("http://localhost:8001/orders")  // تغییر پورت به 8001
          .then((res) => res.json())
          .then((data) => setOrders(data))
          .catch((err) => console.error("Failed to fetch orders:", err));
      } else {
        alert("Failed to place order.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleClearAllData = async () => {
    try {
      const response = await fetch("http://localhost:8005/clear-all-data", {  // تغییر پورت به 8005
        method: "POST",
      });
      if (response.ok) {
        alert("All data cleared successfully!");
        // بروزرسانی stateها برای پاک کردن داده‌ها از رابط کاربری
        setInventory([]);
        setOrders([]);
        setTransactions([]);
      } else {
        alert("Failed to clear data.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/inventory/add", {  // تغییر پورت به 8000
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inventoryForm),
      });
      if (response.ok) {
        alert("Inventory item added successfully!");
        setInventoryForm({
          product_code: "",
          name: "",
          category: "",
          quantity: 0,
          price: 0.0,
        });
      } else {
        alert("Failed to add inventory item.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8005/transactions/add", {  // تغییر پورت به 8002
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionForm),
      });
      if (response.ok) {
        alert("Transaction recorded successfully!");
        setTransactionForm({
          product_code: "",
          change: 0,
          transaction_type: "",
          timestamp: "",
        });
      } else {
        alert("Failed to record transaction.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLoadOnlineRetail = async () => {
    try {
      const response = await fetch("http://localhost:8002/inventory/load-online-retail", {  
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        // اختیاری: بروزرسانی داده‌های موجودی پس از بارگذاری
        fetch("http://localhost:8000/inventory/analyze")  
          .then((res) => res.json())
          .then((data) => setInventory(data.low_stock_items || []))
          .catch((err) => console.error("Failed to fetch inventory:", err));
      } else {
        alert("Failed to load Online Retail data.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!dashboardData) return <p>Loading...</p>;

  // Data for the bar chart
  const barData = {
    labels: ["Inventory Items", "Transactions", "Orders"],
    datasets: [
      {
        label: "Counts",
        data: [
          dashboardData.total_inventory_items,
          dashboardData.total_transactions,
          dashboardData.total_orders,
        ],
        backgroundColor: ["#4caf50", "#2196f3", "#ff9800"],
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Inventory Management Dashboard</h1>

      {/* Cards for displaying totals */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold">Total Inventory Items</h2>
            <p className="text-2xl">{dashboardData.total_inventory_items}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold">Total Transactions</h2>
            <p className="text-2xl">{dashboardData.total_transactions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold">Total Orders</h2>
            <p className="text-2xl">{dashboardData.total_orders}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar chart for overview */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Overview</h2>
        <Bar data={barData} options={{ responsive: true }} />
      </div>

      {/* Alerts section */}
      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Alerts</h2>
        {currentAlerts.length > 0 ? (
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '1rem' }}>
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              {currentAlerts.map((alert, index) => (
                <li
                  key={index}
                  style={{
                    padding: '0.75rem 0',
                    borderBottom: index === currentAlerts.length - 1 ? 'none' : '1px solid #e5e7eb',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>{alert}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p style={{ color: '#6b7280' }}>No alerts</p>
        )}
        {/* دکمه‌های صفحه‌بندی برای alerts */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <button
            onClick={prevAlertPage}
            disabled={currentAlertPage === 1}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              opacity: currentAlertPage === 1 ? '0.5' : '1',
              border: 'none',
            }}
          >
            Previous
          </button>
          <button
            onClick={nextAlertPage}
            disabled={currentAlertPage === Math.ceil(alerts.length / alertsPerPage)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              opacity: currentAlertPage === Math.ceil(alerts.length / alertsPerPage) ? '0.5' : '1',
              border: 'none',
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Orders</h2>
        <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Product Code
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Quantity
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
              {orders.slice(-20).length > 0 ? (
                orders.slice(-20).map((order, index) => (
                  <tr
                    key={order.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                      {order.customer_name}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                      {order.product_code}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                      {order.quantity}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                      {order.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#1f2937' }}>
                    No orders available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stream Data Table */}
      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Stream Data (Last 20 Rows)</h2>
        <table style={{ width: '100%', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Customer Name
              </th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rating
              </th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Category
              </th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Comments
              </th>
            </tr>
          </thead>
          <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
            {streamData.length > 0 ? (
              streamData.map((row, index) => (
                <tr key={index} style={{ transition: 'background-color 0.2s', cursor: 'pointer', backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                    {row.customer_name}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                    {row.rating}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                    {row.category}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                    {row.comments}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#1f2937' }}>
                  No stream data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Inventory Form */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Add Inventory Item</h2>
        <form onSubmit={handleInventorySubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Code"
              value={inventoryForm.product_code}
              onChange={(e) =>
                setInventoryForm({ ...inventoryForm, product_code: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Name"
              value={inventoryForm.name}
              onChange={(e) =>
                setInventoryForm({ ...inventoryForm, name: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={inventoryForm.category}
              onChange={(e) =>
                setInventoryForm({ ...inventoryForm, category: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={inventoryForm.quantity}
              onChange={(e) =>
                setInventoryForm({ ...inventoryForm, quantity: parseInt(e.target.value) })
              }
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={inventoryForm.price}
              onChange={(e) =>
                setInventoryForm({ ...inventoryForm, price: parseFloat(e.target.value) })
              }
              required
            />
          </div>
            <button
              type="submit"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                border: 'none',
                marginTop: '1rem',
              }}
            >
              Add Inventory Item
            </button>
        </form>
      </div>

      {/* Add Transaction Form */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Add Transaction</h2>
        <form onSubmit={handleTransactionSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Code"
              value={transactionForm.product_code}
              onChange={(e) =>
                setTransactionForm({ ...transactionForm, product_code: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Change"
              value={transactionForm.change}
              onChange={(e) =>
                setTransactionForm({ ...transactionForm, change: parseInt(e.target.value) })
              }
              required
            />
            <input
              type="text"
              placeholder="Transaction Type"
              value={transactionForm.transaction_type}
              onChange={(e) =>
                setTransactionForm({ ...transactionForm, transaction_type: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Timestamp"
              value={transactionForm.timestamp}
              onChange={(e) =>
                setTransactionForm({ ...transactionForm, timestamp: e.target.value })
              }
              required
            />
          </div>
            <button
              type="submit"
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                border: 'none',
                marginTop: '1rem',
              }}
            >
              Add Transaction
            </button>
        </form>
      </div>

      {/* Add Order Form */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Place New Order</h2>
        <form onSubmit={handleOrderSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Customer Name"
              value={orderForm.customer_name}
              onChange={(e) =>
                setOrderForm({ ...orderForm, customer_name: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Product Code"
              value={orderForm.product_code}
              onChange={(e) =>
                setOrderForm({ ...orderForm, product_code: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={orderForm.quantity}
              onChange={(e) =>
                setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) })
              }
              required
            />
          </div>
            <button
              type="submit"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                border: 'none',
                marginTop: '1rem',
              }}
            >
              Place Order
            </button>
        </form>
      </div>

      {/* Load Online Retail Data Button */}
      <div className="mt-6">
        <button
          onClick={handleLoadOnlineRetail}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            border: 'none',
            marginTop: '1rem',
          }}
        >
          Load Online Retail Data
        </button>
      </div>

      {/* Clear All Data Button */}
      <div className="mt-6">
        <button
          onClick={handleClearAllData}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            border: 'none',
            marginTop: '1rem',
          }}
        >
          Clear All Data
        </button>
      </div>

      {/* All Data Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">All Data</h2>

        {/* All Inventory Table */}
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Inventory</h3>
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Name
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Category
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Quantity
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Price
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {item.category}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {item.price}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#1f2937' }}>
                      No inventory data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* دکمه‌های صفحه‌بندی */}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                opacity: currentPage === 1 ? '0.5' : '1',
                border: 'none',
              }}
            >
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === Math.ceil(inventory.length / itemsPerPage)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                opacity: currentPage === Math.ceil(inventory.length / itemsPerPage) ? '0.5' : '1',
                border: 'none',
              }}
            >
              Next
            </button>
          </div>
        </div>

        {/* All Transactions Table */}
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Transactions</h3>
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Product Code
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Change
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Transaction Type
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {transaction.product_code}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {transaction.change}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {transaction.transaction_type}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {transaction.timestamp}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#1f2937' }}>
                      No transactions available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* دکمه‌های صفحه‌بندی برای تراکنش‌ها */}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <button
              onClick={prevTransactionPage}
              disabled={currentTransactionPage === 1}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                opacity: currentTransactionPage === 1 ? '0.5' : '1',
                border: 'none',
              }}
            >
              Previous
            </button>
            <button
              onClick={nextTransactionPage}
              disabled={currentTransactionPage === Math.ceil(transactions.length / transactionsPerPage)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                opacity: currentTransactionPage === Math.ceil(transactions.length / transactionsPerPage) ? '0.5' : '1',
                border: 'none',
              }}
            >
              Next
            </button>
          </div>
        </div>

        {/* All Orders Table */}
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Orders</h3>
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Customer
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Product Code
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Quantity
                  </th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
                {currentOrders.length > 0 ? (
                  currentOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {order.customer_name}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {order.product_code}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {order.quantity}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', color: '#1f2937', whiteSpace: 'nowrap' }}>
                        {order.status}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#1f2937' }}>
                      No orders available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* دکمه‌های صفحه‌بندی */}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <button
              onClick={prevOrderPage}
              disabled={currentOrderPage === 1}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                opacity: currentOrderPage === 1 ? '0.5' : '1',
                border: 'none',
              }}
            >
              Previous
            </button>
            <button
              onClick={nextOrderPage}
              disabled={currentOrderPage === Math.ceil(orders.length / ordersPerPage)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                opacity: currentOrderPage === Math.ceil(orders.length / ordersPerPage) ? '0.5' : '1',
                border: 'none',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}