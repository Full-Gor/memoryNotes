export interface Template {
    id: string;
    name: string;
    title: string;
    content: string;
    backgroundColor: string;
    font: string;
    tags: string[];
    description: string;
}

export const TEMPLATES: Template[] = [
    {
        id: 'blank',
        name: 'Vierge',
        title: '',
        content: '',
        backgroundColor: '#fff',
        font: 'System',
        tags: [],
        description: 'Note vierge pour commencer à zéro'
    },
    {
        id: 'meeting',
        name: 'Réunion',
        title: 'Réunion - [Date]',
        content: `📅 Date: [Date]
⏰ Heure: [Heure]
📍 Lieu: [Lieu]
👥 Participants: [Liste des participants]

📋 Ordre du jour:
1. [Point 1]
2. [Point 2]
3. [Point 3]

✅ Actions à suivre:
- [ ] [Action 1] - Responsable: [Nom] - Date limite: [Date]
- [ ] [Action 2] - Responsable: [Nom] - Date limite: [Date]

📝 Notes:
[Notes importantes de la réunion]

🔄 Prochaine réunion: [Date]`,
        backgroundColor: '#e3f2fd',
        font: 'System',
        tags: ['réunion', 'travail', 'planning'],
        description: 'Modèle pour organiser vos réunions'
    },
    {
        id: 'todo',
        name: 'Liste de tâches',
        title: 'Mes tâches',
        content: `📋 LISTE DE TÂCHES

🔥 PRIORITÉ HAUTE:
- [ ] [Tâche urgente 1]
- [ ] [Tâche urgente 2]

📌 PRIORITÉ MOYENNE:
- [ ] [Tâche importante 1]
- [ ] [Tâche importante 2]

📝 À FAIRE:
- [ ] [Tâche normale 1]
- [ ] [Tâche normale 2]

✅ TERMINÉ:
- [x] [Tâche complétée 1]`,
        backgroundColor: '#f3e5f5',
        font: 'System',
        tags: ['tâches', 'productivité', 'organisation'],
        description: 'Modèle pour organiser vos tâches quotidiennes'
    },
    {
        id: 'journal',
        name: 'Journal',
        title: 'Journal - [Date]',
        content: `📖 JOURNAL PERSONNEL
📅 [Date]

🌅 Ce matin:
[Comment s'est passée votre matinée?]

🌞 Cette journée:
[Événements marquants de la journée]

🌙 Ce soir:
[Reflexions de fin de journée]

💭 Mes pensées:
[Vos réflexions personnelles]

🎯 Objectifs pour demain:
- [Objectif 1]
- [Objectif 2]

🙏 Gratitude:
[3 choses pour lesquelles vous êtes reconnaissant]`,
        backgroundColor: '#fff3e0',
        font: 'Créative',
        tags: ['journal', 'personnel', 'réflexion'],
        description: 'Modèle pour votre journal personnel quotidien'
    },
    {
        id: 'recipe',
        name: 'Recette',
        title: '[Nom de la recette]',
        content: `🍳 [NOM DE LA RECETTE]

⏱️ Temps de préparation: [X] minutes
⏰ Temps de cuisson: [X] minutes
👥 Portions: [X] personnes
⭐ Difficulté: [Facile/Moyen/Difficile]

📋 INGRÉDIENTS:
• [Ingrédient 1] - [Quantité]
• [Ingrédient 2] - [Quantité]
• [Ingrédient 3] - [Quantité]

👨‍🍳 PRÉPARATION:
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

💡 ASTUCES:
[Conseils et astuces pour réussir la recette]

📝 NOTES:
[Variations, substitutions, etc.]`,
        backgroundColor: '#e8f5e8',
        font: 'Moderne',
        tags: ['recette', 'cuisine', 'gastronomie'],
        description: 'Modèle pour vos recettes de cuisine'
    },
    {
        id: 'project',
        name: 'Projet',
        title: '[Nom du projet]',
        content: `🚀 PROJET: [NOM DU PROJET]

📅 Date de début: [Date]
📅 Date de fin prévue: [Date]
👤 Chef de projet: [Nom]

🎯 OBJECTIFS:
• [Objectif principal 1]
• [Objectif principal 2]

📋 TÂCHES:
Phase 1 - Planification:
- [ ] [Tâche 1]
- [ ] [Tâche 2]

Phase 2 - Développement:
- [ ] [Tâche 3]
- [ ] [Tâche 4]

Phase 3 - Finalisation:
- [ ] [Tâche 5]
- [ ] [Tâche 6]

💰 BUDGET:
Budget prévu: [Montant]
Budget réel: [Montant]

📝 NOTES:
[Informations importantes sur le projet]`,
        backgroundColor: '#fce4ec',
        font: 'Élégante',
        tags: ['projet', 'travail', 'planification'],
        description: 'Modèle pour gérer vos projets'
    },
    {
        id: 'travel',
        name: 'Voyage',
        title: 'Voyage à [Destination]',
        content: `✈️ VOYAGE À [DESTINATION]
📅 Du [Date] au [Date]

🏨 HÉBERGEMENT:
Hôtel: [Nom de l'hôtel]
Adresse: [Adresse]
Téléphone: [Numéro]
Réservation: [Numéro de confirmation]

🚗 TRANSPORT:
Aller: [Détails du transport aller]
Retour: [Détails du transport retour]

🗺️ ITINÉRAIRE:
Jour 1 - [Date]:
• [Activité 1]
• [Activité 2]

Jour 2 - [Date]:
• [Activité 1]
• [Activité 2]

🍽️ RESTAURANTS:
• [Restaurant 1] - [Adresse]
• [Restaurant 2] - [Adresse]

📱 CONTACTS UTILES:
• [Contact 1] - [Numéro]
• [Contact 2] - [Numéro]

💡 À NE PAS OUBLIER:
- [ ] [Objet 1]
- [ ] [Objet 2]`,
        backgroundColor: '#e0f2f1',
        font: 'Ballet',
        tags: ['voyage', 'vacances', 'planification'],
        description: 'Modèle pour organiser vos voyages'
    },
    {
        id: 'study',
        name: 'Études',
        title: '[Matière] - [Sujet]',
        content: `📚 [MATIÈRE] - [SUJET]
📅 Date: [Date]

🎯 OBJECTIFS D'APPRENTISSAGE:
• [Objectif 1]
• [Objectif 2]

📖 CONCEPTS CLÉS:
1. [Concept 1]: [Définition/Explication]
2. [Concept 2]: [Définition/Explication]

📝 NOTES IMPORTANTES:
[Notes prises pendant le cours/la lecture]

❓ QUESTIONS:
• [Question 1]
• [Question 2]

🔗 RESSOURCES:
• [Ressource 1] - [Lien/Description]
• [Ressource 2] - [Lien/Description]

📋 DEVOIRS:
- [ ] [Devoir 1] - Date limite: [Date]
- [ ] [Devoir 2] - Date limite: [Date]

💡 RÉVISION:
[Points à réviser pour l'examen]`,
        backgroundColor: '#fff8e1',
        font: 'Kapakana',
        tags: ['études', 'éducation', 'apprentissage'],
        description: 'Modèle pour vos notes d\'études'
    }
];

// Fonction pour obtenir un modèle par ID
export const getTemplateById = (id: string): Template | undefined => {
    return TEMPLATES.find(template => template.id === id);
};

// Fonction pour appliquer un modèle
export const applyTemplate = (template: Template) => {
    return {
        title: template.title,
        content: template.content,
        backgroundColor: template.backgroundColor,
        font: template.font,
        tags: [...template.tags],
    };
}; 