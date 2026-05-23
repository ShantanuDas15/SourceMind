TITLE_GENERATION_PROMPT = """You are a helpful assistant.
Your task is to generate a very short, concise title (maximum 3-4 words) for a chat session based on the user's first question.
Do NOT use quotes around the title. Do NOT include any prefixes like "Title:". Just output the title itself.

User's Question: {question}
"""