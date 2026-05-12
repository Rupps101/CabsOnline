import { useState } from 'react';
import MapPicker from './MapPicker';
import PaymentModal from './PaymentModal';

const API = '/~cwd7465/assign';

interface FormData {
  cname: string;
  phone: string;
  unumber: string;
  snumber: string;
  stname: string;
  sbname: string;
  dsbname: string;
  date: string;
  time: string;
}

interface MapState {
  visible: boolean;
  latitude: number;
  longitude: number;
  address: string;
}

interface Confirmation {
  booking_ref: string;
  pickup_time: string;
  pickup_date: string;
}

function get_today(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return d + '/' + m + '/' + now.getFullYear();
}

function get_time_now(): string {
  const now = new Date();
  return (
    String(now.getHours()).padStart(2, '0') +
    ':' +
    String(now.getMinutes()).padStart(2, '0')
  );
}

function BookingForm() {
  const [form, set_form] = useState<FormData>({
    cname: '',
    phone: '',
    unumber: '',
    snumber: '',
    stname: '',
    sbname: '',
    dsbname: '',
    date: get_today(),
    time: get_time_now(),
  });

  const [errors, set_errors] = useState<Partial<FormData>>({});
  const [error_banner, set_error_banner] = useState('');
  const [map_state, set_map_state] = useState<MapState>({
    visible: false,
    latitude: -36.8485,
    longitude: 174.7633,
    address: '',
  });
  const [geocoding, set_geocoding] = useState(false);
  const [show_payment, set_show_payment] = useState(false);
  const [confirmation, set_confirmation] = useState<Confirmation | null>(null);

  const handle_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_form((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    set_errors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = (): boolean => {
    const new_errors: Partial<FormData> = {};
    if (!form.cname.trim()) new_errors.cname = 'Full name is required.';
    if (!form.phone.trim()) new_errors.phone = 'Phone number is required.';
    else if (!/^\d{10,12}$/.test(form.phone.trim()))
      new_errors.phone = 'Phone must be 10-12 digits.';
    if (!form.snumber.trim()) new_errors.snumber = 'Street number is required.';
    if (!form.stname.trim()) new_errors.stname = 'Street name is required.';
    if (!form.date.trim()) new_errors.date = 'Pickup date is required.';
    else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.date.trim()))
      new_errors.date = 'Date must be DD/MM/YYYY.';
    if (!form.time.trim()) new_errors.time = 'Pickup time is required.';
    else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.time.trim()))
      new_errors.time = 'Time must be HH:MM.';

    if (Object.keys(new_errors).length === 0) {
      const parts = form.date.split('/');
      const pickup = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      const tp = form.time.split(':');
      pickup.setHours(+tp[0], +tp[1]);
      if (pickup < new Date()) {
        new_errors.date = 'Pickup must not be in the past.';
      }
    }

    set_errors(new_errors);
    if (Object.keys(new_errors).length > 0) {
      set_error_banner('Please fix the errors below.');
      return false;
    }
    set_error_banner('');
    return true;
  };

  const show_map = async () => {
    if (!form.snumber.trim() || !form.stname.trim()) {
      set_error_banner(
        'Enter a street number and street name to show the map.'
      );
      return;
    }
    set_error_banner('');
    set_geocoding(true);

    const suburb = form.sbname.trim() || 'Auckland';
    const query = `${form.snumber} ${form.stname}, ${suburb}, New Zealand`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`;

    try {
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();

      if (data.length > 0) {
        set_map_state({
          visible: true,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          address: query,
        });
      } else {
        set_map_state({
          visible: true,
          latitude: -36.8485,
          longitude: 174.7633,
          address: query + ' (approximate)',
        });
      }
    } catch {
      set_map_state({
        visible: true,
        latitude: -36.8485,
        longitude: 174.7633,
        address: query + ' (approximate)',
      });
    }
    set_geocoding(false);
  };

  const handle_submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    set_show_payment(true);
  };

  const handle_payment_success = async () => {
    set_show_payment(false);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    try {
      const res = await fetch(API + '/booking.php', {
        method: 'POST',
        body: fd,
      });
      const result = await res.json();

      if (result.success) {
        set_confirmation(result);
        set_form({
          cname: '',
          phone: '',
          unumber: '',
          snumber: '',
          stname: '',
          sbname: '',
          dsbname: '',
          date: get_today(),
          time: get_time_now(),
        });
        set_map_state({
          visible: false,
          latitude: -36.8485,
          longitude: 174.7633,
          address: '',
        });
      } else {
        set_error_banner(result.message || 'Booking failed. Please try again.');
      }
    } catch {
      set_error_banner('Could not connect to the server. Please try again.');
    }
  };

  return (
    <div>
      <div className="page-intro">
        <h1>Book a Ride</h1>
        <p>
          Fill in your details, preview your pickup on the map, then confirm
          your booking.
        </p>
      </div>

      {confirmation && (
        <div className="success-banner">
          ✅ Thank you for your booking!
          <br />
          Booking reference number: <strong>{confirmation.booking_ref}</strong>
          <br />
          Pickup time: <strong>{confirmation.pickup_time}</strong>
          <br />
          Pickup date: <strong>{confirmation.pickup_date}</strong>
        </div>
      )}

      <div className="card">
        <form onSubmit={handle_submit} noValidate>
          {error_banner && <div className="error-banner">{error_banner}</div>}

          <p className="section-title">Personal Details</p>
          <div className="form-row">
            <div className="form-group">
              <label>
                Full Name <span className="required">*</span>
              </label>
              <input
                name="cname"
                value={form.cname}
                onChange={handle_change}
                placeholder="e.g. Jane Smith"
                className={errors.cname ? 'input-error' : ''}
              />
              {errors.cname && (
                <span className="field-error">{errors.cname}</span>
              )}
            </div>
            <div className="form-group">
              <label>
                Phone Number <span className="required">*</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handle_change}
                placeholder="e.g. 0211234567"
                maxLength={12}
                className={errors.phone ? 'input-error' : ''}
              />
              {errors.phone && (
                <span className="field-error">{errors.phone}</span>
              )}
              <span className="field-hint">10-12 digits, numbers only</span>
            </div>
          </div>

          <p className="section-title">Pickup Address</p>
          <div className="form-row">
            <div className="form-group">
              <label>Unit Number</label>
              <input
                name="unumber"
                value={form.unumber}
                onChange={handle_change}
                placeholder="e.g. 4B"
              />
              <span className="field-hint">Optional</span>
            </div>
            <div className="form-group">
              <label>
                Street Number <span className="required">*</span>
              </label>
              <input
                name="snumber"
                value={form.snumber}
                onChange={handle_change}
                placeholder="e.g. 42"
                className={errors.snumber ? 'input-error' : ''}
              />
              {errors.snumber && (
                <span className="field-error">{errors.snumber}</span>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>
              Street Name <span className="required">*</span>
            </label>
            <input
              name="stname"
              value={form.stname}
              onChange={handle_change}
              placeholder="e.g. Queen Street"
              className={errors.stname ? 'input-error' : ''}
            />
            {errors.stname && (
              <span className="field-error">{errors.stname}</span>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Pickup Suburb</label>
              <input
                name="sbname"
                value={form.sbname}
                onChange={handle_change}
                placeholder="e.g. Auckland CBD"
              />
              <span className="field-hint">Optional</span>
            </div>
            <div className="form-group">
              <label>Destination Suburb</label>
              <input
                name="dsbname"
                value={form.dsbname}
                onChange={handle_change}
                placeholder="e.g. Newmarket"
              />
              <span className="field-hint">Optional</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={show_map}
            disabled={geocoding}
            style={{ marginBottom: '8px' }}
          >
            {geocoding ? 'Finding location...' : '🗺 Show Pickup on Map'}
          </button>

          {map_state.visible && (
            <MapPicker
              latitude={map_state.latitude}
              longitude={map_state.longitude}
              address={map_state.address}
            />
          )}

          <p className="section-title" style={{ marginTop: '24px' }}>
            Pickup Date &amp; Time
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>
                Pickup Date <span className="required">*</span>
              </label>
              <input
                name="date"
                value={form.date}
                onChange={handle_change}
                placeholder="dd/mm/yyyy"
                className={errors.date ? 'input-error' : ''}
              />
              {errors.date && (
                <span className="field-error">{errors.date}</span>
              )}
              <span className="field-hint">Format: DD/MM/YYYY</span>
            </div>
            <div className="form-group">
              <label>
                Pickup Time <span className="required">*</span>
              </label>
              <input
                name="time"
                value={form.time}
                onChange={handle_change}
                placeholder="e.g. 17:30"
                className={errors.time ? 'input-error' : ''}
              />
              {errors.time && (
                <span className="field-error">{errors.time}</span>
              )}
              <span className="field-hint">24-hour HH:MM format</span>
            </div>
          </div>

          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <button type="submit" className="btn-primary">
              Continue to Payment →
            </button>
          </div>
        </form>
      </div>

      {show_payment && (
        <PaymentModal
          on_success={handle_payment_success}
          on_cancel={() => set_show_payment(false)}
        />
      )}
    </div>
  );
}

export default BookingForm;
