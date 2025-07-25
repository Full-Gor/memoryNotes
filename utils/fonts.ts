// Liste des polices disponibles
export const FONTS = [
  { name: 'Par défaut', value: 'System' },
  { name: 'Élégante', value: 'serif' },
  { name: 'Moderne', value: 'monospace' },
  { name: 'Créative', value: 'cursive' },
  { name: 'Fantaisie', value: 'fantasy' },
  { name: 'Ballet', value: 'Ballet' },
  { name: 'Fleur De Leah', value: 'FleurDeLeah' },
  { name: 'Kapakana', value: 'Kapakana' },
  { name: 'Monsieur La Doulaise', value: 'MonsieurLaDoulaise' },
  { name: 'Playwrite MX Guides', value: 'PlaywriteMXGuides' },
  { name: 'Unifraktur Maguntia', value: 'UnifrakturMaguntia' },
];

// Fonction pour obtenir le style de police
export const getFontStyle = (fontName: string) => {
    if (fontName === 'System') {
        return {};
    }

      // Pour les polices Google Fonts, on utilise des polices système similaires
  const fontMapping: { [key: string]: string } = {
    'Ballet': 'cursive',
    'FleurDeLeah': 'serif',
    'Kapakana': 'monospace',
    'MonsieurLaDoulaise': 'serif',
    'PlaywriteMXGuides': 'monospace',
    'UnifrakturMaguntia': 'serif',
  };

    const mappedFont = fontMapping[fontName] || fontName;
    return { fontFamily: mappedFont };
}; 