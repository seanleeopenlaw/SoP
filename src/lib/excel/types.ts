export interface ExcelRow {
  Email: string;
  Name: string;
  Team?: string;
  Birthday?: string;
  Chronotype?: string;
  CoreValue1?: string;
  CoreValue2?: string;
  CoreValue3?: string;
  CoreValue4?: string;
  CoreValue5?: string;
  Strength1?: string;
  Strength2?: string;
  Strength3?: string;
  Strength4?: string;
  Strength5?: string;

  // Big Five - Openness (support both old "Openness" and new "OpennessToExperience" column names)
  BigFive_Openness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_Score?: number;
  BigFive_Openness_Imagination_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_Imagination_Score?: number;
  BigFive_Openness_ArtisticInterests_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_ArtisticInterests_Score?: number;
  BigFive_Openness_Emotionality_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_Emotionality_Score?: number;
  BigFive_Openness_Adventurousness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_Adventurousness_Score?: number;
  BigFive_Openness_Intellect_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_Intellect_Score?: number;
  BigFive_Openness_Liberalism_Level?: 'High' | 'Average' | 'Low';
  BigFive_Openness_Liberalism_Score?: number;

  // New column names (OpennessToExperience)
  BigFive_OpennessToExperience_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_Score?: number;
  BigFive_OpennessToExperience_Imagination_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_Imagination_Score?: number;
  BigFive_OpennessToExperience_ArtisticInterests_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_ArtisticInterests_Score?: number;
  BigFive_OpennessToExperience_Emotionality_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_Emotionality_Score?: number;
  BigFive_OpennessToExperience_Adventurousness_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_Adventurousness_Score?: number;
  BigFive_OpennessToExperience_Intellect_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_Intellect_Score?: number;
  BigFive_OpennessToExperience_Liberalism_Level?: 'High' | 'Average' | 'Low';
  BigFive_OpennessToExperience_Liberalism_Score?: number;

  // Big Five - Conscientiousness
  BigFive_Conscientiousness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_Score?: number;
  BigFive_Conscientiousness_SelfEfficacy_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_SelfEfficacy_Score?: number;
  BigFive_Conscientiousness_Orderliness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_Orderliness_Score?: number;
  BigFive_Conscientiousness_Dutifulness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_Dutifulness_Score?: number;
  BigFive_Conscientiousness_Achievement_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_Achievement_Score?: number;
  BigFive_Conscientiousness_SelfDiscipline_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_SelfDiscipline_Score?: number;
  BigFive_Conscientiousness_Cautiousness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Conscientiousness_Cautiousness_Score?: number;

  // Big Five - Extraversion
  BigFive_Extraversion_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_Score?: number;
  BigFive_Extraversion_Friendliness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_Friendliness_Score?: number;
  BigFive_Extraversion_Gregariousness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_Gregariousness_Score?: number;
  BigFive_Extraversion_Assertiveness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_Assertiveness_Score?: number;
  BigFive_Extraversion_ActivityLevel_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_ActivityLevel_Score?: number;
  BigFive_Extraversion_ExcitementSeeking_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_ExcitementSeeking_Score?: number;
  BigFive_Extraversion_Cheerfulness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Extraversion_Cheerfulness_Score?: number;

  // Big Five - Agreeableness
  BigFive_Agreeableness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Score?: number;
  BigFive_Agreeableness_Trust_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Trust_Score?: number;
  BigFive_Agreeableness_Morality_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Morality_Score?: number;
  BigFive_Agreeableness_Altruism_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Altruism_Score?: number;
  BigFive_Agreeableness_Cooperation_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Cooperation_Score?: number;
  BigFive_Agreeableness_Modesty_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Modesty_Score?: number;
  BigFive_Agreeableness_Sympathy_Level?: 'High' | 'Average' | 'Low';
  BigFive_Agreeableness_Sympathy_Score?: number;

  // Big Five - Neuroticism
  BigFive_Neuroticism_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_Score?: number;
  BigFive_Neuroticism_Anxiety_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_Anxiety_Score?: number;
  BigFive_Neuroticism_Anger_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_Anger_Score?: number;
  BigFive_Neuroticism_Depression_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_Depression_Score?: number;
  BigFive_Neuroticism_SelfConsciousness_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_SelfConsciousness_Score?: number;
  BigFive_Neuroticism_Immoderation_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_Immoderation_Score?: number;
  BigFive_Neuroticism_Vulnerability_Level?: 'High' | 'Average' | 'Low';
  BigFive_Neuroticism_Vulnerability_Score?: number;

  Goals_Period?: string;
  Goals_Professional?: string;
  Goals_Personal?: string;
}

export interface ImportResult {
  success: boolean;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    email?: string;
    name?: string;
    error: string;
  }>;
  details: Array<{
    row: number;
    email: string;
    name: string;
    action: 'created' | 'updated';
  }>;
}

export interface Subtrait {
  name: string;
  level: 'High' | 'Average' | 'Low';
  score?: number;
}
