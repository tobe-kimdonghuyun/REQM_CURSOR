전자정부 프레임워크 & Nexacro N 연동 가이드

전자정부 와 Nexacro N 연동 샘플로는 Template Project 의 Enterprise Business 프로젝트와 연동
Mysql, tomcat, jdk 등이 모두 포함되어있는 자료를 다운로드 받아 줍니다.

https://www.egovframe.go.kr/home/ntt/nttRead.do?pagerOffset=0&searchKey=&searchValue=
&menuNo=65&bbsId=4&nttId=1741

전자정부 프레임워크 사이트 > 개발자 교육 > 교육자료 > 표준프레임워크 개발자 교육 교재 및 실습 for Win (V3.10.0)

전자정부 프레임워크 & Nexacro N 연동 가이드

- 전자정부 프레임워크의 Template Project 의 Enterprise Business를 만들어 줍니다.

전자정부 프레임워크 & Nexacro N 연동 가이드

서버 세팅 후 mysql 과 서버를 실행하여 웹 화면이 정상적으로 실행되는지 확인 합니다.

ID     : admin
: 1
PW

전자정부 프레임워크 & Nexacro N 연동 가이드

Nexacro N 과 연동하여 바꿀 화면은 상단의 알림정보 > 공지사항의 화면 입니다.

전자정부 프레임워크 & Nexacro N 연동 가이드

기존 Template Project 파일 소스 수정 부분 (1/2)

pom.xml 에 json 통신을 위한
Jackson 을 추가해 줍니다.

기존 src/main/webapp/WEB-INF/jsp/cop/bbs/
EgovNoticeList.jsp 에서
<c:choose> 문을 사용하여 ‘공지사항‘ 인 경우
넥사크로 화면으로 전환하여 줍니다.
※ iframe 사용

전자정부 프레임워크 & Nexacro N 연동 가이드

기존 Template Project 파일 소스 수정 부분 (2/2)

기존 src/main/java/egovframework/let/cop/bbs/web/
EgovBBSManageController.java 의
selectBoardArticles 메소드에 소스 추가 부분
return 바로 윗줄에 추가 해 줍니다.

기존 src/main/resources/egovframework/
mapper/let/cop/bbs/
EgovBoard_SQL_mysql.xml 의
insertBoardArticle 에서 네모 부분들로
추가, 변경 해줍니다.

전자정부 프레임워크 & Nexacro N 연동 가이드

Nexacro N 연동 샘플은
생성된 샘플 프로젝트의 기능을 최대한 이용하여
기존의 Service, DAO, SQL 등은 그대로 사용하고
Controller 만 새로 만들어 처리 했습니다.

첨부된 egov_nexacroN.zip 파일 압축 해제 하면
아래와 같이 폴더들이 나오는데 각각

- 넥사크로 프로젝트
Controller 파일
-
- 넥사크로 generate 산출물

화살표와 같이 복사&붙여넣기 하여 줍니다.

Nexacro studio 로 작업할 경우
eGovNexa를 실행 시켜 준 후 프로젝트의 Generate Path 는
src/main/webapp/nexa_ui 로 잡고 Generate 하여 진행하면 됩니다.

전자정부 프레임워크 & Nexacro N 연동 가이드

공지사항 화면이며 페이징 처리가 되어 있어
게시물이 10건 초과 할 경우 페이징 버튼이 나타납니다.

전자정부 프레임워크 & Nexacro N 연동 가이드

검색조건에 검색어를 넣고 조회시 동작 화면 입니다.

전자정부 프레임워크 & Nexacro N 연동 가이드

공지사항 등록 화면이며
파일 선택 버튼을 통해 파일을 추가하거나, Delete버튼을 통해 추가한 파일을 삭제 할 수 있습니다.

전자정부 프레임워크 & Nexacro N 연동 가이드

공지사항 상세조회 화면이며 리스트에서 제목 클릭 시 이동 됩니다.
첨부된 파일이 있을경우 첨부파일 목록에서 파일명을 클릭 하면 파일 다운로드가 진행 됩니다.

전자정부 프레임워크 & Nexacro N 연동 가이드

공지사항 수정 화면 입니다.

<수정전>

<수정화면>

<수정후>

전자정부 프레임워크 & Nexacro N 연동 가이드

공지사항 상세조회 화면에서 답글 작성 버튼 클릭시 이동 화면 입니다.
답글 작성 시 글 아래에 ↳ 표시와 함께 등록 됩니다.

전자정부 프레임워크 & Nexacro N 연동 가이드

공지사항 상세조회 화면에서 삭제 버튼을 누를 시 동작 화면 입니다.

