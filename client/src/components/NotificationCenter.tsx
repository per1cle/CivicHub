import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import type { CivicNotification } from '../hooks/useNotifications';

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (n: CivicNotification) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'CERERE': return { char: '📄', bg: '#dbeafe', color: '#1e40af' };
      case 'SESIZARE': return { char: '📍', bg: '#fee2e2', color: '#991b1b' };
      case 'PLATA': return { char: '💰', bg: '#dcfce7', color: '#166534' };
      case 'PROGRAMARE': return { char: '📅', bg: '#fef3c7', color: '#92400e' };
      default: return { char: '🔔', bg: '#f1f5f9', color: '#475569' };
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Acum';
    if (diffMins < 60) return `Acum ${diffMins}m`;
    if (diffHours < 24) return `Acum ${diffHours}h`;
    if (diffDays === 1) return 'Ieri';
    return date.toLocaleDateString('ro-RO');
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '22px',
          color: '#cbd5e1',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          borderRadius: '50%',
          transition: '0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = 'white';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = '#cbd5e1';
        }}
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: '#ef4444',
            color: 'white',
            fontSize: '10px',
            fontWeight: '900',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #0f173d'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '0',
          width: '360px',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'popIn 0.2s ease'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Notificări</h3>
            {unreadCount > 0 && (
              <span style={{ 
                fontSize: '11px', 
                background: '#fee2e2', 
                color: '#b91c1c', 
                padding: '4px 10px', 
                borderRadius: '999px',
                fontWeight: 800
              }}>
                {unreadCount} noi
              </span>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length > 0 ? (
              notifications.map(n => {
                const icon = getIcon(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start',
                      transition: '0.2s',
                      background: !n.isRead ? '#f0f7ff' : 'white'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = !n.isRead ? '#e0f2fe' : '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = !n.isRead ? '#f0f7ff' : 'white'}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0,
                      background: icon.bg,
                      color: icon.color
                    }}>
                      {icon.char}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#0f172a' }}>
                        {n.title}
                      </strong>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                        {n.message}
                      </p>
                      <span style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    {!n.isRead && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#2563eb',
                        borderRadius: '50%',
                        marginTop: '6px'
                      }}></div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <span style={{ display: 'block', fontSize: '40px', marginBottom: '10px' }}>📭</span>
                <p style={{ margin: 0 }}>Nu ai nicio notificare momentan.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}