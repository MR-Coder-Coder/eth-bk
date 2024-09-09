import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <h1>ETH Transaction Viewer</h1>
      <h3>0x296e9939c7726824d707ca70d33e736211a79DAE TL001</h3>
      <h3>0x08EE804cCC817d5d4db89E9e6460e2565c0C066b TLH</h3>
      <nav>
        <ul>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/">Home</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;