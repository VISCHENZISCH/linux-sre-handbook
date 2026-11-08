# Bastion

Handbook d'administration système Linux, SRE, DevOps et (bientôt) SOC.

## Contenu

| Page | Sujet |
| --- | --- |
| `index.html` | Introduction, types de serveurs, principes SRE |
| `diagnostic.html` | Revue pratique : caractériser un serveur, ressources, logs |
| `admin.html` | Sécurité, paquets, systemd, réseau, stockage, monitoring |
| `maintenance.html` | Maintenance planifiée, gestion technique, sauvegarde et PRA/PCA |
| `architecture.html` | Conteneurs, haute disponibilité, IaC, cloud |
| `performance.html` | Performance, tuning et dépannage avancé |
| `pratiques.html` | SRE, GitOps, DevSecOps, Platform Engineering, FinOps, observabilité |
| `kubernetes.html` | Commandes kubectl, manifests YAML, Kubernetes vs Docker |
| `reference.html` | Questions d'entretien et feuille de route |
| `ressources.html` | Ressources d'apprentissage et labs pratiques |

## Lancer en local

Site statique, sans build :

```bash
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000.

## Structure

- `css/` : `variables.css` (tokens, thèmes clair/sombre), `base.css`, `layout.css`, `components.css`
- `js/script.js` : thème, menu mobile, scrollspy, bouton copier
- `img/` : illustrations SVG des bannières
