from emergentintegrations.llm.chat import LlmChat, UserMessage
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

async def generate_weekly_summary(
    pet_name: str,
    logs: List[Dict],
    previous_week_logs: List[Dict] = None
) -> Dict:
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    
    prompt = f"""You are an AI assistant for ZENVO PETS, a dog care tracking app. Generate a weekly care summary for {pet_name}.

This week's logs:
"""
    
    for log in logs:
        prompt += f"""\nDate: {log['date']}
- Appetite: {log['appetite']}
- Energy: {log['energy']}
- Mood: {log['mood']}
- Sleep: {log['sleep']}
"""
        if log.get('unusual_behavior'):
            prompt += f"- Unusual Behavior: {log['unusual_behavior']}\n"
        if log.get('triggers'):
            prompt += f"- Triggers: {log['triggers']}\n"
        if log.get('notes'):
            prompt += f"- Notes: {log['notes']}\n"
    
    if previous_week_logs:
        prompt += "\n\nPrevious week's logs for comparison:\n"
        for log in previous_week_logs[-3:]:
            prompt += f"Date: {log['date']} - Appetite: {log['appetite']}, Energy: {log['energy']}, Mood: {log['mood']}\n"
    
    prompt += """\n\nGenerate a caring, supportive weekly summary that:
1. Highlights any patterns in appetite, energy, mood, or sleep
2. Compares with previous week if data is available
3. Points out repeated triggers or unusual behaviors
4. Suggests monitoring areas of concern
5. If there are concerning patterns (like consistent low appetite or energy), gently recommend consulting a vet

Use supportive language like:
- "We noticed..."
- "This week, [pet name] showed..."
- "You might want to keep an eye on..."
- "If this continues, consider talking to your vet"

DO NOT:
- Make medical diagnoses
- Claim to know exact emotions
- Use overly clinical language
- Be alarmist

Format the response as:
SUMMARY: [2-3 paragraph summary]
KEY_PATTERNS: [comma-separated list of patterns]
CONCERNS: [comma-separated list of concerns, or "None" if no concerns]
"""
    
    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"weekly_summary_{pet_name}",
            system_message="You are a helpful, caring assistant for dog parents. Provide supportive insights based on behavior logs."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        lines = response.strip().split('\n')
        summary_text = ""
        key_patterns = []
        concerns = []
        
        current_section = None
        for line in lines:
            if line.startswith('SUMMARY:'):
                current_section = 'summary'
                summary_text = line.replace('SUMMARY:', '').strip()
            elif line.startswith('KEY_PATTERNS:'):
                current_section = 'patterns'
                patterns_text = line.replace('KEY_PATTERNS:', '').strip()
                if patterns_text and patterns_text.lower() != 'none':
                    key_patterns = [p.strip() for p in patterns_text.split(',')]
            elif line.startswith('CONCERNS:'):
                current_section = 'concerns'
                concerns_text = line.replace('CONCERNS:', '').strip()
                if concerns_text and concerns_text.lower() != 'none':
                    concerns = [c.strip() for c in concerns_text.split(',')]
            elif current_section == 'summary' and line.strip():
                summary_text += ' ' + line.strip()
        
        return {
            'summary_text': summary_text if summary_text else response,
            'key_patterns': key_patterns,
            'concerns': concerns
        }
    except Exception as e:
        return {
            'summary_text': f"We couldn't generate insights this week due to a technical issue. Your logs for {pet_name} have been saved and you can review them anytime.",
            'key_patterns': [],
            'concerns': []
        }