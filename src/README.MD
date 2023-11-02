### 환경설정
- node v20
1. 모듈 설치
```shell
corepack enable
pnpm install
```
### 리워드 서버 실행
1. 서버 이미지 빌드
```shell
docker-compose build
```
1. 도커 실행
```shell
docker-compose up
```
1. 서버 작동확인
http://localhost:3002/health  
응답  
**healthy**

### 스웨거
스웨거 폴더 문서 참조
1. 로컬실행
```shell
node swagger
```

