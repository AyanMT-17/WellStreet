import { useState, useEffect } from 'react';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import Header from '../components/Header';


export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState('orders');
  const [activeTab, setActiveTab] = useState('place-order');
  const [orderForm, setOrderForm] = useState({
    symbol: '',
    quantity: '',
    orderType: 'Market Order',
    side: 'Buy'
  });

  const orderTypes = ['Market Order', 'Limit Order', 'Stop Order', 'Stop Limit Order'];
  const sides = ['Buy', 'Sell'];

  const handleInputChange = (field, value) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio/buy`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify(
        {
          symbol: orderForm.symbol.toUpperCase() + '.NS',
          quantity: parseInt(orderForm.quantity),
          orderType: orderForm.orderType.toUpperCase(),

        }
      )
    });
    if (!response.ok) {
      const errorData = await response.json();
      alert(`Error: ${errorData.message}`);
      return;
    }
    const data = await response.json();
    alert(`Order placed successfully! Order ID: ${data.orderId || 'N/A'}`);
  }


  const [orderHistory, setOrderHistory] = useState([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [orderHistoryError, setOrderHistoryError] = useState(null);

  useEffect(() => {
    if (activeTab === 'order-history') {
      setOrderHistoryLoading(true);
      setOrderHistoryError(null);
     
      fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          setOrderHistory(data || []);
          setOrderHistoryLoading(false);
        })
        .catch(err => {
          setOrderHistoryError('Failed to fetch order history');
          setOrderHistoryLoading(false);
        });
        console.log('Fetching order history...');
    }
  }, [activeTab]);

    // Here you would typically make an API call to place the order


  return (
    // THEME UPDATE: Main background color changed to light gray
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          {/* THEME UPDATE: Header text changed to solid gray */}
          <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-500 mt-2">Place new orders and track your trading activity</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          {/* THEME UPDATE: Tab border and text colors updated to gray theme */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('place-order')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'place-order'
                    ? 'border-gray-800 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Place Order
              </button>
              <button
                onClick={() => setActiveTab('order-history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'order-history'
                    ? 'border-gray-800 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Order History
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'place-order' && (
          // THEME UPDATE: Card styles updated for consistency
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              {/* THEME UPDATE: Icon background changed to light gray */}
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-gray-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-700 ml-3">Place New Order</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">Enter your order details below</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock Symbol */}
              <div>
                {/* THEME UPDATE: Form label color changed */}
                <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Symbol
                </label>
                {/* THEME UPDATE: Form input styles changed */}
                <input
                  type="text"
                  id="symbol"
                  placeholder="E.G, AAPL"
                  value={orderForm.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-800 focus:border-gray-800 outline-none bg-white"
                />
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  placeholder="Number of shares"
                  value={orderForm.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-800 focus:border-gray-800 outline-none bg-white"
                />
              </div>

              {/* Order Type */}
              <div>
                <label htmlFor="orderType" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Type
                </label>
                <div className="relative">
                  <select
                    id="orderType"
                    value={orderForm.orderType}
                    onChange={(e) => handleInputChange('orderType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-800 focus:border-gray-800 outline-none appearance-none bg-white"
                  >
                    {orderTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {/* THEME UPDATE: Dropdown arrow color changed */}
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Side */}
              <div>
                <label htmlFor="side" className="block text-sm font-medium text-gray-700 mb-2">
                  Side
                </label>
                <div className="relative">
                  <select
                    id="side"
                    value={orderForm.side}
                    onChange={(e) => handleInputChange('side', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-800 focus:border-gray-800 outline-none appearance-none bg-white"
                  >
                    {sides.map((side) => (
                      <option key={side} value={side}>
                        {side}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <div className="mt-8">
              {/* THEME UPDATE: Button style changed to solid dark gray */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full md:w-auto px-6 py-2 bg-gray-800 text-white rounded-md font-semibold shadow hover:bg-gray-900 transition-colors"
              >
                Place Order
              </button>
            </div>
          </div>
        )}

        {activeTab === 'order-history' && (
          // THEME UPDATE: Card styles updated
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Order History</h2>
            {orderHistoryLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading...</h3>
              </div>
            ) : orderHistoryError ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">{orderHistoryError}</h3>
              </div>
            ) : orderHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                {/* THEME UPDATE: Empty state text colors changed */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders found</h3>
                <p className="text-gray-500">Your order history will appear here once you start trading.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderHistory.map((order, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.symbol}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.orderType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.side}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.date}</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}