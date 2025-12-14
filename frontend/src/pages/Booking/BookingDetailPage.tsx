import { Container } from '@/components/layout/Container';

const BookingDetailPage = () => {
  // Mock data - replace with actual API call
  const booking = {
    id: 1,
    eventTitle: 'Tech Conference 2024',
    eventDate: '2024-01-15',
    eventTime: '9:00 AM - 6:00 PM',
    venueName: 'Convention Center',
    address: '123 Tech Street, San Francisco, CA',
    status: 'confirmed',
    bookingDate: '2024-01-10',
    totalAmount: 75,
    bookingItems: [
      {
        id: 1,
        ticketType: 'Regular',
        quantity: 1,
        unitPrice: 75,
        subtotal: 75,
        qrCode: 'mock-qr-code-1',
      },
    ],
    payment: {
      method: 'Credit Card',
      status: 'completed',
      transactionId: 'txn_123456789',
    },
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Container>
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-600 mt-2">Booking #{booking.id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Information</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{booking.eventTitle}</h3>
                    <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                      getStatusBadge(booking.status)
                    }`}>
                      {booking.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Date & Time</span>
                      </div>
                      <p className="text-gray-900">{booking.eventDate}</p>
                      <p className="text-gray-600">{booking.eventTime}</p>
                    </div>

                    <div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Venue</span>
                      </div>
                      <p className="text-gray-900">{booking.venueName}</p>
                      <p className="text-gray-600">{booking.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tickets */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tickets</h2>
                <div className="space-y-4">
                  {booking.bookingItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.ticketType}</h3>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${item.unitPrice} each</p>
                          <p className="text-sm text-gray-600">Subtotal: ${item.subtotal}</p>
                        </div>
                      </div>

                      {/* QR Code */}
                      {booking.status === 'confirmed' && (
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Digital Ticket</h4>
                              <p className="text-sm text-gray-600">Show this QR code at check-in</p>
                            </div>
                            <div className="w-24 h-24 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-500">QR Code</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Booking Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Date</span>
                    <span className="font-medium">{booking.bookingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-medium">${booking.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">{booking.payment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`font-medium ${
                      booking.payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {booking.payment.status}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${booking.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Actions</h2>
                <div className="space-y-3">
                  {booking.status === 'confirmed' && (
                    <>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                        Download Tickets
                      </button>
                      <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                        Share Booking
                      </button>
                    </>
                  )}
                  {booking.status === 'pending' && (
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      Complete Payment
                    </button>
                  )}
                  {['confirmed', 'pending'].includes(booking.status) && (
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default BookingDetailPage;

