"""
Reasoning Parser Utility
Extracts and strips <think> tags from model outputs
Handles chain-of-thought models that expose internal reasoning
"""

import re
from typing import Tuple, Optional


def parse_reasoning(text: str) -> Tuple[str, Optional[str]]:
    """
    Parse model output to extract <think> reasoning and clean answer.
    
    Args:
        text: Raw model output that may contain <think>...</think> tags
        
    Returns:
        Tuple of (clean_answer, reasoning)
        - clean_answer: Text with <think> tags removed
        - reasoning: Content inside <think> tags, or None if not present
        
    Examples:
        >>> parse_reasoning("<think>Internal reasoning</think>Final answer")
        ("Final answer", "Internal reasoning")
        
        >>> parse_reasoning("Just a normal answer")
        ("Just a normal answer", None)
    """
    
    # Pattern to match <think>...</think> tags (case-insensitive, multiline)
    think_pattern = r'<think>(.*?)</think>'
    
    # Find all <think> blocks
    think_matches = re.findall(think_pattern, text, re.IGNORECASE | re.DOTALL)
    
    # Handle case where model outputs reasoning WITHOUT opening <think> tag
    # Pattern: text before </think> is the reasoning
    if not think_matches and '</think>' in text.lower():
        # Split by </think> tag
        parts = re.split(r'</think>', text, maxsplit=1, flags=re.IGNORECASE)
        if len(parts) == 2:
            reasoning = parts[0].strip()
            clean_text = parts[1].strip()
            return clean_text, reasoning if reasoning else None
    
    if not think_matches:
        # No reasoning found, return original text
        return text.strip(), None
    
    # Extract reasoning (join multiple blocks if present)
    reasoning = '\n\n'.join(match.strip() for match in think_matches)
    
    # Remove all <think> tags and their content from the text
    clean_text = re.sub(think_pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Clean up extra whitespace
    clean_text = re.sub(r'\n\s*\n\s*\n+', '\n\n', clean_text)  # Remove excessive newlines
    clean_text = clean_text.strip()
    
    return clean_text, reasoning


def has_reasoning(text: str) -> bool:
    """
    Check if text contains <think> tags without extracting.
    
    Args:
        text: Text to check
        
    Returns:
        True if <think> tags are present, False otherwise
    """
    return bool(re.search(r'<think>', text, re.IGNORECASE))


def sanitize_reasoning(reasoning: str) -> str:
    """
    Sanitize reasoning text for safe display.
    Remove potentially sensitive content, excessive formatting.
    
    Args:
        reasoning: Raw reasoning text
        
    Returns:
        Sanitized reasoning text
    """
    if not reasoning:
        return ""
    
    # Remove excessive newlines
    sanitized = re.sub(r'\n\s*\n\s*\n+', '\n\n', reasoning)
    
    # Truncate if extremely long (>10K chars)
    max_length = 10000
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length] + "\n\n[Reasoning truncated for brevity...]"
    
    return sanitized.strip()


# Models known to output chain-of-thought reasoning
REASONING_MODELS = [
    'provider-1/qwen3-next-80b-a3b-thinking',  # Qwen3 Next Thinking
    'provider-3/gemini-2.5-flash-lite-preview-09-2025',  # Gemini 2.5 Flash Lite
    'provider-1/llama-4-scout-17b-16e-instruct',  # Llama 4 Scout (may show reasoning)
]


def is_reasoning_model(model_id: str) -> bool:
    """
    Check if a model is known to output chain-of-thought reasoning.
    
    Args:
        model_id: Model identifier
        
    Returns:
        True if model outputs reasoning, False otherwise
    """
    return any(known_model in model_id.lower() for known_model in [
        'thinking', 'reasoning', 'chain-of-thought', 'qwen3-next', 'gemini-2.5-flash-lite', 'scout'
    ])
