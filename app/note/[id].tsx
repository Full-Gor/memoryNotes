import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Modal, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNotes } from '@/contexts/NotesContext';
import { Audio } from 'expo-av';
import { ArrowLeft, Play, Pause, X, Clock, Edit3, Trash2 } from 'lucide-react-native';
import Svg, { Path, Circle as SvgCircle, Rect, Text as SvgText } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFontStyle } from '@/utils/fonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function NoteDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { notes, categories, deleteNote } = useNotes();
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState<number | null>(null);
    const [position, setPosition] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const note = notes.find((n) => n.id === id);
    const category = categories.find((cat) => cat.id === note?.category);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    if (!note) {
        return (
            <View style={styles.centered}>
                <Text>Note introuvable.</Text>
            </View>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            'Supprimer la note',
            'Êtes-vous sûr de vouloir supprimer cette note ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer', style: 'destructive', onPress: () => {
                        deleteNote(note.id);
                        router.back();
                    }
                },
            ]
        );
    };

    const handleEdit = () => {
        switch (note.type) {
            case 'text':
                router.push(`/editor/text?edit=${note.id}`);
                break;
            case 'checklist':
                router.push(`/editor/checklist?edit=${note.id}`);
                break;
            case 'drawing':
                router.push(`/editor/drawing?edit=${note.id}`);
                break;
            case 'voice':
                router.push(`/editor/voice?edit=${note.id}`);
                break;
            case 'timer':
                router.push(`/editor/timer?edit=${note.id}`);
                break;
        }
    };

    // Fonctions spécifiques pour chaque type de contenu
    const handleEditContent = (contentType: string) => {
        switch (contentType) {
            case 'text':
                router.push(`/editor/text?edit=${note.id}&focus=content`);
                break;
            case 'checklist':
                router.push(`/editor/checklist?edit=${note.id}&focus=items`);
                break;
            case 'drawing':
                router.push(`/editor/drawing?edit=${note.id}&focus=canvas`);
                break;
            case 'voice':
                router.push(`/editor/voice?edit=${note.id}&focus=recording`);
                break;
            case 'timer':
                router.push(`/editor/timer?edit=${note.id}&focus=duration`);
                break;
        }
    };

    const handleDeleteContent = (contentType: string) => {
        Alert.alert(
            'Supprimer le contenu',
            `Êtes-vous sûr de vouloir supprimer le contenu de cette ${contentType} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer', style: 'destructive', onPress: () => {
                        // Supprimer seulement le contenu spécifique
                        switch (contentType) {
                            case 'text':
                                updateNote(note.id, { content: '' });
                                break;
                            case 'checklist':
                                updateNote(note.id, { checklistItems: [] });
                                break;
                            case 'drawing':
                                updateNote(note.id, { drawingElements: [] });
                                break;
                            case 'voice':
                                updateNote(note.id, { audioPath: undefined });
                                break;
                            case 'timer':
                                updateNote(note.id, { timerDuration: 0, isTimerActive: false });
                                break;
                        }
                    }
                },
            ]
        );
    };

    const loadAudio = async () => {
        if (!note.audioPath) return;

        try {
            const { sound: audioSound } = await Audio.Sound.createAsync(
                { uri: note.audioPath },
                { shouldPlay: false }
            );
            setSound(audioSound);

            const status = await audioSound.getStatusAsync();
            if (status.isLoaded) {
                setDuration(status.durationMillis || 0);
            }

            audioSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    setIsPlaying(status.isPlaying);
                    setPosition(status.positionMillis || 0);
                }
            });
        } catch (error) {
            console.error('Error loading audio:', error);
        }
    };

    const togglePlayback = async () => {
        if (!sound) {
            await loadAudio();
            return;
        }

        try {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
        } catch (error) {
            console.error('Error toggling playback:', error);
        }
    };

    const formatTime = (millis: number) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
    };

    const renderDrawingElement = (element: any) => {
        switch (element.type) {
            case 'path':
                return (
                    <Path
                        key={element.id}
                        d={element.points}
                        stroke={element.strokeColor}
                        strokeWidth={element.strokeWidth}
                        fill="none"
                    />
                );
            case 'circle':
                return (
                    <SvgCircle
                        key={element.id}
                        cx={element.x}
                        cy={element.y}
                        r={element.radius}
                        stroke={element.strokeColor}
                        strokeWidth={element.strokeWidth}
                        fill={element.fillColor || 'none'}
                    />
                );
            case 'rect':
                return (
                    <Rect
                        key={element.id}
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        stroke={element.strokeColor}
                        strokeWidth={element.strokeWidth}
                        fill={element.fillColor || 'none'}
                    />
                );
            case 'text':
                return (
                    <SvgText
                        key={element.id}
                        x={element.x}
                        y={element.y}
                        fontSize={element.fontSize}
                        fill={element.strokeColor}
                        stroke="none"
                    >
                        {element.text}
                    </SvgText>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: note.backgroundColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {note.title || 'Note sans titre'}
                    </Text>
                                            <View style={styles.headerActions}>
                            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                                <Edit3 size={24} color="#2196F3" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                                <Trash2 size={24} color="#f44336" />
                            </TouchableOpacity>
                        </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.noteInfo}>
                    <Text style={styles.noteDate}>
                        {new Date(note.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>

                {note.type === 'text' ? (
                    <View>
                        <View style={styles.contentHeader}>
                            <Text style={styles.label}>Note texte</Text>
                            <View style={styles.contentActions}>
                                <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                                    <Edit3 size={24} color="#2196F3" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                                    <Trash2 size={24} color="#f44336" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={[styles.noteContent, getFontStyle(note.font || 'System')]}>{note.content}</Text>
                    </View>
                ) : note.type === 'checklist' && note.checklistItems ? (
                    <View>
                        <View style={styles.contentHeader}>
                            <Text style={styles.label}>Checklist</Text>
                            <View style={styles.contentActions}>
                                <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                                    <Edit3 size={20} color="#2196F3" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                                    <Trash2 size={20} color="#f44336" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {note.checklistItems.map((item, idx) => (
                            <Text key={item.id} style={styles.checklistItem}>
                                {item.completed ? '✅' : '⬜️'} {item.text}
                            </Text>
                        ))}
                    </View>
                ) : note.type === 'timer' ? (
                    <View>
                        <View style={styles.contentHeader}>
                            <Text style={styles.label}>Minuteur</Text>
                            <View style={styles.contentActions}>
                                <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                                    <Edit3 size={20} color="#2196F3" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                                    <Trash2 size={20} color="#f44336" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.timerContainer}>
                            <Clock size={32} color="#E91E63" />
                            <Text style={styles.timerDuration}>
                                {note.timerDuration} minutes
                            </Text>
                            <Text style={styles.timerStatus}>
                                {note.isTimerActive ? 'Actif' : 'Inactif'}
                            </Text>
                            {note.content && (
                                <Text style={[styles.noteContent, getFontStyle(note.font || 'System')]}>{note.content}</Text>
                            )}
                        </View>
                    </View>
                ) : note.type === 'drawing' && note.drawingElements ? (
                    <View>
                        <View style={styles.contentHeader}>
                            <Text style={styles.label}>Dessin</Text>
                            <View style={styles.contentActions}>
                                <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                                    <Edit3 size={20} color="#2196F3" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                                    <Trash2 size={20} color="#f44336" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.drawingContainer}>
                            <Svg width={SCREEN_WIDTH - 64} height={300}>
                                <Rect
                                    width={SCREEN_WIDTH - 64}
                                    height={300}
                                    fill={note.backgroundColor}
                                    stroke="#ddd"
                                    strokeWidth={1}
                                />
                                {note.drawingElements.map(renderDrawingElement)}
                            </Svg>
                        </View>
                        {note.content && (
                            <Text style={[styles.noteContent, getFontStyle(note.font || 'System')]}>{note.content}</Text>
                        )}
                    </View>
                ) : note.type === 'voice' ? (
                    <View>
                        <View style={styles.contentHeader}>
                            <Text style={styles.label}>Mémo vocal</Text>
                            <View style={styles.contentActions}>
                                <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                                    <Edit3 size={20} color="#2196F3" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                                    <Trash2 size={20} color="#f44336" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.audioContainer}>
                            <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                                {isPlaying ? (
                                    <Pause size={32} color="#fff" />
                                ) : (
                                    <Play size={32} color="#fff" />
                                )}
                            </TouchableOpacity>
                            <View style={styles.audioInfo}>
                                <Text style={styles.audioTime}>
                                    {formatTime(position)} / {duration ? formatTime(duration) : '--:--'}
                                </Text>
                            </View>
                        </View>
                        {note.content && (
                            <Text style={[styles.noteContent, getFontStyle(note.font || 'System')]}>{note.content}</Text>
                        )}
                    </View>
                ) : (
                    <Text>Type de note non supporté.</Text>
                )}

                {note.images.length > 0 && (
                    <View style={styles.imagesContainer}>
                        <Text style={styles.label}>Images</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {note.images.map((imageUri, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        setSelectedImage(imageUri);
                                        setModalVisible(true);
                                    }}
                                >
                                    <Image source={{ uri: imageUri }} style={styles.image} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {category && (
                    <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
                        <Text style={styles.categoryText}>{category.name}</Text>
                    </View>
                )}

                {note.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        <Text style={styles.label}>Étiquettes</Text>
                        <View style={styles.tagsList}>
                            {note.tags.map((tag, index) => (
                                <Text key={index} style={styles.tag}>
                                    #{tag}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalBg} onPress={() => setModalVisible(false)}>
                    <Image source={{ uri: selectedImage! }} style={styles.fullImage} />
                    <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={() => setModalVisible(false)}
                    >
                        <X size={24} color="#fff" />
                    </TouchableOpacity>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 8,
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 30,
    },
    actionButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    noteInfo: {
        marginBottom: 16,
    },
    noteDate: {
        fontSize: 14,
        color: '#666',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 8,
        borderRadius: 8,
    },
    contentActions: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 4,
        borderRadius: 6,
    },
    noteContent: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        marginBottom: 16,
    },
    checklistItem: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        lineHeight: 24,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
    },
    timerDuration: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E91E63',
        marginTop: 12,
        marginBottom: 8,
    },
    timerStatus: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    drawingContainer: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
    },
    audioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
    },
    playButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    audioInfo: {
        flex: 1,
    },
    audioTime: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'monospace',
    },
    imagesContainer: {
        marginBottom: 16,
    },
    image: {
        width: 140,
        height: 140,
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        marginTop: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    tagsContainer: {
        marginTop: 16,
    },
    tagsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        fontSize: 14,
        color: '#2196F3',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.98)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: SCREEN_WIDTH * 0.98,
        height: SCREEN_HEIGHT * 0.8,
        borderRadius: 20,
        alignSelf: 'center',
        backgroundColor: '#000',
    },
    closeBtn: {
        position: 'absolute',
        top: 40,
        right: 24,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 4,
        zIndex: 10,
    },
}); 