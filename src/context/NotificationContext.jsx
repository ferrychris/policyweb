import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        // Subscribe to real-time notifications
        const subscription = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications'
            }, (payload) => {
                const newNotification = payload.new;
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
                if (notificationsEnabled) {
                    showNotification(newNotification);
                }
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [notificationsEnabled]);

    const showNotification = (notification) => {
        if (!notificationsEnabled) return;

        toast(notification.title, {
            description: notification.message,
            duration: 5000,
            action: {
                label: 'View',
                onClick: () => handleNotificationClick(notification)
            }
        });
    };

    const handleNotificationClick = (notification) => {
        // Mark as read
        markAsRead(notification.id);

        // Navigate to relevant page if needed
        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);

            if (error) throw error;

            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('read', false);

            if (error) throw error;

            setNotifications(prev =>
                prev.map(notification => ({ ...notification, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    // Function to enable notifications
    const enableNotifications = () => {
        setNotificationsEnabled(true);
    };

    // Function to disable notifications
    const disableNotifications = () => {
        setNotificationsEnabled(false);
    };

    const value = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        notificationsEnabled,
        enableNotifications,
        disableNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    return useContext(NotificationContext);
}; 