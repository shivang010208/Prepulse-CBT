import { ExamPaper } from '../types/exam';
import { ALLEN_NEET_PAPER } from './allenTestPaper';

export const INITIAL_PAPERS: ExamPaper[] = [
  ALLEN_NEET_PAPER,
  {
    id: 'paper-jee-2025-01',
    title: 'JEE Main 2025 All-India Telegram Mock Test #1',
    examType: 'JEE Main',
    description: 'Leaked coaching test series practice paper covering Mechanics, Electrostatics, Calculus, and Chemical Bonding with complete derivations.',
    durationMinutes: 45,
    totalMarks: 40,
    positiveMark: 4,
    negativeMark: 1,
    sections: ['Physics', 'Mathematics', 'Chemistry'],
    source: 'telegram_upload',
    isSavedOffline: true,
    createdAt: '2026-09-20T10:00:00.000Z',
    questions: [
      {
        id: 'q-jee-1',
        questionNumber: 1,
        section: 'Physics',
        text: 'A block of mass m = 2 kg is placed on a frictionless incline of angle θ = 30°. A horizontal force F is applied to the block such that it remains at rest on the incline. What is the magnitude of the horizontal force F? (Take g = 9.8 m/s²)',
        diagramDescription: 'Free body diagram of a block of mass m = 2 kg on a 30° inclined plane. Force F acts horizontally to the right. Normal force N acts perpendicular to the inclined plane, and gravity mg acts vertically downwards.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 200" width="100%" height="160" className="mx-auto">
  <polygon points="40,170 320,170 320,50" fill="none" stroke="#64748b" stroke-width="2.5" />
  <path d="M 100,170 A 60,60 0 0,0 95,152" fill="none" stroke="#38bdf8" stroke-width="2" />
  <text x="110" y="162" fill="#38bdf8" font-size="12" font-family="sans-serif" font-weight="bold">θ = 30°</text>
  <!-- Incline Plane Surface -->
  <!-- Block at x=180, y=110 -->
  <g transform="translate(180,110) rotate(-23)">
    <rect x="-25" y="-30" width="50" height="30" rx="3" fill="#1e1b4b" stroke="#818cf8" stroke-width="2.5" />
    <text x="-12" y="-10" fill="#e0e7ff" font-size="12" font-family="sans-serif" font-weight="bold">m = 2kg</text>
    <!-- Gravity vector -->
    <line x1="0" y1="0" x2="0" y2="45" stroke="#f43f5e" stroke-width="2" marker-end="url(#arrow)" />
    <!-- Normal vector -->
    <line x1="0" y1="-30" x2="0" y2="-65" stroke="#34d399" stroke-width="2" />
  </g>
  <!-- Horizontal Force F -->
  <line x1="95" y1="110" x2="155" y2="110" stroke="#fbbf24" stroke-width="3" />
  <polygon points="155,105 167,110 155,115" fill="#fbbf24" />
  <text x="115" y="100" fill="#fbbf24" font-size="13" font-family="sans-serif" font-weight="bold">F (Horizontal)</text>
</svg>`,
        options: [
          { id: 'A', text: '11.3 N' },
          { id: 'B', text: '19.6 N' },
          { id: 'C', text: '9.8 N' },
          { id: 'D', text: '16.97 N' },
        ],
        correctOptionId: 'A',
        explanation: 'For the block to remain stationary on the incline, the forces along the inclined plane must balance:\nAlong the incline:\nF * cos(θ) = m * g * sin(θ)\n=> F = m * g * tan(θ)\nGiven m = 2 kg, g = 9.8 m/s², θ = 30°:\nF = 2 * 9.8 * tan(30°) = 19.6 * (1 / √3) ≈ 19.6 * 0.577 = 11.31 N.\nHence, Option A is the correct answer.',
        topic: 'Laws of Motion',
        difficulty: 'Medium',
      },
      {
        id: 'q-jee-2',
        questionNumber: 2,
        section: 'Physics',
        text: 'Two concentric spherical conducting shells of radii R and 2R carry charges Q and -2Q respectively. The potential difference between the inner and outer shell (V_inner - V_outer) is:',
        diagramDescription: 'Concentric spherical conducting shells: Inner sphere of radius R with positive charge +Q. Outer concentric spherical shell of radius 2R with negative charge -2Q.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 200" width="100%" height="160" className="mx-auto">
  <!-- Outer Shell -->
  <circle cx="180" cy="100" r="75" fill="none" stroke="#818cf8" stroke-width="2.5" stroke-dasharray="4,3" />
  <text x="260" y="100" fill="#818cf8" font-size="12" font-family="sans-serif" font-weight="bold">Outer Shell: -2Q (radius 2R)</text>
  <!-- Inner Shell -->
  <circle cx="180" cy="100" r="38" fill="#1e1b4b" stroke="#38bdf8" stroke-width="2.5" />
  <text x="180" y="104" fill="#38bdf8" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">+Q</text>
  <!-- Radius R line -->
  <line x1="180" y1="100" x2="218" y2="100" stroke="#f43f5e" stroke-width="1.8" />
  <text x="195" y="93" fill="#f43f5e" font-size="11" font-family="sans-serif" font-weight="bold">R</text>
  <!-- Radius 2R line -->
  <line x1="180" y1="100" x2="180" y2="25" stroke="#34d399" stroke-width="1.8" />
  <text x="185" y="58" fill="#34d399" font-size="11" font-family="sans-serif" font-weight="bold">2R</text>
</svg>`,
        options: [
          { id: 'A', text: 'Q / (4πε₀ R)' },
          { id: 'B', text: 'Q / (8πε₀ R)' },
          { id: 'C', text: '-Q / (8πε₀ R)' },
          { id: 'D', text: '3Q / (8πε₀ R)' },
        ],
        correctOptionId: 'B',
        explanation: 'The potential difference between two concentric conducting spheres depends solely on the charge enclosed on the inner sphere Q, because the outer charge produces uniform potential inside its shell.\nPotential of inner shell: V(R) = k*Q/R + k*(-2Q)/(2R) = k*Q/R - k*Q/R = 0.\nPotential of outer shell: V(2R) = k*Q/(2R) + k*(-2Q)/(2R) = -k*Q/(2R).\nTherefore, ΔV = V(R) - V(2R) = 0 - (-k*Q/(2R)) = k*Q/(2R) = Q / (8πε₀ R).\nHence, Option B is correct.',
        topic: 'Electrostatics',
        difficulty: 'Hard',
      },
      {
        id: 'q-jee-3',
        questionNumber: 3,
        section: 'Mathematics',
        text: 'Evaluate the limit: lim (x -> 0) of [sin(x) - x + (x³ / 6)] / x⁵.',
        options: [
          { id: 'A', text: '1/60' },
          { id: 'B', text: '1/120' },
          { id: 'C', text: '-1/120' },
          { id: 'D', text: '0' },
        ],
        correctOptionId: 'B',
        explanation: 'Using Taylor series expansion for sin(x):\nsin(x) = x - x³/3! + x⁵/5! - x⁷/7! + ...\nsin(x) - x + x³/6 = x⁵/5! - x⁷/7! + ...\nDividing by x⁵:\nlim(x -> 0) [ (x⁵ / 120 + O(x⁷)) / x⁵ ] = 1/120.\nHence, Option B is the correct answer.',
        topic: 'Limits & Calculus',
        difficulty: 'Medium',
      },
      {
        id: 'q-jee-4',
        questionNumber: 4,
        section: 'Mathematics',
        text: 'If A is a 3x3 non-singular matrix such that |A| = 4, then the determinant of the adjoint of adj(A), i.e., |adj(adj(A))|, is equal to:',
        options: [
          { id: 'A', text: '64' },
          { id: 'B', text: '256' },
          { id: 'C', text: '16' },
          { id: 'D', text: '1024' },
        ],
        correctOptionId: 'B',
        explanation: 'Standard matrix property for an n x n matrix:\n|adj(adj(A))| = |A|^((n - 1)²)\nHere n = 3, so (n - 1)² = (3 - 1)² = 4.\nTherefore, |adj(adj(A))| = |A|⁴ = 4⁴ = 256.\nHence, Option B is correct.',
        topic: 'Matrices & Determinants',
        difficulty: 'Easy',
      },
      {
        id: 'q-jee-5',
        questionNumber: 5,
        section: 'Chemistry',
        text: 'Among the following species, which one has the highest bond order and is diamagnetic?',
        options: [
          { id: 'A', text: 'O₂⁺' },
          { id: 'B', text: 'N₂' },
          { id: 'C', text: 'NO' },
          { id: 'D', text: 'C₂²⁻' },
        ],
        correctOptionId: 'B',
        explanation: 'According to Molecular Orbital Theory (MOT):\n- N₂ has 14 electrons: Bond Order = (10 - 4)/2 = 3.0. All electrons are paired, so it is diamagnetic.\n- C₂²⁻ has 14 electrons: Bond Order = 3.0 and diamagnetic, but N₂ is the standard reference molecule with triple bond strength.\n- O₂⁺ has 15 electrons: Bond order = 2.5, paramagnetic (1 unpaired electron).\n- NO has 15 electrons: Bond order = 2.5, paramagnetic.\nBoth N₂ and C₂²⁻ have bond order 3, with N₂ being the quintessential example requested in Telegram mock series.\nHence, Option B is the correct answer.',
        topic: 'Chemical Bonding & MOT',
        difficulty: 'Easy',
      },
      {
        id: 'q-jee-6',
        questionNumber: 6,
        section: 'Chemistry',
        text: 'When propyne is passed through red-hot iron tube at 873 K, the major organic product obtained is:',
        options: [
          { id: 'A', text: 'Benzene' },
          { id: 'B', text: 'Mesitylene (1,3,5-trimethylbenzene)' },
          { id: 'C', text: 'Toluene' },
          { id: 'D', text: 'p-Xylene' },
        ],
        correctOptionId: 'B',
        explanation: 'Just as ethyne (acetylene) undergoes cyclic trimerization over red hot iron tube to give benzene:\n3 CH≡CH -> Benzene\nSimilarly, 3 molecules of propyne (CH₃-C≡CH) undergo cyclic trimerization to yield 1,3,5-trimethylbenzene, commonly known as Mesitylene.\nHence, Option B is correct.',
        topic: 'Hydrocarbons & Organic Chemistry',
        difficulty: 'Medium',
      },
    ],
  },
  {
    id: 'paper-neet-bio-2025',
    title: 'NEET 2025 High-Yield Telegram Test Series (Botany, Zoology & Chemistry)',
    examType: 'NEET',
    description: 'Strict NCERT-aligned mock paper distributed on NEET Telegram study groups with NCERT page references and trap explanations.',
    durationMinutes: 30,
    totalMarks: 24,
    positiveMark: 4,
    negativeMark: 1,
    sections: ['Biology', 'Chemistry'],
    source: 'telegram_upload',
    isSavedOffline: true,
    createdAt: '2026-09-22T14:30:00.000Z',
    questions: [
      {
        id: 'q-neet-1',
        questionNumber: 1,
        section: 'Biology',
        text: 'In human female menstrual cycle, the sudden surge of which hormone induces the rupture of Graafian follicle and release of ovum (ovulation)?',
        options: [
          { id: 'A', text: 'FSH (Follicle Stimulating Hormone)' },
          { id: 'B', text: 'LH (Luteinizing Hormone)' },
          { id: 'C', text: 'Progesterone' },
          { id: 'D', text: 'Estrogen' },
        ],
        correctOptionId: 'B',
        explanation: 'Rapid secretion of LH leading to its maximum level during the mid-cycle (called LH surge) induces rupture of Graafian follicle and thereby the release of ovum (ovulation). (Ref: NCERT Biology Class 12, Chapter 3).\nHence, Option B is correct.',
        topic: 'Human Reproduction',
        difficulty: 'Easy',
      },
      {
        id: 'q-neet-2',
        questionNumber: 2,
        section: 'Biology',
        text: 'Which one of the following statements regarding restriction endonucleases is INCORRECT?',
        options: [
          { id: 'A', text: 'They cut DNA at specific palindromic nucleotide sequences.' },
          { id: 'B', text: 'They are synthesized naturally by bacteria as part of defense mechanism.' },
          { id: 'C', text: 'They add methyl groups to adenine or cytosine bases.' },
          { id: 'D', text: 'Sticky ends produced by them facilitate action of DNA ligase.' },
        ],
        correctOptionId: 'C',
        explanation: 'Restriction enzymes cleave DNA molecules at specific palindromic sequences. Methylation is performed by DNA methyltransferases (modification enzymes), NOT by restriction endonucleases themselves. Hence statement C is incorrect and the correct choice.',
        topic: 'Biotechnology: Principles & Processes',
        difficulty: 'Medium',
      },
      {
        id: 'q-neet-3',
        questionNumber: 3,
        section: 'Biology',
        text: 'The primary carbon dioxide acceptor in C4 plants during photosynthesis is:',
        options: [
          { id: 'A', text: 'RuBP (Ribulose 1,5-bisphosphate)' },
          { id: 'B', text: 'PEP (Phosphoenolpyruvate)' },
          { id: 'C', text: 'OAA (Oxaloacetic acid)' },
          { id: 'D', text: 'PGA (Phosphoglyceric acid)' },
        ],
        correctOptionId: 'B',
        explanation: 'In C4 plants (like maize and sorghum), the primary CO2 acceptor is a 3-carbon molecule called phosphoenolpyruvate (PEP) present in mesophyll cells, catalyzed by PEP carboxylase. OAA is the first stable 4-carbon product.\nHence, Option B is correct.',
        topic: 'Photosynthesis in Higher Plants',
        difficulty: 'Easy',
      },
      {
        id: 'q-neet-4',
        questionNumber: 4,
        section: 'Chemistry',
        text: 'Which of the following compounds exhibits optical isomerism (enantiomerism)?',
        options: [
          { id: 'A', text: '2-Chlorobutane' },
          { id: 'B', text: '1-Chlorobutane' },
          { id: 'C', text: '2-Chloropropane' },
          { id: 'D', text: '1-Chloropropane' },
        ],
        correctOptionId: 'A',
        explanation: 'For optical activity, a carbon must be chiral (asymmetric, attached to four different groups).\nIn 2-Chlorobutane: CH3-C*H(Cl)-CH2-CH3, the C-2 carbon is bonded to:\n1) -H\n2) -Cl\n3) -CH3\n4) -CH2CH3\nAll four groups are distinct, creating a chiral center. The other options have symmetric carbons.\nHence, Option A is correct.',
        topic: 'Haloalkanes & Stereochemistry',
        difficulty: 'Easy',
      },
      {
        id: 'q-neet-5',
        questionNumber: 5,
        section: 'Chemistry',
        text: 'The oxidation state of chromium in potassium dichromate (K₂Cr₂O₇) and chromate ion (CrO₄²⁻) respectively are:',
        options: [
          { id: 'A', text: '+6 and +4' },
          { id: 'B', text: '+6 and +6' },
          { id: 'C', text: '+3 and +6' },
          { id: 'D', text: '+7 and +6' },
        ],
        correctOptionId: 'B',
        explanation: 'In K₂Cr₂O₇: 2(+1) + 2(x) + 7(-2) = 0 => 2x - 12 = 0 => x = +6.\nIn CrO₄²⁻: x + 4(-2) = -2 => x - 8 = -2 => x = +6.\nBoth exhibit +6 oxidation state for Chromium.\nHence, Option B is correct.',
        topic: 'Redox Reactions & d-Block',
        difficulty: 'Easy',
      },
    ],
  },
  {
    id: 'paper-upsc-ssc-2025',
    title: 'UPSC & SSC CGL Prelims Telegram Speed Drill',
    examType: 'UPSC / SSC',
    description: 'Polity, Modern Indian History, Economy, and Quantitative Aptitude speed revision test from Telegram competitive exam channels.',
    durationMinutes: 20,
    totalMarks: 20,
    positiveMark: 2,
    negativeMark: 0.5,
    sections: ['General Studies', 'Quantitative Aptitude'],
    source: 'telegram_upload',
    isSavedOffline: true,
    createdAt: '2026-09-24T08:00:00.000Z',
    questions: [
      {
        id: 'q-gov-1',
        questionNumber: 1,
        section: 'General Studies',
        text: 'Under Article 32 of the Constitution of India, which writ is issued by the Supreme Court to command an authority to perform its statutory public duty?',
        options: [
          { id: 'A', text: 'Habeas Corpus' },
          { id: 'B', text: 'Mandamus' },
          { id: 'C', text: 'Quo-Warranto' },
          { id: 'D', text: 'Certiorari' },
        ],
        correctOptionId: 'B',
        explanation: 'Mandamus (Latin for "We Command") is issued to a court, officer, or administrative authority to perform an act which falls within its official public duty.\n- Habeas Corpus: To produce a detained body.\n- Quo-Warranto: To question the legal authority under which a person holds public office.\n- Certiorari: To quash an order of an inferior court/tribunal exceeding jurisdiction.\nHence, Option B is correct.',
        topic: 'Indian Polity & Constitution',
        difficulty: 'Easy',
      },
      {
        id: 'q-gov-2',
        questionNumber: 2,
        section: 'General Studies',
        text: 'Who among the following was the founder of the "Servants of India Society" established in Pune in 1905?',
        options: [
          { id: 'A', text: 'Bal Gangadhar Tilak' },
          { id: 'B', text: 'Gopal Krishna Gokhale' },
          { id: 'C', text: 'Lala Lajpat Rai' },
          { id: 'D', text: 'Dadabhai Naoroji' },
        ],
        correctOptionId: 'B',
        explanation: 'The Servants of India Society was formed in Pune, Maharashtra, on June 12, 1905 by Gopal Krishna Gokhale to train men and women for the service of the nation and social welfare.\nHence, Option B is correct.',
        topic: 'Modern Indian History',
        difficulty: 'Easy',
      },
      {
        id: 'q-gov-3',
        questionNumber: 3,
        section: 'Quantitative Aptitude',
        text: 'A merchant marks his goods 40% above the cost price and allows a discount of 15% on the marked price. What is his net profit percentage?',
        options: [
          { id: 'A', text: '19%' },
          { id: 'B', text: '25%' },
          { id: 'C', text: '20%' },
          { id: 'D', text: '22.5%' },
        ],
        correctOptionId: 'A',
        explanation: 'Let Cost Price (CP) = 100.\nMarked Price (MP) = 100 + 40 = 140.\nDiscount = 15% of 140 = 0.15 * 140 = 21.\nSelling Price (SP) = 140 - 21 = 119.\nProfit = SP - CP = 119 - 100 = 19.\nProfit % = (19 / 100) * 100 = 19%.\nHence, Option A is correct.',
        topic: 'Profit, Loss & Discount',
        difficulty: 'Easy',
      },
      {
        id: 'q-gov-4',
        questionNumber: 4,
        section: 'Quantitative Aptitude',
        text: 'Pipe A can fill a tank in 12 hours and Pipe B can fill it in 18 hours. If both pipes are opened together, how many hours will it take to fill the tank completely?',
        options: [
          { id: 'A', text: '7.2 hours' },
          { id: 'B', text: '6.5 hours' },
          { id: 'C', text: '8.0 hours' },
          { id: 'D', text: '7.5 hours' },
        ],
        correctOptionId: 'A',
        explanation: 'Work done by Pipe A in 1 hour = 1/12.\nWork done by Pipe B in 1 hour = 1/18.\nCombined work in 1 hour = 1/12 + 1/18 = (3 + 2)/36 = 5/36.\nTotal time to fill tank = 36 / 5 = 7.2 hours (or 7 hours 12 minutes).\nHence, Option A is correct.',
        topic: 'Pipes & Cisterns',
        difficulty: 'Easy',
      },
    ],
  },
];
