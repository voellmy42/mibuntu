import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const NotificationCenter: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleMarkRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        markAsRead(id);
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={toggleOpen}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Bell size={24} color="var(--color-text-primary)" />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        backgroundColor: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                        onClick={() => setIsOpen(false)}
                    />
                    <div style={{
                        position: 'absolute',
                        top: '40px',
                        right: '0',
                        width: '320px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        maxHeight: '400px',
                        overflowY: 'auto',
                        border: '1px solid var(--color-border)'
                    }}>
                        <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#f9fafb'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Benachrichtigungen</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead()}
                                    style={{
                                        fontSize: '12px',
                                        color: 'var(--color-primary)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    Alle gelesen
                                </button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                Keine Benachrichtigungen
                            </div>
                        ) : (
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                {notifications.map(notif => (
                                    <li
                                        key={notif.id}
                                        style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid var(--color-border)',
                                            backgroundColor: notif.read ? 'white' : '#f0f9ff',
                                            cursor: 'default',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: notif.read ? 400 : 600 }}>
                                                    {notif.title}
                                                </p>
                                                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                                    {notif.message}
                                                </p>
                                                <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                    {notif.createdAt?.seconds
                                                        ? format(new Date(notif.createdAt.seconds * 1000), 'dd. MMM HH:mm', { locale: de })
                                                        : 'Gerade eben'}
                                                </span>
                                            </div>
                                            {!notif.read && (
                                                <button
                                                    onClick={(e) => handleMarkRead(notif.id, e)}
                                                    title="Als gelesen markieren"
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--color-primary)',
                                                        padding: '4px'
                                                    }}
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
