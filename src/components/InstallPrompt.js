import React, { useEffect, useState } from 'react';
import '../styles/InstallPrompt.css'; 

const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowAlert(false);
    });

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); 
      setInstallPrompt(e);
      setShowAlert(true); 
    });

    return () => {
      window.removeEventListener('appinstalled', () => {});
      window.removeEventListener('beforeinstallprompt', () => {});
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.log('El usuario aceptó la instalación');
        } else {
          console.log('El usuario rechazó la instalación');
        }
        setShowAlert(false); 
      });
    }
  };

  return (
    showAlert && !isInstalled && (
      <div className="install-prompt">
        <p>¿Quieres instalar nuestra app?</p>
        <button onClick={handleInstallClick} className="install-btn">Instalar</button>
        <button onClick={() => setShowAlert(false)} className="close-btn">Cerrar</button>
      </div>
    )
  );
};

export default InstallPrompt;
