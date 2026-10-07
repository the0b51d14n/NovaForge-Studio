// Contenus du site. Tout est fictif (exercice pédagogique).

/* ---------- Services ---------- */
export type IconName = 'window' | 'bag' | 'pen' | 'code' | 'shield';

export type Service = {
  slug: string;
  icon: IconName;
  title: string;
  short: string;
  description: string;
  includes: string[];
  idealFor: string;
  tags: string[];
};

export const services: Service[] = [
  {
    slug: 'sites-vitrines',
    icon: 'window',
    title: 'Sites vitrines',
    short: 'Un site clair, rapide et à votre image pour présenter votre activité et être trouvé en ligne.',
    description:
      "Votre site est souvent le premier contact avec vos clients. Nous concevons des sites vitrines sur mesure, pensés pour votre métier : clairs, rapides, adaptés au mobile et faciles à mettre à jour.",
    includes: [
      'Maquettes personnalisées',
      'Design responsive : mobile, tablette, ordinateur',
      'Optimisation du référencement naturel',
      'Formulaire de contact',
      'Prise en main pour modifier vos contenus',
    ],
    idealFor: 'Artisans, commerces, professions libérales, associations',
    tags: ['Responsive', 'Référencement', 'Contenus'],
  },
  {
    slug: 'boutiques-en-ligne',
    icon: 'bag',
    title: 'Boutiques en ligne',
    short: 'Vendre en ligne simplement : catalogue, paiement sécurisé et suivi des commandes.',
    description:
      "Nous créons des boutiques en ligne simples à gérer au quotidien, pour vendre vos produits sans complexité technique : vous vous concentrez sur votre activité, la boutique suit.",
    includes: [
      'Catalogue produits et fiches détaillées',
      'Paiement en ligne sécurisé',
      'Gestion des stocks et des commandes',
      'Livraison ou retrait en boutique',
      'Tableau de bord des ventes',
    ],
    idealFor: 'Commerçants, créateurs, producteurs locaux',
    tags: ['E-commerce', 'Paiement', 'Catalogue'],
  },
  {
    slug: 'identite-visuelle',
    icon: 'pen',
    title: 'Identité visuelle',
    short: 'Logo, couleurs, typographies, charte : une image cohérente sur tous vos supports.',
    description:
      "Une identité forte rend votre entreprise reconnaissable au premier coup d'œil. Nous construisons avec vous un univers visuel cohérent, du logo jusqu'à vos supports de communication.",
    includes: [
      'Logo et ses déclinaisons',
      'Palette de couleurs et typographies',
      'Charte graphique',
      'Supports print et réseaux sociaux',
    ],
    idealFor: 'Entreprises en création, marques à moderniser',
    tags: ['Logo', 'Charte', 'Design'],
  },
  {
    slug: 'applications-sur-mesure',
    icon: 'code',
    title: 'Applications sur mesure',
    short: 'Des outils web taillés pour vos besoins : réservation, espace client, gestion interne…',
    description:
      "Quand les solutions toutes faites ne suffisent plus, nous développons des applications web adaptées à votre façon de travailler, simples à utiliser pour vos équipes comme pour vos clients.",
    includes: [
      'Analyse de vos besoins et de vos process',
      'Prise de rendez-vous, espace client, tableaux de bord',
      'Interfaces pensées pour vos utilisateurs',
      'Connexion à vos outils existants',
    ],
    idealFor: 'PME et jeunes entreprises aux besoins spécifiques',
    tags: ['Web app', 'Sur mesure'],
  },
  {
    slug: 'maintenance',
    icon: 'shield',
    title: 'Maintenance & suivi',
    short: 'Mises à jour, sécurité, évolutions : un accompagnement mensuel après la mise en ligne.',
    description:
      "Un site vit après son lancement. Avec notre formule de maintenance mensuelle, votre site reste à jour, sécurisé et continue d'évoluer avec votre activité.",
    includes: [
      'Mises à jour et sauvegardes régulières',
      'Surveillance de la sécurité',
      'Petites évolutions chaque mois',
      'Un interlocuteur joignable',
    ],
    idealFor: 'Tous nos clients après la mise en ligne',
    tags: ['Mensuel', 'Sécurité', 'Évolutions'],
  },
];

/* ---------- Méthode ---------- */
export type Step = { title: string; text: string; meta?: string };

export const method: Step[] = [
  { title: 'Premier rendez-vous', text: 'On écoute votre projet, vos objectifs et vos contraintes pour bien cadrer le besoin.' },
  { title: 'Conception', text: 'Arborescence, maquettes, identité : vous validez chaque étape avant le développement.' },
  { title: 'Développement', text: "Intégration et développement, avec des points réguliers pour suivre l'avancée." },
  { title: 'Mise en ligne', text: 'Tests, mise en production et prise en main : on vous rend les clés.' },
  { title: 'Suivi', text: 'Maintenance mensuelle et évolutions : on reste à vos côtés après le lancement.' },
];

/* ---------- Réalisations ---------- */
export type ProjectCategory = 'vitrine' | 'ecommerce' | 'identite' | 'application';

export const categories: { id: ProjectCategory; label: string }[] = [
  { id: 'vitrine', label: 'Site vitrine' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'identite', label: 'Identité visuelle' },
  { id: 'application', label: 'Application' },
];

export type Project = {
  name: string;
  activity: string;
  category: ProjectCategory;
  year: number;
  summary: string;
  services: string[];
  domain: string;
  mockTitle: string;
  shape: 'circle' | 'arch' | 'stripes' | 'grid' | 'wave' | 'blocks';
  palette: { bg: string; fg: string; accent: string };
  testimonial?: { quote: string; author: string };
};

export const projects: Project[] = [
  {
    name: 'Maison Delcourt',
    activity: 'Boulangerie artisanale · Lille',
    category: 'vitrine',
    year: 2025,
    summary: 'Un site vitrine chaleureux avec la carte, les horaires et la commande de gâteaux pour les événements.',
    services: ['Site vitrine', 'Maintenance'],
    domain: 'maison-delcourt.fr',
    mockTitle: 'Le bon pain, depuis 1987',
    shape: 'arch',
    palette: { bg: '#f6efe3', fg: '#3b2516', accent: '#c8752a' },
    testimonial: {
      quote: 'Un seul interlocuteur du début à la fin et des retours rapides : notre site était en ligne en quelques semaines.',
      author: 'Claire D., gérante',
    },
  },
  {
    name: 'Rayon Vert',
    activity: 'Atelier vélo · Lille',
    category: 'ecommerce',
    year: 2025,
    summary: "Une boutique en ligne de pièces détachées, avec réservation des créneaux d'entretien à l'atelier.",
    services: ['Boutique en ligne', 'Réservation'],
    domain: 'rayonvert-atelier.fr',
    mockTitle: 'Roulez mieux, roulez local',
    shape: 'circle',
    palette: { bg: '#0f2b1d', fg: '#e9f5ec', accent: '#7bdc5a' },
    testimonial: {
      quote: "Ils ont pris le temps de comprendre notre métier avant de proposer quoi que ce soit. Les ventes en ligne ont vite décollé.",
      author: 'Thomas L., fondateur',
    },
  },
  {
    name: 'Kiné Vieux-Lille',
    activity: 'Cabinet de kinésithérapie',
    category: 'application',
    year: 2026,
    summary: 'Une application de prise de rendez-vous en ligne, connectée au planning des praticiens.',
    services: ['Application sur mesure', 'Maintenance'],
    domain: 'kine-vieux-lille.fr',
    mockTitle: 'Prenez rendez-vous en 2 clics',
    shape: 'grid',
    palette: { bg: '#eef6fb', fg: '#0e2f4a', accent: '#2f9bd6' },
    testimonial: {
      quote: 'La maintenance mensuelle nous enlève une vraie épine du pied : on sait qui appeler, et ça avance.',
      author: 'Sarah M., kinésithérapeute',
    },
  },
  {
    name: 'Brasserie des Trois Beffrois',
    activity: 'Brasserie artisanale · Roubaix',
    category: 'identite',
    year: 2025,
    summary: "Une nouvelle identité visuelle, des étiquettes de bières jusqu'au site web de la brasserie.",
    services: ['Identité visuelle', 'Site vitrine'],
    domain: 'trois-beffrois.fr',
    mockTitle: 'Brassée dans le Nord',
    shape: 'stripes',
    palette: { bg: '#1d1a2b', fg: '#f3e9d2', accent: '#e8b23a' },
  },
  {
    name: 'Lumen Énergie',
    activity: 'Jeune entreprise · énergie solaire',
    category: 'application',
    year: 2026,
    summary: "Un site et un simulateur d'économies d'énergie pour présenter l'offre et générer des demandes de devis.",
    services: ['Site vitrine', 'Application sur mesure'],
    domain: 'lumen-energie.fr',
    mockTitle: 'Votre toit, votre énergie',
    shape: 'wave',
    palette: { bg: '#0b1020', fg: '#f5f7ff', accent: '#ffcf3f' },
  },
  {
    name: 'Atelier Nord Archi',
    activity: "Cabinet d'architecture · Lille",
    category: 'vitrine',
    year: 2024,
    summary: 'Un site portfolio épuré pour mettre en valeur les projets du cabinet et ses réalisations.',
    services: ['Site vitrine', 'Identité visuelle'],
    domain: 'atelier-nord-archi.fr',
    mockTitle: "Construire l'essentiel",
    shape: 'blocks',
    palette: { bg: '#ecebe8', fg: '#141414', accent: '#ff4d2e' },
  },
];

/* ---------- Recrutement ---------- */
// Contenus communs du recrutement (les offres elles-mêmes sont dans `openings`)
export const job = {
  missions: [
    { title: 'Design', text: "Participer aux maquettes et à l'identité visuelle des projets clients." },
    { title: 'Développement', text: 'Intégrer et développer sites vitrines, boutiques en ligne et applications sur mesure.' },
    { title: 'Échanges clients', text: 'Assister aux rendez-vous, comprendre les besoins réels et présenter votre travail.' },
    { title: 'Gestion de projet', text: "Suivre l'avancée des projets, du premier rendez-vous jusqu'à la mise en ligne." },
  ],
  traits: [
    { title: 'Créatif', text: 'Vous aimez proposer des idées, en design comme en code, et soigner les détails.' },
    { title: 'Autonome', text: "Vous savez avancer par vous-même… et demander de l'aide quand il le faut." },
    { title: 'Curieux', text: 'Vous voulez comprendre, tester, apprendre vite et découvrir de nouveaux outils.' },
  ],
  reasons: [
    {
      title: 'Touchez à tout',
      quote:
        'Dans une grande entreprise, un junior peut être limité à une seule tâche. Chez nous, vous pourrez toucher au design, au développement, aux échanges clients et à la gestion de projet.',
    },
    {
      title: 'Apprenez plus vite',
      quote: 'En un an chez nous, vous verrez plus de types de projets que beaucoup de juniors en trois ans dans un grand groupe.',
    },
    {
      title: 'Construisez avec nous',
      quote: 'Vous ne rejoignez pas une structure figée : vous participez à sa construction. Votre place grandira avec l’agence.',
    },
    {
      title: 'Prenez des responsabilités',
      quote:
        'En étant le premier recruté, vous grandissez avec la structure. Si l’agence se développe, vous serez naturellement en position de prendre des responsabilités.',
    },
  ],
  facts: [
    { value: '2 ans', label: 'de carnet de commandes stable' },
    { value: 'Mensuel', label: 'des clients en maintenance qui assurent un revenu régulier' },
    { value: 'Quotidien', label: 'un point avec le fondateur, joignable à tout moment' },
  ],
  pay: [
    { label: 'Alternance', value: 'Grille légale', detail: '+ prime éventuelle sur projet', featured: false },
    {
      label: 'CDI junior',
      value: '~ 30 000 €',
      detail: 'brut / an · marge selon profil et portfolio · révision prévue après 6 mois',
      featured: true,
    },
  ],
  perks: [
    { label: 'Télétravail', value: "Jusqu'à 3 jours / semaine" },
    { label: 'Matériel', value: 'Ordinateur portable fourni' },
    { label: 'Formation', value: 'Budget annuel pour formations en ligne et événements tech' },
    { label: 'Tickets resto', value: 'Oui' },
    { label: 'Transport', value: "50 % de l'abonnement pris en charge" },
    { label: 'Lieu', value: 'Espace de coworking à Lille' },
  ],
  steps: [
    { title: 'Candidature', text: 'CV + portfolio ou GitHub.', meta: 'Durée · —' },
    { title: 'Échange découverte', text: 'Appel visio avec le fondateur.', meta: 'Durée · 20 min' },
    { title: 'Mini cas pratique', text: 'Maquetter ou intégrer une page simple.', meta: 'Durée · 2–3 h à la maison' },
    { title: 'Entretien final', text: 'Présentation du cas pratique + discussion.', meta: 'Durée · 45 min' },
    { title: 'Réponse', text: 'Un retour à tous les candidats.', meta: 'Délai · sous 1 semaine' },
  ] as Step[],
  faq: [
    {
      q: 'Je vais être seul la plupart du temps ?',
      a: 'Non. Un point quotidien est prévu avec le fondateur, qui reste joignable à tout moment. Les partenaires interviennent aussi régulièrement sur les projets.',
    },
    {
      q: "Et si l'agence n'a plus assez de clients ?",
      a: 'La structure a un carnet de commandes stable depuis 2 ans, avec des clients en maintenance mensuelle qui assurent un revenu régulier. Le recrutement répond justement à une hausse de la demande.',
    },
    {
      q: "Je n'ai pas toutes les compétences demandées.",
      a: "Ce n'est pas un problème. Nous recrutons d'abord une personnalité curieuse et motivée. Les compétences techniques s'acquièrent sur le terrain, avec un accompagnement.",
    },
    {
      q: "Pourquoi choisir vous plutôt qu'une grande entreprise ?",
      a: 'Pour la variété des projets, les responsabilités rapides et la possibilité de vraiment peser dans les décisions. Ici, votre travail se voit directement.',
    },
    {
      q: 'Le salaire est-il négociable ?',
      a: "En CDI, une marge existe selon le profil et le portfolio. Une révision est prévue après 6 mois en fonction de l'évolution.",
    },
  ],
};

/* ---------- Offres d'emploi (une page est générée par offre) ---------- */
export type Opening = {
  slug: string;
  title: string;
  team: string;
  contracts: string[];
  location: string;
  remote: string;
  experience: string;
  salary: string;
  start: string;
  published: string;
  summary: string;
  intro: string[];
  skills: { must: string[]; nice: string[] };
};

export const openings: Opening[] = [
  {
    slug: 'developpeur-web-junior',
    title: 'Développeur web junior (H/F)',
    team: 'Développement & design',
    contracts: ['Alternance', 'CDI'],
    location: 'Lille · coworking',
    remote: "Jusqu'à 3 jours / semaine",
    experience: 'Junior · débutant accepté',
    salary: 'Alternance : grille légale · CDI : ~ 30 000 € brut / an',
    start: 'Dès que possible',
    published: '2026-10-01',
    summary: "Le premier salarié d'un freelance qui fait grandir sa boîte : design, développement, clients et gestion de projet.",
    intro: [
      "NovaForge Studio, c'est l'activité d'un développeur freelance devenue trop grande pour une seule personne. La demande augmente : il recrute aujourd'hui son premier développeur web junior pour transformer son activité solo en une vraie agence.",
      "Nous cherchons quelqu'un de créatif, autonome et curieux, qui a envie d'apprendre vite et de prendre de vraies responsabilités. Vous travaillerez directement avec le fondateur sur des projets variés pour des TPE, des PME et des jeunes entreprises.",
    ],
    skills: {
      must: [
        'Des bases en HTML, CSS et JavaScript',
        'Des projets à montrer : portfolio ou GitHub',
        'Le goût du travail soigné et du détail',
        "L'envie d'échanger avec des clients",
      ],
      nice: [
        'Un framework front (React, Vue, Astro…)',
        'Git et le travail en équipe',
        'Des notions de design ou de Figma',
        'Un CMS comme WordPress',
      ],
    },
  },
];

/* ---------- Avantages & vie au studio ---------- */
export type BenefitIcon = 'home' | 'laptop' | 'book' | 'food' | 'train' | 'building' | 'gift' | 'growth';

export const benefits: { icon: BenefitIcon; title: string; text: string }[] = [
  { icon: 'home', title: 'Télétravail', text: "Jusqu'à 3 jours par semaine, organisés avec l'équipe." },
  { icon: 'laptop', title: 'Matériel fourni', text: 'Un ordinateur portable pour travailler dans de bonnes conditions.' },
  { icon: 'book', title: 'Budget formation', text: 'Un budget annuel pour des formations en ligne et des événements tech.' },
  { icon: 'food', title: 'Tickets restaurant', text: 'Pour vos pauses déjeuner, au coworking ou ailleurs.' },
  { icon: 'train', title: 'Transport', text: '50 % de votre abonnement de transport pris en charge.' },
  { icon: 'building', title: 'Coworking à Lille', text: 'Un espace de travail partagé, au cœur de la ville.' },
  { icon: 'gift', title: 'Prime sur projet', text: 'En alternance, une prime éventuelle selon les projets.' },
  { icon: 'growth', title: 'Évolution', text: "Révision prévue après 6 mois et des responsabilités qui grandissent avec l'agence." },
];

export const dayInLife = [
  { time: '9 h 30', title: 'Point quotidien', text: 'Un échange avec le fondateur pour fixer les priorités du jour.' },
  { time: '10 h', title: 'Conception & code', text: 'Maquettes, intégration, développement : vous avancez sur vos projets.' },
  { time: '14 h', title: 'Rendez-vous client', text: 'En visio ou sur place, pour présenter une maquette ou recueillir un besoin.' },
  { time: '16 h', title: 'Veille & apprentissage', text: 'Tester un outil, suivre une formation, partager une découverte.' },
  { time: '17 h 30', title: 'Mise en ligne', text: 'Tests, retours, déploiement : votre travail se voit directement.' },
];

/* ---------- FAQ clients ---------- */
export const clientFaq = [
  {
    q: 'Combien coûte un site ?',
    a: 'Chaque projet est différent. Après un premier rendez-vous, nous vous remettons un devis gratuit et détaillé, adapté à vos besoins et à votre budget.',
  },
  {
    q: 'Combien de temps faut-il pour créer mon site ?',
    a: 'Cela dépend de la taille du projet : un site vitrine prend généralement quelques semaines. Nous fixons ensemble un planning clair dès le départ.',
  },
  {
    q: 'Pourrai-je modifier mon site moi-même ?',
    a: 'Oui. À la mise en ligne, nous vous montrons comment modifier vos textes et vos images en toute autonomie.',
  },
  {
    q: 'Que se passe-t-il après la mise en ligne ?',
    a: 'Nous proposons une maintenance mensuelle : mises à jour, sécurité, sauvegardes et petites évolutions. Vous gardez un interlocuteur joignable.',
  },
];
