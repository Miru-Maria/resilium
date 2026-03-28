export type PersonaAssessmentData = {
  location: string;
  incomeStability: "fixed" | "freelance" | "unstable";
  savingsMonths: number;
  hasDependents: boolean;
  skills: string[];
  healthStatus: "excellent" | "good" | "fair" | "poor";
  mobilityLevel: "high" | "medium" | "low";
  housingType: "own" | "rent" | "family" | "nomadic" | "other";
  hasEmergencySupplies: boolean;
  psychologicalResilience: number;
  riskConcerns: string[];
  mentalResilienceAnswers?: {
    stressTolerance1: number;
    stressTolerance2: number;
    adaptability1: number;
    adaptability2: number;
    learningAgility1: number;
    changeManagement1: number;
    changeManagement2: number;
    emotionalRegulation1: number;
    emotionalRegulation2: number;
    socialSupport1: number;
  };
};

export type Persona = {
  key: string;
  name: string;
  description: string;
  assessmentData: PersonaAssessmentData;
};

export const PERSONAS: Persona[] = [
  {
    key: "urban_young_professional",
    name: "Urban Young Professional",
    description: "28-year-old software engineer living in a major city, renting an apartment, no dependents, moderate savings. Focused on career growth.",
    assessmentData: {
      location: "San Francisco, CA",
      incomeStability: "fixed",
      savingsMonths: 4,
      hasDependents: false,
      skills: ["digital", "financial"],
      healthStatus: "excellent",
      mobilityLevel: "high",
      housingType: "rent",
      hasEmergencySupplies: false,
      psychologicalResilience: 7,
      riskConcerns: ["job_loss", "economic_collapse", "cyberattack"],
      mentalResilienceAnswers: {
        stressTolerance1: 4,
        stressTolerance2: 4,
        adaptability1: 4,
        adaptability2: 5,
        learningAgility1: 5,
        changeManagement1: 4,
        changeManagement2: 4,
        emotionalRegulation1: 3,
        emotionalRegulation2: 4,
        socialSupport1: 3,
      },
    },
  },
  {
    key: "rural_retiree",
    name: "Rural Retiree",
    description: "67-year-old retiree living in rural Idaho, owns home, fixed pension income, spouse as dependent. Limited mobility but well-stocked.",
    assessmentData: {
      location: "Rural Idaho",
      incomeStability: "fixed",
      savingsMonths: 24,
      hasDependents: true,
      skills: ["survival", "physical"],
      healthStatus: "fair",
      mobilityLevel: "low",
      housingType: "own",
      hasEmergencySupplies: true,
      psychologicalResilience: 6,
      riskConcerns: ["natural_disaster", "health_crisis", "infrastructure_failure"],
      mentalResilienceAnswers: {
        stressTolerance1: 3,
        stressTolerance2: 4,
        adaptability1: 3,
        adaptability2: 3,
        learningAgility1: 3,
        changeManagement1: 3,
        changeManagement2: 3,
        emotionalRegulation1: 4,
        emotionalRegulation2: 4,
        socialSupport1: 4,
      },
    },
  },
  {
    key: "single_parent_low_income",
    name: "Single Parent, Low Income",
    description: "34-year-old single mother of two in suburban Ohio, works part-time retail, minimal savings, renting. Financially stressed.",
    assessmentData: {
      location: "Columbus, OH",
      incomeStability: "unstable",
      savingsMonths: 0.5,
      hasDependents: true,
      skills: ["none"],
      healthStatus: "fair",
      mobilityLevel: "low",
      housingType: "rent",
      hasEmergencySupplies: false,
      psychologicalResilience: 4,
      riskConcerns: ["job_loss", "health_crisis", "housing_insecurity"],
      mentalResilienceAnswers: {
        stressTolerance1: 2,
        stressTolerance2: 2,
        adaptability1: 3,
        adaptability2: 2,
        learningAgility1: 3,
        changeManagement1: 2,
        changeManagement2: 2,
        emotionalRegulation1: 2,
        emotionalRegulation2: 3,
        socialSupport1: 3,
      },
    },
  },
  {
    key: "recent_immigrant",
    name: "Recent Immigrant",
    description: "39-year-old recent immigrant from Venezuela, working freelance translation gigs in Miami, limited English, no citizenship, 3 children.",
    assessmentData: {
      location: "Miami, FL",
      incomeStability: "freelance",
      savingsMonths: 1,
      hasDependents: true,
      skills: ["language", "physical"],
      healthStatus: "good",
      mobilityLevel: "medium",
      housingType: "family",
      hasEmergencySupplies: false,
      psychologicalResilience: 6,
      riskConcerns: ["political_instability", "job_loss", "health_crisis"],
      mentalResilienceAnswers: {
        stressTolerance1: 4,
        stressTolerance2: 3,
        adaptability1: 5,
        adaptability2: 4,
        learningAgility1: 4,
        changeManagement1: 4,
        changeManagement2: 4,
        emotionalRegulation1: 3,
        emotionalRegulation2: 3,
        socialSupport1: 4,
      },
    },
  },
  {
    key: "military_veteran",
    name: "Military Veteran",
    description: "45-year-old Army veteran in Texas, now working in logistics. Owns home, VA benefits, wife and two teenage kids. Strong practical skills.",
    assessmentData: {
      location: "San Antonio, TX",
      incomeStability: "fixed",
      savingsMonths: 6,
      hasDependents: true,
      skills: ["survival", "medical", "physical"],
      healthStatus: "good",
      mobilityLevel: "high",
      housingType: "own",
      hasEmergencySupplies: true,
      psychologicalResilience: 7,
      riskConcerns: ["natural_disaster", "economic_collapse", "cyberattack"],
      mentalResilienceAnswers: {
        stressTolerance1: 5,
        stressTolerance2: 5,
        adaptability1: 4,
        adaptability2: 5,
        learningAgility1: 4,
        changeManagement1: 4,
        changeManagement2: 5,
        emotionalRegulation1: 3,
        emotionalRegulation2: 4,
        socialSupport1: 4,
      },
    },
  },
  {
    key: "high_income_entrepreneur",
    name: "High-Income Entrepreneur",
    description: "51-year-old tech entrepreneur in Seattle, runs a mid-size SaaS company, owns multiple properties, high savings. Business volatility exposure.",
    assessmentData: {
      location: "Seattle, WA",
      incomeStability: "freelance",
      savingsMonths: 36,
      hasDependents: true,
      skills: ["digital", "financial", "language"],
      healthStatus: "good",
      mobilityLevel: "high",
      housingType: "own",
      hasEmergencySupplies: false,
      psychologicalResilience: 8,
      riskConcerns: ["economic_collapse", "cyberattack", "job_loss"],
      mentalResilienceAnswers: {
        stressTolerance1: 5,
        stressTolerance2: 4,
        adaptability1: 5,
        adaptability2: 5,
        learningAgility1: 5,
        changeManagement1: 5,
        changeManagement2: 5,
        emotionalRegulation1: 4,
        emotionalRegulation2: 4,
        socialSupport1: 3,
      },
    },
  },
  {
    key: "elderly_with_disabilities",
    name: "Elderly With Disabilities",
    description: "73-year-old widow in Phoenix with mobility limitations and chronic conditions. Lives alone, on Social Security, rents senior housing.",
    assessmentData: {
      location: "Phoenix, AZ",
      incomeStability: "fixed",
      savingsMonths: 3,
      hasDependents: false,
      skills: ["none"],
      healthStatus: "poor",
      mobilityLevel: "low",
      housingType: "rent",
      hasEmergencySupplies: false,
      psychologicalResilience: 5,
      riskConcerns: ["health_crisis", "infrastructure_failure", "natural_disaster"],
      mentalResilienceAnswers: {
        stressTolerance1: 2,
        stressTolerance2: 3,
        adaptability1: 2,
        adaptability2: 2,
        learningAgility1: 2,
        changeManagement1: 2,
        changeManagement2: 2,
        emotionalRegulation1: 3,
        emotionalRegulation2: 3,
        socialSupport1: 3,
      },
    },
  },
  {
    key: "college_student",
    name: "College Student",
    description: "21-year-old college junior at a state university in Michigan, part-time barista job, student loans, no savings, renting with roommates.",
    assessmentData: {
      location: "Ann Arbor, MI",
      incomeStability: "unstable",
      savingsMonths: 0,
      hasDependents: false,
      skills: ["digital"],
      healthStatus: "excellent",
      mobilityLevel: "high",
      housingType: "rent",
      hasEmergencySupplies: false,
      psychologicalResilience: 5,
      riskConcerns: ["job_loss", "economic_collapse", "housing_insecurity"],
      mentalResilienceAnswers: {
        stressTolerance1: 2,
        stressTolerance2: 3,
        adaptability1: 4,
        adaptability2: 3,
        learningAgility1: 4,
        changeManagement1: 3,
        changeManagement2: 3,
        emotionalRegulation1: 3,
        emotionalRegulation2: 2,
        socialSupport1: 4,
      },
    },
  },
];
