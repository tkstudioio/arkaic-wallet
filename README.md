# Arkaic - Documentazione Progetto

## 📱 Descrizione Progetto

**Arkaic** è un wallet mobile Bitcoin basato sul protocollo Ark, progettato per essere il più semplice possibile.

### Tecnologie Utilizzate

- **React Native** - Framework per lo sviluppo di app mobili cross-platform
- **Expo** v54.0.21 - Piattaforma per il build e il deployment di app React Native
- **TypeScript** - Linguaggio di programmazione tipizzato
- **Ark SDK** (@arkade-os/sdk v0.3.0) - SDK TypeScript ufficiale per il protocollo Ark, sviluppato da arkadeos
- **Zustand** - State management
- **TailwindCSS + Nativewind** - Styling responsive
- **React Navigation** - Navigazione tra schermate
- **React Query** - Data fetching e caching

### Piattaforme Supportate

- **iOS**
- **Android**
- **Web** (sperimentale)

---

## ⚠️ Disclaimer Importante

- **Non pronto per la produzione** - Arkaic è ancora in fase di sviluppo iniziale
- **Nessuna crittografia dei dati** - I dati non sono attualmente crittografati
- **Uso su mainnet sconsigliato** - Utilizzare solo su testnet per test e sviluppo

---

## 🚀 Guida di Avvio

### Prerequisiti

Assicurarsi di avere installati:

1. **Node.js e npm/yarn**
   - Versione consigliata: controlla `.nvmrc` per la versione esatta (attualmente v18+ consigliato)
   - Installa nvm da: https://github.com/nvm-sh/nvm

2. **iOS Development** (per iOS):
   - Xcode 15+
   - Cocoapods
   - Simulatore iOS o dispositivo fisico

3. **Android Development** (per Android):
   - Android Studio
   - Android SDK 28+
   - Emulatore Android o dispositivo fisico

4. **Expo CLI** (opzionale ma consigliato):
   ```bash
   npm install -g expo-cli
   ```

### Step 1: Clonare il Repository

```bash
git clone <repository-url>
cd arkaic-wallet
```

### Step 2: Configurare Node.js

Se usi nvm, sincronizza la versione di Node.js con il file `.nvmrc`:

```bash
nvm install
nvm use
```

Verifica la versione:
```bash
node --version
```

### Step 3: Installare le Dipendenze

```bash
yarn install
```

Oppure con npm:
```bash
npm install
```

### Step 4: Avviare il Progetto

#### Opzione 1: Avviare il server Expo (Consigliato)

```bash
yarn start
```

Questo avvierà il Expo Development Server. Vedrai un QR code nel terminale.

#### Opzione 2: Sviluppo su Android

```bash
yarn android
```

Assicurati di avere l'emulatore Android in esecuzione o un dispositivo connesso.

#### Opzione 3: Sviluppo su iOS

```bash
yarn ios
```

Assicurati di avere il simulatore iOS disponibile.

#### Opzione 4: Sviluppo Web

```bash
yarn web
```

L'app si aprirà automaticamente nel browser.

### Step 5: Scaricare Expo Go (Se usi Option 1)

Se usi `yarn start`:
1. Scarica l'app **Expo Go** dall'App Store (iOS) o Google Play (Android)
2. Scansiona il QR code visualizzato nel terminale
3. L'app verrà caricata sul tuo dispositivo

---

## 📂 Struttura del Progetto

```
arkaic-wallet/
├── app/                      # Routing principale (Expo Router)
│   ├── _layout.tsx          # Layout principale
│   ├── index.tsx            # Home page
│   ├── dashboard.tsx        # Dashboard principale
│   ├── create-profile.tsx   # Creazione profilo
│   └── profile/             # Schermate profilo
├── components/              # Componenti riutilizzabili
│   ├── account-balance.tsx
│   ├── accounts-carousel.tsx
│   ├── create-profile-form.tsx
│   ├── pos.tsx              # Interfaccia POS per ricezione fondi
│   ├── onboard-button.tsx
│   ├── manual-input-modal.tsx
│   ├── layout/              # Componenti di layout
│   └── icons/               # Componenti icone custom
├── constants/               # Costanti globali
├── assets/                  # Immagini, font, icone
├── app.json                 # Configurazione Expo
├── package.json             # Dipendenze e script
├── tsconfig.json            # Configurazione TypeScript
├── tailwind.config.js       # Configurazione TailwindCSS
└── babel.config.js          # Configurazione Babel
```

---

## 💡 Funzionalità Principali

### 1. **Creazione Account**
- Connessione a un ASP (Ark Service Provider)
- Generazione locale di una chiave privata casuale e sicura
- Nessun dato trasferito al server durante la creazione

### 2. **Dashboard**
- Visualizza saldo totale Ark
- Scorri tra i tuoi account
- Vedi la cronologia delle transazioni
- Accedi a funzioni Send e Receive

### 3. **Ricezione Fondi**
- Interfaccia stile POS
- Genera un QR code BIP21 con formato: `bitcoin:<onchain_address>?ark=<ark_address>&amount=<amount_in_btc>`
- Supporta scanning con fotocamera o input manuale
- Feedback immediato per pagamenti on-chain

### 4. **Invio Fondi**
- Scansiona QR code o inserisci manualmente l'indirizzo
- Parsing automatico BIP21 URI
- Determina automaticamente tra pagamento Ark o on-chain
- Supporta indirizzi Bitcoin standard

### 5. **Ark vs On-chain**
- **Ark Payment** (badge verde): Transazione istantanea a basso costo all'interno dello stesso ASP
- **On-chain Payment** (badge arancione): Transazione blockchain tradizionale, più lenta e costosa

---

## 🔧 Script Disponibili

```bash
# Avvia il server di sviluppo
yarn start

# Avvia su Android
yarn android

# Avvia su iOS
yarn ios

# Avvia su Web
yarn web

# Esegui linting
yarn lint

# Reset completo del progetto
yarn reset-project
```

---

## 🏗️ Stack Tecnologico Dettagliato

### Mobile Framework
- **React Native** 0.81.5
- **Expo Router** 6.0.14 - Routing file-based (simile a Next.js)
- **React Navigation** - Navigazione avanzata

### State Management & Data
- **Zustand** 5.0.8 - State management minimalista
- **React Query** 5.90.2 - Gestione cache e fetch dati
- **Async Storage** 2.2.0 - Archiviazione locale persistente
- **Expo Secure Store** - Archiviazione sicura per dati sensibili

### UI & Styling
- **Gluestack UI** - Componenti UI accessibili
- **TailwindCSS** 3.4.17 + **Nativewind** 4.1.23 - Styling utility-first
- **Lucide React Native** - Icone
- **React Native Skia** 2.2.12 - Graphics rendering

### Form & Validazione
- **React Hook Form** 7.63.0
- **Formik** 2.4.6
- **Zod** 4.1.11 - Validazione schemi TypeScript

### Utilità
- **Axios** 1.13.0 - HTTP client
- **Date-fns** 4.1.0 - Utility per date
- **Lodash** 4.17.21 - Utility functions
- **React Native QR Code** - Generazione QR code
- **Expo Crypto** - Funzioni crittografiche

### Animazioni
- **React Native Reanimated** 4.1.1
- **React Legend Motion** - Animazioni smooth

---

## 📥 Requisiti di Sistema

### macOS
```
- macOS 12+
- Homebrew
- Xcode Command Line Tools
```

### Installazione Dipendenze su macOS

```bash
# Installa Homebrew se non già installato
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installa Node.js con nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc

# Installa la versione Node.js corretta
cd arkaic-wallet
nvm install
nvm use

# Installa yarn (opzionale, ma consigliato)
npm install -g yarn

# Installa Expo CLI
npm install -g expo-cli
```

---

## 🔐 Configurazione Ark SDK

Il progetto utilizza il `@arkade-os/sdk` versione 0.3.0. L'SDK è automaticamente configurato e nessuna configurazione aggiuntiva è richiesta per iniziare lo sviluppo.

Per i dettagli tecnici sull'SDK, consulta il repository ufficiale:
https://github.com/arkade-os/ts-sdk

---

## 🐛 Troubleshooting

### Errore: "Cannot find module 'expo'"
```bash
yarn install
# o
npm install
```

### Emulatore Android non si avvia
```bash
# Lista gli emulatori disponibili
emulator -list-avds

# Avvia un emulatore specifico
emulator -avd <nome_emulatore>
```

### Errore di build iOS
```bash
# Pulisci il build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

# Reinstalla le dipendenze
cd ios
pod install
cd ..

yarn ios
```

### Problemi con la versione di Node.js
```bash
# Verifica che stai usando la versione corretta
node --version

# Se non corrisponde a .nvmrc
nvm install
nvm use
```

### Porta 8081 occupata (Expo Server)
```bash
# Usa una porta diversa
expo start --port 8088
```

---

## 📦 Build per Produzione

### Build Android

```bash
# EAS Build (consigliato)
eas build --platform android

# Build locale
./gradlew assembleRelease
```

### Build iOS

```bash
# EAS Build (consigliato)
eas build --platform ios

# Build locale
xcode-select --install
eas build --platform ios --local
```

Per il setup completo di EAS, vedi: https://docs.expo.dev/eas/

---

## 🤝 Contribuire

### Conventional Commits

I commit seguono lo standard **Conventional Commits** compatibile con `generate-changelog`. Formato:

```
<type>: <descrizione>
```

Tipi validi: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`.

Esempi:
```
feat: aggiunto scanner QR per i pagamenti
fix: corretta visualizzazione del saldo in sats
refactor: estratto parsing BIP21 in utility separata
```

> Tutto il codice, i commenti e i contenuti del repository devono essere scritti in **inglese**.

---

## 💰 Supporta lo Sviluppo

Se trovi **Arkaic** utile o vuoi supportarne lo sviluppo, considera una donazione tramite Lightning Network:

📧 **littlestaff444@walletofsatoshi.com**

---

## 📚 Risorse Utili

- [Documentazione Expo](https://docs.expo.dev)
- [Documentazione React Native](https://reactnative.dev)
- [Ark SDK Repository](https://github.com/arkade-os/ts-sdk)
- [Expo Router](https://expo.github.io/router)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📄 Licenza

Vedi il file `LICENSE` per i dettagli sulla licenza.

---

**Versione Documentazione**: 1.0
**Ultimo aggiornamento**: Febbraio 2026
