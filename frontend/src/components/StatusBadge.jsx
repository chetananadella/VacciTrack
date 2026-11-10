import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const normStatus = (status || '').toLowerCase();

  if (normStatus === 'completed') {
    return (
      <span className="badge badge-completed">
        <CheckCircle2 size={13} /> Completed
      </span>
    );
  } else if (normStatus === 'upcoming') {
    return (
      <span className="badge badge-upcoming">
        <Clock size={13} /> Upcoming
      </span>
    );
  } else if (normStatus === 'due') {
    return (
      <span className="badge badge-due">
        <AlertTriangle size={13} /> Due Today
      </span>
    );
  } else if (normStatus === 'missed' || normStatus === 'overdue') {
    return (
      <span className="badge badge-overdue">
        <XCircle size={13} /> Overdue
      </span>
    );
  }

  return <span className="badge badge-upcoming">{status}</span>;
};

export default StatusBadge;
