# Log dashboard

## Besoin

Développer une interface web qui aide un technicien à comprendre rapidement les événements d’un système, sans devoir lire le JSON brut.

## Lancer le projet

Prérequis : Node.js compatible avec la version de Nuxt du projet et npm.

1. Décompresser l’archive Git et ouvrir un terminal à la racine du projet.
2. Installer les dépendances et démarrer l’application :

```bash
npm ci
npm run dev
```

Ouvrir <http://localhost:3000>. Par défaut, l’application se connecte à `https://technical-exercise.dyneo.io`. Aucun fichier `.env` ni clé n’est nécessaire. Un jeu de données fixe local peut être utilisé en activant `USE_SAMPLE_LOGS` dans `app/utils/dashboard-config.ts`. Pour vérifier la compilation de production et lancer les tests unitaires :

```bash
npm run build
npm test
```

## Fonctionnement

Le dashboard affiche un tableau de logs au démarrage. On peut en ajouter un nouveau, les renommer et les supprimer. 

Chaque tableau a ses propres filtres par niveau, service et utilisateur, sa recherche et sa pagination. Cliquer sur une alerte ou sur un niveau, un service ou un utilisateur dans une ligne permet de créer un tableau ciblé. Chaque ligne du tableau présente l’heure, le niveau, le message et le service. Son détail donne accès aux métadonnées et au JSON complet.

Les alertes en haut de la page comptent les logs `critical`, `error`, `warning` et `debug` conservés. Elles mettent en évidence les niveaux qui demandent le plus d’attention.

Pour éviter que les lignes ne défilent trop vite:
- le bouton Pause fige les tableaux tout en laissant la réception continuer
- le rafraîchissement par lot, toutes les secondes, limite aussi les mises à jour visibles.

La connexion SSE démarre automatiquement et peut être fermée manuellement. En cas de coupure, useEventSource tente de la rétablir automatiquement.

## Choix techniques

- **Nuxt plutôt que Vue avec Vite** : Vite aurait suffi pour cet exercice mais j’ai choisi Nuxt pour avoir un cadre déjà organisé (conventions de pages, auto-imports, composants et composables) et par choix personnel: approfondir cette technologie / découvrir le framework.
- **Zod** : utilisé pour valider les logs reçus -> les événements viennent d’une API donc TypeScript ne peut pas garantir qu’ils ont la bonne structure à l’exécution. Je vérifie chaque log avec un schéma Zod avant de l’ajouter au tableau. Les événements invalides sont ignorés et comptabilisés. Cette validation stricte signifie qu’il faudra adapter le schéma si le format de l’API évolue.
- **Nuxt UI, Tailwind et TanStack Vue Table** : m’ont aussi permis de construire plus rapidement les tableaux, les boutons... la mise en page.
- **SSE avec VueUse** : l’interface reçoit les logs sans envoyer de messages au serveur. `useEventSource` simplifie l’utilisation d’EventSource et les tentatives de reconnexion. WebSocket aurait apporté une communication bidirectionnelle inutile ici.
- **Connexion directe à l’API** : aucun backend intermédiaire n’a été implémenté. Le flux utilise `tail=50` pour récupérer les 50 logs les plus récents à l’ouverture du dashboard, puis suivre les nouveaux en direct. Cela apporte un peu de contexte si le système a démarré avant l’interface, sans fournir un historique complet.

## Architecture

- `app/pages/index.vue` assemble le dashboard, choisit la source de données et relie les événements des composants (composables).
- `app/components/` contient l’interface: les composants du dashboard. `TablePanel` représente une carte de tableau et inclut `Table`, qui gère les lignes, filtres, détails et pagination.
- `app/composables/` regroupe la logique réactive : réception et validation du flux, état de pause et alertes, gestion des tableaux/panels et filtres.
     `useEventStream.ts` reçoit et valide les logs SSE
     `useSampleData.ts` charge les données d’exemple
     `useDashboardState.ts` gère la pause, le rafraîchissement et les alertes
     `useTablePanels.ts` gère les tableaux
     `useTableFilters.ts` gère leurs filtres
- `app/utils/` regroupe le schéma et le type des logs, les configurations, les formats d’affichage et les fonctions de création/rétention.

Une seule connexion alimente une liste de logs partagée par tous les tableaux. Les filtres et la pagination restent propres à chaque tableau. Cette organisation évite de dupliquer la réception et la logique d’affichage.

## Volume et limites

Les logs sont conservés trois minutes, dans la limite de 2 000 entrées. 
Chaque tableau filtre cette liste puis limite les résultats affichables aux 100 plus récents. 
La pagination borne le nombre de lignes rendues simultanément. 
Les tailles de page et ces seuils sont configurables dans `app/utils/dashboard-config.ts`.

Ces limites bornent le coût mémoire et le travail d’affichage, mais l’interface ne fournit pas d’historique durable et ne permet pas de parcourir les résultats au-delà des 100 affichés. Un événement invalide ou avec un niveau inconnu est rejeté et comptabilisé. L’application observe l’état du flux SSE, sans interroger séparément `/health`.

## Quelques améliorations possibles

- Ajouter des tests pour les filtres, la déduplication, les états de reconnexion...
- Préserver les tableaux et filtres dans le navigateur pour les retrouver après rechargement: ajouter une Authentification
- Mieux tolérer l’évolution de l’API: schema Log fixe.
- Mesurer le volume réel et ajuster la durée de rétention, les limites d’affichage et l’intervalle de rafraîchissement.
- Afficher plus de graphique pour une analyse plus approfondie des logs: suivre dans le temps, voir si une 'error' ou 'critical' arrive toujours au même moment...
- Filtrer les tableau avec plusieurs niveaux, plusieurs services... en même temps.