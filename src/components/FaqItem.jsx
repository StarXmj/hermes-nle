// src/components/FaqItem.jsx
import React, { useState } from 'react';
import './FaqItem.css';
import { FaPlus, FaMinus } from 'react-icons/fa'; // Icônes + et -

function FaqItem({ item }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="faq-item">
      <button className="faq-question" onClick={toggleOpen}>
        <span>{item.question}</span>
        {isOpen ? <FaMinus /> : <FaPlus />}
      </button>
      {isOpen && (
        <div className="faq-reponse">
          <p>{item.reponse}</p>
        </div>
      )}
    </div>
  );
}
export default FaqItem;