import json
from django.utils.crypto import get_random_string

# When you first download our project, you need to run this script.

chars = 'qwertyuiopasdfghjklzxcvbnm0987654321!@#$%^&*(-_=+)'
SECRET_KEY = get_random_string(50, chars)

value = {
    "SECRET_KEY": SECRET_KEY,
    "DOMAIN": 'please write domain',
    "CLIENT_ID": 'please write oauth2 client_id',
    "SECRET": 'please write oauth2 secret',
}

with open('secret.json', 'w') as result_file:
    json.dump(value, result_file, ensure_ascii=False)

print('Generated SECRET_KEY result : ' + SECRET_KEY)
print('Check if "secret.json" file is generated at the same directory with manage.py')
