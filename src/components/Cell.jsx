import React from 'react';
import './Cell.css';

const Cell = ({ color }) => {
  return (
    <div 
      className="cell" 
      style={{ 
        backgroundColor: color || '#1e1e1e',
        border: color ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.05)'
      }}
    />
  );
};

export default Cell;