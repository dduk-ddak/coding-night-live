# Coding-Night-Live
Coding-Night-Live는 코드랩에 이용할 수 있는 Web-based Communication Application입니다.
>코드랩이란 특정 기능을 개발하기 위해 단계를 나누고 목표를 세워 함께 배워나가는 행사입니다

코드랩 행사를 진행하면서 `Slack`이나 `PingPong` 등으로만 진행하는 데에는 불편함이 많습니다.

이를 해결하기 위하여 별도 설치가 필요 없는 Web기반의 Application을 만들게 되었습니다.

## 주요 기능
* 투표 기능(참가자들의 참여도 혹은 이해도 파악 가능, ...)
* 댓글 형식의 자유로운 질의응답
* 코드 공유(문법 하이라이팅) 및 정보 공유(공지 사항, 발표 자료, ...)
* 별도로 생성된 코드랩 URL을 가진 사람만 참여 가능
* 세미나 완료 후 pdf로 코드랩 내용 내보내기 가능
* 코드랩 참여 인원 파악 가능

## 사용 기술
* `python` 3.x
* `django` 1.9 or later
* `bootstrap`
* `sqlite3`
* `React`

## 서비스 이용해보기
1. Python 설치하기

    * [설치](https://python.org)

2. 기타 패키지 설치하기

    ```pip install requirements.txt```

3. 프로젝트 migrate 명령 실행하기

    ```python manage.py migrate```

4. 프로젝트 관리자 계정 생성하기

    ```python manage.py createsuperuser```

5. 프로젝트 서버 실행시키기

    ```python manage.py runserver```

6. `Google API Console`에서 `OAuth 2.0 Client ID` 생성하기

    * [Google API Console](https://console.developers.google.com/)
    * **사용자 인증 정보** 클릭
    * **사용자 인증 정보 만들기**에서 **OAuth Client ID** 선택
    * **이름**은 임의로 입력해준다.
    * **승인된 자바스크립트 원본**은 `http://localhost:8000`를 입력해주고, **승인된 리디렉션 URI**는 `http://localhost:8000/accounts/google/login/callback/`를 입력해준다.

7. `localhost:8000/admin`에 접속 후 application 설정 추가하기
    * **Sites**에서 `example.com`을 `localhost:8000`으로 변경하기
    * **Social Applications**에서 **ADD SOCIAL APPLICATION** 클릭하기
    * **Provider**는 `Google`선택, **Name**에는 Google API Console의 OAuth Client ID의 `이름` 입력하기
    * Google API Console의 OAuth Client ID를 참고하여 **Client id**에는 `클라이언트 ID`입력, **Secret Key**에는 `클라이언트 보안 비밀` 입력하기
    * **Chosen sites**에 `localhost:8000` 추가하기

## 소스 코드 라이센스
MIT 라이센스 하에 배포합니다. `LICENSE` 파일을 참고해주시길 바랍니다.
