import re

def is_valid_email(email):
    return re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email)

def is_strong_password(password):
    return len(password) >= 6
