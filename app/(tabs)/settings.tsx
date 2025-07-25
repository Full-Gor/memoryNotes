import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
  Animated,
  Easing,
} from 'react-native';
import { Settings as SettingsIcon, Shield, Bell, Palette, Download, Upload, Trash2, Info, CircleHelp as HelpCircle, Star, Share2, BarChart3, ArrowLeft } from 'lucide-react-native';
import { useNotes } from '@/contexts/NotesContext';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [autoBackup, setAutoBackup] = React.useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'stats'>('settings');
  const { notes, categories } = useNotes();

  // Animations pour les icônes des paramètres
  const settingAnimations = useRef<Animated.Value[]>([]);

  // Initialiser les animations
  useEffect(() => {
    // Nombre total d'éléments de paramètres (préférences + statistiques + données + support)
    const totalSettings = 3 + 1 + 3 + 4; // 11 éléments au total
    settingAnimations.current = Array(totalSettings).fill(null).map(() => new Animated.Value(0));
  }, []);

  // Déclencher l'animation au focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Settings screen focused - starting animations');
      
      // Réinitialiser les animations
      settingAnimations.current.forEach(anim => anim.setValue(0));
      
      // Animer chaque élément avec un délai
      const animations = settingAnimations.current.map((anim, index) => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          delay: index * 100, // Délai progressif pour chaque élément
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        })
      );
      
      Animated.parallel(animations).start(() => {
        console.log('Settings screen animations completed');
      });
    }, [])
  );

  const handleExportData = () => {
    Alert.alert('Info', 'Fonctionnalité d\'export bientôt disponible');
  };

  const handleImportData = () => {
    Alert.alert('Info', 'Fonctionnalité d\'import bientôt disponible');
  };

  const handleClearData = () => {
    Alert.alert(
      'Effacer toutes les données',
      'Cette action supprimera définitivement toutes vos notes, catégories et paramètres. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Fonctionnalité bientôt disponible');
          }
        },
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert('Info', 'Redirection vers le store bientôt disponible');
  };

  const handleShareApp = () => {
    Alert.alert('Info', 'Fonctionnalité de partage bientôt disponible');
  };

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    rightComponent,
    color = '#666',
    animationIndex = 0
  }: any) => {
    const animatedValue = settingAnimations.current[animationIndex] || new Animated.Value(0);
    
    const rotate = animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['0deg', '180deg', '360deg'],
    });
    
    const scale = animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1, 1],
    });
    
    const opacity = animatedValue.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.8, 1],
    });

    return (
      <Animated.View
        style={{
          opacity,
          transform: [
            { scale },
            { rotateX: rotate },
          ],
        }}
      >
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
              <Icon size={20} color={color} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{title}</Text>
              {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
          </View>
          {rightComponent}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paramètres</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>

          <SettingItem
            icon={Bell}
            title="Notifications"
            subtitle="Recevoir des rappels et alertes"
            color="#FF9800"
            animationIndex={0}
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#e0e0e0', true: '#FF9800' }}
                thumbColor={notifications ? '#fff' : '#f4f3f4'}
              />
            }
          />

          <SettingItem
            icon={Palette}
            title="Mode sombre"
            subtitle="Thème sombre pour l'interface"
            color="#9C27B0"
            animationIndex={1}
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#e0e0e0', true: '#9C27B0' }}
                thumbColor={darkMode ? '#fff' : '#f4f3f4'}
              />
            }
          />

          <SettingItem
            icon={Shield}
            title="Sauvegarde automatique"
            subtitle="Sauvegarder automatiquement vos notes"
            color="#4CAF50"
            animationIndex={2}
            rightComponent={
              <Switch
                value={autoBackup}
                onValueChange={setAutoBackup}
                trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
                thumbColor={autoBackup ? '#fff' : '#f4f3f4'}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>

          <SettingItem
            icon={BarChart3}
            title="Voir les statistiques détaillées"
            subtitle="Graphiques, tendances et analyses complètes"
            color="#2196F3"
            animationIndex={3}
            onPress={() => router.push('/stats')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données</Text>

          <SettingItem
            icon={Download}
            title="Exporter les données"
            subtitle="Sauvegarder vos notes localement"
            color="#2196F3"
            animationIndex={4}
            onPress={handleExportData}
          />

          <SettingItem
            icon={Upload}
            title="Importer les données"
            subtitle="Restaurer vos notes depuis une sauvegarde"
            color="#607D8B"
            animationIndex={5}
            onPress={handleImportData}
          />

          <SettingItem
            icon={Trash2}
            title="Effacer toutes les données"
            subtitle="Supprimer définitivement toutes les notes"
            color="#f44336"
            animationIndex={6}
            onPress={handleClearData}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <SettingItem
            icon={Star}
            title="Noter l'application"
            subtitle="Donnez votre avis sur le store"
            color="#FF9800"
            animationIndex={7}
            onPress={handleRateApp}
          />

          <SettingItem
            icon={Share2}
            title="Partager l'application"
            subtitle="Recommander à vos amis"
            color="#4CAF50"
            animationIndex={8}
            onPress={handleShareApp}
          />

          <SettingItem
            icon={HelpCircle}
            title="Aide et support"
            subtitle="FAQ et contact"
            color="#2196F3"
            animationIndex={9}
            onPress={() => Alert.alert('Info', 'Page d\'aide bientôt disponible')}
          />

          <SettingItem
            icon={Info}
            title="À propos"
            subtitle="Version 1.0.0"
            color="#666"
            animationIndex={10}
            onPress={() => Alert.alert(
              'À propos de Memory Notes',
              'Version 1.0.0\n\nArnaud est un développeur passionné qui intervient sur la création d\'applications web, web mobile et mobiles. Pour le développement web, il maîtrise HTML, CSS, PHP, Symfony, WordPress, React et TypeScript. Pour les applications mobiles et web mobiles, il utilise React Native et Expo afin de proposer des solutions performantes et multiplateformes. Il conçoit et gère des bases de données SQL et NoSQL adaptées aux besoins des projets. Arnaud intègre également des solutions no-code telles que Softr, Airtable, Zapier, Figma et WordPress afin d\'accélérer le développement et d\'offrir des alternatives agiles.\n\nDéveloppé avec React Native et Expo'
            )}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Memory Notes v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Créé avec ❤️ pour organiser vos idées
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    padding: 40,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },

});