'use client';

import React from 'react';
import './loader.css';

export const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="capybaraloader">
        <div className="capybara">
          <div className="capyhead">
            <div className="capyear">
              <div className="capyear2" />
            </div>
            <div className="capyear" />
            <div className="capymouth">
              <div className="capylips" />
              <div className="capylips" />
            </div>
            <div className="capyeye" />
            <div className="capyeye" />
          </div>
          <div className="capyleg" />
          <div className="capyleg2" />
          <div className="capyleg2" />
          <div className="capy" />
        </div>
        <div className="loader">
          <div className="loaderline" />
        </div>
      </div>
    </div>
  );
};

export default Loader;
