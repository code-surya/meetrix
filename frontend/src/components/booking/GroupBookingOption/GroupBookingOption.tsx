import { useState, useEffect } from 'react';
import { Event } from '@/features/events/eventsTypes';
import { useGroups } from '@/hooks/useGroups';
import { Loading } from '@/components/common/Loading/Loading';
import './GroupBookingOption.css';

interface GroupBookingOptionProps {
  event: Event;
  enabled: boolean;
  groupId: number | null;
  onToggle: (enabled: boolean, groupId?: number) => void;
  selectedTickets: Record<number, number>;
}

const GroupBookingOption = ({
  event,
  enabled,
  groupId,
  onToggle,
  selectedTickets,
}: GroupBookingOptionProps) => {
  const [showGroupList, setShowGroupList] = useState(false);
  const { groups, isLoading, createGroup, joinGroup } = useGroups(event.id);
  const totalQuantity = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  const calculateDiscount = (quantity: number): number => {
    if (quantity >= 50) return 20;
    if (quantity >= 20) return 15;
    if (quantity >= 10) return 10;
    if (quantity >= 5) return 5;
    return 0;
  };

  const discount = calculateDiscount(totalQuantity);
  const discountAmount = enabled
    ? Object.entries(selectedTickets).reduce((sum, [ticketTypeId, quantity]) => {
        const ticketType = event.ticket_types?.find((tt) => tt.id === parseInt(ticketTypeId));
        return sum + (ticketType?.price || 0) * quantity * (discount / 100);
      }, 0)
    : 0;

  const handleCreateGroup = async () => {
    try {
      const result = await createGroup({
        eventId: event.id,
        name: `Group for ${event.title}`,
        maxMembers: 20,
      });

      if (result.success && result.group) {
        onToggle(true, result.group.id);
        setShowGroupList(false);
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleJoinGroup = async (groupIdToJoin: number) => {
    try {
      const result = await joinGroup(groupIdToJoin);
      if (result.success) {
        onToggle(true, groupIdToJoin);
        setShowGroupList(false);
      }
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  return (
    <div className="group-booking-option">
      <div className="group-booking-header">
        <h2>Group Booking</h2>
        <p className="group-booking-description">
          Book tickets together with friends and save! Discounts apply based on total group size.
        </p>
      </div>

      <div className="group-booking-card">
        <div className="group-booking-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggle(e.target.checked, groupId || undefined)}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">Enable Group Booking</span>
          </label>
        </div>

        {enabled && (
          <div className="group-booking-details">
            <div className="discount-info">
              <div className="discount-badge">
                {discount}% OFF
              </div>
              <p className="discount-description">
                You'll save {discount}% on all tickets when booking as a group
              </p>
            </div>

            {totalQuantity >= 5 ? (
              <div className="discount-breakdown">
                <h3>Discount Tiers:</h3>
                <ul className="discount-tiers">
                  <li className={totalQuantity >= 5 ? 'active' : ''}>
                    5-9 people: 5% discount
                  </li>
                  <li className={totalQuantity >= 10 ? 'active' : ''}>
                    10-19 people: 10% discount
                  </li>
                  <li className={totalQuantity >= 20 ? 'active' : ''}>
                    20-49 people: 15% discount
                  </li>
                  <li className={totalQuantity >= 50 ? 'active' : ''}>
                    50+ people: 20% discount
                  </li>
                </ul>
              </div>
            ) : (
              <div className="minimum-notice">
                <p>
                  <strong>Minimum 5 tickets required</strong> for group booking discounts.
                  You currently have {totalQuantity} ticket{totalQuantity !== 1 ? 's' : ''} selected.
                </p>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="savings-preview">
                <div className="savings-row">
                  <span>Your Savings:</span>
                  <span className="savings-amount">-{discountAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="group-management">
              {groupId ? (
                <div className="current-group">
                  <p>You're booking as part of a group</p>
                  <button
                    className="btn-secondary"
                    onClick={() => onToggle(false)}
                  >
                    Leave Group
                  </button>
                </div>
              ) : (
                <div className="group-actions">
                  <button
                    className="btn-primary"
                    onClick={() => setShowGroupList(!showGroupList)}
                  >
                    {showGroupList ? 'Hide' : 'Join or Create'} Group
                  </button>
                </div>
              )}
            </div>

            {showGroupList && !groupId && (
              <div className="group-list">
                {isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {groups && groups.length > 0 ? (
                      <div className="available-groups">
                        <h3>Available Groups</h3>
                        {groups.map((group) => (
                          <div key={group.id} className="group-item">
                            <div className="group-info">
                              <h4>{group.name}</h4>
                              <p>
                                {group.member_count} / {group.max_members} members
                              </p>
                            </div>
                            <button
                              className="join-group-btn"
                              onClick={() => handleJoinGroup(group.id)}
                            >
                              Join
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-groups">No groups available</p>
                    )}
                    <button
                      className="create-group-btn"
                      onClick={handleCreateGroup}
                    >
                      Create New Group
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupBookingOption;

