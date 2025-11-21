import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

interface IncidentData {
  outlet: { name: string };
  date: Date;
  time?: string | null;
  programName?: string | null;
  presenterName?: string | null;
  description: string;
  mediaUrl?: string | null;
  infractionType?: string | null;
}

interface UserData {
  name?: string | null;
  preferredTone: string;
}

export async function generateComplaintLetter(
  incident: IncidentData,
  user: UserData,
  existingComplaintsCount: number
): Promise<string> {
  const dateStr = incident.date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const infractionDescriptions: Record<string, string> = {
    household_analogy: 'comparing government finances to household budgets',
    debt_scare: 'creating unfounded concern about government debt levels',
    insolvency_myth: 'suggesting the government could become insolvent in its own currency',
    other: 'economic misinformation'
  };

  const infractionDesc = incident.infractionType
    ? infractionDescriptions[incident.infractionType] || 'economic misinformation'
    : 'economic misinformation';

  // Variation strategies based on complaint count
  const variationStrategies = [
    'Lead with the specific error made, then explain why it is incorrect using MMT principles.',
    'Lead with BBC editorial guidelines and journalism standards, then show how this broadcast violated them.',
    'Lead with the 2020 letter signed by economists calling for better economic coverage, then apply it to this specific case.',
    'Lead with MMT principles and how modern monetary systems work, then show how this broadcast contradicted them.',
    'Lead with the impact on public understanding and democracy, then explain the specific error.',
    'Lead with a comparison to how the same presenter/program has covered similar topics correctly in the past.',
    'Lead with academic and institutional sources that contradict the claim made.',
    'Lead with the practical policy implications of the misinformation.'
  ];

  const emphasisOptions = [
    'Focus on requesting a correction to be broadcast.',
    'Focus on requesting presenter training on economics.',
    'Focus on requesting a policy review for economic coverage.',
    'Focus on requesting the Editorial Complaints Unit review the matter.',
    'Focus on the pattern of similar errors across BBC coverage.',
    'Focus on specific factual claims that can be verified or refuted.'
  ];

  const strategy = variationStrategies[existingComplaintsCount % variationStrategies.length];
  const emphasis = emphasisOptions[existingComplaintsCount % emphasisOptions.length];

  const prompt = `Generate a unique complaint letter about economic misinformation in media.

CONTEXT:
- Media Outlet: ${incident.outlet.name}
- Program: ${incident.programName || 'Unknown program'}
- Date: ${dateStr}
- Time: ${incident.time || 'Not specified'}
- Presenter: ${incident.presenterName || 'Not specified'}
- Incident Description: ${incident.description}
- Media URL: ${incident.mediaUrl || 'Not available'}
- Type of Infraction: ${infractionDesc}

KEY MMT PRINCIPLES TO REFERENCE (use 1-2 appropriately):
1. A currency-issuing government (like the UK) issues its own currency - it is the monopoly supplier of pounds sterling.
2. Such governments cannot "run out of money" in their own currency - they can always meet financial obligations denominated in that currency.
3. The constraint on government spending is real resources and inflation, not the money itself.
4. Household and business budget analogies are fundamentally misleading when applied to currency-issuing governments.
5. The national debt is essentially a record of private sector savings in government securities.
6. Government deficits = private sector surpluses, mathematically.

RELEVANT CONTEXT:
- In 2020, over 30 leading economists wrote to the BBC requesting better economic coverage.
- In 2023, the BBC conducted an internal "BBC Breakfast Review" examining economic literacy in broadcasting.
- The BBC's editorial guidelines require accuracy and impartiality in factual reporting.

USER PREFERENCES:
- Tone: ${user.preferredTone}
- Writer's name: ${user.name || 'A concerned viewer'}
- This is complaint #${existingComplaintsCount + 1} about this incident (ensure variation)

VARIATION INSTRUCTIONS:
- ${strategy}
- ${emphasis}
- Do NOT repeat structures from previous complaints.
- Vary your opening sentence, argumentation flow, and specific requests.

REQUIREMENTS:
- Professional, factual tone appropriate to "${user.preferredTone}" preference
- 250-400 words
- Include the date, time (if available), program name, and presenter name
- Explain what was said and why it is factually incorrect
- Reference relevant journalism standards or guidelines
- Make a specific, actionable request
- Sign off with "[Your name]" as placeholder

Generate the complaint letter now:`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });

  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response');
  }

  return textContent.text;
}
