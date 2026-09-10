# Moderniser les rendez-vous professionnels

## Objectif
Rendre le calendrier professionnel plus moderne et permettre de retrouver immédiatement les rendez-vous du jour et ceux à clôturer.

## Changements
- Moderniser l’en-tête et la barre de commandes du planning avec une hiérarchie plus claire et des contrôles compacts.
- Ajouter deux filtres rapides avec compteurs : **Aujourd’hui** et **À clôturer**, plus une vue **Tous**.
- Afficher une liste latérale priorisée des rendez-vous correspondant au filtre actif, avec heure, patient, motif, lieu et statut.
- Synchroniser les filtres avec le calendrier : le filtre Aujourd’hui positionne le calendrier sur la date du jour et la sélection d’un rendez-vous ouvre sa fiche.
- Ajouter un état métier de démonstration « À clôturer » aux rendez-vous concernés, sans modifier la persistance ni les API.
- Corriger le lien « Mon planning » dans le menu professionnel pour ouvrir la bonne page.

## Vérification
- Tester les filtres Tous, Aujourd’hui et À clôturer.
- Vérifier les vues semaine, mois et liste, l’ouverture d’un rendez-vous et l’affichage mobile.
- Contrôler l’absence d’erreurs dans la prévisualisation.

## Détails techniques
- Conserver FullCalendar v7 et le chargement compatible avec le rendu serveur.
- Étendre le modèle de démonstration des événements avec un statut optionnel.
- Utiliser les composants et couleurs existants du design FUENI.
