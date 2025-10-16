-- Seed data for PersonaLogic Builder
-- Generated from seed-data.json

-- Clear existing data
DELETE FROM big_five_profiles;
DELETE FROM chronotypes;
DELETE FROM character_strengths;
DELETE FROM core_values;
DELETE FROM user_profiles;

-- Insert User Profiles
INSERT INTO user_profiles (id, user_id, name, team, birthday, avatar_url, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Sarah Chen', 'Product Design', '1992-03-15', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', '2025-01-15 10:00:00+00', '2025-01-15 10:00:00+00'),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'Marcus Johnson', 'Engineering', '1988-07-22', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', '2025-01-16 09:00:00+00', '2025-01-16 09:00:00+00'),
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'Priya Patel', 'Product Design', '1995-11-08', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', '2025-01-17 14:00:00+00', '2025-01-17 14:00:00+00');

-- Insert Core Values
INSERT INTO core_values (id, profile_id, values, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', ARRAY['Creativity', 'Collaboration', 'Integrity', 'Innovation', 'Empathy'], '2025-01-15 10:05:00+00', '2025-01-15 10:05:00+00'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', ARRAY['Excellence', 'Continuous Learning', 'Transparency', 'Teamwork', 'Impact'], '2025-01-16 09:05:00+00', '2025-01-16 09:05:00+00'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440003', ARRAY['User-centricity', 'Creativity', 'Growth mindset', 'Diversity', 'Sustainability'], '2025-01-17 14:05:00+00', '2025-01-17 14:05:00+00');

-- Insert Character Strengths
INSERT INTO character_strengths (id, profile_id, strengths, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', ARRAY['Problem-solving', 'Active listening', 'Strategic thinking', 'Adaptability', 'Mentorship'], '2025-01-15 10:10:00+00', '2025-01-15 10:10:00+00'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', ARRAY['Technical expertise', 'Systems thinking', 'Code review', 'Architecture design', 'Performance optimization'], '2025-01-16 09:10:00+00', '2025-01-16 09:10:00+00'),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440003', ARRAY['Visual design', 'User research', 'Prototyping', 'Communication', 'Detail-oriented'], '2025-01-17 14:10:00+00', '2025-01-17 14:10:00+00');

-- Insert Chronotypes
INSERT INTO chronotypes (id, profile_id, types, primary_type, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', ARRAY['Bear', 'Dolphin']::chronotype_animal[], 'Bear'::chronotype_animal, '2025-01-15 10:15:00+00', '2025-01-15 10:15:00+00'),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', ARRAY['Lion']::chronotype_animal[], 'Lion'::chronotype_animal, '2025-01-16 09:15:00+00', '2025-01-16 09:15:00+00'),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440003', ARRAY['Wolf', 'Dolphin']::chronotype_animal[], 'Wolf'::chronotype_animal, '2025-01-17 14:15:00+00', '2025-01-17 14:15:00+00');

-- Insert Big Five Profiles
INSERT INTO big_five_profiles (id, profile_id, openness_data, conscientiousness_data, extraversion_data, agreeableness_data, neuroticism_data, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001',
'{"groupName":"Openness","overallLevel":"High","overallScore":82,"subtraits":[{"name":"Imagination","level":"High","score":85},{"name":"Artistic Interests","level":"High","score":88},{"name":"Emotionality","level":"High","score":78},{"name":"Adventurousness","level":"High","score":80},{"name":"Intellect","level":"High","score":84},{"name":"Liberalism","level":"Average","score":65}]}'::jsonb,
'{"groupName":"Conscientiousness","overallLevel":"High","overallScore":75,"subtraits":[{"name":"Self-Efficacy","level":"High","score":78},{"name":"Orderliness","level":"Average","score":68},{"name":"Dutifulness","level":"High","score":82},{"name":"Achievement-Striving","level":"High","score":80},{"name":"Self-Discipline","level":"High","score":75},{"name":"Cautiousness","level":"Average","score":65}]}'::jsonb,
'{"groupName":"Extraversion","overallLevel":"Average","overallScore":58,"subtraits":[{"name":"Friendliness","level":"High","score":72},{"name":"Gregariousness","level":"Average","score":55},{"name":"Assertiveness","level":"Average","score":60},{"name":"Activity Level","level":"High","score":70},{"name":"Excitement-Seeking","level":"Low","score":40},{"name":"Cheerfulness","level":"Average","score":65}]}'::jsonb,
'{"groupName":"Agreeableness","overallLevel":"High","overallScore":78,"subtraits":[{"name":"Trust","level":"High","score":75},{"name":"Morality","level":"High","score":85},{"name":"Altruism","level":"High","score":82},{"name":"Cooperation","level":"High","score":80},{"name":"Modesty","level":"Average","score":65},{"name":"Sympathy","level":"High","score":81}]}'::jsonb,
'{"groupName":"Neuroticism","overallLevel":"Low","overallScore":35,"subtraits":[{"name":"Anxiety","level":"Low","score":38},{"name":"Anger","level":"Low","score":25},{"name":"Depression","level":"Low","score":30},{"name":"Self-Consciousness","level":"Average","score":45},{"name":"Immoderation","level":"Low","score":32},{"name":"Vulnerability","level":"Low","score":35}]}'::jsonb,
'2025-01-15 10:20:00+00', '2025-01-15 10:20:00+00'),

('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440002',
'{"groupName":"Openness","overallLevel":"High","overallScore":76,"subtraits":[{"name":"Imagination","level":"Average","score":62},{"name":"Artistic Interests","level":"Average","score":55},{"name":"Emotionality","level":"Average","score":58},{"name":"Adventurousness","level":"High","score":78},{"name":"Intellect","level":"High","score":92},{"name":"Liberalism","level":"High","score":75}]}'::jsonb,
'{"groupName":"Conscientiousness","overallLevel":"High","overallScore":88,"subtraits":[{"name":"Self-Efficacy","level":"High","score":90},{"name":"Orderliness","level":"High","score":85},{"name":"Dutifulness","level":"High","score":92},{"name":"Achievement-Striving","level":"High","score":88},{"name":"Self-Discipline","level":"High","score":90},{"name":"Cautiousness","level":"High","score":82}]}'::jsonb,
'{"groupName":"Extraversion","overallLevel":"Average","overallScore":52,"subtraits":[{"name":"Friendliness","level":"Average","score":58},{"name":"Gregariousness","level":"Low","score":42},{"name":"Assertiveness","level":"High","score":75},{"name":"Activity Level","level":"High","score":70},{"name":"Excitement-Seeking","level":"Low","score":35},{"name":"Cheerfulness","level":"Average","score":55}]}'::jsonb,
'{"groupName":"Agreeableness","overallLevel":"Average","overallScore":62,"subtraits":[{"name":"Trust","level":"Average","score":60},{"name":"Morality","level":"High","score":78},{"name":"Altruism","level":"Average","score":65},{"name":"Cooperation","level":"Average","score":62},{"name":"Modesty","level":"Average","score":55},{"name":"Sympathy","level":"Average","score":58}]}'::jsonb,
'{"groupName":"Neuroticism","overallLevel":"Low","overallScore":28,"subtraits":[{"name":"Anxiety","level":"Low","score":30},{"name":"Anger","level":"Low","score":22},{"name":"Depression","level":"Low","score":18},{"name":"Self-Consciousness","level":"Low","score":35},{"name":"Immoderation","level":"Low","score":28},{"name":"Vulnerability","level":"Low","score":25}]}'::jsonb,
'2025-01-16 09:20:00+00', '2025-01-16 09:20:00+00'),

('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440003',
'{"groupName":"Openness","overallLevel":"High","overallScore":90,"subtraits":[{"name":"Imagination","level":"High","score":95},{"name":"Artistic Interests","level":"High","score":92},{"name":"Emotionality","level":"High","score":85},{"name":"Adventurousness","level":"High","score":88},{"name":"Intellect","level":"High","score":90},{"name":"Liberalism","level":"High","score":85}]}'::jsonb,
'{"groupName":"Conscientiousness","overallLevel":"Average","overallScore":65,"subtraits":[{"name":"Self-Efficacy","level":"High","score":75},{"name":"Orderliness","level":"Average","score":58},{"name":"Dutifulness","level":"Average","score":68},{"name":"Achievement-Striving","level":"High","score":72},{"name":"Self-Discipline","level":"Average","score":62},{"name":"Cautiousness","level":"Average","score":55}]}'::jsonb,
'{"groupName":"Extraversion","overallLevel":"High","overallScore":72,"subtraits":[{"name":"Friendliness","level":"High","score":80},{"name":"Gregariousness","level":"High","score":75},{"name":"Assertiveness","level":"Average","score":65},{"name":"Activity Level","level":"High","score":78},{"name":"Excitement-Seeking","level":"High","score":72},{"name":"Cheerfulness","level":"High","score":82}]}'::jsonb,
'{"groupName":"Agreeableness","overallLevel":"High","overallScore":80,"subtraits":[{"name":"Trust","level":"High","score":78},{"name":"Morality","level":"High","score":82},{"name":"Altruism","level":"High","score":85},{"name":"Cooperation","level":"High","score":80},{"name":"Modesty","level":"High","score":75},{"name":"Sympathy","level":"High","score":85}]}'::jsonb,
'{"groupName":"Neuroticism","overallLevel":"Average","overallScore":48,"subtraits":[{"name":"Anxiety","level":"Average","score":52},{"name":"Anger","level":"Low","score":38},{"name":"Depression","level":"Low","score":40},{"name":"Self-Consciousness","level":"Average","score":55},{"name":"Immoderation","level":"Average","score":50},{"name":"Vulnerability","level":"Average","score":48}]}'::jsonb,
'2025-01-17 14:20:00+00', '2025-01-17 14:20:00+00');

-- Show summary
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL SELECT 'core_values', COUNT(*) FROM core_values
UNION ALL SELECT 'character_strengths', COUNT(*) FROM character_strengths
UNION ALL SELECT 'chronotypes', COUNT(*) FROM chronotypes
UNION ALL SELECT 'big_five_profiles', COUNT(*) FROM big_five_profiles;
