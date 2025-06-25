# Guide des tests

## Lancer les tests

- **Tous les tests** :
  ```bash
  npm test
  ```
- **Mode interactif (watch)** :
  ```bash
  npm run test:watch
  ```
- **Couverture de code** :
  ```bash
  npm run test:coverage
  ```
- **Tests unitaires uniquement** :
  ```bash
  npm run test:unit
  ```
- **Tests d'intégration uniquement** :
  ```bash
  npm run test:integration
  ```

## Organisation des fichiers de tests

- Tous les tests sont dans le dossier `tests/` à la racine du projet.
- **tests/unit/** : tests unitaires (un fichier par composant, service ou fonction clé)
- **tests/integration/** : tests d'intégration (navigation, interactions utilisateur, scénarios multi-composants)
- **tests/__mocks__/** : mocks pour les assets et styles
- Les fichiers de test doivent suivre la convention :
  - `NomDuComposant.test.js` pour les composants
  - `nomService.test.js` pour les services
  - `nomFonction.test.js` pour les fonctions utilitaires

## Structure d'un fichier de test

- Utilisez `describe()` pour regrouper les tests par fonctionnalité ou composant
- Utilisez `it()` ou `test()` pour chaque cas de test précis
- Utilisez des mocks pour isoler les dépendances externes (API, AsyncStorage, etc.)
- Vérifiez l'accessibilité et la robustesse (cas limites, erreurs)

## Bonnes pratiques

- Couvrez chaque composant, service et fonction critique
- Ajoutez un test pour chaque bug corrigé ou fonctionnalité ajoutée
- Gardez les tests lisibles, structurés et rapides
- Utilisez la couverture de code pour identifier les parties non testées

## Dépendances principales

- [Jest](https://jestjs.io/)
- [@testing-library/react-native](https://testing-library.com/docs/react-native-testing-library/intro/)
- [@testing-library/jest-native](https://github.com/testing-library/jest-native)
- [jest-expo](https://docs.expo.dev/guides/testing-with-jest/)

---

Pour toute nouvelle fonctionnalité, créez un test unitaire ET, si pertinent, un test d'intégration. 