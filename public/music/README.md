# 🎵 Dossier Musique - Beat Saber

## Instructions

Placez vos fichiers de musique dans ce dossier pour les utiliser dans le jeu.

### Fichiers requis

Le jeu s'attend à trouver ces fichiers :

1. **song1.mp3** - Première musique
2. **song2.mp3** - Deuxième musique
3. **song3.mp3** - Troisième musique

### Format recommandé

- **Format** : MP3 (recommandé) ou OGG
- **Bitrate** : 128-320 kbps
- **Durée** : 2-5 minutes recommandé
- **Genre** : Musiques rythmées (EDM, Rock, etc.) pour une meilleure expérience

### Fonctionnement

Le jeu va automatiquement :

1. ✅ **Charger** votre musique
2. 🎯 **Analyser** le BPM (tempo) de la musique
3. 🎵 **Détecter** les beats (temps forts)
4. 🎮 **Générer** des cubes synchronisés avec les beats détectés

### Résolution de problèmes

Si la musique ne se charge pas :

- Vérifiez que les fichiers sont bien nommés `song1.mp3`, `song2.mp3`, `song3.mp3`
- Vérifiez que les fichiers sont bien dans `public/music/`
- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Assurez-vous que le serveur de développement a redémarré après l'ajout des fichiers

### Personnalisation

Pour modifier les informations affichées (nom, artiste), éditez le fichier :
`src/AudioManager.js` dans la section `musicLibrary`

```javascript
this.musicLibrary = [
    {
        id: 'music1',
        name: 'Nom de votre musique',  // ← Modifiez ici
        file: 'music/song1.mp3',
        artist: 'Nom de l\'artiste',    // ← Modifiez ici
        bpm: 120
    },
    // ...
];
```

### Exemple de musiques recommandées

Pour tester le jeu, vous pouvez utiliser des musiques libres de droits comme :

- Musiques EDM énergiques (120-140 BPM)
- Rock instrumental
- Synthwave
- Drum & Bass

**⚠️ Important** : Assurez-vous d'avoir les droits d'utilisation des musiques que vous ajoutez !

### Crédits

N'oubliez pas de créditer les artistes si vous partagez votre version du jeu !
