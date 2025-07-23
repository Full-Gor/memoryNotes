import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNotes } from '@/contexts/NotesContext';
import { Bell, Calendar, X, Clock } from 'lucide-react-native';

export default function ActiveReminders() {
    const { notes, removeReminder } = useNotes();
    const [currentTime, setCurrentTime] = useState(new Date());

    const activeReminders = notes.filter(note =>
        note.reminder && new Date(note.reminder) > currentTime
    );

    useEffect(() => {
        if (activeReminders.length > 0) {
            const timer = setInterval(() => {
                setCurrentTime(new Date());
            }, 60000); // Mise à jour toutes les minutes

            return () => clearInterval(timer);
        }
    }, [activeReminders.length]);

    const formatReminderTime = (date: Date) => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `Dans ${days} jour${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `Dans ${hours} heure${hours > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `Dans ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            return 'Maintenant';
        }
    };

    const formatReminderDate = (date: Date) => {
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleRemoveReminder = async (noteId: string) => {
        try {
            await removeReminder(noteId);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de supprimer le rappel');
        }
    };

    if (activeReminders.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Rappels actifs</Text>
            {activeReminders
                .sort((a, b) => new Date(a.reminder!).getTime() - new Date(b.reminder!).getTime())
                .map((reminder) => (
                    <View key={reminder.id} style={[styles.reminderCard, { backgroundColor: reminder.backgroundColor }]}>
                        <View style={styles.reminderHeader}>
                            <View style={styles.reminderInfo}>
                                <Bell size={16} color="#FF9800" />
                                <Text style={styles.reminderTitle} numberOfLines={1}>
                                    {reminder.title || 'Rappel sans titre'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveReminder(reminder.id)}
                            >
                                <X size={16} color="#f44336" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.reminderDetails}>
                            <View style={styles.reminderTime}>
                                <Clock size={14} color="#666" />
                                <Text style={styles.reminderTimeText}>
                                    {formatReminderTime(reminder.reminder!)}
                                </Text>
                            </View>
                            
                            <View style={styles.reminderDate}>
                                <Calendar size={14} color="#666" />
                                <Text style={styles.reminderDateText}>
                                    {formatReminderDate(reminder.reminder!)}
                                </Text>
                            </View>
                        </View>

                        {reminder.reminderRepeat && reminder.reminderRepeat !== 'none' && (
                            <View style={styles.repeatInfo}>
                                <Text style={styles.repeatText}>
                                    {reminder.reminderRepeat === 'daily' ? '🔄 Tous les jours' : 
                                     reminder.reminderRepeat === 'weekly' ? '🔄 Toutes les semaines' : 
                                     '🔄 Tous les mois'}
                                </Text>
                            </View>
                        )}

                        {reminder.content && (
                            <Text style={styles.reminderContent} numberOfLines={2}>
                                {reminder.content}
                            </Text>
                        )}
                    </View>
                ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    reminderCard: {
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    reminderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reminderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    reminderTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    removeButton: {
        padding: 4,
    },
    reminderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    reminderTime: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reminderTimeText: {
        fontSize: 12,
        color: '#FF9800',
        fontWeight: '600',
        marginLeft: 4,
    },
    reminderDate: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reminderDateText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    repeatInfo: {
        marginBottom: 8,
    },
    repeatText: {
        fontSize: 11,
        color: '#666',
        fontStyle: 'italic',
    },
    reminderContent: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
}); 