import { useState } from 'react';

interface PaymentModalProps {
  on_success: () => void;
  on_cancel: () => void;
}

interface CardForm {
  card_name: string;
  card_number: string;
  expiry: string;
  cvv: string;
}

function PaymentModal({ on_success, on_cancel }: PaymentModalProps) {
  const [card, set_card] = useState<CardForm>({
    card_name: '',
    card_number: '',
    expiry: '',
    cvv: '',
  });
  const [errors, set_errors] = useState<Partial<CardForm>>({});
  const [processing, set_processing] = useState(false);
  const [processed, set_processed] = useState(false);

  const handle_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (e.target.name === 'card_number') {
      value = value.replace(/\D/g, '').slice(0, 16);
      value = value.replace(/(.{4})/g, '$1 ').trim();
    }

    if (e.target.name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    }

    if (e.target.name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }

    set_card((prev) => ({ ...prev, [e.target.name]: value }));
    set_errors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = (): boolean => {
    const new_errors: Partial<CardForm> = {};
    if (!card.card_name.trim())
      new_errors.card_name = 'Name on card is required.';
    const digits = card.card_number.replace(/\s/g, '');
    if (digits.length !== 16)
      new_errors.card_number = 'Enter a valid 16-digit card number.';
    if (!/^\d{2}\/\d{2}$/.test(card.expiry))
      new_errors.expiry = 'Enter expiry as MM/YY.';
    if (card.cvv.length !== 3) new_errors.cvv = 'CVV must be 3 digits.';
    set_errors(new_errors);
    return Object.keys(new_errors).length === 0;
  };

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    set_processing(true);
    await new Promise((res) => setTimeout(res, 2000));
    set_processing(false);
    set_processed(true);
    await new Promise((res) => setTimeout(res, 1000));
    on_success();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {processed ? (
          <div className="modal-success">
            <div className="modal-success-icon">✅</div>
            <p>Payment approved! Confirming booking...</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>💳 Payment Details</h2>
              <p>This is a simulated payment — no real charges will be made.</p>
            </div>

            <form onSubmit={handle_submit} noValidate>
              <div className="form-group">
                <label>
                  Name on Card <span className="required">*</span>
                </label>
                <input
                  name="card_name"
                  value={card.card_name}
                  onChange={handle_change}
                  placeholder="e.g. Jane Smith"
                  className={errors.card_name ? 'input-error' : ''}
                />
                {errors.card_name && (
                  <span className="field-error">{errors.card_name}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Card Number <span className="required">*</span>
                </label>
                <input
                  name="card_number"
                  value={card.card_number}
                  onChange={handle_change}
                  placeholder="1234 5678 9012 3456"
                  className={errors.card_number ? 'input-error' : ''}
                />
                {errors.card_number && (
                  <span className="field-error">{errors.card_number}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Expiry <span className="required">*</span>
                  </label>
                  <input
                    name="expiry"
                    value={card.expiry}
                    onChange={handle_change}
                    placeholder="MM/YY"
                    className={errors.expiry ? 'input-error' : ''}
                  />
                  {errors.expiry && (
                    <span className="field-error">{errors.expiry}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    CVV <span className="required">*</span>
                  </label>
                  <input
                    name="cvv"
                    value={card.cvv}
                    onChange={handle_change}
                    placeholder="123"
                    className={errors.cvv ? 'input-error' : ''}
                  />
                  {errors.cvv && (
                    <span className="field-error">{errors.cvv}</span>
                  )}
                </div>
              </div>

              <div className="modal-secure-note">
                🔒 Simulated secure payment — no real data is stored
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={on_cancel}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner" />
                      Processing...
                    </>
                  ) : (
                    'Pay & Confirm Booking'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
