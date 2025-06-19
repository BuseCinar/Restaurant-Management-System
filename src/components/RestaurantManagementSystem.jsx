import React, { useState, useEffect } from 'react';
import { Camera, Users, DollarSign, Clock, AlertTriangle, CheckCircle, User, TrendingUp, Eye, Utensils, Award, Timer } from 'lucide-react';

const RestaurantManagementSystem = () => {
  const [tables, setTables] = useState([
    { id: 1, waiter: 1, status: 'empty', orders: [], total: 0, customerArrival: null },
    { id: 2, waiter: 1, status: 'empty', orders: [], total: 0, customerArrival: null },
    { id: 3, waiter: 2, status: 'empty', orders: [], total: 0, customerArrival: null },
    { id: 4, waiter: 2, status: 'empty', orders: [], total: 0, customerArrival: null }
  ]);

  const [waiters, setWaiters] = useState([
    { id: 1, name: 'Ahmet Yılmaz', totalSales: 0, responseTime: [], warnings: 0, performance: 100, avatar: '👨‍🍳' },
    { id: 2, name: 'Fatma Demir', totalSales: 0, responseTime: [], warnings: 0, performance: 100, avatar: '👩‍🍳' }
  ]);

  const [menuItems] = useState({
    'sulu-yemek': { name: 'Sulu Yemek', price: 45, icon: '🍲', category: 'Ana Yemek' },
    'izgara': { name: 'Izgara', price: 65, icon: '🥩', category: 'Ana Yemek' },
    'corba': { name: 'Çorba', price: 25, icon: '🍜', category: 'Başlangıç' },
    'salata': { name: 'Salata', price: 35, icon: '🥗', category: 'Başlangıç' },
    'tatli': { name: 'Tatlı', price: 30, icon: '🍰', category: 'Tatlı' }
  });

  const [dailyReport, setDailyReport] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const simulateObjectDetection = (tableId, items) => {
    const table = tables.find(t => t.id === tableId);
    if (table.status === 'occupied') {
      const detectedOrders = items.map(item => ({
        item: item,
        quantity: Math.floor(Math.random() * 3) + 1,
        timestamp: new Date()
      }));
      
      updateTableOrders(tableId, detectedOrders);
    }
  };

  const simulateWaiterDetection = (waiterId, tableId) => {
    const table = tables.find(t => t.id === tableId);
    if (table.customerArrival) {
      const responseTime = (Date.now() - table.customerArrival) / 1000;
      updateWaiterPerformance(waiterId, responseTime);
    }
  };

  const updateTableOrders = (tableId, newOrders) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        const updatedOrders = [...table.orders, ...newOrders];
        const total = updatedOrders.reduce((sum, order) => 
          sum + (menuItems[order.item]?.price * order.quantity || 0), 0);
        return { ...table, orders: updatedOrders, total };
      }
      return table;
    }));
  };

  const updateWaiterPerformance = (waiterId, responseTime) => {
    setWaiters(prev => prev.map(waiter => {
      if (waiter.id === waiterId) {
        const newResponseTimes = [...waiter.responseTime, responseTime];
        const avgResponseTime = newResponseTimes.reduce((a, b) => a + b, 0) / newResponseTimes.length;
        const performance = Math.max(0, 100 - (avgResponseTime > 60 ? (avgResponseTime - 60) * 2 : 0) - waiter.warnings * 10);
        
        return {
          ...waiter,
          responseTime: newResponseTimes,
          performance: Math.round(performance)
        };
      }
      return waiter;
    }));
  };

  const setCustomerArrival = (tableId) => {
    setTables(prev => prev.map(table => 
      table.id === tableId 
        ? { ...table, status: 'occupied', customerArrival: Date.now() }
        : table
    ));

    setTimeout(() => {
      const table = tables.find(t => t.id === tableId);
      const waiter = waiters.find(w => w.id === table.waiter);
      
      if (table.orders.length === 0) {
        setAlerts(prev => [...prev, {
          id: Date.now(),
          message: `Masa ${tableId} - ${waiter.name} 1 dakikada müşteriye hizmet vermedi!`,
          type: 'warning',
          timestamp: new Date()
        }]);
        
        setWaiters(prev => prev.map(w => 
          w.id === table.waiter ? { ...w, warnings: w.warnings + 1 } : w
        ));
      }
    }, 60000);
  };

  const clearTable = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    
    const today = new Date().toDateString();
    setDailyReport(prev => ({
      ...prev,
      [today]: {
        ...prev[today],
        [`table_${tableId}`]: [
          ...(prev[today]?.[`table_${tableId}`] || []),
          {
            orders: table.orders,
            total: table.total,
            waiter: table.waiter,
            timestamp: new Date()
          }
        ]
      }
    }));

    setWaiters(prev => prev.map(waiter => 
      waiter.id === table.waiter 
        ? { ...waiter, totalSales: waiter.totalSales + table.total }
        : waiter
    ));

    setTables(prev => prev.map(t => 
      t.id === tableId 
        ? { ...t, status: 'empty', orders: [], total: 0, customerArrival: null }
        : t
    ));
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayData = dailyReport[today] || {};
    
    let totalRevenue = 0;
    let totalOrders = 0;
    
    Object.values(todayData).forEach(tableData => {
      tableData.forEach(session => {
        totalRevenue += session.total;
        totalOrders += session.orders.length;
      });
    });
    
    return { totalRevenue, totalOrders };
  };

  const { totalRevenue, totalOrders } = getTodayStats();
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Utensils className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
            Restoran Yönetim Sistemi
          </h1>
          <p className="text-gray-600 text-lg">AI Destekli Sipariş Takibi & Performans Analizi</p>
          <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            {currentTime.toLocaleTimeString('tr-TR')} - {currentTime.toLocaleDateString('tr-TR')}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            {alerts.slice(-3).map(alert => (
              <div key={alert.id} className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 p-4 mb-3 rounded-r-lg shadow-md animate-pulse">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{alert.message}</p>
                    <p className="text-xs text-red-500 mt-1">{alert.timestamp.toLocaleTimeString('tr-TR')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Günlük Ciro</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{totalRevenue}₺</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dolu Masa / Toplam</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{occupiedTables}/4</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Kameralar</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">4/4</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sistem Durumu</p>
                <p className="text-lg font-bold text-emerald-600">🟢 Çevrimiçi</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Masa Durumları */}
          <div className="xl:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <Utensils className="h-4 w-4 text-white" />
                </div>
                Masa Durumları
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tables.map(table => (
                  <div key={table.id} className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    table.status === 'occupied' 
                      ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100 shadow-red-100' 
                      : 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-green-100'
                  } shadow-lg`}>
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <div className="text-2xl mr-2">🍽️</div>
                          <h3 className="text-lg font-bold text-gray-900">Masa {table.id}</h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                          table.status === 'occupied' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-green-500 text-white'
                        }`}>
                          {table.status === 'occupied' ? '🔴 DOLU' : '🟢 BOŞ'}
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-3 text-sm text-gray-700">
                        <User className="h-4 w-4 mr-2" />
                        <span className="font-medium">
                          {waiters.find(w => w.id === table.waiter)?.avatar} {waiters.find(w => w.id === table.waiter)?.name}
                        </span>
                      </div>
                      
                      {table.orders.length > 0 && (
                        <div className="mb-4 p-3 bg-white/70 rounded-xl">
                          <p className="text-xs font-bold text-gray-800 mb-2 flex items-center">
                            📋 SİPARİŞLER:
                          </p>
                          <div className="space-y-1">
                            {table.orders.map((order, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="flex items-center">
                                  <span className="mr-2">{menuItems[order.item]?.icon}</span>
                                  {order.quantity}x {menuItems[order.item]?.name}
                                </span>
                                <span className="font-bold text-green-600">
                                  {(menuItems[order.item]?.price * order.quantity)}₺
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-gray-300 mt-2 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-900">TOPLAM:</span>
                              <span className="text-lg font-bold text-green-600">{table.total}₺</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {table.status === 'empty' && (
                          <button
                            onClick={() => setCustomerArrival(table.id)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            👥 Müşteri Geldi
                          </button>
                        )}
                        
                        {table.status === 'occupied' && (
                          <>
                            <button
                              onClick={() => simulateObjectDetection(table.id, ['sulu-yemek', 'salata'])}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              🤖 AI Tespit
                            </button>
                            <button
                              onClick={() => clearTable(table.id)}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              ✨ Temizle
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Garson Performansı */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <Award className="h-4 w-4 text-white" />
                </div>
                Garson Performansı
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {waiters.map(waiter => (
                <div key={waiter.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">{waiter.avatar}</div>
                        <div>
                          <h3 className="font-bold text-gray-900">{waiter.name}</h3>
                          <p className="text-sm text-gray-600">Masa {waiter.id === 1 ? '1-2' : '3-4'} Sorumlusu</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                        waiter.performance >= 90 ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                        waiter.performance >= 75 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                        waiter.performance >= 60 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                        'bg-gradient-to-r from-red-400 to-red-500 text-white'
                      }`}>
                        {waiter.performance >= 90 ? '🌟' : waiter.performance >= 75 ? '⭐' : waiter.performance >= 60 ? '⚠️' : '🚨'} %{waiter.performance}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/70 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{waiter.totalSales}₺</div>
                        <div className="text-xs text-gray-600 font-medium">💰 Günlük Satış</div>
                      </div>
                      <div className="bg-white/70 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-red-600">{waiter.warnings}</div>
                        <div className="text-xs text-gray-600 font-medium">⚠️ Uyarı Sayısı</div>
                      </div>
                      <div className="bg-white/70 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {waiter.responseTime.length > 0 
                            ? Math.round(waiter.responseTime.reduce((a, b) => a + b, 0) / waiter.responseTime.length)
                            : 0}s
                        </div>
                        <div className="text-xs text-gray-600 font-medium">⏱️ Ort. Yanıt</div>
                      </div>
                      <div className="bg-white/70 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">{tables.filter(t => t.waiter === waiter.id && t.status === 'occupied').length}</div>
                        <div className="text-xs text-gray-600 font-medium">🍽️ Aktif Masa</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Menu & Camera Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Menu Items */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <Utensils className="h-4 w-4 text-white" />
                </div>
                Menü Fiyatları
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(menuItems).map(([key, item]) => (
                  <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{item.category}</p>
                      <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {item.price}₺
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kamera Sistemi */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="px-6 py-4 border-b border-gray-200/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                AI Kamera Sistemi
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[1, 2, 3, 4].map(cameraId => (
                  <div key={cameraId} className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border-2 border-green-200 hover:shadow-lg transition-all duration-300">
                    <div className="text-center">
                      <div className="relative mb-3">
                        <Eye className="h-8 w-8 text-green-600 mx-auto" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="font-bold text-gray-900">Kamera {cameraId}</h3>
                      <p className="text-sm text-green-600 font-medium">🟢 Aktif</p>
                      <p className="text-xs text-gray-600">Masa {cameraId} İzleme</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  Sistem Özellikleri
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>🤖 Akıllı nesne tanıma teknolojisi</li>
                  <li>👤 Garson yüz/QR kod tanıma</li>
                  <li>🛡️ Müşteri gizliliği koruması</li>
                  <li>⚡ Gerçek zamanlı analiz</li>
                  <li>📊 Otomatik raporlama</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantManagementSystem;