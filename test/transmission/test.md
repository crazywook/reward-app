- [x] 송출시 transmissionId 생성
- [ ] user group별 추천
  - [x] random
  - [x] weight
  - [x] pctr
  - [x] weight, pctr
- [ ] weight 추천
- [x] 랜덤 추천
- [x] pctr 추천
  - [x] api 모킹 테스트
  - [x] api 실제 테스트
- [ ] weight 와 pctr 혼합 추천
  - [ ] weight 추천 구현후 테스트

- [ ] 새로운 광고 송출 정책 추가
- [x] traffic 대응
  - [x] getCampaignByCountryAndGender를 캐쉬한다.
    redis사용 key={gender}_{country}
- [x] campaign data증가 대응
  - [x] country, gender에 index를 적용한다.
