import { useState, useEffect } from 'react';
import { Event } from '@/features/events/eventsTypes';
import apiClient from '@/services/api/client';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { Loading } from '@/components/common/Loading/Loading';
import { ErrorMessage } from '@/components/common/ErrorMessage/ErrorMessage';
import './AttendanceStats.css';

interface AttendanceStatsProps {
  event: Event;
  attendanceData?: any;
}

const AttendanceStats = ({ event, attendanceData }: AttendanceStatsProps) => {
  const [stats, setStats] = useState<any>(attendanceData);
  const [isLoading, setIsLoading] = useState(!attendanceData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attendanceData) {
      fetchAttendanceStats();
    }
  }, [event.id, attendanceData]);

  const fetchAttendanceStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(
        `/events/${event.id}/check_ins/attendance`
      );

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('Failed to fetch attendance data');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load attendance stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="attendance-stats-loading">
        <Loading size="large" />
        <p>Loading attendance statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <ErrorMessage
        message={error || 'Failed to load attendance data'}
        onRetry={fetchAttendanceStats}
      />
    );
  }

  const attendanceRate = stats.attendance_rate || 0;
  const totalRegistrations = stats.total_registrations || 0;
  const totalCheckedIn = stats.total_checked_in || 0;

  return (
    <div className="attendance-stats">
      <div className="stats-header">
        <h3>Live Attendance Statistics</h3>
        <button className="refresh-btn" onClick={fetchAttendanceStats}>
          🔄 Refresh
        </button>
      </div>

      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{totalCheckedIn}</div>
            <div className="stat-label">Checked In</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{totalRegistrations}</div>
            <div className="stat-label">Total Registrations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{attendanceRate}%</div>
            <div className="stat-label">Attendance Rate</div>
          </div>
        </div>
      </div>

      <div className="stats-details">
        <div className="detail-section">
          <h4>Recent Check-ins</h4>
          {stats.recent_check_ins && stats.recent_check_ins.length > 0 ? (
            <div className="recent-list">
              {stats.recent_check_ins.map((checkIn: any, index: number) => (
                <div key={index} className="recent-item">
                  <div className="attendee-info">
                    <span className="attendee-name">{checkIn.attendee_name}</span>
                    <span className="ticket-type">{checkIn.ticket_type}</span>
                  </div>
                  <div className="check-in-details">
                    <span className="check-in-time">
                      {new Date(checkIn.checked_in_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {checkIn.checked_in_by && (
                      <span className="checked-by">by {checkIn.checked_in_by}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No check-ins yet</p>
          )}
        </div>

        {stats.check_in_trends && stats.check_in_trends.length > 0 && (
          <div className="detail-section">
            <h4>Check-in Trends (Last Hour)</h4>
            <div className="trends-chart">
              {stats.check_in_trends.map((trend: any) => (
                <div key={trend.hour} className="trend-bar">
                  <div className="trend-label">
                    {trend.hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="trend-bar-container">
                    <div
                      className="trend-bar-fill"
                      style={{
                        height: `${Math.min((trend.check_ins / 10) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="trend-value">{trend.check_ins}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detail-section">
          <h4>Event Capacity</h4>
          <div className="capacity-info">
            <div className="capacity-bar">
              <div
                className="capacity-fill"
                style={{
                  width: totalRegistrations > 0 ? `${(totalCheckedIn / totalRegistrations) * 100}%` : '0%'
                }}
              />
            </div>
            <div className="capacity-labels">
              <span>0</span>
              <span>{totalRegistrations}</span>
            </div>
            <p className="capacity-text">
              {totalCheckedIn} of {totalRegistrations} attendees checked in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;

