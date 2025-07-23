import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNotes } from '@/contexts/NotesContext';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const PERIODS = [
    { key: 'day', label: 'Jour' },
    { key: 'week', label: 'Semaine' },
    { key: 'month', label: 'Mois' },
];

function groupNotesByPeriod(notes, period) {
    const groups = {};
    const now = new Date();

    notes.forEach(note => {
        try {
            const date = new Date(note.createdAt);
            let key;

            if (period === 'day') {
                // Grouper par jour (derniers 7 jours)
                const diffTime = Math.abs(now - date);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 7) {
                    key = date.toISOString().split('T')[0]; // yyyy-MM-dd
                }
            } else if (period === 'week') {
                // Grouper par semaine (dernières 4 semaines)
                const diffTime = Math.abs(now - date);
                const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
                if (diffWeeks <= 4) {
                    const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
                    key = `Semaine ${weekNumber}`;
                }
            } else {
                // Grouper par mois (derniers 6 mois)
                const diffTime = Math.abs(now - date);
                const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
                if (diffMonths <= 6) {
                    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
                    key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                }
            }

            if (key) {
                if (!groups[key]) groups[key] = [];
                groups[key].push(note);
            }
        } catch (error) {
            console.error('Error processing note date:', error);
        }
    });
    return groups;
}

function SimpleBarChart({ data, maxValue }) {
    if (!data || data.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aucune donnée disponible</Text>
            </View>
        );
    }

    return (
        <View style={styles.chartContainer}>
            {data.map((item, index) => (
                <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                        <View
                            style={[
                                styles.bar,
                                {
                                    height: maxValue > 0 ? Math.max((item.y / maxValue) * 150, 10) : 10,
                                    backgroundColor: '#2196F3'
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.barLabel}>{item.x}</Text>
                    <Text style={styles.barValue}>{item.y}</Text>
                </View>
            ))}
        </View>
    );
}

export default function StatsScreen() {
    const router = useRouter();
    const { notes } = useNotes();
    const [period, setPeriod] = useState('day');

    // Regrouper les notes par période
    const grouped = useMemo(() => {
        try {
            return groupNotesByPeriod(notes || [], period);
        } catch (error) {
            console.error('Error grouping notes:', error);
            return {};
        }
    }, [notes, period]);

    const chartData = useMemo(() => {
        try {
            const data = Object.entries(grouped).map(([key, notes]) => ({
                x: key,
                y: notes.length,
                chars: notes.reduce((acc, n) => acc + (n.content?.length || 0), 0),
            }));
            return data.sort((a, b) => a.x.localeCompare(b.x));
        } catch (error) {
            console.error('Error creating chart data:', error);
            return [];
        }
    }, [grouped]);

    // Calculer les totaux pour la période sélectionnée
    const periodTotals = useMemo(() => {
        const totalNotes = chartData.reduce((acc, d) => acc + d.y, 0);
        const totalChars = chartData.reduce((acc, d) => acc + d.chars, 0);
        return { totalNotes, totalChars };
    }, [chartData]);

    const maxValue = Math.max(...chartData.map(d => d.y), 1);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Statistiques</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.periodSelector}>
                    {PERIODS.map(p => (
                        <TouchableOpacity
                            key={p.key}
                            style={[styles.periodButton, period === p.key && styles.periodButtonActive]}
                            onPress={() => setPeriod(p.key)}
                        >
                            <Text style={[styles.periodButtonText, period === p.key && styles.periodButtonTextActive]}>
                                {p.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Notes ({period === 'day' ? '7 derniers jours' : period === 'week' ? '4 dernières semaines' : '6 derniers mois'})</Text>
                        <Text style={styles.summaryValue}>{periodTotals.totalNotes}</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Caractères ({period === 'day' ? '7 derniers jours' : period === 'week' ? '4 dernières semaines' : '6 derniers mois'})</Text>
                        <Text style={styles.summaryValue}>{periodTotals.totalChars}</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Minuteurs</Text>
                        <Text style={styles.summaryValue}>{notes.filter(note => note.type === 'timer').length}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Notes par {period === 'day' ? 'jour' : period === 'week' ? 'semaine' : 'mois'}</Text>

                <SimpleBarChart data={chartData} maxValue={maxValue} />

                <Text style={styles.sectionTitle}>Détail par période</Text>
                {chartData.map(d => (
                    <View key={d.x} style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{d.x}</Text>
                        <View style={styles.detailValues}>
                            <Text style={styles.detailValue}>{d.y} notes</Text>
                            <Text style={styles.detailValue}>{d.chars} caractères</Text>
                        </View>
                    </View>
                ))}

                <Text style={styles.sectionTitle}>Détail par note</Text>
                {Object.entries(grouped).flatMap(([periodKey, periodNotes]) =>
                    periodNotes.map((note, index) => (
                        <View key={`${periodKey}-${index}`} style={styles.noteDetailRow}>
                            <View style={styles.noteInfo}>
                                <Text style={styles.noteTitle} numberOfLines={1}>
                                    {note.title || 'Sans titre'}
                                </Text>
                                <Text style={styles.notePeriod}>{periodKey}</Text>
                            </View>
                            <View style={styles.noteStats}>
                                {note.type === 'timer' ? (
                                    <Text style={styles.noteChars}>{note.timerDuration} min</Text>
                                ) : (
                                    <Text style={styles.noteChars}>{note.content?.length || 0} caractères</Text>
                                )}
                                <Text style={styles.noteDate}>
                                    {new Date(note.createdAt).toLocaleDateString('fr-FR')}
                                </Text>
                            </View>
                        </View>
                    ))
                )}

                <Text style={styles.sectionTitle}>Minuteurs</Text>
                {notes.filter(note => note.type === 'timer').map((timer, index) => (
                    <View key={timer.id} style={styles.noteDetailRow}>
                        <View style={styles.noteInfo}>
                            <Text style={styles.noteTitle} numberOfLines={1}>
                                {timer.title || 'Minuteur sans titre'}
                            </Text>
                            <Text style={styles.notePeriod}>
                                {timer.isTimerActive ? 'Actif' : 'Inactif'}
                            </Text>
                        </View>
                        <View style={styles.noteStats}>
                            <Text style={styles.noteChars}>{timer.timerDuration} minutes</Text>
                            <Text style={styles.noteDate}>
                                {new Date(timer.createdAt).toLocaleDateString('fr-FR')}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    scroll: { padding: 20 },
    periodSelector: { flexDirection: 'row', marginBottom: 16, justifyContent: 'center' },
    periodButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eee', marginHorizontal: 4 },
    periodButtonActive: { backgroundColor: '#2196F3' },
    periodButtonText: { color: '#666', fontWeight: '600' },
    periodButtonTextActive: { color: '#fff' },
    summaryContainer: { flexDirection: 'row', marginBottom: 24, justifyContent: 'space-between' },
    summaryCard: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12, marginHorizontal: 4, alignItems: 'center' },
    summaryLabel: { fontSize: 10, color: '#666', marginBottom: 4, textAlign: 'center' },
    summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#2196F3' },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 12, color: '#2196F3' },
    chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 200, marginBottom: 24, paddingHorizontal: 10 },
    barContainer: { alignItems: 'center', flex: 1 },
    barWrapper: { height: 150, justifyContent: 'flex-end', marginBottom: 8 },
    bar: { width: 20, borderRadius: 2 },
    barLabel: { fontSize: 10, color: '#666', textAlign: 'center' },
    barValue: { fontSize: 12, fontWeight: '600', color: '#2196F3', marginTop: 4 },
    emptyState: { height: 200, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#999', fontSize: 16 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
    detailLabel: { fontSize: 14, color: '#666', flex: 1 },
    detailValues: { alignItems: 'flex-end' },
    detailValue: { fontSize: 12, color: '#2196F3', marginLeft: 8 },
    noteDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    noteInfo: { flex: 1 },
    noteTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
    notePeriod: { fontSize: 12, color: '#999' },
    noteStats: { alignItems: 'flex-end' },
    noteChars: { fontSize: 12, color: '#2196F3', fontWeight: '600' },
    noteDate: { fontSize: 11, color: '#999', marginTop: 2 },
}); 