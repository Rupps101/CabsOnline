import { useState } from 'react';

const API = 'https://webdev.aut.ac.nz/~cwd7465/assign';
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

interface DriverAssignment {
  [booking_ref: string]: string;
}

function DriverPanel() {
  const [bookings, set_bookings] = useState<Booking[]>([]);
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState('');
  const [searched, set_searched] = useState(false);
  const [drivers, set_drivers] = useState<DriverAssignment>({});
  const [assigning, set_assigning] = useState<string | null>(null);
  const [confirmation, set_confirmation] = useState('');

  const fetch_bookings = async () => {
    set_error('');
    set_confirmation('');
    set_loading(true);
    set_searched(true);

    const fd = new FormData();
    fd.append('action', 'search');
    fd.append('bsearch', '');

    try {
      const res = await fetch(API + '/admin.php', { method: 'POST', body: fd });
      const result = await res.json();

      if (result.success) {
        set_bookings(result.bookings);
      } else {
        set_error(result.message || 'Failed to load bookings.');
      }
    } catch {
      set_error('Could not connect to the server. Please try again.');
    }

    set_loading(false);
  };

  const handle_driver_change = (booking_ref: string, value: string) => {
    set_drivers((prev) => ({ ...prev, [booking_ref]: value }));
  };

  const handle_assign = async (booking_ref: string) => {
    const driver_name = (drivers[booking_ref] || '').trim();
    if (!driver_name) {
      set_error('Please enter a driver name before assigning.');
      return;
    }

    set_error('');
    set_assigning(booking_ref);

    const fd = new FormData();
    fd.append('action', 'assign');
    fd.append('booking_ref', booking_ref);

    try {
      const res = await fetch(API + '/admin.php', { method: 'POST', body: fd });
      const result = await res.json();

      if (result.success) {
        set_bookings((prev) =>
          prev.map((b) =>
            b.booking_ref === booking_ref ? { ...b, status: 'assigned' } : b
          )
        );
        set_confirmation(
          'Congratulations! Booking request ' +
            booking_ref +
            ' has been assigned to ' +
            driver_name +
            '!'
        );
      } else {
        set_error(result.message || 'Assignment failed. Please try again.');
      }
    } catch {
      set_error('Could not connect to the server. Please try again.');
    }

    set_assigning(null);
  };

  return (
    <div>
      <div className="page-intro">
        <h1>Driver Panel</h1>
        <p>
          View unassigned bookings due within the next 2 hours and assign a
          driver to each one.
        </p>
      </div>

      <div className="card">
        <p className="section-title">Upcoming Unassigned Bookings</p>

        {error && <div className="error-banner">{error}</div>}
        {confirmation && (
          <div className="success-banner">✅ {confirmation}</div>
        )}

        <button
          className="btn-primary"
          onClick={fetch_bookings}
          disabled={loading}
          style={{ marginBottom: '20px' }}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Loading...
            </>
          ) : (
            '🔄 Load Upcoming Bookings'
          )}
        </button>

        {searched && !loading && bookings.length === 0 && (
          <div className="driver-empty">
            <div className="driver-empty-icon">🚖</div>
            <p>No unassigned bookings due in the next 2 hours.</p>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="results-table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Pickup Suburb</th>
                  <th>Destination</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                  <th>Driver Name</th>
                  <th>Assign</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.booking_ref}>
                    <td>{b.booking_ref}</td>
                    <td>{b.customer_name}</td>
                    <td>{b.phone_number}</td>
                    <td>{b.suburb || '—'}</td>
                    <td>{b.destination_suburb || '—'}</td>
                    <td>
                      {b.pickup_date} {b.pickup_time}
                    </td>
                    <td>
                      <span className={'badge badge--' + b.status}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <input
                        className="driver-input"
                        placeholder="Driver name"
                        value={drivers[b.booking_ref] || ''}
                        onChange={(e) =>
                          handle_driver_change(b.booking_ref, e.target.value)
                        }
                        disabled={b.status === 'assigned'}
                      />
                    </td>
                    <td>
                      <button
                        className="btn-assign"
                        onClick={() => handle_assign(b.booking_ref)}
                        disabled={
                          b.status === 'assigned' || assigning === b.booking_ref
                        }
                      >
                        {assigning === b.booking_ref ? '...' : 'Assign'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverPanel;
