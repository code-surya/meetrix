import { useState, useEffect } from 'react';
import { useGroups } from '@/hooks/useGroups';
import { Loading } from '@/components/common/Loading/Loading';
import './GroupBookingStep.css';

interface GroupBookingStepProps {
  eventId: number;
  selectedGroupId: number | null;
  onGroupSelect: (groupId: number | null) => void;
  totalTickets: number;
}

const GroupBookingStep = ({
  eventId,
  selectedGroupId,
  onGroupSelect,
  totalTickets,
}: GroupBookingStepProps) => {
  const { groups, isLoading, createGroup, joinGroup } = useGroups(eventId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string>('');

  const calculateDiscount = (quantity: number): number => {
    if (quantity >= 50) return 20;
    if (quantity >= 20) return 15;
    if (quantity >= 10) return 10;
    if (quantity >= 5) return 5;
    return 0;
  };

  const discount = calculateDiscount(totalTickets);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const result = await createGroup({
        name: groupName,
        event_id: eventId,
        max_members: 50,
      });

      if (result.success && result.group) {
        onGroupSelect(result.group.id);
        setShowCreateForm(false);
        setGroupName('');
      } else {
        setError(result.error || 'Failed to create group');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      setError('Invite code is required');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const result = await joinGroup(inviteCode);

      if (result.success && result.group) {
        onGroupSelect(result.group.id);
        setShowJoinForm(false);
        setInviteCode('');
      } else {
        setError(result.error || 'Invalid invite code');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSkip = () => {
    onGroupSelect(null);
  };

  return (
    <div className="group-booking-step">
      <div className="step-header">
        <h3>Group Booking (Optional)</h3>
        <p className="step-description">
          Book with a group to get discounts! The more people, the bigger the discount.
        </p>
      </div>

      {discount > 0 && (
        <div className="discount-info">
          <div className="discount-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
            <span>You qualify for {discount}% group discount!</span>
          </div>
          <p className="discount-description">
            Create or join a group with {totalTickets} tickets to save money.
          </p>
        </div>
      )}

      {error && (
        <div className="group-error-message">
          {error}
        </div>
      )}

      <div className="group-options">
        {/* Existing Groups */}
        {isLoading ? (
          <div className="groups-loading">
            <Loading />
            <p>Loading groups...</p>
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="existing-groups">
            <h4>Your Groups</h4>
            <div className="groups-list">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`group-card ${selectedGroupId === group.id ? 'selected' : ''}`}
                  onClick={() => onGroupSelect(selectedGroupId === group.id ? null : group.id)}
                >
                  <div className="group-info">
                    <h5>{group.name}</h5>
                    <p>{group.member_count || 0} members</p>
                  </div>
                  <div className="group-actions">
                    {selectedGroupId === group.id ? (
                      <span className="selected-indicator">Selected</span>
                    ) : (
                      <button className="select-group-btn">Select</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Create Group */}
        {!showCreateForm ? (
          <button
            className="action-button create-group-btn"
            onClick={() => {
              setShowCreateForm(true);
              setShowJoinForm(false);
              setError('');
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Create New Group
          </button>
        ) : (
          <div className="create-group-form">
            <h4>Create Group</h4>
            <input
              type="text"
              className="form-input"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={isCreating}
            />
            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setGroupName('');
                  setError('');
                }}
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateGroup}
                disabled={isCreating || !groupName.trim()}
              >
                {isCreating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        )}

        {/* Join Group */}
        {!showJoinForm ? (
          <button
            className="action-button join-group-btn"
            onClick={() => {
              setShowJoinForm(true);
              setShowCreateForm(false);
              setError('');
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2C13.3137 2 16 4.68629 16 8C16 11.3137 13.3137 14 10 14M10 2C6.68629 2 4 4.68629 4 8C4 11.3137 6.68629 14 10 14M10 2V14M10 2C8.89543 2 8 2.89543 8 4M10 14C8.89543 14 8 13.1046 8 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Join Existing Group
          </button>
        ) : (
          <div className="join-group-form">
            <h4>Join Group</h4>
            <input
              type="text"
              className="form-input"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              disabled={isJoining}
              maxLength={8}
            />
            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowJoinForm(false);
                  setInviteCode('');
                  setError('');
                }}
                disabled={isJoining}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleJoinGroup}
                disabled={isJoining || !inviteCode.trim()}
              >
                {isJoining ? 'Joining...' : 'Join Group'}
              </button>
            </div>
          </div>
        )}

        {/* Skip Option */}
        <button
          className="action-button skip-btn"
          onClick={handleSkip}
        >
          Continue without group
        </button>
      </div>

      {selectedGroupId && (
        <div className="selected-group-info">
          <div className="info-badge">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Group booking selected. Discount will be applied at checkout.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupBookingStep;

