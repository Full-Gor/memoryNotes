import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Calendar, Clock, Repeat, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ReminderPickerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (date: Date, repeat: 'none' | 'daily' | 'weekly' | 'monthly') => void;
  initialDate?: Date;
  initialRepeat?: 'none' | 'daily' | 'weekly' | 'monthly';
}

const QUICK_REMINDERS = [
  { label: 'Dans 15 minutes', minutes: 15 },
  { label: 'Dans 30 minutes', minutes: 30 },
  { label: 'Dans 1 heure', minutes: 60 },
  { label: 'Dans 2 heures', minutes: 120 },
  { label: 'Demain à 9h', hours: 9, days: 1 },
  { label: 'Ce soir à 20h', hours: 20 },
];

const REPEAT_OPTIONS = [
  { label: 'Une seule fois', value: 'none' as const },
  { label: 'Tous les jours', value: 'daily' as const },
  { label: 'Toutes les semaines', value: 'weekly' as const },
  { label: 'Tous les mois', value: 'monthly' as const },
];

export default function ReminderPicker({
  visible,
  onClose,
  onSave,
  initialDate,
  initialRepeat = 'none',
}: ReminderPickerProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [selectedRepeat, setSelectedRepeat] = useState(initialRepeat);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleQuickReminder = (reminder: any) => {
    const newDate = new Date();
    if (reminder.minutes) {
      newDate.setMinutes(newDate.getMinutes() + reminder.minutes);
    } else if (reminder.hours) {
      newDate.setHours(reminder.hours, 0, 0, 0);
      if (reminder.days) {
        newDate.setDate(newDate.getDate() + reminder.days);
      }
    }
    setSelectedDate(newDate);
  };

  const handleSave = () => {
    if (selectedDate <= new Date()) {
      Alert.alert('Erreur', 'La date du rappel doit être dans le futur');
      return;
    }
    onSave(selectedDate, selectedRepeat);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Définir un rappel</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Rappels rapides */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rappels rapides</Text>
            <View style={styles.quickReminders}>
              {QUICK_REMINDERS.map((reminder, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickReminderButton}
                  onPress={() => handleQuickReminder(reminder)}
                >
                  <Text style={styles.quickReminderText}>{reminder.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date et heure personnalisées */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date et heure personnalisées</Text>
            
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#2196F3" />
              <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={20} color="#2196F3" />
              <Text style={styles.dateTimeText}>{formatTime(selectedDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* Répétition */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Répétition</Text>
            <View style={styles.repeatOptions}>
              {REPEAT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.repeatOption,
                    selectedRepeat === option.value && styles.repeatOptionActive,
                  ]}
                  onPress={() => setSelectedRepeat(option.value)}
                >
                  <Repeat size={16} color={selectedRepeat === option.value ? '#fff' : '#666'} />
                  <Text
                    style={[
                      styles.repeatOptionText,
                      selectedRepeat === option.value && styles.repeatOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
            minimumDate={new Date()}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display="default"
            onChange={(event, date) => {
              setShowTimePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickReminders: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickReminderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  quickReminderText: {
    fontSize: 14,
    color: '#666',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  repeatOptions: {
    gap: 8,
  },
  repeatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  repeatOptionActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  repeatOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  repeatOptionTextActive: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
}); 