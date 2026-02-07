# 🔄 Flow Côté Serveur - FighterGame

## 📋 Vue d'Ensemble

Le serveur utilise une architecture basée sur **EventBus** et **Systèmes** (pattern ECS-like) pour gérer le jeu.

---

## 🚀 Initialisation du Serveur

### 1. **Démarrage** (`server/server.ts`)

```
1. Création Express + HTTP Server
2. Configuration Socket.io (CORS: *)
3. Création EventBus (communication interne)
4. Création ServerState (état du jeu)
5. Création des Systèmes :
   - AttackSystem
   - MovementSystem
   - DirectionSystem
   - UpdateSystem
   - ProgressionSystem
6. Création SocketIoAdapter (EventBus → Socket.io)
7. Création EntityCommandListener (écoute les commandes)
8. Création BotManager
9. Création GameLoop
10. Écoute des connexions Socket.io
```

---

## 🔌 Connexion d'un Joueur

### Flow de Connexion

```
Client se connecte
    ↓
io.on("connection", socket)
    ↓
1. HumanEventListener créé
   - Envoie CONNECTED avec socket.id
   - Envoie CURRENT_ENTITIES (tous les joueurs existants)
    ↓
2. Enregistrement des listeners Socket.io
   - EntityCommand.ATTACK
   - EntityCommand.UPDATED
   - EntityCommand.POSITION_UPDATED
   - EntityCommand.STATE_CHANGED
   - EntityCommand.MOVING_VECTOR_CHANGED
   - ClientToSocketMsg.SPAWN_PLAYER
    ↓
3. Si premier joueur → GameLoop.start()
```

### Spawn d'un Joueur

```
Client envoie: SPAWN_PLAYER (name)
    ↓
HumanEventListener reçoit
    ↓
Création Player(id=socket.id, name, position={0,0}, ...)
    ↓
ServerState.addPlayer(player, socket)
    - Ajoute dans entities Map
    - Ajoute dans playerSockets Map
    - Émet EntityEvent.ADDED
    ↓
SocketIoAdapter écoute EntityEvent.ADDED
    ↓
Envoie ServerToSocketMsg.NEW_ENTITY à tous les clients
```

---

## 🎮 Game Loop (60 FPS)

### Boucle Principale (`GameLoop.ts`)

```
Chaque ~16.67ms (60 FPS):
    ↓
1. Calcul deltaTime (normalisé à 60 FPS)
    ↓
2. botManager.updateBots(deltaTime)
   - Met à jour tous les bots
    ↓
3. serverState.updatePlayers(deltaTime)
   - Pour chaque entité :
     a. Détection collisions (CollisionService)
     b. Appel onCollideWith() pour chaque collision
     c. entity.update(delta) → met à jour l'état
```

---

## 📨 Flow des Commandes Client → Serveur

### Architecture en 2 Couches

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ Socket.io
       ↓
┌──────────────────────┐
│ HumanEventListener   │  ← Reçoit les messages Socket.io
└──────┬───────────────┘
       │ Émet dans EventBus
       ↓
┌──────────────────────┐
│ EntityCommandListener│  ← Écoute EntityCommand.*
└──────┬───────────────┘
       │ Appelle les Systèmes
       ↓
┌──────────────────────┐
│   Systèmes (ECS)     │  ← Traitent la logique
└──────────────────────┘
```

### 1. **Attaque** (`EntityCommand.ATTACK`)

```
Client → Socket.io: EntityCommand.ATTACK
    ↓
HumanEventListener reçoit
    ↓
Émet: EventBus.emit(EntityCommand.ATTACK, data)
    ↓
EntityCommandListener écoute
    ↓
Appelle: attackSystem.handleAttack(attackData)
    ↓
AttackSystem:
  - Récupère l'attaquant depuis ServerState
  - Détermine le type d'attaque (MELEE/PROJECTILE)
  - Appelle le handler approprié :
    * MeleeAttackHandler:
      - Valide hitbox (HitboxValidationService)
      - Pour chaque cible touchée:
        → damageSystem.applyDamage()
    * ProjectileAttackHandler:
      - Crée un Projectile
      - Ajoute dans ServerState
    ↓
DamageSystem.applyDamage():
  - Calcule dégâts (avec variabilité + crit)
  - Applique dégâts à la cible
  - Émet EntityEvent.RECEIVE_ATTACK (cible)
  - Émet LocalPlayerEvent.ATTACK_RESULT (attaquant)
  - Si HP <= 0:
    → Émet EntityEvent.DIED
    → ProgressionSystem gère XP/kills
    ↓
SocketIoAdapter écoute les événements
    ↓
Envoie aux clients via Socket.io
```

### 2. **Mouvement** (`EntityCommand.POSITION_UPDATED`)

```
Client → Socket.io: EntityCommand.POSITION_UPDATED
    ↓
HumanEventListener reçoit
    ↓
Émet: EventBus.emit(EntityCommand.POSITION_UPDATED, data)
    ↓
EntityCommandListener écoute
    ↓
Appelle: movementSystem.handlePosUpdated(entityId, position)
    ↓
MovementSystem:
  - Récupère l'entité depuis ServerState
  - Met à jour la position
  - Émet EntityEvent.POSITION_UPDATED
    ↓
SocketIoAdapter écoute
    ↓
Envoie ServerToSocketMsg.ENTITY_POS_UPDATE
  - broadcast (tous sauf l'émetteur)
```

### 3. **Direction** (`EntityCommand.MOVING_VECTOR_CHANGED`)

```
Client → Socket.io: EntityCommand.MOVING_VECTOR_CHANGED
    ↓
HumanEventListener reçoit
    ↓
Émet: EventBus.emit(EntityCommand.MOVING_VECTOR_CHANGED, data)
    ↓
EntityCommandListener écoute
    ↓
Appelle: directionSystem.handleDirectionUpdate(...)
    ↓
DirectionSystem:
  - Met à jour movingVector, direction, state
  - Émet EntityEvent.MOVING_VECTOR_CHANGED
    ↓
SocketIoAdapter écoute
    ↓
Envoie ServerToSocketMsg.ENTITY_DIRECTION_UPDATE
  - broadcast (tous sauf l'émetteur)
```

### 4. **Mise à Jour Générale** (`EntityCommand.UPDATED`)

```
Client → Socket.io: EntityCommand.UPDATED (PlayerInfo)
    ↓
HumanEventListener reçoit
    ↓
Émet: EventBus.emit(EntityCommand.UPDATED, playerInfo)
    ↓
EntityCommandListener écoute
    ↓
Appelle: updateSystem.handleEntityUpdated(playerInfo)
    ↓
UpdateSystem:
  - Met à jour l'entité dans ServerState
  - Émet EntityEvent.UPDATED
    ↓
SocketIoAdapter écoute
    ↓
Envoie ServerToSocketMsg.ENTITY_UPDATE
  - broadcast (tous sauf l'émetteur)
```

---

## 🔄 Flow Serveur → Clients

### SocketIoAdapter (`adapters/SocketIoAdapter.ts`)

L'adapter écoute les événements EventBus et les propage via Socket.io :

| EventBus Event | Socket.io Message | Destinataire |
|----------------|-------------------|--------------|
| `EntityEvent.RECEIVE_ATTACK` | `ATTACK_RECEIVED` | Cible uniquement |
| `LocalPlayerEvent.ATTACK_RESULT` | `ATTACK_RESULT` | Attaquant uniquement |
| `EntityEvent.KNOCKBACKED` | `KNOCKBACK_RECEIVED` | Cible uniquement |
| `EntityEvent.DIED` | `ENTITY_DIED` | Tous (broadcast) |
| `EntityEvent.ADDED` | `NEW_ENTITY` | Tous (broadcast) |
| `EntityEvent.MOVING_VECTOR_CHANGED` | `ENTITY_DIRECTION_UPDATE` | Tous sauf émetteur (broadcast) |
| `EntityEvent.POSITION_UPDATED` | `ENTITY_POS_UPDATE` | Tous sauf émetteur (broadcast) |
| `EntityEvent.UPDATED` | `ENTITY_UPDATE` | Tous sauf émetteur (broadcast) |
| `EntityEvent.SYNC` | `ENTITY_SYNC` | Tous (broadcast) |

---

## 🤖 Système de Bots

### BotManager

```
GameLoop appelle: botManager.updateBots(deltaTime)
    ↓
Pour chaque bot:
  - BotInputHandler génère des inputs
  - BotAdapter convertit inputs → EntityCommand
  - Les commandes passent par le même flow que les joueurs
```

---

## 📊 Systèmes Principaux

### 1. **AttackSystem**
- Gère les attaques (mêlée et projectiles)
- Utilise des handlers par type d'attaque
- Valide les hitboxes

### 2. **MovementSystem**
- Met à jour les positions des entités
- Émet des événements de position

### 3. **DirectionSystem**
- Gère les changements de direction
- Met à jour movingVector et state

### 4. **UpdateSystem**
- Synchronise les entités avec les données reçues
- Met à jour ServerState

### 5. **ProgressionSystem**
- Gère XP, niveaux, kills
- Écoute EntityEvent.DIED
- Calcule les récompenses

### 6. **DamageSystem**
- Applique les dégâts
- Gère les crits, variabilité
- Gère la mort des entités

---

## 🗄️ ServerState

### Rôle
- **Source de vérité** pour l'état du jeu
- Stocke toutes les entités (Map<string, Entity>)
- Gère les sockets des joueurs
- Gère les bots

### Méthodes Principales
- `addPlayer()` - Ajoute un joueur
- `addEntity()` - Ajoute une entité (projectile, etc.)
- `getEntity()` - Récupère une entité
- `updatePlayers()` - Met à jour toutes les entités (collisions + update)
- `removeEntity()` - Supprime une entité

---

## 🔗 EventBus

### Types d'Événements

#### EntityCommand (Client → Serveur)
- `ATTACK` - Commande d'attaque
- `UPDATED` - Mise à jour d'entité
- `POSITION_UPDATED` - Mise à jour position
- `MOVING_VECTOR_CHANGED` - Changement direction
- `STATE_CHANGED` - Changement d'état

#### EntityEvent (Interne Serveur)
- `ADDED` - Nouvelle entité
- `REMOVED` - Entité supprimée
- `UPDATED` - Entité mise à jour
- `POSITION_UPDATED` - Position mise à jour
- `RECEIVE_ATTACK` - Entité reçoit une attaque
- `KNOCKBACKED` - Entité reçoit un knockback
- `DIED` - Entité morte
- `SYNC` - Synchronisation

#### LocalPlayerEvent
- `ATTACK_RESULT` - Résultat d'attaque pour l'attaquant

---

## 🔄 Exemple Complet : Un Joueur Attaque

```
1. Client appuie sur clic gauche
   ↓
2. Client calcule hitbox et envoie EntityCommand.ATTACK
   ↓
3. HumanEventListener reçoit via Socket.io
   ↓
4. Émet EntityCommand.ATTACK dans EventBus
   ↓
5. EntityCommandListener écoute
   ↓
6. Appelle attackSystem.handleAttack()
   ↓
7. AttackSystem:
   - Récupère attaquant
   - Valide hitbox → trouve cibles
   - Pour chaque cible:
     → damageSystem.applyDamage()
       - Calcule dégâts
       - Applique à la cible
       - Émet RECEIVE_ATTACK (cible)
       - Émet ATTACK_RESULT (attaquant)
       - Si mort → émet DIED
   ↓
8. SocketIoAdapter écoute:
   - RECEIVE_ATTACK → envoie ATTACK_RECEIVED à la cible
   - ATTACK_RESULT → envoie ATTACK_RESULT à l'attaquant
   - DIED → envoie ENTITY_DIED à tous
   ↓
9. ProgressionSystem écoute DIED:
   - Donne XP au tueur
   - Vérifie level up
   - Émet SYNC avec nouvelles stats
   ↓
10. SocketIoAdapter envoie ENTITY_SYNC à tous
```

---

## 🎯 Points Clés

1. **Découplage** : EventBus permet aux systèmes de communiquer sans dépendances directes
2. **Autorité Serveur** : Le serveur valide toutes les actions
3. **Broadcast Intelligent** : Les mises à jour sont envoyées à tous sauf l'émetteur
4. **Game Loop** : 60 FPS pour la physique et les collisions
5. **Systèmes Modulaires** : Chaque système a une responsabilité unique

---

## 📝 Notes

- Les collisions sont vérifiées **côté serveur** dans `ServerState.updatePlayers()`
- Les projectiles sont des entités à part entière dans ServerState
- Les bots utilisent le même flow que les joueurs via BotAdapter
- Le serveur est l'**autorité** : il valide et applique toutes les actions
