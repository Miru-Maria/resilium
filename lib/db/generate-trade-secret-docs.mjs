import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType, PageBreak,
} from "docx";
import { writeFileSync } from "fs";

const TODAY = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
const TODAY_RO = new Date().toLocaleDateString("ro-RO", { year: "numeric", month: "long", day: "numeric" });

const COMPANY = "Resilium SRL";
const CONTACT = "contact_resilium@pm.me";

function h(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 240, after: 120 },
  });
}

function p(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Calibri" })],
    spacing: { before: 80, after: 80 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function li(text) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 22, font: "Calibri" })],
    spacing: { before: 60, after: 60 },
    indent: { left: 360 },
  });
}

function bold(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, font: "Calibri" })],
    spacing: { before: 80, after: 40 },
  });
}

function divider() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D97706" } },
    spacing: { before: 120, after: 120 },
    text: "",
  });
}

// ─── ENGLISH VERSION ───────────────────────────────────────────────────────

const englishDoc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 22 },
      },
    },
  },
  sections: [{
    properties: {},
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: "TRADE SECRET CLASSIFICATION NOTICE", bold: true, size: 36, font: "Calibri", color: "D97706" }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Resilience Methodology — Proprietary & Confidential", italics: true, size: 24, font: "Calibri", color: "555555" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `${COMPANY}  ·  ${TODAY}`, size: 20, font: "Calibri", color: "888888" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      }),
      divider(),

      h("1. Purpose of This Document"),
      p("This document establishes the formal trade secret classification of the Resilium resilience methodology and all associated intellectual property. It is intended to create a written record of proprietary ownership for internal use, legal protection, and enforcement purposes in accordance with the Romanian Law no. 11/1991 on unfair competition, the EU Trade Secrets Directive (2016/943/EU), and the US Defend Trade Secrets Act (DTSA)."),

      h("2. Owner & Operator"),
      p(`The intellectual property described herein is owned and operated exclusively by ${COMPANY}, a Romanian limited liability company (Societate cu Răspundere Limitată) registered in Romania.`),
      p(`Contact: ${CONTACT}`),

      h("3. Classification of Proprietary Assets"),
      p("The following elements are classified as proprietary trade secrets and confidential intellectual property:"),

      h("3.1 Resilience Scoring Algorithm", HeadingLevel.HEADING_2),
      li("The multi-dimensional scoring methodology that produces a weighted composite resilience score across six life dimensions: Financial, Health, Skills, Mobility, Psychological, and Resources."),
      li("The specific weighting matrix applied to each dimension based on household composition, location, income stability, and stated risk priorities."),
      li("The normalization and benchmarking logic that positions individual scores within population distributions."),
      li("The Social Capital overlay dimension and its integration into the composite score."),

      h("3.2 Six-Dimension Assessment Framework", HeadingLevel.HEADING_2),
      li("The specific question sequence, branching logic, and adaptive follow-up questions within the full resilience assessment (13+ step flow)."),
      li("The Mental Resilience sub-assessment (MR questionnaire) and its integration with the six primary dimensions."),
      li("The mapping of assessment responses to vulnerability categories and priority tiers."),

      h("3.3 AI-Powered Action Plan Generation", HeadingLevel.HEADING_2),
      li("The prompt engineering, system instruction design, and structured output schema used to generate personalized resilience action plans via large language model APIs."),
      li("The logic for translating raw scores into prioritized, area-specific, household-contextualized checklists."),
      li("The daily habits generation framework and its linkage to dimension scores and stated goals."),

      h("3.4 Scenario Stress-Test Methodology", HeadingLevel.HEADING_2),
      li("The AI-driven scenario simulation logic (e.g., 'sudden job loss', 'natural disaster', 'medical emergency') and how vulnerability gaps are identified from the user's existing resilience profile."),
      li("The structured scenario output format: impact analysis, immediate actions, recovery pathway."),

      h("3.5 Checklist Framework & Content", HeadingLevel.HEADING_2),
      li("The curated checklist item library organized by resilience area, priority tier (Critical, High, Medium, Low), and household context."),
      li("The checklist item selection and ranking algorithm based on score gaps and stated goals."),

      h("3.6 Brand & Product Identity", HeadingLevel.HEADING_2),
      li("The 'Resilium' brand name, logo, visual design language, and platform user interface."),
      li("The 'Know Your Readiness. Build Your Resilience.' tagline and associated marketing copy."),
      li("The Neural Canvas animated background and unique visual identity elements."),

      h("4. Confidentiality Obligations"),
      p("All employees, contractors, advisors, and third parties who have access to any of the proprietary assets described in Section 3 are bound by confidentiality obligations. Unauthorized disclosure, reproduction, reverse engineering, or use of these trade secrets for competitive purposes constitutes a violation of applicable trade secret law and unfair competition regulations."),
      p("Access to these assets must be granted on a strict need-to-know basis and must be revoked immediately upon termination of any professional relationship with the operator."),

      h("5. Notice of Rights"),
      p(`© ${new Date().getFullYear()} ${COMPANY}. All rights reserved.`),
      p("This methodology, platform, and all associated intellectual property are protected under:"),
      li("Romanian Law no. 8/1996 on copyright and related rights"),
      li("EU Trade Secrets Directive (2016/943/EU), transposed into Romanian law via Law no. 11/1991"),
      li("US Defend Trade Secrets Act (DTSA), 18 U.S.C. § 1836 et seq."),
      li("EU Database Directive (96/9/EC) — the checklist and methodology database qualifies for sui generis database rights"),

      h("6. Document Control"),
      p("This document should be reviewed and updated annually or whenever a material change is made to the methodology or technology. Copies should be stored securely and not distributed outside the organization without legal counsel review."),
      p(`Document version: 1.0  ·  Effective date: ${TODAY}  ·  Next review: ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString("en-US", { year: "numeric", month: "long" })}`),

      divider(),
      new Paragraph({
        children: [new TextRun({ text: `${COMPANY}  ·  Confidential  ·  Not for Distribution`, size: 18, font: "Calibri", color: "AAAAAA", italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 160 },
      }),
    ],
  }],
});

// ─── ROMANIAN VERSION ───────────────────────────────────────────────────────

const romanianDoc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 22 },
      },
    },
  },
  sections: [{
    properties: {},
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: "NOTIFICARE DE CLASIFICARE SECRET COMERCIAL", bold: true, size: 36, font: "Calibri", color: "D97706" }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Metodologia de Reziliență — Proprietar & Confidențial", italics: true, size: 24, font: "Calibri", color: "555555" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `${COMPANY}  ·  ${TODAY_RO}`, size: 20, font: "Calibri", color: "888888" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      }),
      divider(),

      h("1. Scopul Acestui Document"),
      p("Acest document stabilește clasificarea formală ca secret comercial a metodologiei de reziliență Resilium și a întregii proprietăți intelectuale asociate. Este destinat creării unui registru scris al proprietății în scopuri interne, de protecție juridică și de aplicare, în conformitate cu Legea nr. 11/1991 privind combaterea concurenței neloiale, Directiva UE privind secretele comerciale (2016/943/UE) și Legea americană privind apărarea secretelor comerciale (DTSA)."),

      h("2. Proprietar & Operator"),
      p(`Proprietatea intelectuală descrisă în prezentul document este deținută și operată exclusiv de ${COMPANY}, o societate cu răspundere limitată înregistrată în România.`),
      p(`Contact: ${CONTACT}`),

      h("3. Clasificarea Activelor Proprietare"),
      p("Următoarele elemente sunt clasificate ca secrete comerciale proprietare și proprietate intelectuală confidențială:"),

      h("3.1 Algoritmul de Scorare a Rezilienței", HeadingLevel.HEADING_2),
      li("Metodologia de scorare multidimensională care produce un scor compozit ponderat al rezilienței pe șase dimensiuni ale vieții: Financiar, Sănătate, Competențe, Mobilitate, Psihologic și Resurse."),
      li("Matricea de ponderare specifică aplicată fiecărei dimensiuni în funcție de componența gospodăriei, locație, stabilitate financiară și priorități de risc declarate."),
      li("Logica de normalizare și benchmarking care poziționează scorurile individuale în distribuțiile populației."),
      li("Dimensiunea suplimentară Capital Social și integrarea sa în scorul compozit."),

      h("3.2 Cadrul de Evaluare pe Șase Dimensiuni", HeadingLevel.HEADING_2),
      li("Secvența specifică de întrebări, logica de ramificare și întrebările adaptive de urmărire din evaluarea completă a rezilienței (flux de 13+ pași)."),
      li("Sub-evaluarea Rezilienței Mentale (chestionar MR) și integrarea sa cu cele șase dimensiuni primare."),
      li("Maparea răspunsurilor la evaluare pe categorii de vulnerabilitate și niveluri de prioritate."),

      h("3.3 Generarea Planului de Acțiune prin Inteligență Artificială", HeadingLevel.HEADING_2),
      li("Ingineria prompt-urilor, designul instrucțiunilor de sistem și schema de ieșire structurată utilizată pentru generarea planurilor personalizate de acțiune pentru reziliență prin API-uri de modele lingvistice mari."),
      li("Logica pentru traducerea scorurilor brute în liste de verificare prioritizate, specifice pe arii, contextualizate pentru gospodărie."),
      li("Cadrul de generare a obiceiurilor zilnice și legătura sa cu scorurile pe dimensiuni și obiectivele declarate."),

      h("3.4 Metodologia de Testare la Stres prin Scenarii", HeadingLevel.HEADING_2),
      li("Logica de simulare a scenariilor bazată pe IA (ex.: 'pierderea bruscă a locului de muncă', 'dezastru natural', 'urgență medicală') și modul în care decalajele de vulnerabilitate sunt identificate din profilul de reziliență existent al utilizatorului."),
      li("Formatul structurat de ieșire pentru scenarii: analiză a impactului, acțiuni imediate, traiectorie de recuperare."),

      h("3.5 Cadrul și Conținutul Listei de Verificare", HeadingLevel.HEADING_2),
      li("Biblioteca curată de elemente din lista de verificare, organizată pe arie de reziliență, nivel de prioritate (Critic, Ridicat, Mediu, Scăzut) și context de gospodărie."),
      li("Algoritmul de selecție și clasare a elementelor din lista de verificare bazat pe lacunele de scor și obiectivele declarate."),

      h("3.6 Identitatea de Brand și Produs", HeadingLevel.HEADING_2),
      li("Denumirea de brand 'Resilium', logo-ul, limbajul de design vizual și interfața utilizator a platformei."),
      li("Tagline-ul 'Know Your Readiness. Build Your Resilience.' și materialele de marketing asociate."),
      li("Fundalul animat Neural Canvas și elementele unice de identitate vizuală."),

      h("4. Obligații de Confidențialitate"),
      p("Toți angajații, contractorii, consilierii și terțele părți care au acces la oricare dintre activele proprietare descrise în Secțiunea 3 sunt obligați prin obligații de confidențialitate. Divulgarea neautorizată, reproducerea, ingineria inversă sau utilizarea acestor secrete comerciale în scopuri competitive constituie o încălcare a legislației aplicabile privind secretele comerciale și reglementările privind concurența neloială."),
      p("Accesul la aceste active trebuie acordat pe baza principiului strict al necesității de a cunoaște și trebuie revocat imediat la încheierea oricărei relații profesionale cu operatorul."),

      h("5. Notificare de Drepturi"),
      p(`© ${new Date().getFullYear()} ${COMPANY}. Toate drepturile rezervate.`),
      p("Această metodologie, platformă și toată proprietatea intelectuală asociată sunt protejate în temeiul:"),
      li("Legii nr. 8/1996 privind dreptul de autor și drepturile conexe (România)"),
      li("Directivei UE privind secretele comerciale (2016/943/UE), transpusă în dreptul român prin Legea nr. 11/1991"),
      li("Legii americane privind apărarea secretelor comerciale (DTSA), 18 U.S.C. § 1836 et seq."),
      li("Directivei UE privind bazele de date (96/9/CE) — baza de date a listei de verificare și a metodologiei beneficiază de drepturi sui generis"),

      h("6. Controlul Documentului"),
      p("Acest document trebuie revizuit și actualizat anual sau ori de câte ori se aduce o modificare materială metodologiei sau tehnologiei. Copiile trebuie stocate în siguranță și nu trebuie distribuite în afara organizației fără revizuirea consilierului juridic."),
      p(`Versiunea documentului: 1.0  ·  Data intrării în vigoare: ${TODAY_RO}  ·  Revizuire următoare: ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString("ro-RO", { year: "numeric", month: "long" })}`),

      divider(),
      new Paragraph({
        children: [new TextRun({ text: `${COMPANY}  ·  Confidențial  ·  Nu pentru Distribuție`, size: 18, font: "Calibri", color: "AAAAAA", italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 160 },
      }),
    ],
  }],
});

const engBuffer = await Packer.toBuffer(englishDoc);
writeFileSync("trade-secret-EN.docx", engBuffer);
console.log("✓ trade-secret-EN.docx created");

const roBuffer = await Packer.toBuffer(romanianDoc);
writeFileSync("trade-secret-RO.docx", roBuffer);
console.log("✓ trade-secret-RO.docx created");
