import React, { useState } from 'react';
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

  const handlePlaceOrder = () => {
    console.log('Placing order:', orderForm);
    // Here you would typically make an API call to place the order
  };

  return (
    <div className="min-h-screen bg-yellow-200">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">Orders</h1>
          <p className="text-amber-700 mt-2">Place new orders and track your trading activity</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-amber-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('place-order')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'place-order'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-amber-500 hover:text-amber-700 hover:border-amber-300'
                }`}
              >
                Place Order
              </button>
              <button
                onClick={() => setActiveTab('order-history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'order-history'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-amber-500 hover:text-amber-700 hover:border-amber-300'
                }`}
              >
                Order History
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'place-order' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-amber-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-md flex items-center justify-center shadow-md">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent ml-3">Place New Order</h2>
            </div>
            <p className="text-amber-700 text-sm mb-6">Enter your order details below</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock Symbol */}
              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-amber-700 mb-2">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  id="symbol"
                  placeholder="E.G, AAPL"
                  value={orderForm.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-amber-50/50"
                />
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-amber-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  placeholder="Number of shares"
                  value={orderForm.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-amber-50/50"
                />
              </div>

              {/* Order Type */}
              <div>
                <label htmlFor="orderType" className="block text-sm font-medium text-amber-700 mb-2">
                  Order Type
                </label>
                <div className="relative">
                  <select
                    id="orderType"
                    value={orderForm.orderType}
                    onChange={(e) => handleInputChange('orderType', e.target.value)}
                    className="w-full px-3 py-2 border border-amber-200 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none bg-amber-50/50"
                  >
                    {orderTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Side */}
              <div>
                <label htmlFor="side" className="block text-sm font-medium text-amber-700 mb-2">
                  Side
                </label>
                <div className="relative">
                  <select
                    id="side"
                    value={orderForm.side}
                    onChange={(e) => handleInputChange('side', e.target.value)}
                    className="w-full px-3 py-2 border border-amber-200 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none bg-amber-50/50"
                  >
                    {sides.map((side) => (
                      <option key={side} value={side}>
                        {side}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <div className="mt-8">
              <button
                onClick={handlePlaceOrder}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-md font-medium hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-md"
              >
                Place Order
              </button>
            </div>
          </div>
        )}

        {activeTab === 'order-history' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-amber-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent mb-4">Order History</h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">No orders yet</h3>
              <p className="text-amber-700">Your order history will appear here once you start trading.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}