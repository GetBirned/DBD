export interface ProjectData {
  name: string
  /** Short initials, a fallback mark for a project with no logo. */
  glyph: string
  /** Real logo image, when available — takes priority over the glyph. */
  logo?: string
  tag: string
  /** Subtle per-card accent color. */
  tint: string
  stack: string
  /** One line for the stacked project cards — the full `desc` is in the case study. */
  pitch: string
  desc: string
  vidLabel: string
  repo: string
  /** Live site, when the project is actually deployed somewhere — shown as a "Visit Site" link. */
  url?: string
  /** Real screenshots pulled from the project's GitHub repo, when available. A .webm entry
   * plays as a looping muted video (thumbnail + lightbox) instead of a static image. */
  screenshots?: string[]
  /** A real screen-recording — takes over the main showcase area from screenshots[0]. */
  video?: string
  /** Width ÷ height of `video` (or of screenshots[0] when there's no video), so the project card
   *  can frame it exactly instead of letterboxing it. */
  mediaRatio: number
  /** A wordmark image that replaces the plain-text name heading, when the brand has one. */
  nameLogo?: string
  /** Overrides the default height classes for `nameLogo`. */
  nameLogoHeight?: string
  /** Overrides the card's panel fill — pair with `cardDark` when it's dark enough to need light text. */
  cardBg?: string
  /** Extra background-image layer(s) (e.g. a subtle repeating-gradient grid) painted over
   * `cardBg`, for cards that want texture instead of a flat fill. */
  cardTexture?: string
  /** Switches the card's text/border colors to their light-on-dark equivalents. */
  cardDark?: boolean
  /** A looping muted video behind the entire card (under a dark scrim), instead of the demo
   * media area. Pair with `cardDark` (and usually a dark `cardBg` fallback for before it loads). */
  cardBgVideo?: string
  /** A static image behind the entire card (under a dark scrim) — the still-image equivalent of
   * `cardBgVideo`. Pair with `cardDark` and a dark `cardBg` fallback. */
  cardBgImage?: string
  /** Scrim darkness (0-100) over `cardBgVideo`/`cardBgImage`, default 60. Busier backgrounds need
   * a higher value to keep text legible. */
  cardScrim?: number
  /** A light-colored variant of `logo`, used instead when `cardDark` is set. */
  logoDark?: string
  /** The logo traced in ASCII, shown on the ship's green screens in place of the image. Set in
   *  VT323, whose characters are 0.4em wide. */
  ascii?: string
}

/** DartERP's mark traced at 72 columns: its strokes as characters, its bowls left open. */
const DARTERP_ASCII = `
                                                     .+#%%%#*-
*#######**+-.                                       =@@@%#%@@@#.
%@@%****#%@@@#-                                    :@@%.    +@@#
%@@+      .=%@@*                                   =@@+      @@@
%@@+        :@@@=                                  =@@+      @@@
%@@+         *@@%++++++++++++++++++++++++++++++++++#@@%******@@@********
%@@+         *@@@%%%%%@@@@@@@@@@@@@@@@@@@@@####%@@@@@@@@@@@@@@@@@@@@@@@%
%@@+         %@@*     #@@-.....%@@:....=@@%     .#@@*
%@@+        *@@@:     #@@-     %@@.    =@@%      +@@%
%@@*::::-=*%@@#:      #@@-     %@@.    =@@%....:=@@@-
%@@@@@@@@@@#+:        #@@-     %@@.    =@@@@@@@@@%*:
:::::::::.            *##:     -==     =@@%:::#@@#
                                       =@@%   .#@@#
                                       =@@%    .#@@#.
                                       =%%#     .#%%#.
`.slice(1, -1)

/** FortLotto's wordmark traced at 96 columns. */
const FORTLOTTO_ASCII = `
%%%%%%%%#                            .::   :##%%=                    .:.      .::
@@@@@@@@*                          #@@@+   -@@@@=                 :%@@@-    *@@@%
@@@@%+++:   .:---:           ..    %@@@*:: -@@@@=       :---:     -@@@@=:.  #@@@%::     :---:
@@@@%::.  :#@@@@@@%-  +%@@*=@@@%.:@@@@@@@@ -@@@@=     +%@@@@@@+. #@@@@@@@=:@@@@@@@@  .*@@@@@@%=
@@@@@@@% .%@@@%*@@@@= +@@@@#@@@@+:*%@@@%#% -@@@@=    #@@@@+%@@@# =#@@@@%#=.*%@@@@#%  %@@@%+@@@@=
@@@@@@@% =@@@@=.@@@@% +@@@@ %%%%+  %@@@+   -@@@@=   .@@@@# #@@@@: :@@@@-    #@@@%   -@@@@+ @@@@%
@@@@%::. =@@@@=.@@@@@ +@@@@        %@@@+   -@@@@=   :@@@@# #@@@@: :@@@@-    #@@@%   -@@@@+ @@@@@
@@@@%    :@@@@*-@@@@* +@@@@        #@@@%--.-@@@@%*** %@@@%.#@@@@. .@@@@#--  *@@@@=-..@@@@#:@@@@*
@@@@%     +@@@@@@@@#. +@@@@        :@@@@@@=-@@@@@@@% -@@@@@@@@@-   +@@@@@@  .%@@@@@+ =@@@@@@@@%.
%%#*=      :+*###*-   :----         .-=+==::#***+++=  .=*###*=.     :=++=-    -=+==:  :+*###*=
`.slice(1, -1)

/** DeadLotto's wordmark traced at 110 columns. */
const DEADLOTTO_ASCII = `
=***=::==:    -***+:.:=*-      :**+ .****.:-=-.    .****=       :+==#%#*-  -*=-****:::-***+-+*. .-:-=+##*=.
:@@@=   :#@*: .@@@*    -+     =@@@=  *@@@    =@%=   *@@@.      *@:   -%@@%::.  %@@*    @@@+  -:#*      :#@@*.
 @@@=    .%@@- @@@#----:    :+ @@@-  +@@@     =@@%. +@@@      *@@.    .%@@%    %@@+    %@@+  .%@:        +@@@:
 @@@=     +@@% @@@+  -*=   =+ .@@@-  +@@@      @@@+ +@@@      %@@*     :@@@:   %@@+    %@@+  *@@-         *@@#
 @@@=     +@@@ @@@+      .*#---@@@-  +@@@      @@@+ +@@@      =@@@+     #@%    %@@+    %@@+  *@@%         :@@%
 @@@=     %@@+ @@@+     :%@-  .@@@-  +@@@     -@@%. +@@@       -%@@#:  .%*.    %@@+    %@@+  .%@@#        .@@-
.@@@=   .*@%-  @@@#.  .+@@@   -@@@=  *@@@    -%@*.  *@@@    :=#+ :=**+--.      %@@*    @@@*   .#@@%-      +%-
=###+::=+=.   =############-  *###* .####::-+=-    .*###***#####*-            -####.  -####.    :=*%%+=---:
`.slice(1, -1)

/** Die Or Die's wordmark traced at 96 columns: the black faces of its letters, without the blocks. */
const DIEORDIE_ASCII = `
+%*=-.      :+:       .-*#:            ::         ::.           *#*=:       =+:        .:=*#=
-@@+#@#=    -@%    :+%%+-           :+%%%%*=   .*%%%%#+-        +@@+%@*-    +@%     :=#%*=:
:@%  :%@*   -@%    *@*             #@#-  +@@:  .@@:  -%@+       -@@  :%@+   +@%     %@+
:@%   %@*   -@%    *@#+%+          #@+   =@@:  .@@=-*@#=.       -@@   %@+   +@%     %@#+#%
:@@-  %@*   -@%    *@#-            #@+   =@@:  .@@#@%-          -@@:  %@+   +@%     %@#-.
:@@+ -@@+   -@%    *@*  .-+        #@#. :#@%.  .@@::#@+.        -@@= -%@=   +@%     %@+   -=-
.=#%%@*:    :#%    *@#*%#+-        .=#@%%*:    .@@:  -#%-       .*@%%%+.    -%%     %@#+##+-.
    -.        .    -#+:                :        ..     --          --         :     =#+:.
`.slice(1, -1)

/** PiRail's logo traced at 72 columns: the rail, the name, and the signal running off it. */
const PIRAIL_ASCII = `
      .-------------.
     =-             -=   :::::-:.   .:-:..:::::-:.               **  +*
     =:             :=   #@#****%%-  :-:.-@%*****%%=             --  #@
      =--         --=    #@:     #@: -+. -@+      #@-   =+*+=:   +=  #@
        .=-.   .-=.      #@:     #@: *@. -@+      #@: .%%-::#@-  @%  #@
           =- :=         #@+===+#@=  *@. -@%****#%%-   ..:::=@+  @%  #@
           := -:         #@+====-.   *@. -@*:::=@#    :#@*++*@+  @%  #@
           := -:         #@:         *@. -@+    -@#.  *@-   +@+  @%  #@
           := -:         #@:         *@. -@+     :%%. =@#-=**@#- @%  #@
           := -:         :-.         :-  .-:      .-:  :===. :=- --  --
           := -:                                   -
           := -:                                   #.
           := -:                                  :-=
           := -:                                  =.=
       ..:-=   =-:..      ..::.   -:      ==   =  = =        ==  .-.
:-----::.         .::-----:.  .-.=.:-    -..=.=:: = :-      =. =:- :-.::
                                :.  :-  -:   :  +:-  =.-- .-.  .:    .
                                      :-        -*   -:  -:
                                                 =   ..::
`.slice(1, -1)

/** FieldLogger's mark (an F whose top bar runs into a backwards L) and wordmark, traced at 110 columns. */
const FIELDLOGGER_ASCII = `
*@@@@@@@@@@@@@%.
%@*.........=@@:                            ..        ..
%@+         -@@:     .%%%%%%%%:+@*          @@+      -@@.:%%=
%@+         -@@:     .@@*::::: .=:    ..    @@+    . -@@.:@@=        ...      ..        ..       ...       ..
%@@%%%%%%%. -@@:     .@@*====- *@# :*@%%@#: @@+ =%@@@%@@.:@@=     .+%@@@%+  +%@@@%@# -#@@@%@@: +%@%@%= =@@%@@=
%@*.......  -@@:     .@@%***** *@#.@@*--*@% @@+-@@-..+@@.:@@=     %@#. :%@#+@%: .*@#:@@=. =@@:*@%=-=%@==@@: .
%@+         -@@:     .@@+      *@#:@@*===+= @@+-@@:  =@@.:@@=     %@#  .#@#=@%-.:#@#.@@+..=@@:#@%===+=:=@@
%@+         -@@:     .@@+      *@# -#@##%%. @@+ +%@%@%@@.:@@@@@@@*.*@@%@%*. =#%@%%@# :*%@%#@@:.*%%##@= =@@
%@+  =++++++*@@:      ..       ...    .:.   ..    ... ..  ........   .:.    =-..-%@+ :+:.:+@%.   .:.    ..
-=:  ==========                                                            .+#%@%#=  =#%@%#+.
`.slice(1, -1)

/** The B2W API hexagon traced at 72 columns: its edge, the inner outline, and the API lettering. */
const B2WAPI_ASCII = `
                              :-=++++++=-:
                      .:-=+++===--------===++++-:.
               .-=++++===-----:          .-----===++++=-:
        .-=++++===-----.                        .:----===++++=-.
 :-=++++===----:.                                      .:----===++++=-:
@-=-----:.                                                    .:-----=-%
@ =                                                                  = %
@ =          -%@@@@@@@@@@@@@@@%=  @@@@@@@@@@@@@@@@@%: .@@@%          = %
@ =          *@@@#*********#@@@%  @@@@#*********%@@@+ .@@@%          = %
@ =          *@@@*=========+@@@%  @@@@+=========#@@@+ .@@@%          = %
@ =          *@@@@@@@@@@@@@@@@@%  @@@@@@@@@@@@@@@@@@= .@@@%          = %
@ =          *@@@+---------+@@@%  @@@@=------------.  .@@@%          = %
@ =          *@@@:         :@@@%  @@@@.               .@@@%          = %
@ =          *%%%:         :%%%#  %%%%.               .%%%#          = %
@ =                                                                  = %
@-------.                                                      .:----=:%
.:-++++===-----:.                                       :-----===++++=:.
        :-=+++===-----:.                         :-----===++++-:.
              .:-=++++===----:.          .:-----===++++-:.
                      .-=++++===--------===++++=-:
                             .:-++++++++=:.
`.slice(1, -1)

export const projects: ProjectData[] = [
  {
    name: 'FieldLogger',
    mediaRatio: 1280 / 800,
    glyph: 'FL',
    logo: '/logos/project_logos/fieldLogger.svg',
    ascii: FIELDLOGGER_ASCII,
    tag: 'Desktop App',
    pitch: "A one-click activity logger for implementation consultants that turns the day's calls and walkthroughs into copy-ready notes.",
    tint: 'hsl(24, 90%, 52%)',
    stack: 'Electron · Preact · JavaScript · Google Calendar (iCal)',
    desc: "A Windows desktop app for implementation consultants: log every call, email, and walkthrough in one click (or drag it out on the calendar), track each client's implementations against their milestones, and turn the day into copy-ready note lines for time entries. It suggests unlogged meetings from Google Calendar, keeps everything on your own computer with automatic backups, and updates itself from a shared team folder.",
    vidLabel: 'Demo — FieldLogger',
    repo: 'https://github.com/GetBirned/FieldLogger',
    video: '/videos/fieldlogger.webm',
    screenshots: [
      '/screenshots/fieldlogger/01-log.webp',
      '/screenshots/fieldlogger/02-client.webp',
      '/screenshots/fieldlogger/03-notes.webp',
      '/screenshots/fieldlogger/04-dark.webp',
    ],
  },
  {
    name: 'B2W API Help Guide',
    mediaRatio: 1280 / 800,
    glyph: 'API',
    logo: '/logos/project_logos/b2wApi.png',
    ascii: B2WAPI_ASCII,
    tag: 'Developer Guide',
    pitch: "The help guide for B2W's three cloud APIs, with an error decoder, a request builder, and a token inspector.",
    tint: 'hsl(205, 100%, 32%)',
    stack: 'HTML · CSS · JavaScript · Python · Postman',
    desc: "The guide at b2w-api.com for B2W's three cloud APIs (Ops, Estimate, and Management Reporting), used by customers, partners, and B2W Support. Each guide answers questions like “How do I generate a Bearer Token?” with step-by-step walkthroughs and Postman, PowerShell, cURL, and raw HTTP examples. Its tools run entirely in the browser: an environment checker, an error decoder that names the likely cause, a request builder, and a token inspector.",
    vidLabel: 'Demo — B2W API Help Guide',
    repo: 'https://github.com/GetBirned/B2WAPIHelpPage',
    url: 'https://www.b2w-api.com',
    video: '/videos/b2w-api.webm',
    screenshots: [
      '/screenshots/b2w-api/01-guide.webp',
      '/screenshots/b2w-api/02-decoder.webp',
      '/screenshots/b2w-api/03-builder.webp',
      '/screenshots/b2w-api/04-reporting.webp',
    ],
  },
  {
    name: 'DartERP',
    ascii: DARTERP_ASCII,
    mediaRatio: 1280 / 844,
    glyph: 'DE',
    logo: '/logos/project_logos/dartERP_logo.png',
    tag: 'Desktop ERP',
    pitch: 'A manufacturing ERP with serialized, audit-trailed tracking, built end to end in C# and .NET 8.',
    tint: 'hsl(42, 65%, 45%)',
    // The app's own tan/gold accent color (sampled from its logo), as the card's dominant tone.
    cardBg: 'oklch(0.83 0.046 87)',
    // A faint blueprint/graph-paper grid — fits an engineering tool better than a flat fill.
    cardTexture:
      'repeating-linear-gradient(0deg, oklch(0.3 0.02 87 / 0.08) 0px, oklch(0.3 0.02 87 / 0.08) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, oklch(0.3 0.02 87 / 0.08) 0px, oklch(0.3 0.02 87 / 0.08) 1px, transparent 1px, transparent 28px)',
    stack: 'C# · .NET 8 · WinForms · SQL Server',
    desc: 'A desktop manufacturing ERP built for a fictional firearms manufacturer: inventory, purchase orders, work orders, and serialized finished-goods tracking with full audit trails, built to show professional .NET application architecture end to end.',
    vidLabel: 'Demo — DartERP',
    repo: 'https://github.com/GetBirned/DartERP',
    video: '/videos/darterp.webm',
    screenshots: [
      '/screenshots/darterp/01-dashboard.webp',
      '/screenshots/darterp/03-customers.webp',
      '/screenshots/darterp/04-inventory.webp',
    ],
  },
  {
    name: 'DeadLotto',
    mediaRatio: 1280 / 852,
    glyph: 'DL',
    logo: '/logos/project_logos/deadLotto_logo.png',
    nameLogo: '/logos/project_logos/deadLottoWordmark.png',
    ascii: DEADLOTTO_ASCII,
    tag: 'Companion App',
    pitch: 'Real-time multiplayer strat-roulette for Deadlock, with lobbies, achievements, and leaderboards.',
    tint: 'hsl(38, 65%, 45%)',
    stack: 'React · Express · Socket.IO · PostgreSQL',
    desc: "A strat-roulette companion for Valve's Deadlock. Spin or draft a random hero, take on a random challenge, and see if your team can pull off the run, with real-time multiplayer lobbies, achievements, and leaderboards.",
    vidLabel: 'Demo — DeadLotto',
    repo: 'https://github.com/GetBirned/DeadLotto',
    url: 'https://www.deadlotto.com',
    video: '/videos/deadlotto.webm',
    screenshots: [
      '/screenshots/deadlotto/01-lobby.webp',
      '/screenshots/deadlotto/02-spin.webp',
      '/screenshots/deadlotto/03-ingame.webp',
    ],
    cardBg: 'oklch(0.16 0.02 60 / 0.95)',
    cardDark: true,
  },
  {
    name: 'FortLotto',
    mediaRatio: 1280 / 720,
    glyph: 'FL',
    logo: '/logos/project_logos/FortLottoBlack.png',
    logoDark: '/logos/project_logos/FortLottoWhite.png',
    nameLogo: '/logos/project_logos/fortLottoWordmark.png',
    ascii: FORTLOTTO_ASCII,
    tag: 'Web Game',
    pitch: 'Strat-roulette for Fortnite squads: random drops, random challenges, and a running scoreboard.',
    tint: 'oklch(0.58 0.19 275)',
    stack: 'HTML5 · CSS3 · JavaScript · LocalStorage',
    desc: 'A strat-roulette companion for Fortnite squads, with randomized drop locations, unique challenges, and session-long win/loss tracking.',
    vidLabel: 'Demo — FortLotto',
    repo: 'https://github.com/GetBirned/FortLotto',
    url: 'https://getbirned.github.io/FortLotto/index.html',
    cardBgVideo: '/videos/fortlotto.webm',
    cardBg: 'oklch(0.15 0.03 250 / 0.96)',
    cardDark: true,
    video: '/videos/fortlotto-demo.webm',
    screenshots: [
      '/screenshots/fortlotto/01-setup.webp',
      '/screenshots/fortlotto/02-results.webp',
      '/screenshots/fortlotto/03-about.webp',
    ],
  },
  {
    name: 'Die Or Die',
    mediaRatio: 1280 / 720,
    glyph: 'DD',
    logo: '/logos/project_logos/dieordie.png',
    nameLogo: '/logos/project_logos/dieOrDieWordmark.png',
    ascii: DIEORDIE_ASCII,
    nameLogoHeight: 'h-10 sm:h-14 lg:h-[72px] xl:h-20',
    tag: 'Deck-Builder',
    pitch: 'A rogue-like deck-builder where you build a bag of physics-based dice and roll poker hands.',
    tint: 'hsl(0, 65%, 45%)',
    stack: 'Godot · GDScript · Shader · UI/UX',
    desc: 'A rogue-like deck-builder featuring physics-based dice mechanics and poker-hand inspired multipliers and abilities. Build up a dice bag, roll wisely, and defeat the likes of King Chess.',
    vidLabel: 'Demo — Die Or Die',
    repo: 'https://github.com/GetBirned/Die-Or-Die',
    video: '/videos/dieordie/menu.webm',
    screenshots: ['/videos/dieordie/map.webm', '/videos/dieordie/basicroll.webm', '/videos/dieordie/bigroll.webm'],
    cardBgImage: '/screenshots/dieordie/board-games-bg.webp',
    cardBg: 'oklch(0.19 0.05 24 / 0.96)',
    cardDark: true,
    // The asset is pre-desaturated/darkened (see raw-media/dieordie) so the collage reads as
    // texture; a plain black scrim alone left the source's red "DIE OR DIE" banner legible
    // behind the footer, where it looked like a duplicate title.
    cardScrim: 72,
  },
  {
    name: 'PiRail',
    mediaRatio: 1600 / 1000,
    glyph: 'PR',
    logo: '/logos/project_logos/pirailBlack.png',
    logoDark: '/logos/project_logos/pirailLight.png',
    ascii: PIRAIL_ASCII,
    tag: 'Senior Capstone',
    pitch: 'Waze, but for railroads: a live track-inspection map fed by GPS, IMU, and LIDAR on a Raspberry Pi.',
    tint: 'hsl(0, 65%, 45%)',
    stack: 'React · JavaScript · Python · OpenStreetMap · GPS / GIS',
    desc: "UNH senior capstone for PiRail, a low-cost railroad track-inspection platform running on a Raspberry Pi with GPS, IMU, and LIDAR sensors. Our five-person team replaced a legacy jQuery interface with a mobile-first React app: a live map plotting the train's position, reportable points of interest (“Waze, but for railroads”), and a simulator that replays recorded runs so the UI can be tested without riding a train.",
    vidLabel: 'Demo — PiRail',
    repo: 'https://github.com/cpn18/track-chart',
    screenshots: [
      '/screenshots/pirail/01-app.webp',
      '/screenshots/pirail/02-team.webp',
      '/screenshots/pirail/03-architecture.webp',
      '/screenshots/pirail/04-testbed.webp',
    ],
    cardBgImage: '/screenshots/pirail/map-bg.webp',
    cardBg: 'oklch(0.16 0.015 250 / 0.96)',
    cardDark: true,
    cardScrim: 78,
  },
]
