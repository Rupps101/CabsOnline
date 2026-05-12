import { useState } from 'react';

const API = '/~cwd7465/assign';

interface Booking {
  booking_ref: string;
  customer_name: string;
  phone_number: string;
  suburb: string;
  destination_suburb: string;
  pickup_date: string;
  pickup_time: string;
  status: string;
}

function BookingLookup() {
  const [ref, set_ref] = useState('');
  const [error, set_error] = useState('');
  const [loading, set_loading] = useState(false);
  const [booking, set_booking] = useState<Booking | null>(null);
  const [not_found, set_not_found] = useState(false);

  const validate_ref = (value: string): boolean => {
    if (!value.trim()) {
      set_error('Please enter a booking reference number.');
      return false;
    }
    if (!/^BRN\d{5}$/.test(value.trim())) {
      set_error('Reference must be in the format BRN00001.');
      return false;
    }
    return true;
  };

  const handle_search = async (e: React.FormEvent) => {
    e.preventDefault();
    set_error('');
    set_booking(null);
    set_not_found(false);

    if (!validate_ref(ref)) return;

    set_loading(true);

    const fd = new FormData();
    fd.append('action', 'search');
    fd.append('bsearch', ref.trim());

    try {
      const res = await fetch(API + '/admin.php', { method: 'POST', body: fd });
      const result = await res.json();

      if (result.success) {
        if (result.bookings.length > 0) {
          set_booking(result.bookings[0]);
        } else {
          set_not_found(true);
        }
      } else {
        set_error(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      set_error('Could not connect to the server. Please try again.');
    }

    set_loading(false);
  };

  return (
    <div>
      <div className="page-intro">
        <h1>My Booking</h1>
        <p>
          Enter your booking reference number to check the status of your ride.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handle_search} noValidate>
          <p className="section-title">Booking Reference Lookup</p>

          {error && <div className="error-banner">{error}</div>}

          <div className="form-group">
            <label>
              Booking Reference <span className="required">*</span>
            </label>
            <input
              value={ref}
              onChange={(e) => {
                set_ref(e.target.value);
                set_error('');
              }}
              placeholder="e.g. BRN00001"
              className={error ? 'input-error' : ''}
            />
            <span className="field-hint">Format: BRN followed by 5 digits</span>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Searching...
              </>
            ) : (
              'Check Status'
            )}
          </button>
        </form>
      </div>

      {not_found && (
        <div className="card">
          <div className="lookup-not-found">
            <div className="lookup-not-found-icon">🔍</div>
            <p>
              No booking found for <strong>{ref}</strong>.
            </p>
            <p>Please check the reference number and try again.</p>
          </div>
        </div>
      )}

      {booking && (
        <div className="card">
          <p className="section-title">Booking Details</p>
          <div className="lookup-status-header">
            <span className={'badge badge--' + booking.status}>
              {booking.status}
            </span>
            <span className="lookup-ref">{booking.booking_ref}</span>
          </div>

          <div className="lookup-grid">
            <div className="lookup-item">
              <span className="lookup-label">Customer Name</span>
              <span className="lookup-value">{booking.customer_name}</span>
            </div>
            <div className="lookup-item">
              <span className="lookup-label">Phone</span>
              <span className="lookup-value">{booking.phone_number}</span>
            </div>
            <div className="lookup-item">
              <span className="lookup-label">Pickup Date</span>
              <span className="lookup-value">{booking.pickup_date}</span>
            </div>
            <div className="lookup-item">
              <span className="lookup-label">Pickup Time</span>
              <span className="lookup-value">{booking.pickup_time}</span>
            </div>
            <div className="lookup-item">
              <span className="lookup-label">Pickup Suburb</span>
              <span className="lookup-value">{booking.suburb || '—'}</span>
            </div>
            <div className="lookup-item">
              <span className="lookup-label">Destination</span>
              <span className="lookup-value">
                {booking.destination_suburb || '—'}
              </span>
            </div>
          </div>

          <div
            className={
              'lookup-status-message lookup-status-message--' + booking.status
            }
          >
            {booking.status === 'unassigned'
              ? '⏳ Your booking has been received and a driver will be assigned shortly.'
              : '✅ A driver has been assigned to your booking. Get ready!'}
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingLookup;
