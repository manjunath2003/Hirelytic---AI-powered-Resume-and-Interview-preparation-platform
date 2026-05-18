import uuid

def generate_meeting_link():
    """
    Generates a Google Meet style safe interview link.
    """
    unique_id = uuid.uuid4().hex[:10]
    return f"https://meet.google.com/{unique_id[:3]}-{unique_id[3:6]}-{unique_id[6:]}"
