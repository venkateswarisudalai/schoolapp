import React, { useState, useEffect } from 'react';
import { getAllChildren } from '../../services/childrenService';
import { getFeePaymentsByChild } from '../../services/feeService';
import type { Child, FeePayment } from '../../types/index';
import './FeeAnalytics.css';

interface FeeAnalyticsProps {
  onBack: () => void;
}

const FeeAnalytics: React.FC<FeeAnalyticsProps> = ({ onBack }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [children, setChildren] = useState<Child[]>([]);
  const [allPayments, setAllPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const childrenData = await getAllChildren();
        setChildren(childrenData);

        // Fetch payments for all children
        const paymentPromises = childrenData.map(child => getFeePaymentsByChild(child.id));
        const paymentResults = await Promise.all(paymentPromises);
        setAllPayments(paymentResults.flat());
      } catch (error) {
        console.error('Error loading fee data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const MONTHLY_FEE = 3500;
  const totalStudents = children.length;
  const expectedMonthlyRevenue = totalStudents * MONTHLY_FEE;

  // Get payments for selected month
  const currentMonthPayments = allPayments.filter(payment => {
    const paymentDate = new Date(payment.dueDate);
    return paymentDate.getMonth() === selectedMonth &&
           paymentDate.getFullYear() === selectedYear;
  });

  const paidStudents = currentMonthPayments.filter(p => p.status === 'paid').length;
  const pendingStudents = currentMonthPayments.filter(p => p.status === 'pending').length;
  const overdueStudents = currentMonthPayments.filter(p => p.status === 'overdue').length;

  const totalCollected = currentMonthPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = currentMonthPayments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const collectionRate = totalStudents > 0
    ? Math.round((paidStudents / totalStudents) * 100)
    : 0;

  const studentFeeStatus = children.map(child => {
    const childPayments = currentMonthPayments.filter(p => p.childId === child.id);
    const latestPayment = childPayments[0];

    return {
      childId: child.id,
      childName: child.name,
      gender: child.gender,
      amount: MONTHLY_FEE,
      status: latestPayment?.status || 'pending',
      paidDate: latestPayment?.paidDate,
      dueDate: latestPayment?.dueDate || `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-10`,
    };
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="fee-analytics-container">
        <div className="analytics-header">
          <div className="analytics-title-section">
            <button className="back-btn-analytics" onClick={onBack}>← Back</button>
            <h2>Fee Analytics</h2>
          </div>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading fee data...</div>
      </div>
    );
  }

  return (
    <div className="fee-analytics-container">
      <div className="analytics-header">
        <div className="analytics-title-section">
          <button className="back-btn-analytics" onClick={onBack}>
            ← Back
          </button>
          <h2>Fee Analytics</h2>
        </div>

        <div className="month-selector">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="month-select"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month} {selectedYear}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="month-select"
            style={{ marginLeft: '8px' }}
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="summary-card total">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <div className="summary-label">Expected Revenue</div>
            <div className="summary-value">₹{expectedMonthlyRevenue.toLocaleString()}</div>
            <div className="summary-detail">{totalStudents} students × ₹{MONTHLY_FEE}</div>
          </div>
        </div>

        <div className="summary-card collected">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <div className="summary-label">Collected</div>
            <div className="summary-value">₹{totalCollected.toLocaleString()}</div>
            <div className="summary-detail">{paidStudents} students paid</div>
          </div>
        </div>

        <div className="summary-card pending">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <div className="summary-label">Pending</div>
            <div className="summary-value">₹{totalPending.toLocaleString()}</div>
            <div className="summary-detail">{pendingStudents + overdueStudents} students</div>
          </div>
        </div>

        <div className="summary-card rate">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <div className="summary-label">Collection Rate</div>
            <div className="summary-value">{collectionRate}%</div>
            <div className="summary-detail">{paidStudents}/{totalStudents} students</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="collection-progress">
        <div className="progress-header">
          <span>Collection Progress</span>
          <span>{collectionRate}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
        <div className="progress-legend">
          <span className="legend-item">
            <span className="legend-dot collected"></span>
            Collected: ₹{totalCollected.toLocaleString()}
          </span>
          <span className="legend-item">
            <span className="legend-dot pending"></span>
            Pending: ₹{totalPending.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="status-breakdown">
        <h3>Payment Status Breakdown</h3>
        <div className="status-cards">
          <div className="status-card paid-card">
            <div className="status-count">{paidStudents}</div>
            <div className="status-label">Paid</div>
            <div className="status-amount">₹{totalCollected.toLocaleString()}</div>
          </div>
          <div className="status-card pending-card">
            <div className="status-count">{pendingStudents}</div>
            <div className="status-label">Pending</div>
            <div className="status-amount">
              ₹{currentMonthPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
          </div>
          <div className="status-card overdue-card">
            <div className="status-count">{overdueStudents}</div>
            <div className="status-label">Overdue</div>
            <div className="status-amount">
              ₹{currentMonthPayments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Student-wise List */}
      <div className="student-fee-list">
        <h3>Student-wise Fee Status</h3>
        {studentFeeStatus.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No students found. Add students first.
          </div>
        ) : (
          <div className="fee-table">
            <div className="fee-table-header">
              <div className="col-student">Student Name</div>
              <div className="col-amount">Amount</div>
              <div className="col-status">Status</div>
              <div className="col-date">Due/Paid Date</div>
            </div>
            {studentFeeStatus.map((student) => (
              <div className="fee-table-row" key={student.childId}>
                <div className="col-student">
                  <div className="student-avatar">
                    {student.gender === 'male' ? '👦' : '👧'}
                  </div>
                  <span>{student.childName}</span>
                </div>
                <div className="col-amount">₹{student.amount.toLocaleString()}</div>
                <div className="col-status">
                  <span className={`status-badge-table ${student.status}`}>
                    {student.status}
                  </span>
                </div>
                <div className="col-date">
                  {student.status === 'paid' && student.paidDate
                    ? `Paid: ${new Date(student.paidDate).toLocaleDateString()}`
                    : `Due: ${new Date(student.dueDate).toLocaleDateString()}`
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="monthly-insights">
        <h3>Insights</h3>
        <div className="insight-cards">
          {collectionRate >= 80 && (
            <div className="insight-card success">
              <span className="insight-icon">🎉</span>
              <div className="insight-content">
                <strong>Excellent Collection!</strong>
                <p>You've collected {collectionRate}% of expected fees this month.</p>
              </div>
            </div>
          )}
          {collectionRate < 80 && collectionRate >= 50 && (
            <div className="insight-card warning">
              <span className="insight-icon">⚠️</span>
              <div className="insight-content">
                <strong>Moderate Collection</strong>
                <p>Only {collectionRate}% collected. Send reminders to pending parents.</p>
              </div>
            </div>
          )}
          {collectionRate < 50 && (
            <div className="insight-card danger">
              <span className="insight-icon">🚨</span>
              <div className="insight-content">
                <strong>Low Collection Rate</strong>
                <p>Only {collectionRate}% collected. Immediate action required!</p>
              </div>
            </div>
          )}
          {overdueStudents > 0 && (
            <div className="insight-card info">
              <span className="insight-icon">📞</span>
              <div className="insight-content">
                <strong>Overdue Payments</strong>
                <p>{overdueStudents} student(s) have overdue payments. Follow up required.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeAnalytics;
