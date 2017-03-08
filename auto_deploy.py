from django.contrib.sites.models import Stie
from allauth.socialaccount.models import SocialApp

def social_app_setting():
    default_site_1 = Site.objects.get(id=1)
    default_site_1.domain = 'localhost:8000'    # TODO
    default_site_1.name = 'localhost:8000'    # TODO
    default_site_1.save()
    
    new_social_app = SocialApp(
        id=1,
        provider='google',
        name='localhost:8000',
        client_id='temp',
        secret='temp',
        key='',
    )
    
    new_social_app.save()
    new_social_app.sites.add(default_site_1)
    new_social_app.save()

if __name__ == '__main__':
    print('test msg')
