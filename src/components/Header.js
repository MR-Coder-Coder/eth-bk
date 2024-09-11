import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="app-header">
      <h1>ETH Transaction Viewer</h1>
      <nav>
        <ul className="nav-links">
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/admin">Admin</Link></li>
          <li><Link to="/">Home</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
