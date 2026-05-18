import React from 'react';

const SortableHeader = ({ label, field, sortBy, sortOrder, onSort }) => {
  const isActive = sortBy === field;
  return (
    <th onClick={() => onSort(field)} style={{ cursor: 'pointer' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        <span style={{ 
          fontSize: 10, 
          color: isActive ? 'var(--accent)' : 'var(--text-muted)',
          opacity: isActive ? 1 : 0.5
        }}>
          {isActive ? (sortOrder === 'ASC' ? '↑' : '↓') : '⇅'}
        </span>
      </span>
    </th>
  );
};

export default SortableHeader;
