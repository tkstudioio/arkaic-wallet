### 0.2.0 (2026-03-03)

##### Chores

*  update yarn.lock (de4a052e)

##### Continuous Integration

* **release:**  auto-push commits and tags after version bump (ede46210)
*  add automated iOS build/submit on tag push (5a36e965)

##### Documentation Changes

* **claude:**  add agent definitions and task specifications (0b1fa35a)
* **versioning:**  add automatic changelog generation documentation (f82e1b91)

##### Bug Fixes

* **send:**  improve QR scanner and paste button sizing (4702bd3e)
* **account-balance:**  only show spinner during balance refetch (a7726b93)
* **dashboard:**  wrap action buttons in flex-1 containers for equal sizing (968287a6)
* **ui:**  use foreground token for base text color instead of primary-foreground (e7fbcb9e)

##### Other Changes

* **theme:**  update primary color palette from purple to pink" (40cae1a2)

##### Refactors

* **layout:**  replace menu dropdown with drawer navigation (12a10d2f)
* **account-balance:**  replace ts-pattern match with explicit conditionals and add account name badge (52f52e7e)
* **components:**  migrate button variants from secondary/ghost to outline/link (43ec990e)
* **ui:**  remove non-standard button sizes and add action-colored outline borders (28f55b2a)

##### Code Style Changes

* **ui:**  update button actions and variants across components (47202d54)
* **button:**  add neutral action and refine outline variant styles (aa45b47b)
* **layout:**  reduce top padding and remove bottom padding (a7646380)
* **drawer:**  normalize quotes and sort imports (b4b861c6)
* **theme:**  update primary color palette from purple to pink (f4d1868d)

### 0.1.0 (2026-03-03)

##### Chores

* **app:**  add app icon asset and configure icon paths (d32c7af6)
* **agents:**  update task directory paths and add reviewer agent (02fffd83)
*  add planner agent prompt (14ff57b3)
*  update dependencies (1d0dd9c6)
*  configure metro bundler for SVG assets (730a98ea)
*  dashboard code (efaf822e)
*  remove console log (84c98556)
*  clean code (c1ce8b1d)
*  rename app layout file (5de24d05)
*  remove unused components (53c11d1f)
*  remove console logs (b076347e)
*  move files (ca0f1350)
*  remove useless console.log (021cd525)
* **ui:**  configure font families in tailwind config (17867684)
* **fonts:**  load Ubuntu Mono and Ubuntu fonts in root layout (89ca2769)
* **deps:**
  *  add @expo-google-fonts/ubuntu (583f074e)
  *  relax react-native-svg version constraint (765c82b8)
  *  add @scure/bip39 and @scure/bip32 for BIP39 mnemonic support (a519c40e)
  *  add ubuntu-mono font for improved typography (bab19d20)
  *  update Expo SDK packages and plugin config (d78d256b)

##### Documentation Changes

*  update CLAUDE.md with typography system documentation (abe116ca)
*  update CLAUDE.md to reflect account architecture (0b93ae4e)
*  update readme (095b847f)
*  update documentation (204360a7)
*  add presentation file (0a58613b)
*  add features section. better dev onboarding (4b1eca76)
*  create first documentation (4ecb15c0)
*  add screenshots (b26e4c22)
* **tasks:**  document arkaic token migration plan (task 1.3) (491c4092)
* **claude:**
  *  add rule against AI co-authorship in commits (651989c6)
  *  claude init (8b0936ac)
* **components:**  add a pdf export from figma of all components to date. (7ea89e6d)
* **readme:**  rewrite project documentation and remove old screenshots (39a0e789)

##### New Features

* **ui:**
  *  add seedphrase SVG asset and SVG type declaration (aa2a6fae)
  *  add semantic typography components (19e1cbc1)
  *  add gluestack icon component (45fdb7ea)
* **ui/button:**  add "big" size variant (0d114f3e)
* **wallet:**
  *  ask passphrase at login instead of persisting private key (d006cc11)
  *  add account menu with seed backup, delete and logout options (7500332a)
  *  add mnemonic seed phrase wizard for profile creation and restore (877a0a0b)
*  add BIP39 mnemonic utility for key generation and validation (7da1f7e6)
*  submarine swap (5872ed18)
*  reverse lightning swap (3203e0dc)
*  add paste from clipboard (5d165116)
*  add copy to clipboard in receive qr code (9159d9d5)
*  deploy (30c3c71d)
*  add accounts carousel (8098223a)
*  add vtxo manager (3faf0ccf)
*  restore from key page (07be87c6)
*  add transactions switch on chain change (0d6e0c19)
*  add detailed transactions switch (9c3e9dd9)
*  ui enhance (baa061cb)
*  ark <> onchain switch by swipe (32589f3d)
*  new amount component (53b1ec45)
*  add signerPubkey in arkaic payment to check if is same asp (d9d30cd4)
*  handle no profiles (f60f9c34)
*  add transaction link to mempool explorer (70814406)
*  add notification listening and feedback for ark incoming transactions (d57f71e9)
* **components:**  add profile list item component (bc88ebff)
* **theme:**  introduce arkaic design tokens (2fcc493d)
* **profile:**  replace ASP URL input with server selector (ed1facd6)

##### Bug Fixes

* **transactions:**  rewrite badge logic and remove dead code (679608c9)
* **ui:**
  *  use P instead of Muted for seed phrase step description (a3f50b22)
  *  update status bar style to light for dark background visibility (0d678e5a)
  *  spread action buttons across full width on dashboard (c529ea4f)
  *  restore send and receive action buttons on dashboard (304400bd)
  *  make profile list scrollable on home page (84d475a2)
* **store:**  add logout action and remove duplicate removeAccount (f30286a0)
* **hooks:**
  *  resolve React hooks performance issues (58a71b2c)
  *  resolve query key collisions and deduplicate transaction fetching (b78e55a9)
*  build errors (1bd52c57)
*  wrong back to dashboard button in qr action sheet (bd8b7a0f)
*  remove border and fix spacing (02be69bb)
*  expo packages compatibility (95ab2acb)
*  expo packages compatibility (e68daffc)
*  replace router.push with router.replace (88ea3569)

##### Other Changes

*  add SVG illustrations for onboarding flow (b1542883)
*  qr color (6397553c)
*  reset action sheet on payment fulfilled sheet close (61d6e9d1)
*  remove rounded (7893a09a)

##### Refactors

* **ui:**
  *  update action sheet button variants and actions (de2a97ba)
  *  adopt semantic typography components across all components (45ad6fd6)
  *  update design tokens and base component styles (d862ac5f)
  *  remove auth layout wrapper from homepage (6f04069e)
  *  update modal footer layouts to vertical stack (dc6b1c13)
  *  update app layout menu with reordered items and icon support (e848473e)
  *  simplify receive action sheet and improve address copy ux (d3bff8b2)
  *  remove manual input modal and simplify send flow (e03d8620)
  *  replace qr carousel badge and pagination with button group navigation (d057d04c)
  *  redesign menu component with action variants and icon support (f488f6b7)
  *  switch all amount displays and inputs from fiat to sats (67e24077)
  *  remove image from profile creation and improve layouts (45deae85)
* **layout:**  replace ScrollView with View and adjust flex layout (44d87a6a)
* **icons:**  update logo SVG with new design and viewBox (1bcd4e37)
* **store:**  remove unused AsyncStorage import and legacy migration logic (7bf3f2a8)
* **ui/balance:**  replace skeleton with spinner for loading state (8149ba67)
* **ui/layout:**
  *  simplify dashboard menu items (b6874146)
  *  update auth layout and dashboard structure (99891d0c)
* **ui/auth:**  add logo and restructure auth screen layout (b7c6989e)
* **ui/receive:**  update button styling (ca57b9f1)
* **ui/create-account:**  improve form UX and add validation (5d465e88)
* **ui/homepage:**  improve account list with avatar and typography (3b815b67)
* **ui/amount:**
  *  simplify no-funds display (5f2b3e31)
  *  integrate Sats icon into AmountComponent (b5999039)
* **ui/transactions:**  update transaction list layout and styling (a8af33a4)
*  use Button big variant for action sheet triggers (ee7e3d9f)
*  send and receive components (e8fba9bf)
*  send and receive components (50af76b3)
*  send component is now an action sheet (5544029b)
*  homepage, carousel, payment modals and other things (19ae1031)
*  UX (f619e0f4)
*  show amounts in fiat currency (adb0d01e)
*  add price converter, remove onboard page (89c8fc6a)
*  remove onchain view (f6d4c093)
*  transactions (5c7aa9e3)
*  pos and receive components (98e9efff)
*  transaction row (fe1f8529)
*  ark balance component (cd124607)
*  working on balance component (4b5e6291)
*  header ui (7136d1a2)
*  create profile (c4b35119)
*  profiles list (b7682791)
*  onchain page (8afc11a4)
*  rename store file name (9b030111)
*  onchain (883222c5)
*  profile list UI (c99046fc)
*  balance and onboard-funds UI (9bcf4299)
* **wallet:**  rename profile to account throughout codebase (12d77b00)
* **components:**
  *  improve dashboard layout and balance display (8d7aad0a)
  *  redesign dashboard and home layouts (16ac8eca)
  *  update button styling and auth layout (f59803de)
* **hooks:**  extract account login logic to useLoginMutation hook (0c1606d4)
* **stores/profile:**  simplify store and move account initialization (e019b5bc)
* **components/accounts-carousel:**  improve carousel scroll handling (aff976bf)
* **components/homepage:**  enhance homepage with illustrations and logo (fd7ed898)
* **pages/profile:**  enhance profile creation page layout (eeab620f)
* **form:**  simplify create profile form (de538d7f)
* **components/carousel-pagination:**  simplify pagination with arkaic tokens (59668ce4)
* **theme:**
  *  migrate color references from react-navigation to arkaic tokens (051376ed)
  *  migrate all components to arkaic color tokens (758114a7)
  *  remove react-navigation theming in favor of gluestack (9d519396)
* **auth:**  use auth layout on home and add loading state (5045c91b)

##### Code Style Changes

* **button:**  add hard offset shadow and update button variants (1c1a4893)
* **ui/transactions:**  fix formatting and adjust layout (f5393829)
* **ui:**  refactor skeleton component and update card styles (1d3d6314)
*  standardize code formatting in UI components (8cc535e3)
*  standardize code formatting (quotes, trailing commas) (34adb403)

### 0.1.0 (2026-03-03)

##### Chores

* **app:**  add app icon asset and configure icon paths (d32c7af6)
* **agents:**  update task directory paths and add reviewer agent (02fffd83)
*  add planner agent prompt (14ff57b3)
*  update dependencies (1d0dd9c6)
*  configure metro bundler for SVG assets (730a98ea)
*  dashboard code (efaf822e)
*  remove console log (84c98556)
*  clean code (c1ce8b1d)
*  rename app layout file (5de24d05)
*  remove unused components (53c11d1f)
*  remove console logs (b076347e)
*  move files (ca0f1350)
*  remove useless console.log (021cd525)
* **ui:**  configure font families in tailwind config (17867684)
* **fonts:**  load Ubuntu Mono and Ubuntu fonts in root layout (89ca2769)
* **deps:**
  *  add @expo-google-fonts/ubuntu (583f074e)
  *  relax react-native-svg version constraint (765c82b8)
  *  add @scure/bip39 and @scure/bip32 for BIP39 mnemonic support (a519c40e)
  *  add ubuntu-mono font for improved typography (bab19d20)
  *  update Expo SDK packages and plugin config (d78d256b)

##### Documentation Changes

*  update CLAUDE.md with typography system documentation (abe116ca)
*  update CLAUDE.md to reflect account architecture (0b93ae4e)
*  update readme (095b847f)
*  update documentation (204360a7)
*  add presentation file (0a58613b)
*  add features section. better dev onboarding (4b1eca76)
*  create first documentation (4ecb15c0)
*  add screenshots (b26e4c22)
* **tasks:**  document arkaic token migration plan (task 1.3) (491c4092)
* **claude:**
  *  add rule against AI co-authorship in commits (651989c6)
  *  claude init (8b0936ac)
* **components:**  add a pdf export from figma of all components to date. (7ea89e6d)
* **readme:**  rewrite project documentation and remove old screenshots (39a0e789)

##### New Features

* **ui:**
  *  add seedphrase SVG asset and SVG type declaration (aa2a6fae)
  *  add semantic typography components (19e1cbc1)
  *  add gluestack icon component (45fdb7ea)
* **ui/button:**  add "big" size variant (0d114f3e)
* **wallet:**
  *  ask passphrase at login instead of persisting private key (d006cc11)
  *  add account menu with seed backup, delete and logout options (7500332a)
  *  add mnemonic seed phrase wizard for profile creation and restore (877a0a0b)
*  add BIP39 mnemonic utility for key generation and validation (7da1f7e6)
*  submarine swap (5872ed18)
*  reverse lightning swap (3203e0dc)
*  add paste from clipboard (5d165116)
*  add copy to clipboard in receive qr code (9159d9d5)
*  deploy (30c3c71d)
*  add accounts carousel (8098223a)
*  add vtxo manager (3faf0ccf)
*  restore from key page (07be87c6)
*  add transactions switch on chain change (0d6e0c19)
*  add detailed transactions switch (9c3e9dd9)
*  ui enhance (baa061cb)
*  ark <> onchain switch by swipe (32589f3d)
*  new amount component (53b1ec45)
*  add signerPubkey in arkaic payment to check if is same asp (d9d30cd4)
*  handle no profiles (f60f9c34)
*  add transaction link to mempool explorer (70814406)
*  add notification listening and feedback for ark incoming transactions (d57f71e9)
* **components:**  add profile list item component (bc88ebff)
* **theme:**  introduce arkaic design tokens (2fcc493d)
* **profile:**  replace ASP URL input with server selector (ed1facd6)

##### Bug Fixes

* **transactions:**  rewrite badge logic and remove dead code (679608c9)
* **ui:**
  *  use P instead of Muted for seed phrase step description (a3f50b22)
  *  update status bar style to light for dark background visibility (0d678e5a)
  *  spread action buttons across full width on dashboard (c529ea4f)
  *  restore send and receive action buttons on dashboard (304400bd)
  *  make profile list scrollable on home page (84d475a2)
* **store:**  add logout action and remove duplicate removeAccount (f30286a0)
* **hooks:**
  *  resolve React hooks performance issues (58a71b2c)
  *  resolve query key collisions and deduplicate transaction fetching (b78e55a9)
*  build errors (1bd52c57)
*  wrong back to dashboard button in qr action sheet (bd8b7a0f)
*  remove border and fix spacing (02be69bb)
*  expo packages compatibility (95ab2acb)
*  expo packages compatibility (e68daffc)
*  replace router.push with router.replace (88ea3569)

##### Other Changes

*  add SVG illustrations for onboarding flow (b1542883)
*  qr color (6397553c)
*  reset action sheet on payment fulfilled sheet close (61d6e9d1)
*  remove rounded (7893a09a)

##### Refactors

* **ui:**
  *  update action sheet button variants and actions (de2a97ba)
  *  adopt semantic typography components across all components (45ad6fd6)
  *  update design tokens and base component styles (d862ac5f)
  *  remove auth layout wrapper from homepage (6f04069e)
  *  update modal footer layouts to vertical stack (dc6b1c13)
  *  update app layout menu with reordered items and icon support (e848473e)
  *  simplify receive action sheet and improve address copy ux (d3bff8b2)
  *  remove manual input modal and simplify send flow (e03d8620)
  *  replace qr carousel badge and pagination with button group navigation (d057d04c)
  *  redesign menu component with action variants and icon support (f488f6b7)
  *  switch all amount displays and inputs from fiat to sats (67e24077)
  *  remove image from profile creation and improve layouts (45deae85)
* **layout:**  replace ScrollView with View and adjust flex layout (44d87a6a)
* **icons:**  update logo SVG with new design and viewBox (1bcd4e37)
* **store:**  remove unused AsyncStorage import and legacy migration logic (7bf3f2a8)
* **ui/balance:**  replace skeleton with spinner for loading state (8149ba67)
* **ui/layout:**
  *  simplify dashboard menu items (b6874146)
  *  update auth layout and dashboard structure (99891d0c)
* **ui/auth:**  add logo and restructure auth screen layout (b7c6989e)
* **ui/receive:**  update button styling (ca57b9f1)
* **ui/create-account:**  improve form UX and add validation (5d465e88)
* **ui/homepage:**  improve account list with avatar and typography (3b815b67)
* **ui/amount:**
  *  simplify no-funds display (5f2b3e31)
  *  integrate Sats icon into AmountComponent (b5999039)
* **ui/transactions:**  update transaction list layout and styling (a8af33a4)
*  use Button big variant for action sheet triggers (ee7e3d9f)
*  send and receive components (e8fba9bf)
*  send and receive components (50af76b3)
*  send component is now an action sheet (5544029b)
*  homepage, carousel, payment modals and other things (19ae1031)
*  UX (f619e0f4)
*  show amounts in fiat currency (adb0d01e)
*  add price converter, remove onboard page (89c8fc6a)
*  remove onchain view (f6d4c093)
*  transactions (5c7aa9e3)
*  pos and receive components (98e9efff)
*  transaction row (fe1f8529)
*  ark balance component (cd124607)
*  working on balance component (4b5e6291)
*  header ui (7136d1a2)
*  create profile (c4b35119)
*  profiles list (b7682791)
*  onchain page (8afc11a4)
*  rename store file name (9b030111)
*  onchain (883222c5)
*  profile list UI (c99046fc)
*  balance and onboard-funds UI (9bcf4299)
* **wallet:**  rename profile to account throughout codebase (12d77b00)
* **components:**
  *  improve dashboard layout and balance display (8d7aad0a)
  *  redesign dashboard and home layouts (16ac8eca)
  *  update button styling and auth layout (f59803de)
* **hooks:**  extract account login logic to useLoginMutation hook (0c1606d4)
* **stores/profile:**  simplify store and move account initialization (e019b5bc)
* **components/accounts-carousel:**  improve carousel scroll handling (aff976bf)
* **components/homepage:**  enhance homepage with illustrations and logo (fd7ed898)
* **pages/profile:**  enhance profile creation page layout (eeab620f)
* **form:**  simplify create profile form (de538d7f)
* **components/carousel-pagination:**  simplify pagination with arkaic tokens (59668ce4)
* **theme:**
  *  migrate color references from react-navigation to arkaic tokens (051376ed)
  *  migrate all components to arkaic color tokens (758114a7)
  *  remove react-navigation theming in favor of gluestack (9d519396)
* **auth:**  use auth layout on home and add loading state (5045c91b)

##### Code Style Changes

* **button:**  add hard offset shadow and update button variants (1c1a4893)
* **ui/transactions:**  fix formatting and adjust layout (f5393829)
* **ui:**  refactor skeleton component and update card styles (1d3d6314)
*  standardize code formatting in UI components (8cc535e3)
*  standardize code formatting (quotes, trailing commas) (34adb403)

