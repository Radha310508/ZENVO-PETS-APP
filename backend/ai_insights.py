import anthropic
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

async def generate_weekly_summary(
    pet_name: str,
    logs: List[Dict],
    previous_week_logs: List[Dict] = None
) -> Dict:
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    prompt = f"You are an AI assistant for ZENVO PETS. Generate a weekly care summary for {pet_name}.\n\nThis week logs:\n"
    for log in logs:
        prompt += f"\nDate: {log['date']}\n- Appetite: {log['appetite']}\n- Energy: {log['energy']}\n- Mood: {log['mood']}\n- Sleep: {log['sleep']}\n"
    prompt += "\nFormat:\nSUMMARY: [summary]\nKEY_PATTERNS: [patterns]\nCONCERNS: [concerns or None]\n"
    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system="You are a helpful caring assistant for dog parents.",
            messages=[{"role": "user", "content": prompt}]
        )
        response = message.content[0].text
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
                patterns_text = line.replace('KEY_PATTERNS:', '').strip()
                if patterns_text and patterns_text.lower() != 'none':
                    key_patterns = [p.strip() for p in patterns_text.split(',')]
            elif line.startswith('CONCERNS:'):
                concerns_text = line.replace('CONCERNS:', '').strip()
                if concerns_text and concerns_text.lower() != 'none':
                    concerns = [c.strip() for c in concerns_text.split(',')]
            elif current_section == 'summary' and line.strip():
                summary_text += ' ' + line.strip()
        return {'summary_text': summary_text if summary_text else response, 'key_patterns': key_patterns, 'concerns': concerns}
    except Exception as e:
        return {'summary_text': f"Could not generate insights for {pet_name} this week. Your logs are saved.", 'key_patterns': [], 'concerns': []}
