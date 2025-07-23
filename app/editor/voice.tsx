import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useNotes } from '@/contexts/NotesContext';
import { Mic, StopCircle, Save, ArrowLeft } from 'lucide-react-native';

export default function VoiceEditorScreen() {
    const router = useRouter();
    const { addNote, categories } = useNotes();
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
    const recordingRef = useRef<Audio.Recording | null>(null);

    const startRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès au micro.');
                return;
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const rec = new Audio.Recording();
            await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            await rec.startAsync();
            setRecording(rec);
            recordingRef.current = rec;
            setIsRecording(true);
        } catch (err) {
            Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement.');
        }
    };

    const stopRecording = async () => {
        try {
            if (!recordingRef.current) return;
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            setAudioUri(uri || null);
            setIsRecording(false);
            setRecording(null);
            recordingRef.current = null;
        } catch (err) {
            Alert.alert('Erreur', 'Impossible d\'arrêter l\'enregistrement.');
        }
    };

    const handleSave = () => {
        if (!audioUri) {
            Alert.alert('Erreur', 'Aucun mémo vocal enregistré.');
            return;
        }
        addNote({
            title: 'Mémo vocal',
            content: '',
            type: 'voice',
            category: selectedCategory,
            tags: [],
            backgroundColor: '#fff',
            images: [],
            isLocked: false,
            audioPath: audioUri,
        });
        Alert.alert('Succès', 'Mémo vocal sauvegardé !', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={28} color="#2196F3" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mémo vocal</Text>
            </View>
            <View style={styles.content}>
                <TouchableOpacity
                    style={[styles.recordButton, isRecording && styles.recording]}
                    onPress={isRecording ? stopRecording : startRecording}
                >
                    {isRecording ? (
                        <StopCircle size={48} color="#f44336" />
                    ) : (
                        <Mic size={48} color="#2196F3" />
                    )}
                </TouchableOpacity>
                <Text style={styles.statusText}>
                    {isRecording ? 'Enregistrement en cours...' : audioUri ? 'Mémo enregistré !' : 'Appuyez pour enregistrer'}
                </Text>
                {audioUri && (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Save size={24} color="#fff" />
                        <Text style={styles.saveButtonText}>Sauvegarder</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
        color: '#2196F3',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    recording: {
        backgroundColor: '#ffebee',
    },
    statusText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2196F3',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
}); 