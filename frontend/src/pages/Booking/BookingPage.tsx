import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { Container } from '@/components/layout/Container';
import { dataService } from '@/services/dataService';
import { generateBookingId, generateQRCodeData } from '@/utils/qrCode';
import type { MockEvent } from '@/services/mockData';

type BookingStep = 'tickets' | 'review' | 'payment' | 'confirmation';

const BookingPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<BookingStep>('tickets');
  const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({});
  const [groupBooking, setGroupBooking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingData, setBookingData] = useState<any>(null);

  // Load event and check authentication
  useEffect(() => {
    if (!eventId) return;

    const loadEvent = async () => {
      setLoading(true);
      try {
        const eventData = dataService.getEventById(parseInt(eventId));
        if (eventData) {
          setEvent(eventData);
        } else {
          setErrors({ general: 'Event not found' });
        }
      } catch (error) {
        setErrors({ general: 'Failed to load event' });
      } finally {
        setLoading(false);
      }
    };

    loadEvent();

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${eventId}/book` } });
    }
  }, [eventId, isAuthenticated, navigate]);

  const handleTicketSelection = (ticketTypeId: number, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketTypeId]: quantity,
    }));
    setErrors({});
  };

  const calculateTotal = () => {
    if (!event) return 0;

    let total = 0;
    Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
      const ticketType = event.ticketTypes.find(tt => tt.id === parseInt(ticketTypeId));
      if (ticketType) {
        total += ticketType.price * quantity;
      }
    });

    // Apply group discount (10% for 5+ tickets)
    const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    if (groupBooking && totalTickets >= 5) {
      total *= 0.9; // 10% discount
    }

    return total;
  };

  const handleContinueToReview = () => {
    const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    if (totalTickets === 0) {
      setErrors({ tickets: 'Please select at least one ticket' });
      return;
    }

    setCurrentStep('review');
  };

  const handleConfirmBooking = async () => {
    if (!event || !user) return;

    setCurrentStep('payment');

    // Simulate payment processing
    setTimeout(() => {
      const bookingId = generateBookingId();
      const totalAmount = calculateTotal();
      const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

      // Create booking items with QR codes
      const bookingItems = Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
        const qrCodes = Array.from({ length: quantity }, () => generateQRCodeData(Date.now()));
        return {
          ticketTypeId: parseInt(ticketTypeId),
          quantity,
          qrCodes,
        };
      });

      // Create booking
      const booking = dataService.createBooking({
        userId: user.id,
        eventId: event.id,
        status: 'confirmed',
        totalAmount,
        totalTickets,
        bookingItems,
      });

      setBookingData({ booking, bookingId, totalAmount });
      setCurrentStep('confirmation');
    }, 2000); // Simulate payment processing delay
  };

  const totalAmount = calculateTotal();
  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  if (loading) {
    return (
      <Container>
        <div className="py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container>
        <div className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-8">The event you're trying to book doesn't exist.</p>
            <button
              onClick={() => navigate('/events')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Browse Events
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {['tickets', 'review', 'payment', 'confirmation'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step ? 'bg-blue-600 text-white' :
                    ['tickets', 'review', 'payment', 'confirmation'].indexOf(currentStep) > index ? 'bg-green-600 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep === step ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                  {index < 3 && <div className="w-12 h-0.5 bg-gray-300 ml-4"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 'tickets' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Tickets</h2>

              {errors.tickets && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                  {errors.tickets}
                </div>
              )}

              <div className="space-y-6">
                {event.ticketTypes.map((ticketType) => (
                  <div key={ticketType.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{ticketType.name}</h3>
                        <p className="text-gray-600">${ticketType.price} each</p>
                        <p className="text-sm text-gray-500">
                          {ticketType.quantity - ticketType.sold} remaining
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleTicketSelection(ticketType.id, Math.max(0, (selectedTickets[ticketType.id] || 0) - 1))}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">
                          {selectedTickets[ticketType.id] || 0}
                        </span>
                        <button
                          onClick={() => handleTicketSelection(ticketType.id, (selectedTickets[ticketType.id] || 0) + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Group Booking Option */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={groupBooking}
                    onChange={(e) => setGroupBooking(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">
                    Group booking (5+ tickets get 10% discount)
                  </span>
                </label>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <div className="text-lg font-semibold text-gray-900">
                  Total: ${totalAmount.toFixed(2)}
                  {groupBooking && totalTickets >= 5 && (
                    <span className="text-green-600 ml-2">(10% discount applied)</span>
                  )}
                </div>
                <button
                  onClick={handleContinueToReview}
                  disabled={totalTickets === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Continue to Review
                </button>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Booking</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Event:</strong> {event.title}</p>
                    <p><strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
                    <p><strong>Venue:</strong> {event.venueName}</p>
                    <p><strong>Location:</strong> {event.city}, {event.country}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
                      const ticketType = event.ticketTypes.find(tt => tt.id === parseInt(ticketTypeId));
                      if (!ticketType) return null;
                      return (
                        <div key={ticketTypeId} className="flex justify-between text-gray-600">
                          <span>{ticketType.name} x {quantity}</span>
                          <span>${(ticketType.price * quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                    {groupBooking && totalTickets >= 5 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Group Discount (10%)</span>
                        <span>-${(totalAmount * 0.1).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('tickets')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Back to Tickets
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Processing Payment</h2>

              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 mb-4">Processing your payment...</p>
                <p className="text-sm text-gray-500">Please do not close this page</p>
              </div>
            </div>
          )}

          {currentStep === 'confirmation' && bookingData && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600">Your tickets have been booked successfully.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Booking ID:</span>
                    <span className="ml-2 font-mono text-gray-900">{bookingData.bookingId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total Amount:</span>
                    <span className="ml-2 text-gray-900">${bookingData.totalAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Event:</span>
                    <span className="ml-2 text-gray-900">{event.title}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <span className="ml-2 text-gray-900">{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  A confirmation email has been sent to your email address.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/bookings')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    View My Bookings
                  </button>
                  <button
                    onClick={() => navigate('/events')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Browse More Events
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

  const handleTicketSelection = (ticketTypeId: number, quantity: number) => {
    setSelectedTickets((prev) => {
      const updated = { ...prev };
      if (quantity === 0) {
        delete updated[ticketTypeId];
      } else {
        updated[ticketTypeId] = quantity;
      }
      return updated;
    });
    setErrors({});
  };

  const handleGroupToggle = (enabled: boolean, groupId?: number) => {
    setGroupBooking({ enabled, groupId: groupId || null });
  };

  const calculateTotal = () => {
    if (!event?.ticket_types) return 0;

    let total = 0;
    Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
      const ticketType = event.ticket_types?.find(
        (tt) => tt.id === parseInt(ticketTypeId)
      );
      if (ticketType) {
        total += ticketType.price * quantity;
      }
    });

    // Apply group discount if applicable
    if (groupBooking.enabled && groupBooking.groupId) {
      const totalQuantity = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
      const discount = calculateGroupDiscount(totalQuantity);
      total -= total * discount;
    }

    return total;
  };

  const calculateGroupDiscount = (totalQuantity: number): number => {
    if (totalQuantity >= 50) return 0.20;
    if (totalQuantity >= 20) return 0.15;
    if (totalQuantity >= 10) return 0.10;
    if (totalQuantity >= 5) return 0.05;
    return 0;
  };

  const validateStep = (step: BookingStep): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'tickets') {
      const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
      if (totalTickets === 0) {
        newErrors.tickets = 'Please select at least one ticket';
        setErrors(newErrors);
        return false;
      }

      // Validate availability
      Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
        const ticketType = event?.ticket_types?.find(
          (tt) => tt.id === parseInt(ticketTypeId)
        );
        if (ticketType && quantity > ticketType.available_quantity) {
          newErrors[`ticket_${ticketTypeId}`] = `Only ${ticketType.available_quantity} tickets available`;
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    switch (currentStep) {
      case 'tickets':
        setCurrentStep('group');
        break;
      case 'group':
        setCurrentStep('review');
        break;
      case 'review':
        handleCreateBooking();
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'group':
        setCurrentStep('tickets');
        break;
      case 'review':
        setCurrentStep('group');
        break;
      case 'payment':
        setCurrentStep('review');
        break;
      default:
        break;
    }
  };

  const handleCreateBooking = async () => {
    if (!event || !validateStep('review')) return;

    setCurrentStep('confirming');
    setErrors({});

    try {
      const ticketRequests = Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => ({
        ticket_type_id: parseInt(ticketTypeId),
        quantity,
      }));

      let result;
      if (groupBooking.enabled && groupBooking.groupId) {
        result = await createGroupBooking({
          groupId: groupBooking.groupId,
          eventId: event.id,
          ticketRequests,
        });
      } else {
        result = await createBooking({
          eventId: event.id,
          ticketRequests,
        });
      }

      if (result.success && result.booking) {
        setBookingData(result.booking);
        setCurrentStep('payment');
      } else {
        setErrors({ general: result.error || 'Failed to create booking' });
        setCurrentStep('review');
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred' });
      setCurrentStep('review');
    }
  };

  const handlePaymentSuccess = () => {
    navigate(`/bookings/${bookingData?.id}/confirm`);
  };

  const handlePaymentError = (error: string) => {
    setErrors({ payment: error });
    setCurrentStep('review');
  };

  if (isLoadingEvent) {
    return (
      <Container>
        <div className="booking-page-loading">
          <Loading size="large" />
          <p>Loading event details...</p>
        </div>
      </Container>
    );
  }

  if (eventError || !event) {
    return (
      <Container>
        <ErrorMessage
          message="Failed to load event. Please try again."
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  const subtotal = calculateTotal();
  const discount = groupBooking.enabled
    ? calculateGroupDiscount(totalTickets) * subtotal
    : 0;
  const total = subtotal - discount;

  return (
    <Container>
      <div className="booking-page">
        {/* Progress Indicator */}
        <div className="booking-progress">
          <div className={`progress-step ${currentStep === 'tickets' ? 'active' : currentStep !== 'tickets' ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Select Tickets</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep === 'group' ? 'active' : ['review', 'payment', 'confirming'].includes(currentStep) ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Group Booking</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep === 'review' ? 'active' : ['payment', 'confirming'].includes(currentStep) ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Review</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep === 'payment' || currentStep === 'confirming' ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Payment</div>
          </div>
        </div>

        {/* Error Display */}
        {errors.general && (
          <ErrorMessage message={errors.general} />
        )}

        {/* Step Content */}
        <div className="booking-content">
          {currentStep === 'tickets' && (
            <TicketSelector
              event={event}
              selectedTickets={selectedTickets}
              onTicketChange={handleTicketSelection}
              errors={errors}
            />
          )}

          {currentStep === 'group' && (
            <GroupBookingOption
              event={event}
              enabled={groupBooking.enabled}
              groupId={groupBooking.groupId}
              onToggle={handleGroupToggle}
              selectedTickets={selectedTickets}
            />
          )}

          {currentStep === 'review' && (
            <div className="review-step">
              <PriceBreakdown
                event={event}
                selectedTickets={selectedTickets}
                subtotal={subtotal}
                discount={discount}
                total={total}
                groupBooking={groupBooking}
              />
            </div>
          )}

          {currentStep === 'payment' && bookingData && (
            <PaymentRedirect
              booking={bookingData}
              total={total}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}

          {currentStep === 'confirming' && (
            <div className="confirming-step">
              <Loading size="large" />
              <p>Creating your booking...</p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'payment' && currentStep !== 'confirming' && (
          <div className="booking-navigation">
            {currentStep !== 'tickets' && (
              <button
                className="btn-secondary"
                onClick={handleBack}
                disabled={isBookingLoading}
              >
                Back
              </button>
            )}
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={
                isBookingLoading ||
                totalTickets === 0 ||
                (currentStep === 'review' && !bookingData)
              }
            >
              {isBookingLoading ? (
                <>
                  <Loading size="small" />
                  Processing...
                </>
              ) : currentStep === 'review' ? (
                'Proceed to Payment'
              ) : (
                'Continue'
              )}
            </button>
          </div>
        )}
      </div>
    </Container>
  );
};

export default BookingPage;
