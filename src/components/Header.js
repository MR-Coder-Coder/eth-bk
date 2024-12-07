import React from 'react';
import { Link } from 'react-router-dom';


function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-800 p-5">
      <h1 className="text-3xl mb-4 text-center text-gray-100 font-bold">
        Wallet Transaction Tracker
      </h1>
      <nav>
        <ul className="flex justify-center space-x-6">
          <li>
            <Link 
              to="/" 
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-200"
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/admin" 
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-200"
            >
              Admin
            </Link>
          </li>
          <li>
            <Link 
              to="/login" 
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-200"
            >
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
