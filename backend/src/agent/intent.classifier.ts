import { AgentIntent } from './agent.types';

export class IntentClassifier {
  static classify(userMessage: string): AgentIntent {
    const text = userMessage.toLowerCase().trim();
    console.log(`[INTENT CLASSIFIER] Classifying message: "${userMessage}"`);

    // 1. Profile / Details Query
    if (
      text.includes('what is my name') ||
      text.includes("what's my name") ||
      text.includes('send my details') ||
      text.includes('show my details') ||
      text.includes('show my profile') ||
      text.includes('what do you know about me') ||
      text.includes('my details') ||
      text.includes('my info') ||
      text.includes('my profile') ||
      text.includes('my stats') ||
      text.includes('tell me my fitness profile') ||
      text.includes('send my fitness details') ||
      text.includes('what is my height') ||
      text.includes('what is my weight') ||
      text.includes('what is my current weight') ||
      text.includes('what is my goal')
    ) {
      console.log('[INTENT CLASSIFIER RESULT]: PROFILE_DETAILS');
      return 'PROFILE_DETAILS';
    }

    // 2. Casual / Greetings / Thanks / Farewell
    if (
      /^(hi|hello|hey|hey da|hi da|yo|good morning|good evening|greetings|sup)\b/i.test(text) &&
      text.length < 25
    ) {
      console.log('[INTENT CLASSIFIER RESULT]: GREETING');
      return 'GREETING';
    }

    if (/^(thanks|thank you|thx|ty|cheers|appreciated|thank u)\b/i.test(text) && text.length < 30) {
      console.log('[INTENT CLASSIFIER RESULT]: THANKS');
      return 'THANKS';
    }

    if (/^(bye|goodbye|see you|cya|catch you later)\b/i.test(text) && text.length < 30) {
      console.log('[INTENT CLASSIFIER RESULT]: FAREWELL');
      return 'FAREWELL';
    }

    // 3. Next 6-day Future Adaptive Workout Plan
    if (
      text.includes('next 6 days') ||
      text.includes('next week plan') ||
      text.includes('schedule for next') ||
      text.includes('upcoming plan') ||
      text.includes('future workout plan') ||
      text.includes('create my next workout plan') ||
      text.includes('what should i train next') ||
      text.includes('what should i workout for the next')
    ) {
      console.log('[INTENT CLASSIFIER RESULT]: NEXT_PLAN');
      return 'NEXT_PLAN';
    }

    // 4. Specific Workouts / Today's Training
    if (
      text.includes('today what workout') ||
      text.includes('what should i train today') ||
      text.includes('today workout') ||
      text.includes('what workout today') ||
      text.includes('train today') ||
      text.includes('what should i do today') ||
      text.includes('what to train today') ||
      text.includes('give me a workout plan') ||
      text.includes("give me today's workout") ||
      text.includes('give me today workout')
    ) {
      console.log('[INTENT CLASSIFIER RESULT]: TODAY_WORKOUT');
      return 'TODAY_WORKOUT';
    }

    // 5. Weekly Report
    if (
      text.includes('weekly report') ||
      text.includes('compare this week') ||
      text.includes('what did i improve this week') ||
      text.includes('weekly summary')
    ) {
      console.log('[INTENT CLASSIFIER RESULT]: WEEKLY_REPORT');
      return 'WEEKLY_REPORT';
    }

    // 6. Recovery / Fitness State Statements
    if (
      text.includes('lazy') ||
      text.includes('feel lazy') ||
      text.includes('feel like lazy') ||
      text.includes('tired') ||
      text.includes('i am tired') ||
      text.includes('sore') ||
      text.includes('fatigue') ||
      text.includes('can i train') ||
      text.includes('can i do') ||
      text.includes('recovery') ||
      text.includes('rest day') ||
      text.includes('how should i recover') ||
      text.includes('give me recovery advice') ||
      text.includes('low energy')
    ) {
      console.log('[INTENT CLASSIFIER RESULT]: RECOVERY_ADVICE');
      return 'RECOVERY_ADVICE';
    }

    // 7. Nutrition & Meals & Protein & Calories
    if (
      text.includes('protein') ||
      text.includes('calories left') ||
      text.includes('calories do i have left') ||
      text.includes('how many calories') ||
      text.includes('calories remaining') ||
      text.includes('budget left') ||
      text.includes('what should i eat') ||
      text.includes('what did i eat today') ||
      text.includes('how much protein did i eat') ||
      text.includes('what should i eat after workout') ||
      text.includes('nutrition') ||
      text.includes('consumed today') ||
      text.includes('meal') ||
      text.includes('what to eat') ||
      text.includes('dinner') ||
      text.includes('lunch') ||
      text.includes('breakfast')
    ) {
      console.log('[INTENT CLASSIFIER RESULT]: NUTRITION_ADVICE');
      return 'NUTRITION_ADVICE';
    }

    // 8. Progress & Analytics & Strength & Weight Statements
    if (
      text.includes('progress') ||
      text.includes('how is my progress') ||
      text.includes('how is my bench press progressing') ||
      text.includes('bench press') ||
      text.includes('strength decrease') ||
      text.includes('am i progressing') ||
      text.includes('getting stronger') ||
      text.includes('weight loss') ||
      text.includes('how much weight have i lost') ||
      text.includes('gained') ||
      text.includes('lost') ||
      text.includes('want to lose weight') ||
      text.includes('want to build muscle') ||
      text.includes('weight not decreasing')
    ) {
      console.log('[INTENT CLASSIFIER RESULT]: PROGRESS_ANALYSIS');
      return 'PROGRESS_ANALYSIS';
    }

    // 9. Workout Generation
    if (text.includes('create a workout') || text.includes('generate workout') || text.includes('routine')) {
      console.log('[INTENT CLASSIFIER RESULT]: WORKOUT_GENERATION');
      return 'WORKOUT_GENERATION';
    }

    // 10. Workout History / Yesterday / Statements
    if (
      text.includes('history') ||
      text.includes('last workout') ||
      text.includes('what was my last workout') ||
      text.includes('yesterday') ||
      text.includes('trained chest') ||
      text.includes('trained legs') ||
      text.includes('trained back') ||
      text.includes('how many workouts') ||
      text.includes('workouts this week') ||
      text.includes('what did i train')
    ) {
      console.log('[INTENT CLASSIFIER RESULT]: WORKOUT_HISTORY');
      return 'WORKOUT_HISTORY';
    }

    // 11. Exercise Search & Details
    if (
      text.includes('give me a chest exercise') ||
      text.includes('chest exercise') ||
      text.includes('exercise for') ||
      text.includes('explain lunges') ||
      text.includes('how to do')
    ) {
      console.log('[INTENT CLASSIFIER RESULT]: EXERCISE_SEARCH');
      return 'EXERCISE_SEARCH';
    }

    // 12. General Fitness Concepts
    if (
      text.includes('progressive overload') ||
      text.includes('form') ||
      text.includes('what is') ||
      text.includes('explain')
    ) {
      console.log('[INTENT CLASSIFIER RESULT]: GENERAL_FITNESS');
      return 'GENERAL_FITNESS';
    }

    console.log('[INTENT CLASSIFIER RESULT]: GENERAL_FITNESS (default)');
    return 'GENERAL_FITNESS';
  }
}
