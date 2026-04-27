"use strict";

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle,
} = require("./node_modules/docx");
const fs = require("fs");
const path = require("path");

const NOW = new Date();
const YEAR = NOW.getFullYear().toString();
const TODAY_EN = NOW.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
const TODAY_RO = NOW.toLocaleDateString("ro-RO", { year: "numeric", month: "long", day: "numeric" });
const NEXT_YEAR_EN = new Date(NOW.getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long" });
const NEXT_YEAR_RO = new Date(NOW.getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("ro-RO", { year: "numeric", month: "long" });

const COMPANY = "Resilium SRL";
const CONTACT = "contact_resilium@pm.me";

function heading(text, level) {
  return new Paragraph({
    text,
    heading: level || HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 100 },
  });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Calibri" })],
    spacing: { before: 80, after: 80 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text: "\u2022  " + text, size: 22, font: "Calibri" })],
    spacing: { before: 60, after: 60 },
    indent: { left: 400 },
  });
}

function rule() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D97706" } },
    spacing: { before: 160, after: 160 },
  });
}

function center(text, opts) {
  const run = Object.assign({ text, font: "Calibri" }, opts || {});
  return new Paragraph({
    children: [new TextRun(run)],
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 60 },
  });
}

// ─── ENGLISH ─────────────────────────────────────────────────────────────────

const englishSections = [
  center("TRADE SECRET CLASSIFICATION NOTICE", { bold: true, size: 36, color: "D97706" }),
  center("Resilience Methodology \u2014 Proprietary & Confidential", { italics: true, size: 24, color: "555555" }),
  center(COMPANY + "  \u00b7  " + TODAY_EN, { size: 20, color: "888888" }),
  new Paragraph({ spacing: { before: 120 } }),
  rule(),

  heading("1. Purpose of This Document"),
  body("This document establishes the formal trade secret classification of the Resilium resilience methodology and all associated intellectual property. It is intended to create a written record of proprietary ownership for internal use, legal protection, and enforcement purposes in accordance with Romanian Law no. 11/1991 on unfair competition, the EU Trade Secrets Directive (2016/943/EU), and the US Defend Trade Secrets Act (DTSA)."),

  heading("2. Owner & Operator"),
  body("The intellectual property described herein is owned and operated exclusively by " + COMPANY + ", a Romanian limited liability company (Societate cu R\u0103spundere Limitat\u0103) registered in Romania."),
  body("Contact: " + CONTACT),

  heading("3. Classification of Proprietary Assets"),
  body("The following elements are classified as proprietary trade secrets and confidential intellectual property:"),

  heading("3.1  Resilience Scoring Algorithm", HeadingLevel.HEADING_2),
  bullet("The multi-dimensional scoring methodology producing a weighted composite resilience score across six life dimensions: Financial, Health, Skills, Mobility, Psychological, and Resources."),
  bullet("The specific weighting matrix applied to each dimension based on household composition, location, income stability, and stated risk priorities."),
  bullet("The normalization and benchmarking logic that positions individual scores within population distributions."),
  bullet("The Social Capital overlay dimension and its integration into the composite score."),

  heading("3.2  Six-Dimension Assessment Framework", HeadingLevel.HEADING_2),
  bullet("The specific question sequence, branching logic, and adaptive follow-up questions within the full resilience assessment (13+ step flow)."),
  bullet("The Mental Resilience sub-assessment (MR questionnaire) and its integration with the six primary dimensions."),
  bullet("The mapping of assessment responses to vulnerability categories and priority tiers."),

  heading("3.3  AI-Powered Action Plan Generation", HeadingLevel.HEADING_2),
  bullet("The prompt engineering, system instruction design, and structured output schema used to generate personalised resilience action plans via large language model APIs."),
  bullet("The logic for translating raw scores into prioritised, area-specific, household-contextualised checklists."),
  bullet("The daily habits generation framework and its linkage to dimension scores and stated goals."),

  heading("3.4  Scenario Stress-Test Methodology", HeadingLevel.HEADING_2),
  bullet("The AI-driven scenario simulation logic (e.g. \u2018sudden job loss\u2019, \u2018natural disaster\u2019, \u2018medical emergency\u2019) and how vulnerability gaps are identified from the user\u2019s existing resilience profile."),
  bullet("The structured scenario output format: impact analysis, immediate actions, recovery pathway."),

  heading("3.5  Checklist Framework & Content", HeadingLevel.HEADING_2),
  bullet("The curated checklist item library organised by resilience area, priority tier (Critical, High, Medium, Low), and household context."),
  bullet("The checklist item selection and ranking algorithm based on score gaps and stated goals."),

  heading("3.6  Brand & Product Identity", HeadingLevel.HEADING_2),
  bullet("The \u2018Resilium\u2019 brand name, logo, visual design language, and platform user interface."),
  bullet("The \u2018Know Your Readiness. Build Your Resilience.\u2019 tagline and associated marketing copy."),
  bullet("The Neural Canvas animated background and unique visual identity elements."),

  heading("4. Confidentiality Obligations"),
  body("All employees, contractors, advisors, and third parties who have access to any of the proprietary assets described in Section 3 are bound by confidentiality obligations. Unauthorised disclosure, reproduction, reverse engineering, or use of these trade secrets for competitive purposes constitutes a violation of applicable trade secret law and unfair competition regulations."),
  body("Access must be granted on a strict need-to-know basis and revoked immediately upon termination of any professional relationship with the operator."),

  heading("5. Notice of Rights"),
  body("\u00a9 " + YEAR + " " + COMPANY + ". All rights reserved."),
  body("This methodology, platform, and all associated intellectual property are protected under:"),
  bullet("Romanian Law no. 8/1996 on copyright and related rights"),
  bullet("EU Trade Secrets Directive (2016/943/EU), transposed into Romanian law via Law no. 11/1991"),
  bullet("US Defend Trade Secrets Act (DTSA), 18 U.S.C. \u00a7 1836 et seq."),
  bullet("EU Database Directive (96/9/EC) \u2014 the checklist and methodology database qualifies for sui generis database rights"),

  heading("6. Document Control"),
  body("This document should be reviewed and updated annually or whenever a material change is made to the methodology or technology. Copies should be stored securely and not distributed outside the organisation without legal counsel review."),
  body("Document version: 1.0  \u00b7  Effective date: " + TODAY_EN + "  \u00b7  Next review: " + NEXT_YEAR_EN),

  rule(),
  center(COMPANY + "  \u00b7  Confidential  \u00b7  Not for Distribution", { size: 18, color: "AAAAAA", italics: true }),
];

// ─── ROMANIAN ────────────────────────────────────────────────────────────────

const romanianSections = [
  center("NOTIFICARE DE CLASIFICARE SECRET COMERCIAL", { bold: true, size: 36, color: "D97706" }),
  center("Metodologia de Rezilien\u021b\u0103 \u2014 Proprietar & Confiden\u021bial", { italics: true, size: 24, color: "555555" }),
  center(COMPANY + "  \u00b7  " + TODAY_RO, { size: 20, color: "888888" }),
  new Paragraph({ spacing: { before: 120 } }),
  rule(),

  heading("1. Scopul Acestui Document"),
  body("Acest document stabile\u015fte clasificarea formal\u0103 ca secret comercial a metodologiei de rezilien\u021b\u0103 Resilium \u015fi a \u00eentregii propriet\u0103\u021bi intelectuale asociate. Este destinat cre\u0103rii unui registru scris al propriet\u0103\u021bii \u00een scopuri interne, de protec\u021bie juridic\u0103 \u015fi de aplicare, \u00een conformitate cu Legea nr. 11/1991 privind combaterea concuren\u021bei neloiale, Directiva UE privind secretele comerciale (2016/943/UE) \u015fi Legea american\u0103 privind ap\u0103rarea secretelor comerciale (DTSA)."),

  heading("2. Proprietar & Operator"),
  body("Proprietatea intelectual\u0103 descris\u0103 \u00een prezentul document este de\u021binut\u0103 \u015fi operat\u0103 exclusiv de " + COMPANY + ", o societate cu r\u0103spundere limitat\u0103 \u00eenregistrat\u0103 \u00een Rom\u00e2nia."),
  body("Contact: " + CONTACT),

  heading("3. Clasificarea Activelor Proprietare"),
  body("Urm\u0103toarele elemente sunt clasificate ca secrete comerciale proprietare \u015fi proprietate intelectual\u0103 confiden\u021bial\u0103:"),

  heading("3.1  Algoritmul de Scorare a Rezilien\u021bei", HeadingLevel.HEADING_2),
  bullet("Metodologia de scorare multidimensional\u0103 care produce un scor compozit ponderat al rezilien\u021bei pe \u015fase dimensiuni ale vie\u021bii: Financiar, S\u0103n\u0103tate, Competen\u021be, Mobilitate, Psihologic \u015fi Resurse."),
  bullet("Matricea de ponderare specific\u0103 aplicat\u0103 fiec\u0103rei dimensiuni \u00een func\u021bie de componen\u021ba gospod\u0103riei, loca\u021bie, stabilitate financiar\u0103 \u015fi priorit\u0103\u021bi de risc declarate."),
  bullet("Logica de normalizare \u015fi benchmarking care pozi\u021bioneaz\u0103 scorurile individuale \u00een distribu\u021biile popula\u021biei."),
  bullet("Dimensiunea suplimentar\u0103 Capital Social \u015fi integrarea sa \u00een scorul compozit."),

  heading("3.2  Cadrul de Evaluare pe \u015ease Dimensiuni", HeadingLevel.HEADING_2),
  bullet("Secven\u021ba specific\u0103 de \u00eentreb\u0103ri, logica de ramificare \u015fi \u00eentreb\u0103rile adaptive de urm\u0103rire din evaluarea complet\u0103 a rezilien\u021bei (flux de 13+ pa\u015fi)."),
  bullet("Sub-evaluarea Rezilien\u021bei Mentale (chestionar MR) \u015fi integrarea sa cu cele \u015fase dimensiuni primare."),
  bullet("Maparea r\u0103spunsurilor la evaluare pe categorii de vulnerabilitate \u015fi niveluri de prioritate."),

  heading("3.3  Generarea Planului de Ac\u021biune prin Inteligen\u021b\u0103 Artificial\u0103", HeadingLevel.HEADING_2),
  bullet("Ingineria prompt-urilor, designul instruc\u021biunilor de sistem \u015fi schema de ie\u015fire structurat\u0103 utilizat\u0103 pentru generarea planurilor personalizate de ac\u021biune pentru rezilien\u021b\u0103 prin API-uri de modele lingvistice mari."),
  bullet("Logica pentru traducerea scorurilor brute \u00een liste de verificare prioritizate, specifice pe arii, contextualizate pentru gospod\u0103rie."),
  bullet("Cadrul de generare a obiceiurilor zilnice \u015fi leg\u0103tura sa cu scorurile pe dimensiuni \u015fi obiectivele declarate."),

  heading("3.4  Metodologia de Testare la Stres prin Scenarii", HeadingLevel.HEADING_2),
  bullet("Logica de simulare a scenariilor bazat\u0103 pe IA (ex.: \u2018pierderea brusc\u0103 a locului de munc\u0103\u2019, \u2018dezastru natural\u2019, \u2018urgen\u021b\u0103 medical\u0103\u2019) \u015fi modul \u00een care decalajele de vulnerabilitate sunt identificate din profilul de rezilien\u021b\u0103 existent al utilizatorului."),
  bullet("Formatul structurat de ie\u015fire pentru scenarii: analiz\u0103 a impactului, ac\u021biuni imediate, traiectorie de recuperare."),

  heading("3.5  Cadrul \u015fi Con\u021binutul Listei de Verificare", HeadingLevel.HEADING_2),
  bullet("Biblioteca curat\u0103 de elemente din lista de verificare, organizat\u0103 pe arie de rezilien\u021b\u0103, nivel de prioritate (Critic, Ridicat, Mediu, Sc\u0103zut) \u015fi context de gospod\u0103rie."),
  bullet("Algoritmul de selec\u021bie \u015fi clasare a elementelor din lista de verificare bazat pe lacunele de scor \u015fi obiectivele declarate."),

  heading("3.6  Identitatea de Brand \u015fi Produs", HeadingLevel.HEADING_2),
  bullet("Denumirea de brand \u2018Resilium\u2019, logo-ul, limbajul de design vizual \u015fi interfata utilizator a platformei."),
  bullet("Tagline-ul \u2018Know Your Readiness. Build Your Resilience.\u2019 \u015fi materialele de marketing asociate."),
  bullet("Fundalul animat Neural Canvas \u015fi elementele unice de identitate vizual\u0103."),

  heading("4. Obliga\u021bii de Confiden\u021bialitate"),
  body("To\u021bi angaja\u021bii, contractorii, consilierii \u015fi ter\u021bele p\u0103r\u021bi care au acces la oricare dintre activele proprietare descrise \u00een Sec\u021biunea 3 sunt obliga\u021bi prin obliga\u021bii de confiden\u021bialitate. Divulgarea neautorizat\u0103, reproducerea, ingineria invers\u0103 sau utilizarea acestor secrete comerciale \u00een scopuri competitive constituie o \u00eenc\u0103lcare a legisla\u021biei aplicabile privind secretele comerciale \u015fi reglement\u0103rile privind concuren\u021ba neloial\u0103."),
  body("Accesul la aceste active trebuie acordat pe baza principiului strict al necesit\u0103\u021bii de a cunoa\u015fte \u015fi trebuie revocat imediat la \u00eencheierea oric\u0103rei rela\u021bii profesionale cu operatorul."),

  heading("5. Notificare de Drepturi"),
  body("\u00a9 " + YEAR + " " + COMPANY + ". Toate drepturile rezervate."),
  body("Aceast\u0103 metodologie, platform\u0103 \u015fi toat\u0103 proprietatea intelectual\u0103 asociat\u0103 sunt protejate \u00een temeiul:"),
  bullet("Legii nr. 8/1996 privind dreptul de autor \u015fi drepturile conexe (Rom\u00e2nia)"),
  bullet("Directivei UE privind secretele comerciale (2016/943/UE), transpus\u0103 \u00een dreptul rom\u00e2n prin Legea nr. 11/1991"),
  bullet("Legii americane privind ap\u0103rarea secretelor comerciale (DTSA), 18 U.S.C. \u00a7 1836 et seq."),
  bullet("Directivei UE privind bazele de date (96/9/CE) \u2014 baza de date a listei de verificare \u015fi a metodologiei beneficiaz\u0103 de drepturi sui generis"),

  heading("6. Controlul Documentului"),
  body("Acest document trebuie revizuit \u015fi actualizat anual sau ori de c\u00e2te ori se aduce o modificare material\u0103 metodologiei sau tehnologiei. Copiile trebuie stocate \u00een siguran\u021b\u0103 \u015fi nu trebuie distribuite \u00een afara organiza\u021biei f\u0103r\u0103 revizuirea consilierului juridic."),
  body("Versiunea documentului: 1.0  \u00b7  Data intr\u0103rii \u00een vigoare: " + TODAY_RO + "  \u00b7  Revizuire urm\u0103toare: " + NEXT_YEAR_RO),

  rule(),
  center(COMPANY + "  \u00b7  Confiden\u021bial  \u00b7  Nu pentru Distribu\u021bie", { size: 18, color: "AAAAAA", italics: true }),
];

function makeDoc(children) {
  return new Document({
    sections: [{ properties: {}, children }],
  });
}

async function run() {
  const engDoc = makeDoc(englishSections);
  const roDoc = makeDoc(romanianSections);

  const engBuf = await Packer.toBuffer(engDoc);
  const roBuf = await Packer.toBuffer(roDoc);

  const outDir = path.resolve(__dirname, "..", "..");
  const libDir = __dirname;

  fs.writeFileSync(path.join(libDir, "trade-secret-EN.docx"), engBuf);
  fs.writeFileSync(path.join(libDir, "trade-secret-RO.docx"), roBuf);
  fs.writeFileSync(path.join(outDir, "trade-secret-EN.docx"), engBuf);
  fs.writeFileSync(path.join(outDir, "trade-secret-RO.docx"), roBuf);

  console.log("English: " + engBuf.length + " bytes -> trade-secret-EN.docx");
  console.log("Romanian: " + roBuf.length + " bytes -> trade-secret-RO.docx");
  console.log("Done.");
}

run().catch(e => { console.error(e); process.exit(1); });
