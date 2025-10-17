import React from 'react';

export const Table = ({ children }) => (
  <table className="table">
    {children}
  </table>
);

export const TableHead = ({ children }) => (
  <thead className="table-head">
    {children}
  </thead>
);

export const TableRow = ({ children }) => (
  <tr className="table-row">
    {children}
  </tr>
);

export const TableCell = ({ children }) => (
  <td className="table-cell">
    {children}
  </td>
);

export const TableBody = ({ children }) => (
  <tbody className="table-body">
    {children}
  </tbody>
);