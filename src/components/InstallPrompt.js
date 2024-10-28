import React, { useEffect, useState } from 'react';
import '../styles/InstallPrompt.css';

const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Verifica si la app ya está instalada en el dispositivo.
    window.addEventListener('appinstalled', () => {
      console.log('Aplicación instalada');
      setIsInstalled(true);
      setShowAlert(false); // Oculta la alerta si ya está instalada.
    });

    // Escucha el evento beforeinstallprompt (PC y móvil).
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); // Evita que el navegador muestre el prompt por defecto.
      setInstallPrompt(e); // Guarda el evento para invocarlo manualmente.
      setShowAlert(true); // Muestra la alerta personalizada.
    });

    return () => {
      window.removeEventListener('appinstalled', () => {});
      window.removeEventListener('beforeinstallprompt', () => {});
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt(); // Lanza el prompt de instalación.
      installPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.log('Usuario aceptó la instalación');
        } else {
          console.log('Usuario rechazó la instalación');
        }
        setShowAlert(false); // Oculta la alerta después de la decisión.
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
