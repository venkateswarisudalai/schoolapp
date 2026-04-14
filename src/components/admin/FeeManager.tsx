import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, IndianRupee, Send, Eye } from 'lucide-react';
import { saveFeeConfig, getAllFeeConfigs, generateMonthlyFees, getAllFeePayments, updateFeePaymentStatus } from '../../services/feeService';
import type { FeeConfig } from '../../services/feeService';
import { getAllChildren } from '../../services/childrenService';
import type { Child, FeePayment } from '../../types/index';
import './FeeManager.css';

interface FeeManagerProps {
  onBack: () => void;
}

const classes = [
  { id: 'class-1', name: 'Sunshine Nursery' },
  { id: 'class-2', name: 'Rainbow LKG' },
  { id: 'class-3', name: 'Star UKG' },
];

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

type Tab = 'setup' | 'generate' | 'verify';

const FeeManager = ({ onBack }: FeeManagerProps) => {
  const [tab, setTab] = useState<Tab>('setup');
  const [configs, setConfigs] = useState<FeeConfig[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Setup form
  const [selectedClass, setSelectedClass] = useState('class-2');
  const [monthlyFee, setMonthlyFee] = useState('3500');
  const [upiId, setUpiId] = useState('mayuri@oksbi');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Generate form
  const [genClass, setGenClass] = useState('class-2');
  const [genMonth, setGenMonth] = useState(new Date().getMonth());
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState('');

  // Verify
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cfgs, kids, pmts] = await Promise.all([
          getAllFeeConfigs(),
          getAllChildren(),
          getAllFeePayments(),
        ]);
        setConfigs(cfgs);
        setChildren(kids);
        setPayments(pmts);

        // Pre-fill from existing config
        if (cfgs.length > 0) {
          const cfg = cfgs[0];
          setMonthlyFee(String(cfg.monthlyFee));
          setUpiId(cfg.upiId || 'mayuri@oksbi');
        }
      } catch (error) {
        console.error('Error loading fee data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Save fee config
  const handleSaveConfig = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const cls = classes.find(c => c.id === selectedClass);
      await saveFeeConfig({
        classId: selectedClass,
        className: cls?.name || '',
        monthlyFee: Number(monthlyFee),
        upiId,
        schoolName: 'Mayuri Kids Villa',
      });
      setSaveMsg(`Fee set: ₹${monthlyFee}/month for ${cls?.name}`);
      const cfgs = await getAllFeeConfigs();
      setConfigs(cfgs);
    } catch (error) {
      setSaveMsg('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // Save config for all classes at once
  const handleSaveAllClasses = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      for (const cls of classes) {
        await saveFeeConfig({
          classId: cls.id,
          className: cls.name,
          monthlyFee: Number(monthlyFee),
          upiId,
          schoolName: 'Mayuri Kids Villa',
        });
      }
      setSaveMsg(`Fee set: ₹${monthlyFee}/month for ALL classes`);
      const cfgs = await getAllFeeConfigs();
      setConfigs(cfgs);
    } catch (error) {
      setSaveMsg('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // Generate fees
  const handleGenerate = async () => {
    setGenerating(true);
    setGenMsg('');
    try {
      const cfg = configs.find(c => c.id === genClass);
      const amount = cfg?.monthlyFee || Number(monthlyFee);
      const classKids = children.filter(c => c.classId === genClass);

      if (classKids.length === 0) {
        setGenMsg('No students in this class.');
        setGenerating(false);
        return;
      }

      const created = await generateMonthlyFees(
        genClass, genMonth, genYear, amount,
        classKids.map(c => ({ id: c.id, name: c.name }))
      );
      setGenMsg(`Created ${created} fee record(s) for ${months[genMonth]} ${genYear}. ${classKids.length - created} already existed.`);

      // Refresh payments
      const pmts = await getAllFeePayments();
      setPayments(pmts);
    } catch (error) {
      setGenMsg('Failed to generate fees.');
    } finally {
      setGenerating(false);
    }
  };

  // Verify payment
  const handleVerify = async (paymentId: string) => {
    setVerifyingId(paymentId);
    try {
      await updateFeePaymentStatus(paymentId, 'paid', {
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'upi',
        receiptNumber: `RCP-${Date.now().toString(36).toUpperCase()}`,
      });
      setPayments(prev => prev.map(p =>
        p.id === paymentId ? { ...p, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : p
      ));
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setVerifyingId(null);
    }
  };

  // Mark as overdue
  const handleMarkOverdue = async (paymentId: string) => {
    try {
      await updateFeePaymentStatus(paymentId, 'overdue');
      setPayments(prev => prev.map(p =>
        p.id === paymentId ? { ...p, status: 'overdue' } : p
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredPayments = payments
    .filter(p => filterStatus === 'all' || p.status === filterStatus)
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

  const getChildName = (childId: string) => children.find(c => c.id === childId)?.name || 'Unknown';
  const getChildClass = (childId: string) => {
    const classId = children.find(c => c.id === childId)?.classId;
    return classes.find(c => c.id === classId)?.name || '';
  };

  if (loading) {
    return (
      <div className="content">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
          <h2 className="page-title">Fee Management</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="page-title">Fee Management</h2>
      </div>

      {/* Tabs */}
      <div className="fee-tabs">
        <button className={`fee-tab ${tab === 'setup' ? 'active' : ''}`} onClick={() => setTab('setup')}>
          <IndianRupee size={16} /> Set Fees
        </button>
        <button className={`fee-tab ${tab === 'generate' ? 'active' : ''}`} onClick={() => setTab('generate')}>
          <Send size={16} /> Generate
        </button>
        <button className={`fee-tab ${tab === 'verify' ? 'active' : ''}`} onClick={() => setTab('verify')}>
          <Eye size={16} /> Verify
        </button>
      </div>

      {/* Setup Tab */}
      {tab === 'setup' && (
        <div className="fee-section">
          <div className="fee-form-card">
            <h3>Monthly Fee Amount</h3>
            <div className="fee-input-group">
              <span className="fee-currency">₹</span>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                className="fee-amount-input"
                placeholder="3500"
              />
              <span className="fee-period">/month</span>
            </div>

            <h3 style={{ marginTop: '20px' }}>UPI ID (for GPay payments)</h3>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="fee-text-input"
              placeholder="mayuri@oksbi"
            />

            <h3 style={{ marginTop: '20px' }}>Apply To</h3>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="fee-select"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={handleSaveConfig} disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Saving...' : 'Save for Selected Class'}
              </button>
              <button className="btn btn-secondary" onClick={handleSaveAllClasses} disabled={saving} style={{ flex: 1 }}>
                Save for All Classes
              </button>
            </div>

            {saveMsg && <div className="fee-msg success">{saveMsg}</div>}
          </div>

          {/* Current configs */}
          {configs.length > 0 && (
            <div className="fee-form-card" style={{ marginTop: '16px' }}>
              <h3>Current Fee Settings</h3>
              {configs.map(cfg => (
                <div className="fee-config-row" key={cfg.id}>
                  <span className="fee-config-class">{cfg.className}</span>
                  <span className="fee-config-amount">₹{cfg.monthlyFee}/month</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generate Tab */}
      {tab === 'generate' && (
        <div className="fee-section">
          <div className="fee-form-card">
            <h3>Generate Fee Records</h3>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
              This creates a pending fee record for each student in the selected class for the chosen month.
            </p>

            <label className="fee-label">Class</label>
            <select value={genClass} onChange={(e) => setGenClass(e.target.value)} className="fee-select">
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({children.filter(ch => ch.classId === c.id).length} students)</option>
              ))}
            </select>

            <label className="fee-label" style={{ marginTop: '12px' }}>Month</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select value={genMonth} onChange={(e) => setGenMonth(Number(e.target.value))} className="fee-select" style={{ flex: 2 }}>
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={genYear} onChange={(e) => setGenYear(Number(e.target.value))} className="fee-select" style={{ flex: 1 }}>
                {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <button className="btn btn-primary btn-block" onClick={handleGenerate} disabled={generating} style={{ marginTop: '16px' }}>
              {generating ? 'Generating...' : `Generate Fees for ${months[genMonth]} ${genYear}`}
            </button>

            {genMsg && <div className="fee-msg success">{genMsg}</div>}
          </div>

          {/* Quick: Generate for all classes */}
          <button
            className="btn btn-secondary btn-block"
            style={{ marginTop: '8px' }}
            onClick={async () => {
              setGenerating(true);
              setGenMsg('');
              let total = 0;
              for (const cls of classes) {
                const cfg = configs.find(c => c.id === cls.id);
                const amount = cfg?.monthlyFee || Number(monthlyFee);
                const kids = children.filter(c => c.classId === cls.id);
                if (kids.length > 0) {
                  const n = await generateMonthlyFees(cls.id, genMonth, genYear, amount, kids.map(c => ({ id: c.id, name: c.name })));
                  total += n;
                }
              }
              setGenMsg(`Generated ${total} fee records for all classes.`);
              setPayments(await getAllFeePayments());
              setGenerating(false);
            }}
            disabled={generating}
          >
            Generate for ALL Classes
          </button>
        </div>
      )}

      {/* Verify Tab */}
      {tab === 'verify' && (
        <div className="fee-section">
          {/* Summary counts */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ flex: 1, background: '#e8f5e9', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#2e7d32' }}>{payments.filter(p => p.status === 'paid').length}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>Paid</div>
            </div>
            <div style={{ flex: 1, background: '#fff3e0', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#e65100' }}>{payments.filter(p => p.status === 'pending').length}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>Pending</div>
            </div>
            <div style={{ flex: 1, background: '#ffebee', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#c62828' }}>{payments.filter(p => p.status === 'overdue').length}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>Overdue</div>
            </div>
            <div style={{ flex: 1, background: '#e3f2fd', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1565c0' }}>{payments.length}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>Total</div>
            </div>
          </div>

          <div className="fee-filter-row">
            {['pending', 'overdue', 'paid', 'all'].map(s => (
              <button
                key={s}
                className={`fee-filter-btn ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                {s !== 'all' && (
                  <span className="fee-filter-count">
                    {payments.filter(p => p.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filteredPayments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              No {filterStatus} payments found. Generate fees first.
            </div>
          ) : (
            <div className="fee-verify-list">
              {filteredPayments.map(payment => (
                <div className={`fee-verify-card ${payment.status}`} key={payment.id}>
                  <div className="fee-verify-top">
                    <div>
                      <div className="fee-verify-name">{getChildName(payment.childId)}</div>
                      <div className="fee-verify-class">{getChildClass(payment.childId)}</div>
                    </div>
                    <div className="fee-verify-right">
                      <div className="fee-verify-amount">₹{payment.amount}</div>
                      <span className={`fee-verify-badge ${payment.status}`}>{payment.status}</span>
                    </div>
                  </div>
                  <div className="fee-verify-bottom">
                    <span className="fee-verify-due">Due: {payment.dueDate}</span>
                    {payment.status === 'paid' && payment.paidDate && (
                      <span className="fee-verify-paid">Paid: {payment.paidDate}</span>
                    )}
                    {payment.receiptNumber && (
                      <span className="fee-verify-receipt">#{payment.receiptNumber}</span>
                    )}
                  </div>
                  {payment.status !== 'paid' && (
                    <div className="fee-verify-actions">
                      <button
                        className="btn-verify"
                        onClick={() => handleVerify(payment.id)}
                        disabled={verifyingId === payment.id}
                      >
                        <CheckCircle size={16} />
                        {verifyingId === payment.id ? 'Verifying...' : 'Mark as Paid'}
                      </button>
                      {payment.status === 'pending' && (
                        <button className="btn-overdue" onClick={() => handleMarkOverdue(payment.id)}>
                          Mark Overdue
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeeManager;
