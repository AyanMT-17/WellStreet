import { useState, useEffect } from 'react';
import { ChevronDown, ShoppingCart, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [orderMessage, setOrderMessage] = useState({ type: '', text: '' });

  const orderTypes = ['Market Order', 'Limit Order', 'Stop Order', 'Stop Limit Order'];
  const sides = ['Buy', 'Sell'];

  const handleInputChange = (field, value) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!orderForm.symbol || !orderForm.symbol.trim()) {
      errors.symbol = 'Stock symbol is required';
    }
    if (!orderForm.quantity || isNaN(orderForm.quantity) || parseInt(orderForm.quantity) <= 0) {
      errors.quantity = 'Please enter a valid quantity (positive number)';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setOrderMessage({ type: '', text: '' });

    try {
      const endpoint = orderForm.side === 'Sell' ? 'sell' : 'buy';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          symbol: orderForm.symbol.toUpperCase() + '.NS',
          quantity: parseInt(orderForm.quantity),
          orderType: orderForm.orderType.toUpperCase(),
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      const data = await response.json();
      setOrderMessage({
        type: 'success',
        text: `${orderForm.side} order for ${orderForm.quantity} shares of ${orderForm.symbol.toUpperCase()} placed successfully!`
      });
      // Reset form after successful order
      setOrderForm(prev => ({ ...prev, symbol: '', quantity: '' }));
    } catch (err) {
      setOrderMessage({ type: 'error', text: err.message || 'Failed to place order' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setOrderMessage({ type: '', text: '' }), 5000);
    }
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

  return (
    <div className="min-h-screen bg-[#fccc07]">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-black uppercase tracking-widest bg-white inline-block px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#000] rotate-1">Orders</h1>
          <p className="text-black font-bold mt-4 uppercase tracking-wider bg-white inline-block px-3 border-2 border-black ml-4 rotate-[-1deg]">Place & Track Trades</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex justify-center">
          <div className="flex space-x-4 bg-white p-2 border-4 border-black shadow-[6px_6px_0px_0px_#000]">
            <button
              onClick={() => setActiveTab('place-order')}
              className={`py-3 px-8 font-black text-sm uppercase tracking-wider border-2 transition-all duration-200 ${activeTab === 'place-order'
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#888]'
                : 'bg-white text-black border-transparent hover:border-black hover:bg-gray-100'
                }`}
            >
              Place Order
            </button>
            <button
              onClick={() => setActiveTab('order-history')}
              className={`py-3 px-8 font-black text-sm uppercase tracking-wider border-2 transition-all duration-200 ${activeTab === 'order-history'
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#888]'
                : 'bg-white text-black border-transparent hover:border-black hover:bg-gray-100'
                }`}
            >
              Order History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'place-order' && (
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] max-w-2xl mx-auto">
            <div className="flex items-center mb-8 border-b-4 border-black pb-4">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-black mr-4 shadow-[4px_4px_0px_0px_#888]">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-wide">Place New Order</h2>
            </div>

            {/* Order Message */}
            {orderMessage.text && (
              <div className={`mb-8 p-4 border-4 font-bold flex items-center shadow-[4px_4px_0px_0px_#000] ${orderMessage.type === 'success' ? 'bg-[#a3e635] border-black text-black' : 'bg-[#f87171] border-black text-black'}`}>
                {orderMessage.type === 'success' ? <CheckCircle className="w-6 h-6 mr-3 stroke-[3]" /> : <AlertCircle className="w-6 h-6 mr-3 stroke-[3]" />}
                {orderMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Stock Symbol */}
              <div>
                <label htmlFor="symbol" className="block text-sm font-black text-black uppercase mb-3 tracking-wider">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  id="symbol"
                  placeholder="E.G, RELIANCE"
                  value={orderForm.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  className={`w-full px-4 py-3 border-3 font-bold outline-none transition-all ${validationErrors.symbol ? 'border-red-600 bg-red-50' : 'border-black focus:shadow-[4px_4px_0px_0px_#000] focus:-translate-y-1 focus:-translate-x-1'}`}
                />
                {validationErrors.symbol && <p className="text-red-600 font-bold text-xs mt-2 uppercase">{validationErrors.symbol}</p>}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-black text-black uppercase mb-3 tracking-wider">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  placeholder="Number of shares"
                  min="1"
                  value={orderForm.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className={`w-full px-4 py-3 border-3 font-bold outline-none transition-all ${validationErrors.quantity ? 'border-red-600 bg-red-50' : 'border-black focus:shadow-[4px_4px_0px_0px_#000] focus:-translate-y-1 focus:-translate-x-1'}`}
                />
                {validationErrors.quantity && <p className="text-red-600 font-bold text-xs mt-2 uppercase">{validationErrors.quantity}</p>}
              </div>

              {/* Order Type */}
              <div>
                <label htmlFor="orderType" className="block text-sm font-black text-black uppercase mb-3 tracking-wider">
                  Order Type
                </label>
                <div className="relative">
                  <select
                    id="orderType"
                    value={orderForm.orderType}
                    onChange={(e) => handleInputChange('orderType', e.target.value)}
                    className="w-full px-4 py-3 border-3 border-black font-bold outline-none appearance-none bg-white focus:shadow-[4px_4px_0px_0px_#000] focus:-translate-y-1 focus:-translate-x-1 transition-all"
                  >
                    {orderTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-black absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none stroke-[3]" />
                </div>
              </div>

              {/* Side */}
              <div>
                <label htmlFor="side" className="block text-sm font-black text-black uppercase mb-3 tracking-wider">
                  Side
                </label>
                <div className="relative">
                  <select
                    id="side"
                    value={orderForm.side}
                    onChange={(e) => handleInputChange('side', e.target.value)}
                    className="w-full px-4 py-3 border-3 border-black font-bold outline-none appearance-none bg-white focus:shadow-[4px_4px_0px_0px_#000] focus:-translate-y-1 focus:-translate-x-1 transition-all"
                  >
                    {sides.map((side) => (
                      <option key={side} value={side}>
                        {side}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-black absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <div className="mt-10">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-4 bg-black text-white border-3 border-black font-black uppercase tracking-widest text-lg shadow-[6px_6px_0px_0px_#fff] hover:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  'CONFIRM ORDER'
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'order-history' && (
          <div className="bg-white border-4 border-black p-0 shadow-[12px_12px_0px_0px_#000]">
            <div className="p-6 border-b-4 border-black bg-gray-50">
              <h2 className="text-2xl font-black text-black uppercase tracking-wide">Transaction History</h2>
            </div>

            {orderHistoryLoading ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-black text-white flex items-center justify-center mx-auto mb-6 border-4 border-black animate-spin">
                  <div className="w-8 h-8 bg-white" />
                </div>
                <h3 className="text-xl font-black text-black uppercase tracking-widest">LOADING DATA...</h3>
              </div>
            ) : orderHistoryError ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-red-100 flex items-center justify-center mx-auto mb-6 border-4 border-black">
                  <AlertCircle className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-xl font-bold text-red-600 uppercase">{orderHistoryError}</h3>
              </div>
            ) : orderHistory.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-200 flex items-center justify-center mx-auto mb-6 border-4 border-black">
                  <ShoppingCart className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-2xl font-black text-black uppercase mb-2">NO ORDERS YET</h3>
                <p className="text-black font-medium">Start trading to build your history.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y-4 divide-black">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">Symbol</th>
                      <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">Side</th>
                      <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y-2 divide-black">
                    {orderHistory.map((order, idx) => (
                      <tr key={idx} className="hover:bg-yellow-50 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-black border-r-2 border-black">{order.symbol}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-black border-r-2 border-black">{order.quantity}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-black border-r-2 border-black">{order.orderType}</td>
                        <td className={`px-6 py-5 whitespace-nowrap text-sm font-black uppercase border-r-2 border-black ${order.side === 'Buy' ? 'text-green-600' : 'text-red-600'}`}>{order.side}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-black border-r-2 border-black">
                          <span className="px-3 py-1 bg-gray-200 border-2 border-black text-xs uppercase">{order.status}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-black">{order.date}</td>
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