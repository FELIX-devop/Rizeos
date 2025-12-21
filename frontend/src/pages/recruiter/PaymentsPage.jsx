import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import PaymentButton from '../../components/PaymentButton.jsx';
import { listPayments } from '../../services/api.js';
import { toast } from 'sonner';

/**
 * PaymentsPage
 * 
 * Dedicated page for viewing payment history and making new payments.
 * This is the ONLY place where listPayments API is called.
 */
export default function PaymentsPage({ config }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState('');

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await listPayments(token);
      if (Array.isArray(res)) setPayments(res);
      else if (Array.isArray(res?.payments)) setPayments(res.payments);
      else setPayments([]);
    } catch (err) {
      console.error('Failed to load payments', err);
      setPayments([]);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalMatic = useMemo(
    () => (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toFixed(3),
    [payments]
  );

  const handlePaymentVerified = (id) => {
    setPaymentId(id);
    toast.success('Payment verified');
    loadPayments(); // Refresh payments list
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/recruiter')}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Overview
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Section */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Make Payment</h2>
            <p className="text-sm text-white/70">Pay platform fee to post jobs</p>
          </div>

          <PaymentButton
            adminWallet={config.admin_wallet}
            platformFee={config.platform_fee_matic || 0.1}
            onVerified={handlePaymentVerified}
          />

          {paymentId && (
            <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-lg">
              <p className="text-sm text-green-300">
                ✓ Payment verified! You can now post jobs.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-white/60 mb-2">Payment Details:</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Platform Fee:</span>
                <span className="font-semibold">{config.platform_fee_matic || 0.1} MATIC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Recipient:</span>
                <span className="font-mono text-xs text-white/80 truncate max-w-[200px]">
                  {config.admin_wallet || 'Not configured'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Payment History</h2>
              <p className="text-sm text-white/70">All your transactions</p>
            </div>
            <button
              className="text-xs px-3 py-1 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              onClick={loadPayments}
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-white/60 mb-1">Total Paid</p>
            <p className="text-2xl font-semibold text-accent">{totalMatic} MATIC</p>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {loading && (
              <div className="text-center py-8">
                <p className="text-sm text-white/60">Loading payments...</p>
              </div>
            )}

            {!loading && payments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/60 mb-2">No payments yet.</p>
                <p className="text-sm text-white/50">Make your first payment to start posting jobs.</p>
              </div>
            )}

            {!loading &&
              payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-white/80 truncate">
                      {p.tx_hash || p.txHash || 'N/A'}
                    </p>
                    {p.created_at && (
                      <p className="text-xs text-white/50 mt-1">
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className="text-accent font-semibold ml-4">{p.amount} MATIC</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

