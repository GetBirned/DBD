/**
 * What MU/TH/UR knows about each skill on the skills card (keyed by its name in skills.ts): what
 * it is, the records on this site built with it, where it was used on the job, and older work on
 * GitHub that isn't a record here. Every line comes from the résumé, a project's stack, or its
 * repo, so keep it in step with them.
 */
export interface Dossier {
  /** What it is, in a line. */
  about: string
  /** Other names it answers to when typed in. */
  aliases?: string[]
  /** Project or client records built with it, by name — `SITE` for this site itself — each
   *  optionally with a note in place of the record's tag. */
  built?: (string | [name: string, note: string])[]
  /** Where it was used on the job: the post, and what it was used for there. */
  service?: [post: string, what: string][]
  /** Work on GitHub that isn't a record on this site. */
  archive?: [name: string, what: string, repo: string][]
  /** A reading taken live when it's asked about. */
  live?: 'github'
}

/** This site, among the records: it's the ship you're on, so it isn't a link. */
export const SITE = 'this site'

const IC = 'Trimble · Implementation Consultant'
const TSE = 'Trimble · Technical Support Engineer'
const AT = 'Account Tree · Development Intern'

const GH = 'https://github.com/GetBirned/'
const FUNH: [string, string, string] = ['FUN-H', 'UNH dining-hall ordering app, on Flask', `${GH}FUN-H`]
const DARTBOT: [string, string, string] = ['DartBot', 'a chat bot made to sound like me', `${GH}DartBot`]

export const DOSSIERS: Record<string, Dossier> = {
  // Languages
  'C#': {
    about: "Microsoft's statically typed language for .NET: desktop apps, services, and games.",
    aliases: ['csharp', 'c sharp', 'cs'],
    built: ['DartERP'],
    service: [[TSE, 'C# and SQL defects across the B2W suite']],
  },
  Python: {
    about: 'A general-purpose language for scripting, data work, and back ends.',
    aliases: ['py'],
    built: ['PiRail', ['B2W API Help Guide', 'the build that bundles the guide into one page']],
    archive: [FUNH],
  },
  Java: {
    about: "The JVM's object-oriented language, and the classic language of Android.",
    archive: [['BulletZone', 'multiplayer arena shooter for Android', `${GH}BulletZone`]],
  },
  C: {
    about: 'The low-level systems language underneath operating systems and firmware.',
  },
  SQL: {
    about: 'The language for querying and shaping relational databases.',
    built: ['DartERP'],
    service: [
      [IC, 'database build-out and data-integrity checks'],
      [TSE, 'root cause traced through SQL Server data'],
    ],
  },
  JavaScript: {
    about: 'The language of the browser, and through Node.js, of servers and desktop apps.',
    aliases: ['js', 'ecmascript'],
    built: ['FieldLogger', 'B2W API Help Guide', 'FortLotto', 'PiRail'],
    service: [[AT, 'features and fixes in a PHP/JavaScript platform']],
    archive: [DARTBOT],
  },
  TypeScript: {
    about: 'JavaScript with static types, checked before the code ever runs.',
    aliases: ['ts'],
    built: ['DeadLotto', SITE],
    archive: [['Boston Terrazzo', 'website for a terrazzo restoration company', `${GH}BostonTerrazzo`]],
  },
  PHP: {
    about: 'A server-side web language, and the engine underneath WordPress.',
    built: ['Account Tree'],
    service: [[AT, 'features and fixes in a PHP/JavaScript platform']],
  },
  GDScript: {
    about: "Godot's built-in scripting language, Python-like and made for game logic.",
    aliases: ['gd script'],
    built: ['Die Or Die'],
  },
  'HTML5 / CSS': {
    about: 'The structure and the styling of every page on the web.',
    aliases: ['html', 'html5', 'css', 'css3'],
    built: ['FortLotto', 'B2W API Help Guide', 'FieldLogger', SITE],
  },

  // Integrations
  'REST APIs': {
    about: 'Web services spoken over HTTP: resources, verbs, and JSON.',
    aliases: ['rest', 'rest api', 'api', 'apis'],
    built: [
      ['B2W API Help Guide', "the guide to B2W's three cloud APIs"],
      [SITE, 'the Spotify and Steam readings in the recreation log'],
    ],
    service: [[IC, 'telematics data feeds connected through REST APIs']],
  },
  'AEMP 2.0 · ISO 15143-3': {
    about: 'The telematics standard that puts machine hours, location, and fuel in one shared format.',
    aliases: ['aemp', 'aemp 2', 'aemp2', 'iso 15143', 'iso 15143-3', 'telematics'],
    service: [[IC, 'John Deere, Komatsu, and Samsara feeds into customer systems']],
  },
  'OAuth 2.0': {
    about: 'The standard for letting an app act for you without ever holding your password.',
    aliases: ['oauth', 'oauth2'],
    built: [[SITE, 'the Spotify listening history in the music log']],
  },
  Salesforce: {
    about: 'The CRM where customer cases are opened, worked, and closed.',
    aliases: ['sfdc'],
    service: [[TSE, '1,400+ cases through the full ticket lifecycle']],
  },
  Dialogflow: {
    about: "Google's platform for conversational agents and chat bots.",
    archive: [DARTBOT],
  },
  'Socket.IO': {
    about: 'Real-time, two-way messaging between the browser and the server.',
    aliases: ['socketio', 'socket io', 'websockets', 'websocket'],
    built: [['DeadLotto', 'live multiplayer lobbies']],
  },
  'OpenStreetMap / GIS': {
    about: 'Open map data, and the craft of putting data on a map.',
    aliases: ['openstreetmap', 'osm', 'gis', 'maps'],
    built: [['PiRail', "the train's live position on the map"]],
  },
  'GPS · IMU · LIDAR': {
    about: 'Satellite position, inertial motion, and laser ranging: a machine sensing where it is.',
    aliases: ['gps', 'imu', 'lidar', 'sensors'],
    built: [['PiRail', 'sensor telemetry from a Raspberry Pi on the rails']],
  },

  // Tools
  React: {
    about: 'A library for building interfaces out of components.',
    aliases: ['reactjs', 'react.js'],
    built: ['DeadLotto', 'PiRail', SITE],
  },
  '.NET 8': {
    about: "Microsoft's modern, cross-platform .NET.",
    aliases: ['.net', 'dotnet', 'net 8', 'dotnet 8', '.net core'],
    built: ['DartERP'],
  },
  '.NET Framework': {
    about: 'The original Windows .NET, still running much of the enterprise world.',
    aliases: ['net framework', 'dotnet framework'],
    service: [[IC, 'deploying B2W, built on .NET Framework and SQL Server']],
  },
  'Node.js': {
    about: 'JavaScript outside the browser: servers, tools, and desktop apps.',
    aliases: ['node', 'nodejs'],
    built: ['DeadLotto', 'FieldLogger', SITE],
  },
  Express: {
    about: 'A small, unopinionated web server for Node.js.',
    aliases: ['expressjs', 'express.js'],
    built: ['DeadLotto', SITE],
  },
  'Tailwind CSS': {
    about: 'Styling with utility classes, written right in the markup.',
    aliases: ['tailwind'],
    built: ['DeadLotto', SITE],
  },
  'Framer Motion': {
    about: 'Animation for React, from fades to springs.',
    aliases: ['framer', 'motion'],
    built: [[SITE, 'every screen switching on and off']],
  },
  Vite: {
    about: 'A fast dev server and build tool for the web.',
    aliases: ['vitejs'],
    built: ['DeadLotto', SITE],
  },
  IIS: {
    about: "Microsoft's web server for Windows.",
    aliases: ['internet information services'],
    service: [[TSE, 'IIS configuration across customer environments']],
  },
  Railway: {
    about: 'A cloud platform that deploys straight from a Git repository.',
    built: ['B2W API Help Guide', SITE],
  },
  'Raspberry Pi': {
    about: 'A credit-card-sized Linux computer.',
    aliases: ['pi', 'raspi', 'rpi'],
    built: [['PiRail', "the inspection rig's onboard computer"]],
  },
  Godot: {
    about: 'An open-source engine for 2D and 3D games.',
    aliases: ['godot engine'],
    built: ['Die Or Die'],
  },
  Git: {
    about: 'Version control: every change recorded, and any of them undoable.',
    built: [['PiRail', 'five people on one repository'], SITE],
  },
  GitHub: {
    about: 'Where the code lives, and where it gets shared and reviewed.',
    aliases: ['gh'],
    live: 'github',
  },
  'Visual Studio': {
    about: "Microsoft's IDE for .NET.",
    aliases: ['vs', 'visual studio 2022'],
    built: ['DartERP'],
  },
  JIRA: {
    about: "Atlassian's tracker for issues and defects.",
    service: [[TSE, 'defects tracked with Development and QA']],
  },
  'Agile / Scrum': {
    about: 'Short iterations, regular check-ins, and work planned in sprints.',
    aliases: ['agile', 'scrum', 'sprints'],
    built: [['PiRail', 'a five-person team across two semesters']],
    service: [[AT, 'working in an Agile cycle']],
  },
  'Defect lifecycle': {
    about: 'Taking a bug from report to reproduction, root cause, fix, and verification.',
    aliases: ['defects', 'bugs', 'qa'],
    service: [[TSE, 'reproduced, tracked, and verified fixes before release']],
  },
  'Root-cause analysis': {
    about: 'Finding why something failed, not only where.',
    aliases: ['rca', 'root cause', 'root cause analysis'],
    service: [[TSE, 'root cause isolated from logs and SQL Server data']],
  },
  'Requirements (BRDs)': {
    about: "Business requirements documents: what a system has to do, written down before it's built.",
    aliases: ['brd', 'brds', 'requirements'],
    service: [
      [AT, 'business requirements documents'],
      [IC, 'requirements capture for each deployment'],
    ],
  },

  // Databases
  'SQL Server': {
    about: "Microsoft's relational database.",
    aliases: ['mssql', 'ms sql', 'microsoft sql server', 'sqlserver'],
    built: ['DartERP'],
    service: [
      [IC, 'database build-out and data-integrity checks'],
      [TSE, 'administration, upgrades, and production issues'],
    ],
  },
  SSRS: {
    about: "SQL Server Reporting Services: Microsoft's report server.",
    aliases: ['reporting services'],
    service: [[TSE, 'SSRS configuration and reporting issues']],
  },
  SSMS: {
    about: 'SQL Server Management Studio, the console for SQL Server.',
    aliases: ['management studio'],
    service: [[TSE, 'database administration']],
  },
  PostgreSQL: {
    about: 'The open-source relational database.',
    aliases: ['postgres', 'pg', 'psql'],
    built: ['DeadLotto'],
  },
  MongoDB: {
    about: 'A database that keeps records as JSON-like documents.',
    aliases: ['mongo'],
    archive: [FUNH],
  },
}
