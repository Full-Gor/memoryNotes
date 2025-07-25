import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNotes } from '@/contexts/NotesContext';
import { ArrowLeft, Play, Pause, RotateCcw, Save, Clock } from 'lucide-react-native';

export default function TimerEditor() {
    const router = useRouter();
    const { addNote, updateNote, notes, categories } = useNotes();
    const { edit } = useLocalSearchParams();

    const existingNote = edit ? notes.find(note => note.id === edit) : null;

    const [title, setTitle] = useState(existingNote?.title || '');
    const [content, setContent] = useState(existingNote?.content || '');
    const [selectedCategory, setSelectedCategory] = useState(existingNote?.category || categories[0]?.id || '');
    const [backgroundColor, setBackgroundColor] = useState(existingNote?.backgroundColor || '#fff');
    const [tags, setTags] = useState<string[]>(existingNote?.tags || []);
    const [isLocked, setIsLocked] = useState(existingNote?.isLocked || false);

    // Timer states
    const [timerDuration, setTimerDuration] = useState(existingNote?.timerDuration || 25); // minutes par défaut
    const [timeRemaining, setTimeRemaining] = useState((existingNote?.timerDuration || 25) * 60); // en secondes
    const [isTimerActive, setIsTimerActive] = useState(existingNote?.isTimerActive || false);
    const [timerStartTime, setTimerStartTime] = useState<Date | null>(existingNote?.timerStartTime || null);
    const [timerMode, setTimerMode] = useState<'pomodoro' | 'custom'>('pomodoro');

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const colorOptions = [
        '#fff', '#ffebee', '#e8f5e8', '#fff3e0', '#f3e5f5', '#e0f2f1', '#fff8e1'
    ];

    const presetDurations = [
        { label: '25 min', value: 25 },
        { label: '45 min', value: 45 },
        { label: '60 min', value: 60 },
        { label: '90 min', value: 90 }
    ];

    useEffect(() => {
        if (isTimerActive) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setIsTimerActive(false);
                        Alert.alert('Temps écoulé !', 'Votre minuteur est terminé.');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isTimerActive]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = () => {
        if (timeRemaining === 0) {
            setTimeRemaining(timerDuration * 60);
        }
        setIsTimerActive(true);
        setTimerStartTime(new Date());
    };

    const pauseTimer = () => {
        setIsTimerActive(false);
    };

    const resetTimer = () => {
        setIsTimerActive(false);
        setTimeRemaining(timerDuration * 60);
        setTimerStartTime(null);
    };

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Erreur', 'Veuillez saisir un titre pour votre note');
            return;
        }

        if (existingNote) {
            // Mode édition
            updateNote(existingNote.id, {
                title: title.trim(),
                content: content.trim(),
                category: selectedCategory,
                tags,
                backgroundColor,
                isLocked,
                timerDuration,
                timerStartTime: timerStartTime || undefined,
                isTimerActive,
            });
            Alert.alert('Succès', 'Minuteur modifié avec succès', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            // Mode création
            const noteData = {
                title: title.trim(),
                content: content.trim(),
                type: 'timer' as const,
                category: selectedCategory,
                tags,
                backgroundColor,
                images: [],
                isLocked,
                timerDuration,
                timerStartTime: timerStartTime || undefined,
                isTimerActive,
            };

            addNote(noteData);
            Alert.alert('Succès', 'Minuteur créé avec succès', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }
    };

    const addTag = (tag: string) => {
        if (tag.trim() && !tags.includes(tag.trim())) {
            setTags([...tags, tag.trim()]);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{existingNote ? 'Modifier le minuteur' : 'Minuteur'}</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <Save size={24} color="#2196F3" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Timer Display */}
                <View style={styles.timerContainer}>
                    <Text style={styles.timerDisplay}>{formatTime(timeRemaining)}</Text>
                    <Text style={styles.timerLabel}>
                        {isTimerActive ? 'En cours...' : 'Prêt'}
                    </Text>
                </View>

                {/* Timer Controls */}
                <View style={styles.timerControls}>
                    <TouchableOpacity
                        style={[styles.controlButton, styles.playButton]}
                        onPress={isTimerActive ? pauseTimer : startTimer}
                    >
                        {isTimerActive ? (
                            <Pause size={24} color="#fff" />
                        ) : (
                            <Play size={24} color="#fff" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlButton, styles.resetButton]}
                        onPress={resetTimer}
                    >
                        <RotateCcw size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Duration Settings */}
                <View style={styles.durationSection}>
                    <Text style={styles.sectionTitle}>Durée</Text>
                    <View style={styles.presetButtons}>
                        {presetDurations.map((preset) => (
                            <TouchableOpacity
                                key={preset.value}
                                style={[
                                    styles.presetButton,
                                    timerDuration === preset.value && styles.presetButtonActive
                                ]}
                                onPress={() => {
                                    setTimerDuration(preset.value);
                                    if (!isTimerActive) {
                                        setTimeRemaining(preset.value * 60);
                                    }
                                }}
                            >
                                <Text style={[
                                    styles.presetButtonText,
                                    timerDuration === preset.value && styles.presetButtonTextActive
                                ]}>
                                    {preset.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.customDuration}>
                        <Text style={styles.customDurationLabel}>Durée personnalisée (minutes):</Text>
                        <TextInput
                            style={styles.durationInput}
                            value={timerDuration.toString()}
                            onChangeText={(text) => {
                                const value = parseInt(text) || 0;
                                setTimerDuration(value);
                                if (!isTimerActive) {
                                    setTimeRemaining(value * 60);
                                }
                            }}
                            keyboardType="numeric"
                            placeholder="25"
                        />
                    </View>
                </View>

                {/* Note Details */}
                <View style={styles.noteSection}>
                    <Text style={styles.sectionTitle}>Détails de la note</Text>

                    <TextInput
                        style={styles.titleInput}
                        placeholder="Titre de la note"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <TextInput
                        style={styles.contentInput}
                        placeholder="Description ou notes..."
                        value={content}
                        onChangeText={setContent}
                        multiline
                        numberOfLines={4}
                    />

                    {/* Category Selection */}
                    <View style={styles.categorySection}>
                        <Text style={styles.sectionSubtitle}>Catégorie</Text>
                        <View style={styles.categoryButtons}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryButton,
                                        selectedCategory === category.id && styles.categoryButtonActive
                                    ]}
                                    onPress={() => setSelectedCategory(category.id)}
                                >
                                    <Text style={[
                                        styles.categoryButtonText,
                                        selectedCategory === category.id && styles.categoryButtonTextActive
                                    ]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Color Selection */}
                    <View style={styles.colorSection}>
                        <Text style={styles.sectionSubtitle}>Couleur de fond</Text>
                        <View style={styles.colorButtons}>
                            {colorOptions.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorButton,
                                        { backgroundColor: color },
                                        backgroundColor === color && styles.colorButtonActive
                                    ]}
                                    onPress={() => setBackgroundColor(color)}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 8,
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 25,
    },
    saveButton: {
        padding: 8,
        marginTop: 20,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    timerDisplay: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'monospace',
    },
    timerLabel: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
    },
    timerControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 32,
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: '#4CAF50',
    },
    resetButton: {
        backgroundColor: '#FF9800',
    },
    durationSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    presetButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    presetButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    presetButtonActive: {
        backgroundColor: '#2196F3',
    },
    presetButtonText: {
        fontSize: 14,
        color: '#666',
    },
    presetButtonTextActive: {
        color: '#fff',
    },
    customDuration: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    customDurationLabel: {
        fontSize: 14,
        color: '#666',
    },
    durationInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: 80,
        textAlign: 'center',
    },
    noteSection: {
        flex: 1,
    },
    sectionSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 12,
    },
    titleInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    contentInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        textAlignVertical: 'top',
    },
    categorySection: {
        marginBottom: 16,
    },
    categoryButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
    },
    categoryButtonActive: {
        backgroundColor: '#2196F3',
    },
    categoryButtonText: {
        fontSize: 14,
        color: '#666',
    },
    categoryButtonTextActive: {
        color: '#fff',
    },
    colorSection: {
        marginBottom: 16,
    },
    colorButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    colorButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    colorButtonActive: {
        borderColor: '#2196F3',
        borderWidth: 3,
    },
}); 