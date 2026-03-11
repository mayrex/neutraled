# Changelog NPC e Bug Fixes - Phaser Colyseus Multiplayer

Questo documento riassume tutte le modifiche e le funzionalità introdotte nel progetto, divise per task.

## Task 1: Fix Bug Animazioni Giocatore
**Problema:** Le animazioni del giocatore (es. camminata) si "incastravano" al primo movimento e non si aggiornavano più cambiando direzione o fermandosi.
**Soluzione:** 
- Rimosso il controllo rigido `texture.key === 'player'` nel client (`GameScene.js`). 
- In Phaser, l'avvio di un'animazione cambia dinamicamente la texture (es. da `player` a `rightwalk_frame1`), il che faceva fallire il controllo e bloccava l'update.
- Ora i controlli dell'animazione si basano esclusivamente sul ruolo del giocatore (`currentMode === 'human'`), garantendo transizioni fluide tra i movimenti. Quando si è in forma di mostro le animazioni umane vengono opportunamente fermate.

## Task 2: Ribilanciamento Arma Stordente (Taser Umano)
**Problema:** Il Taser (arma secondaria dell'umano) era troppo sbilanciato in PvP.
**Soluzione:**
- Modificati i parametri nel server (`GameRoom.js`).
- I danni del Taser sono stati ridotti da 5 a **2**.
- La durata dello stordimento (immobilizzazione) è stata dimezzata da 2000ms a **1000ms**.

## Task 3: Barra Evoluzione e Trasformazione
**Problema:** I mostri potevano trasformarsi in umani gratis e mancava una meccanica di progressione per incentivare il farming.
**Soluzione:**
- Aggiunta la statistica **Evoluzione** (da 0 a 100) al Player Schema.
- Aggiunta la UI client-side (Barra grafica arancione e testo percentuale in `GameScene.js`).
- La trasformazione ora **costa 100 punti Evoluzione ed è obbligatoria per entrambe le direzioni** (sia da umano a mostro, sia da mostro a umano). 
- Dopo la trasformazione, i punti si azzerano tornando a 0.
- Come si ottiene Evoluzione: 
  - Raccogliendo sfere/collezionabili nella mappa (+10 punti).
  - Attaccando giocatori o NPC nemici (si guadagnano punti pari alla metà dei danni inflitti).
  - Uccidendo giocatori o NPC nemici (+30 punti bonus).

## Task 4: Inserimento NPC (Nemici PvE) e IA
**Problema:** La mappa era vuota se non c'erano altri giocatori, ed era necessario poter farmare punti.
**Soluzione:**
- Creato un nuovo modulo di stato `Npc.js` e aggiunto al `GameState.js` del server.
- **Client-Side Rendering:** Gli NPC vengono sincronizzati sui client. Il client renderizza gli sprite (usando momentaneamente quelli base del mostro e dell'umano), la vita, la barra HP, i nomi visivi e interpola il loro movimento e le animazioni come se fossero veri giocatori.
- **Client-Side Combattimento:** Aggiunte le collisioni (Hit Overlap) nel client per permettere alle armi e proiettili del giocatore di colpire e distruggere gli NPC.
- **Server AI Loop:** 
  - Il server esegue un tick autonomo a 10Hz per muovere l'IA degli NPC.
  - **Aggro Globale Illimitato:** Gli NPC non hanno limiti di visuale. Individuano sempre il bersaglio valido e vivo più vicino appartenente alla fazione opposta (giocatore o un altro NPC) e camminano inesorabilmente verso di esso.
  - **Danno da contatto:** Quando l'IA raggiunge il suo bersaglio (distanza < 50), infligge automaticamente 5 danni con un cooldown (pausa) di 1.5 secondi per ogni attacco. 
  - **Auto-Balancing & Escalation:** Il gioco parte con 3 Umani NPC e 3 Mostri NPC. Ogni 15 secondi interviene un loop di "rispedizione": l'obiettivo massimo della mappa sale di 1 (es. 4, poi 5, etc.). Il server rileva istantaneamente quanti NPC mancano per riempire il nuovo limite e li fa nascere tutti simultaneamente, aumentando radicalmente la difficoltà all'aumentare del tempo di gioco.
