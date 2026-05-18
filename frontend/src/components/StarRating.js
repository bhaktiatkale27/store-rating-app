import React, { useState } from 'react';

const StarRating = ({ value, onChange, readonly = false, size = 'normal' }) => {
  const [hovered, setHovered] = useState(0);
  const fontSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize,
            color: star <= (hovered || value) ? 'var(--gold)' : 'var(--border)',
            cursor: readonly ? 'default' : 'pointer',
            transition: 'color 0.15s, transform 0.15s',
            transform: !readonly && star <= hovered ? 'scale(1.2)' : 'scale(1)',
            display: 'inline-block',
          }}
        >★</span>
      ))}
    </div>
  );
};

export default StarRating;
