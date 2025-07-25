import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Alert, ScrollView, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useNotes } from '@/contexts/NotesContext';
import { Camera, Image as ImageIcon, Save, ArrowLeft, X } from 'lucide-react-native';

export default function PhotoEditorScreen() {
    const router = useRouter();
    const { addNote, categories } = useNotes();
    const [images, setImages] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');

    const pickImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            allowsEditing: false,
            quality: 1,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImages([...images, ...result.assets.map(asset => asset.uri)]);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la caméra.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const removeImage = (uri: string) => {
        setImages(images.filter(img => img !== uri));
    };

    const handleSave = () => {
        if (images.length === 0) {
            Alert.alert('Erreur', 'Aucune image sélectionnée.');
            return;
        }
        addNote({
            title: 'Photos',
            content: description,
            type: 'text',
            category: selectedCategory,
            tags: [],
            backgroundColor: '#fff',
            images,
            isLocked: false,
        });
        Alert.alert('Succès', 'Photos sauvegardées !', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={28} color="#2196F3" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajouter des photos</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                        <Camera size={32} color="#fff" />
                        <Text style={styles.buttonText}>Prendre une photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={pickImages}>
                        <ImageIcon size={32} color="#fff" />
                        <Text style={styles.buttonText}>Choisir dans la galerie</Text>
                    </TouchableOpacity>
                </View>
                {images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
                        {images.map((uri, idx) => (
                            <View key={uri} style={styles.previewContainer}>
                                <Image source={{ uri }} style={styles.preview} />
                                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(uri)}>
                                    <X size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
                {images.length > 0 && (
                    <TextInput
                        style={styles.input}
                        placeholder="Ajouter une description ou un commentaire..."
                        placeholderTextColor="#aaa"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                )}
                {images.length > 0 && (
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
    backButton: {
        padding: 8,
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
        color: '#2196F3',
        marginTop: 25,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 16,
    },
    actionButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 4,
        fontSize: 14,
    },
    previewRow: {
        flexDirection: 'row',
        marginVertical: 24,
        maxHeight: 120,
    },
    previewContainer: {
        position: 'relative',
        marginRight: 12,
    },
    preview: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    removeBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#f44336',
        borderRadius: 12,
        padding: 2,
    },
    input: {
        width: '100%',
        minHeight: 48,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#333',
        marginBottom: 16,
        backgroundColor: '#fafafa',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
}); 