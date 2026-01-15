import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const QRCodeDisplay = ({ value, size = 256 }) => {
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    // Génération locale du QR Code (Ultra rapide)
    if (value) {
      QRCode.toDataURL(value, { 
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      .then(url => {
        setImgSrc(url);
      })
      .catch(err => {
        console.error("Erreur QR:", err);
      });
    }
  }, [value, size]);

  return (
    <div style={{ 
      padding: '20px', 
      background: 'white', 
      borderRadius: '10px', 
      display: 'inline-block',
      boxShadow: '0 0 15px rgba(0,0,0,0.5)' 
    }}>
      {imgSrc ? (
        <img src={imgSrc} alt="QR Code Session" style={{ display: 'block' }} />
      ) : (
        <div style={{ 
            width: size, 
            height: size, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'black'
        }}>
            Chargement...
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;