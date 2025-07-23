import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNotes } from '@/contexts/NotesContext';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react-native';

export default function ActiveTimers() {
    const { notes, updateNote } = useNotes();
    const [currentTime, setCurrentTime] = useState(new Date());

    const activeTimers = notes.filter(note =>
        note.type === 'timer' && note.isTimerActive && note.timerStartTime
    );

    useEffect(() => {
        if (activeTimers.length > 0) {
            const timer = setInterval(() => {
                setCurrentTime(new Date());
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [activeTimers.length]);

    const calculateTimeRemaining = (timerStartTime: Date, duration: number) => {
        const elapsed = Math.floor((currentTime.getTime() - timerStartTime.getTime()) / 1000);
        const remaining = (duration * 60) - elapsed;
        return Math.max(0, remaining);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePauseTimer = (noteId: string) => {
        updateNote(noteId, { isTimerActive: false });
    };

    const handleResumeTimer = (noteId: string) => {
        updateNote(noteId, {
            isTimerActive: true,
            timerStartTime: new Date()
        });
    };

    const handleResetTimer = (noteId: string, duration: number) => {
        updateNote(noteId, {
            isTimerActive: false,
            timerStartTime: undefined
        });
    };

    if (activeTimers.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Minuteurs actifs</Text>
            {activeTimers.map((timer) => {
                const timeRemaining = calculateTimeRemaining(timer.timerStartTime!, timer.timerDuration!);
                const isExpired = timeRemaining === 0;

                if (isExpired) {
                    Alert.alert('Temps écoulé !', `Le minuteur "${timer.title}" est terminé.`);
                    updateNote(timer.id, { isTimerActive: false });
                    return null;
                }

                return (
                    <View key={timer.id} style={[styles.timerCard, { backgroundColor: timer.backgroundColor }]}>
                        <View style={styles.timerHeader}>
                            <View style={styles.timerInfo}>
                                <Clock size={16} color="#E91E63" />
                                <Text style={styles.timerTitle} numberOfLines={1}>
                                    {timer.title}
                                </Text>
                            </View>
                            <Text style={styles.timerDisplay}>
                                {formatTime(timeRemaining)}
                            </Text>
                        </View>

                        <View style={styles.timerControls}>
                            <TouchableOpacity
                                style={[styles.controlButton, styles.pauseButton]}
                                onPress={() => handlePauseTimer(timer.id)}
                            >
                                <Pause size={16} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.controlButton, styles.resetButton]}
                                onPress={() => handleResetTimer(timer.id, timer.timerDuration!)}
                            >
                                <RotateCcw size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            })}
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
    timerCard: {
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
    timerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    timerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    timerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    timerDisplay: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E91E63',
        fontFamily: 'monospace',
    },
    timerControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    controlButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pauseButton: {
        backgroundColor: '#FF9800',
    },
    resetButton: {
        backgroundColor: '#f44336',
    },
}); 