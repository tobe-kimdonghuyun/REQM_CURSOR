# 언어 응답 규칙

- 설명, 피드백, 질문 답변, 진행상황 등 모든 텍스트 응답은 **한글**로 작성한다.
- 코드, 명령어, 프로그래밍 언어 키워드, 배포 설정값(YAML, JSON 키 등)은 원문 그대로 유지한다.
- 코드 주석은 한글로 작성해도 무방하나, 코드 자체는 변경하지 않는다.

---

# Project Overview

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | nexacroN v21 / nexacroN v24, HTML, JavaScript, TypeScript |
| UI 라이브러리 | framer-motion, lucide-react, tailwind-merge, clsx |
| 백엔드 | Kotlin (Spring Boot), Python (FastAPI) |
| 빌드/배포 | NexacroN_Deploy_JAVA.jar, Apache Tomcat 9, BAT 스크립트 |
| 마이그레이션 | Jakarta 마이그레이션 (PowerShell 스크립트) |

## 프로젝트 주요 디렉토리

```
.claude/                   — Claude Code 프로젝트 설정
  ├── commands/            — 커스텀 슬래시 커맨드 정의 (.md → /커맨드명)
  ├── skills/              — 스킬 참조 문서 (nexacro-dev, nexacro-deploy 등)
  └── settings.local.json  — 로컬 권한·hooks·language 설정

SKILLS/                    — Claude Code 스킬 상세 가이드 (nexacro-dev, nexacro-deploy 등)
tools/                     — 배포 BAT 스크립트 및 Tomcat 제어 스크립트
scripts/                   — PowerShell 유틸리티 (Jakarta 변환, JAR 다운로드)
deploy/                    — 배포 설정 파일
DOC/                       — 개발·운영 문서, nexacroN/nexacroK 설계 문서
nexacroN 메뉴얼/            — nexacroN V24 오프라인 매뉴얼 HTML (developer_guide 등)
NTemplate/                 — nexacroN 프로젝트 템플릿
apache-tomcat-9.0.89/      — 로컬 Tomcat 9 서버 (conf/, webapps/ 등)
nexacrodeploy/             — nexacro 배포 도구 (NexacroN_Deploy_JAVA.jar 등)
scratch/                   — 임시 작업 폴더

nexacroK_UI/               — nexacroK UI 화면 프로젝트 모음
  └── EmRemSample/         — em/rem 단위 검증 샘플 프로젝트
        ├── Base/          — 기본 기능 화면 (Button, Grid, DynamicDataset 등)
        ├── FrameBase/     — 메인 프레임 (main.xfdl — Combo 메뉴 진입점)
        └── TestCase/      — em/rem 테스트 케이스 화면 (EmRemSample00~10, TestCase00~02)

nexacroN_UI/               — nexacroN UI 화면 프로젝트 소스
  ├── v21/                 — nexacroN v21 화면 프로젝트
  └── v24/                 — nexacroN v24 화면 프로젝트

nexacroN_generate/         — nexacroN Studio Generate/Deploy 결과물
  ├── output/              — Generate 결과물
  └── deploy/              — 최종 배포 결과물
```

---

# 코딩 컨벤션

## 공통 원칙

- 과도한 추상화 금지 — 단일 사용 헬퍼/유틸 함수 생성 지양
- 불필요한 하위 호환 코드, 주석 처리된 코드, 미사용 변수 남기지 않기
- 시스템 경계(사용자 입력, 외부 API)에서만 유효성 검사
- 에러 핸들링은 실제 발생 가능한 케이스에만 추가

## TypeScript / JavaScript

- `any` 타입 사용 최소화, 명시적 타입 선언 우선
- `async/await` 사용, `.then().catch()` 체이닝 지양
- 컴포넌트 파일은 PascalCase, 유틸 파일은 camelCase
- 상수는 `UPPER_SNAKE_CASE`

## Python

- Black formatter 기준 포맷팅
- type hint 필수 (`def foo(x: int) -> str:`)
- `f-string` 사용, `%` 포맷 지양
- 예외는 구체적인 타입으로 (`except ValueError` > `except Exception`)

## Kotlin

- `data class` 활용으로 불변 모델 선호
- null-safety: `!!` 연산자 사용 금지, `?.let {}` 또는 `?: return` 패턴 사용
- `companion object` 내 상수 정의
- 함수명은 camelCase, 클래스명은 PascalCase

## nexacroN / nexacroK

> **필독**: nexacroN 또는 nexacroK 관련 작업 시 **반드시** 아래 메뉴얼을 먼저 참조한다.
>
> 메뉴얼 루트: `D:\git_prj\REQM\nexacroN 메뉴얼\Nexacro N V24 매뉴얼  오프라인 메뉴얼\`
>
> | 파일명 | 용도 |
> |--------|------|
> | `developer_guide_nexacro_n_v24_ko.html` | 컴포넌트, Dataset API, transaction, 이벤트 처리 |
> | `advanced_development_guide_nexacro_n_v24_ko.html` | Grid 고급, 팝업, 탭, 모듈, 에러 처리 |
> | `deployment_guide_nexacro_n_v24_ko.html` | 빌드/배포, 서버 파일 구조 |
> | `development_tools_guide_nexacro_n_v24_ko.html` | Nexacro Studio, 디버거 사용법 |
> | `getting_started_nexacro_n_v24_ko.html` | 프로젝트 구조, 파일 타입(.xprj/.xadl/.xfdl) |
> | `server_setup_guide_nexacro_n_v24_ko.html` | Tomcat 설정, PlatformData, 인코딩 |
> | `module_developer_guide_nexacro_n_v24_ko.html` | 모듈(.xmodule) 개발, TypeDefinition |
> | `product_information_nexacro_n_v24_ko.html` | 지원 플랫폼/브라우저, v24 신규 기능 |
> | `improvement_a11y_guide_nexacro_n_v24_ko.html` | 접근성(Accessibility) 개선 가이드 |
>
> **xapi (서버 서비스 개발 Java API)**
> 메뉴얼 루트: `D:\git_prj\REQM\nexacroN 메뉴얼\xapi\korean\`
>
> | 경로 | 용도 |
> |------|------|
> | `com/nexacro/java/xapi/data/PlatformData.html` | 최상위 데이터 컨테이너 API |
> | `com/nexacro/java/xapi/data/DataSet.html` | 2차원 테이블 데이터 API |
> | `com/nexacro/java/xapi/data/VariableList.html` | 단일 변수 목록 API |
> | `com/nexacro/java/xapi/data/DataTypes.html` | 데이터 타입 상수 목록 |
> | `com/nexacro/java/xapi/data/ColumnHeader.html` | 컬럼 헤더 정의 API |
> | `com/nexacro/java/xapi/tx/HttpPlatformRequest.html` | HTTP 요청 수신 API |
> | `com/nexacro/java/xapi/tx/HttpPlatformResponse.html` | HTTP 응답 송신 API |
> | `com/nexacro/java/xapi/tx/PlatformException.html` | 예외 처리 |

### 기본 규칙

- 이벤트 핸들러명: `컴포넌트명_이벤트명` (예: `btnSave_onclick`)
- 공통 함수는 `gfn_` prefix 사용
- Dataset 컬럼명은 대문자 스네이크케이스 (예: `USER_ID`)
- 화면 스크립트는 기능 단위로 구역 주석 구분
- 화면은 `.xfdl` 확장자 파일 — XML(컴포넌트/레이아웃) + nexacro 스크립트(로직) 혼합
- 스크립트는 `<Script><![CDATA[ ... ]]></Script>` 태그 내부에 function으로 작성 javascript문법을 사용하고 있다 
- `nexacrodeploy.exe`를 통해 nexacroK, nexacroN 모두 빌드 → 최종 `.js` 파일 생성 (현재 미설치, 추후 추가 예정)

### 프로젝트 파일 구조

| 확장자 | 역할 |
|--------|------|
| `.xprj` | 프로젝트 파일 (전체 프로젝트 설정) |
| `.xadl` | Application Definition — 앱 진입점, 전역 변수, 글로벌 Dataset 설정 |
| `.xfdl` | Form Definition — 화면 단위 UI + 스크립트 |
| `.xjs` | 외부 스크립트 파일 (공통 함수 모듈) |
| `.xtheme` | 테마/스타일 정의 |

**빌드 실행 흐름**: `launch.html` → `nexacro.js` 로드 → `application.xadl` 초기화 → startup Form 표시

### 주요 컴포넌트 목록

| 분류 | 컴포넌트 |
|------|---------|
| 입력 | `Edit`, `TextArea`, `Combo`, `CheckBox`, `Radio`, `Calendar`, `DateField` |
| 버튼 | `Button`, `ImageButton`, `CheckButton` |
| 표시 | `Static`, `Image`, `Grid`, `ListBox`, `ProgressBar` |
| 컨테이너 | `Div`, `Panel`, `PopupDiv`, `Tab` |
| 기타 | `FileUpload`, `FileDownload`, `WebBrowser`, `Menu`, `PopupMenu` |

**컴포넌트 ID 네이밍 prefix 권장**: `btn_`, `edt_`, `grd_`, `ds_`, `cmb_`, `chk_`, `div_`, `tab_`, `lst_`

### Dataset을 Grid에 연결방법
 - 2가지 방법이 있음 
   - 생성된 Grid의 binddataset에 텍스트로 바로 설정한다 
   - script통해서 동적으로 등록한다 예시로:  this.grd_main.binddataset  = "동적생성된 dataset id"
### nexacro grid의 엑셀처럼 내보내기 기능
- 기본적으로 제공되는 grid의 saveXLS로직을 가져와서 사용하면됨
- 기본제공되는 saveXLS를 사용하면 엑셀로 내보내기기능을 구현할수 있음.  
### Dataset API

```javascript
// 행 추가
var nRow = this.dsMain.addRow();

// 값 설정/조회
this.dsMain.setColumn(nRow, "USER_ID", "hong");
var val = this.dsMain.getColumn(nRow, "USER_ID");

// 행 삭제
this.dsMain.deleteRow(nRow);

// 행 검색
var foundRow = this.dsMain.findRow("USER_ID", "hong");

// 전체 행 수
var cnt = this.dsMain.rowcount;

// 대량 데이터 처리 시 화면 갱신 비활성화 (성능)
this.dsMain.updatecontrol = false;
// ... 반복 처리 ...
this.dsMain.updatecontrol = true;

// Dataset 필터 적용
this.dsMain.setFilter("STATUS == 'Y'");
this.dsMain.setFilter("");  // 필터 해제

// 행 타입 (ROWTYPE_NORMAL, ROWTYPE_INSERT, ROWTYPE_UPDATE, ROWTYPE_DELETE)
this.dsMain.setRowType(nRow, Dataset.ROWTYPE_NORMAL);
```

### 서비스 통신 (transaction)

```javascript
// 기본 패턴
this.transaction(
    "svcId",             // 서비스 식별자
    "/api/endpoint",     // URL
    "dsSearch:dsSearch", // 입력 Dataset (로컬명:서버명)
    "dsResult:dsResult", // 출력 Dataset
    "",                  // 추가 파라미터
    "fn_callback"        // 콜백 함수명 (문자열)
);

// 콜백 패턴 — errCode 반드시 확인
this.fn_callback = function(svcId, errCode, errMsg) {
    if (errCode < 0) {   // 시스템 오류
        alert("시스템 오류: " + errMsg);
        return;
    }
    if (errCode > 0) {   // 업무 오류
        alert("업무 오류: " + errMsg);
        return;
    }
    // 성공 처리
};
```

### 이벤트 처리 패턴

```javascript
// 버튼 클릭
this.btnSearch_onclick = function(obj, e) { };

// Combo 항목 변경
this.cmbStatus_onitemchanged = function(obj, e) {
    var val = obj.value;
};

// Grid 셀 클릭
this.grdMain_oncellclick = function(obj, e) {
    var rowIdx = e.row;
    var colIdx = e.cell;
};

// Grid 헤더 클릭 (정렬/전체선택)
this.grdMain_onheadclick = function(obj, e) { };

// 키보드 단축키 (Form 레벨)
this.Form_onkeydown = function(obj, e) {
    if (e.ctrlKey && e.keycode == 83) { fn_save(); return false; }  // Ctrl+S
    if (e.keycode == 13) { fn_search(); return false; }              // Enter
    if (e.keycode == 27) { this.close(); return false; }             // Esc
};
```

### Form 생명주기 이벤트

```javascript
// 화면 최초 로드 (1회 실행) — 초기화 로직
this.Form_onload = function(obj, e) {
    fn_initForm();
    fn_loadInitData();
};

// 화면 활성화 시마다 실행 — 데이터 갱신
this.Form_onactivate = function(obj, e) { };

// 화면 비활성화 시
this.Form_ondeactivate = function(obj, e) { };

// 화면 종료 전 — return false 시 종료 취소
this.Form_onclose = function(obj, e) {
    if (!fn_validateBeforeClose()) return false;
};
```

### 팝업(Popup) 패턴

```javascript
// 팝업 열기
this.openPopup("popUser", "xfdl/UserPopup.xfdl",
    { p_userId: this.edtUserId.value, p_mode: "edit" },
    "fn_popupCallback");

// 팝업 내부 — argument로 전달된 데이터 수신
this.Form_onload = function(obj, e) {
    var userId = this.argument.p_userId;
    var mode   = this.argument.p_mode;
};

// 팝업 닫기 + 데이터 반환
this.btnConfirm_onclick = function(obj, e) {
    this.close({ resultCode: "OK", userId: this.edtUserId.value });
};

// 팝업 콜백 처리
this.fn_popupCallback = function(popupObj, returnValue) {
    if (returnValue && returnValue.resultCode == "OK") {
        this.edtUserId.set_value(returnValue.userId);
    }
};
```

### Div 동적 폼 로드

```javascript
// Div에 xfdl 로드
this.divContent.set_url("Form::SubForm.xfdl");

// Div 내부 컴포넌트 접근
var innerValue = this.divContent.form.dsMain.getColumn(0, "USER_ID");
var innerGrid  = this.divContent.form.grdMain;
```

### 공통 함수(gfn_) 필수 패턴

```javascript
// Null/빈값 처리
function gfn_nvl(val, defaultVal) {
    return (val == null || val == undefined || val == "") ? defaultVal : val;
}

// 날짜 조회 — "YYYYMMDD" 형식
function gfn_getToday() { /* 오늘 날짜 반환 */ }

// 문자열 좌우 패딩
function gfn_lpad(str, len, padChar) { /* "1" → "0001" */ }
function gfn_rpad(str, len, padChar) { /* "1" → "1000" */ }

// 숫자 포맷
function gfn_numFormat(num) { return Number(num).toLocaleString(); }

// 유효성 검증 (이메일, 전화번호 등)
function gfn_isEmail(email) { /* regex 검증 */ }
function gfn_isPhone(phone) { /* regex 검증 */ }
```

### Grid 주요 패턴

```javascript
// 그리드 선택 행 배열 가져오기
var aRows = this.grdMain.getSelectRowArray();

// 셀 스타일 동적 변경
this.grdMain_ongetcellstyle = function(obj, e) {
    if (this.dsMain.getColumn(e.row, "STATUS") == "ERROR") {
        e.style.background = "#ffcccc";
    }
};

// 컬럼 표시/숨김
this.grdMain.setColHidden(colIndex, true);

// 전체 선택 체크박스 (헤더 클릭 시)
this.grdMain_onheadclick = function(obj, e) {
    if (e.cell == 0) obj.setAll("select", !obj.getCheckOldValue(0));
};
```

### Application 전역 변수

```javascript
// 전역 변수 저장/조회
application.setGlobal("USER_ID", "hong");
var userId = application.getGlobal("USER_ID");
```

### xapi 서버 서비스 개발 (Java)

transaction() 호출 시 서버에서 처리하는 Java 서비스는 **nexacro xapi** 라이브러리로 구현한다.

#### 패키지 구조 및 import

```java
import com.nexacro.java.xapi.data.*;            // PlatformData, DataSet, VariableList, DataTypes, ColumnHeader
import com.nexacro.java.xapi.data.datatype.*;   // PlatformDataType
import com.nexacro.java.xapi.tx.*;              // HttpPlatformRequest, HttpPlatformResponse, PlatformException, PlatformType
```

#### PlatformData 구조

```
PlatformData (최상위 컨테이너)
  ├─ VariableList  — 단일 파라미터 (ErrorCode, ErrorMsg, 검색조건 등)
  └─ DataSetList   — DataSet 목록 (2차원 테이블 데이터)
       └─ DataSet  — ColumnHeader 목록 + 행 데이터
```

#### DataTypes 상수 (컬럼 타입 지정 시 사용)

| 상수 | Java 타입 | 포맷 |
|------|---------|------|
| `DataTypes.STRING` | `String` | - |
| `DataTypes.INT` | `int` | - |
| `DataTypes.LONG` | `long` | - |
| `DataTypes.DOUBLE` | `double` | - |
| `DataTypes.FLOAT` | `float` | - |
| `DataTypes.BIG_DECIMAL` | `BigDecimal` | - |
| `DataTypes.BOOLEAN` | `boolean` | - |
| `DataTypes.DATE` | `Date` | yyyyMMdd |
| `DataTypes.DATE_TIME` | `Date` | yyyyMMddHHmmssSSS |
| `DataTypes.BLOB` | `byte[]` | - |

#### DataSet API

```java
// 컬럼 정의
DataSet ds = new DataSet("dsResult");
ds.addColumn(new ColumnHeader("USER_ID",   DataTypes.STRING, 20));
ds.addColumn(new ColumnHeader("USER_NM",   DataTypes.STRING, 50));
ds.addColumn(new ColumnHeader("REG_DT",    DataTypes.DATE));
ds.addColumn(new ColumnHeader("AMT",       DataTypes.BIG_DECIMAL));

// 행 추가 및 값 설정
int row = ds.newRow();
ds.setValue(row, "USER_ID", "hong");
ds.setValue(row, "USER_NM", "홍길동");
ds.setValue(row, "AMT",     new BigDecimal("50000.00"));

// 값 읽기 (타입별)
String  userId = ds.getString(i,  "USER_ID");
int     cnt    = ds.getInt(i,     "CNT");
double  amt    = ds.getDouble(i,  "AMT");
Date    dt     = ds.getDateTime(i,"REG_DT");
Object  val    = ds.getObject(i,  "COL");

// 행 상태 확인 — 클라이언트가 변경한 행 처리 시 필수
int rowType = ds.getRowType(i);
// ROW_TYPE_NORMAL=0, ROW_TYPE_INSERT=1, ROW_TYPE_UPDATE=2, ROW_TYPE_DELETE=3
```

#### VariableList API

```java
VariableList varList = resData.getVariableList();
varList.add("ErrorCode", 0);          // int
varList.add("ErrorMsg",  "SUCCESS");  // String
varList.add("TotalCnt",  100);

// 요청 Variable 읽기
VariableList inVar = reqData.getVariableList();
String searchNm = inVar.getString("SEARCH_NM");
int    pageNo   = inVar.getInt("PAGE_NO");
```

#### 완전한 JSP 서비스 패턴

```jsp
<%@ page import="com.nexacro.java.xapi.data.*, com.nexacro.java.xapi.tx.*" %>
<%@ page contentType="text/xml; charset=UTF-8" %>
<%
    out.clearBuffer();  // 필수 — 앞선 출력 제거
    
    // 1. 요청 수신
    HttpPlatformRequest req = new HttpPlatformRequest(request);
    req.receiveData();
    PlatformData reqData = req.getData();
    
    // 2. 입력값 추출
    VariableList inVar = reqData.getVariableList();
    String searchNm = inVar.getString("SEARCH_NM");
    DataSet dsIn = reqData.getDataSet("dsSearch");
    
    // 3. 응답 생성
    PlatformData resData = new PlatformData();
    
    // 4. 결과 Dataset 구성
    DataSet dsOut = new DataSet("dsResult");
    dsOut.addColumn(new ColumnHeader("USER_ID", DataTypes.STRING, 20));
    dsOut.addColumn(new ColumnHeader("USER_NM", DataTypes.STRING, 50));
    // ... DB 조회 후 행 추가 ...
    resData.addDataSet(dsOut);
    
    // 5. 처리 결과 Variable
    resData.getVariableList().add("ErrorCode", 0);
    resData.getVariableList().add("ErrorMsg",  "SUCCESS");
    
    // 6. 응답 송신
    HttpPlatformResponse res = new HttpPlatformResponse(response, req);
    res.setData(resData);
    res.sendData();
%>
```

#### Servlet 패턴 (복잡한 비즈니스 로직 시)

```java
protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
    try {
        HttpPlatformRequest  req     = new HttpPlatformRequest(request);
        req.receiveData();
        PlatformData         reqData = req.getData();
        PlatformData         resData = processService(reqData);
        HttpPlatformResponse res     = new HttpPlatformResponse(response, req);
        res.setData(resData);
        res.sendData();
    } catch (PlatformException e) {
        sendError(response, -1, e.getMessage());
    } catch (Exception e) {
        sendError(response, -999, "서버 오류: " + e.getMessage());
    }
}
```

#### 행 상태(RowType)별 CRUD 처리 패턴

```java
DataSet dsIn = reqData.getDataSet("dsSave");
for (int i = 0; i < dsIn.getRowCount(); i++) {
    int rowType = dsIn.getRowType(i);
    if (rowType == DataSet.ROW_TYPE_INSERT) {
        // INSERT
    } else if (rowType == DataSet.ROW_TYPE_UPDATE) {
        // UPDATE
    } else if (rowType == DataSet.ROW_TYPE_DELETE) {
        // DELETE
    }
}
```

#### ContentType / 인코딩 설정

| 항목 | 설정값 |
|------|--------|
| JSP contentType | `text/xml; charset=UTF-8` |
| Binary 응답 | `PlatformType.CONTENT_TYPE_BINARY` |
| ZLIB 압축 | `res.addProtocolType(PlatformType.PROTOCOL_TYPE_ZLIB)` |
| Tomcat JVM 옵션 | `-Dfile.encoding=UTF8` |

**Excel MIME 타입 (web.xml):**
```xml
<mime-mapping>
  <extension>xlsx</extension>
  <mime-type>application/vnd.openxmlformats-officedocument.spreadsheetml.sheet</mime-type>
</mime-mapping>
```

#### xapi 서비스 개발 체크리스트

- `out.clearBuffer()` 호출 (JSP에서 필수)
- `receiveData()` / `sendData()` 는 반드시 `try-catch(PlatformException)` 으로 감쌀 것 
- 응답에 `ErrorCode` (0=성공, 음수=오류) + `ErrorMsg` 포함 필수
- 저장 서비스는 `getRowType()` 으로 INSERT/UPDATE/DELETE 분기 처리
- 컬럼명은 **대문자** 사용 (클라이언트 Dataset과 일치해야 함)

### 모듈(.xmodule) 개발

모듈은 재사용 가능한 복합 컴포넌트(Composite Component) 단위이다.

**패키지 구성:**
```
MyModule.xmodule
├── module.xml        — 타입 정의 (Property, Method, Event)
├── MyModule.xcdl     — 컴포지트 컴포넌트 UI 레이아웃
├── MyModule.js       — 동작 로직 (prototype 기반)
└── resource/         — 이미지, xcss 스타일
```

**모듈 스크립트 기본 구조:**
```javascript
nexacro.MyModule = function(name, left, top, width, height) {
    nexacro._CompositeComponent.call(this, name, left, top, width, height);
    this._p_myProp = "";
};
nexacro.MyModule.prototype = Object.create(nexacro._CompositeComponent.prototype);

// getter/setter
nexacro.MyModule.prototype.set_myProp = function(v) {
    if (this._p_myProp != v) { this._p_myProp = v; }
};
nexacro.MyModule.prototype.get_myProp = function() {
    return this._p_myProp;
};
```

**모듈 배포/설치:** `Deploy > Module Package` 생성 후 `File > Install Module`로 설치 → 컴포넌트 팔레트에 자동 등록.

### em/rem 단위 지원 속성

nexacroK/nexacroN에서 em/rem 단위를 사용할 수 있는 속성 목록:

| 속성 | em 기준 | 비고 |
|------|---------|------|
| `width`, `height` | self font | |
| `minwidth`, `maxwidth`, `minheight`, `maxheight` | MainFrame font | rem 사용 권장 |
| `padding` | self font | 1~4방향 모두 가능 |
| `border` | self font | 두께 부분만 |
| `borderRadius` | self font | |
| `font` | 부모 font | font-size 부분 |
| `letterSpacing` | self font | 음수도 허용 |
| `wordSpacing` | self font | |
| `textPadding` | self font | |
| `background` | self font | size/position 부분 |
| `boxShadow` | self font | offset/blur/spread |

- **em** = 해당 컴포넌트 자신의 font-size 기준
- **rem** = MainFrame의 font-size 기준
- **규칙: em/rem 속성은 XML에 직접 쓰지 않고, `FormId_onload` 스크립트에서 설정한다**

```javascript
// Form 태그: <Form id="MyForm" ... onload="MyForm_onload">
this.MyForm_onload = function(obj:nexacro.Form, e:nexacro.LoadEventInfo)
{
    this.btn01.padding       = "1em";
    this.btn01.border        = "0.5em solid #3B82F6";
    this.btn02.letterSpacing = "0.1em";
    this.btn02.wordSpacing   = "0.2em";
    this.btn03.font          = "0.8em/normal \"Malgun Gothic\"";
    this.btn04.boxShadow     = "0.2em 0.2em 0.5rem rgba(0,0,0,0.3)";
};
```

- `text` 속성 값에 em/rem 문자열이 포함되어도 제거 대상 아님 (설명 텍스트)
- 화면 초기화 버튼 패턴: `this.reload()` — taborder 마지막+1, left=1165, top=8

### xfdl 파일 복사·리네임 체크리스트

xfdl 파일을 복사하거나 파일명을 변경할 때 반드시 내부를 함께 수정한다:

1. `<Form id="...">` — 새 파일명과 동일하게 수정 (`MyForm01.xfdl` → `id="MyForm01"`)
2. `onload="..."` — 새 Form id에 맞게 수정 (`onload="MyForm01_onload"`)
3. 스크립트 내 `this.OldName_onload = function(...)` — 새 이름으로 수정
4. `$Geninfo$.geninfo` — 빌드 시 자동 재생성이므로 별도 수정 불필요

> xfdl 파일 인코딩: **UTF-8 without BOM** (첫 3바이트 `3C 3F 78` = `<?x`)  
> PowerShell 수정 시: `New-Object System.Text.UTF8Encoding($false)` 사용

연속 리네임 시 충돌 방지: 임시 파일명을 경유한다 (10→tmp, 09→10, …, 01→02, tmp→01).

### main.xfdl dsMenu 관리

`FrameBase/main.xfdl`의 `dsMenu` Dataset에서 Combo 메뉴 항목을 관리한다:

```xml
<!-- Column0 = 순서 코드(정수), Column1 = Namespace::파일명.xfdl -->
<Row>
  <Col id="Column1">TestCase::MyNewForm.xfdl</Col>
  <Col id="Column0">17</Col>
</Row>
```

- Namespace: `TestCase::` (TestCase 폴더), `Base::` (Base 폴더)
- **새 xfdl 파일 생성 시 반드시 dsMenu에 Row 추가**
- Div에 로드되는 서브 폼(예: `EmRemChild.xfdl`)은 추가 여부를 별도 판단

### Dataset 심화 API (V24 매뉴얼 분석)

```javascript
// 행 검색 — 범위 지정 가능
var nRow = this.ds.findRow("COL", "100", 10, 10000);  // 10~10000행 범위
var nRow = this.ds.findRowExpr("dept_cd == 'A2' && pos_cd > '03'", 2, 10);

// filter — 빈문자열=해제, 인수없음=직전조건 재적용
this.ds.filter("amount > 1000 && model_cd = 'A-1'");
this.ds.filter("");   // 해제
this.ds.filter();     // 직전 조건 재적용

// keystring — S(정렬)/G(그룹)/O(locale옵션)
this.ds.keystring = "G:+column0,S:-column1";
this.ds.keystring = "S:Column0,O:Column0[en-US]{\"caseFirst\":\"upper\",\"numeric\":true}";

// 조건부 집계
this.ds.getCaseSum("Column0 > 10", "Column0");
this.ds.getCaseCount(strExpr, "Column0");

// 그룹 범위 집계 (소계 행 클릭 시)
var s = this.ds.getGroupRangeStart(e.row);
var cnt = this.ds.getGroupRangeCount(e.row);
this.ds.getAvg("Column1", s, s + cnt);
// getRowLevel(row) == 0 이면 그룹(소계) 행

// 변경 전 값 / 삭제된 행 조회
var orgVal = this.ds.getOrgColumn(i, "COL");       // 변경 전 원본 값
var delCnt = this.ds.getDeletedRowCount();
var delVal = this.ds.getDeletedColumn(i, "COL");

// Dataset 통째 복사
this.ds_copy.copyData(this.ds_input);

// 스크립트 동적 Dataset 생성 + Grid 바인딩
var ds = new Dataset; ds.name = "ds_data";
this.addChild("ds_data", ds);
this.ds_data.addColumn("COL0", "String");
this.Grid00.binddataset = "ds_data";
this.Grid00.createFormat();   // 동적 바인딩 후 필수

// RowType 강제변경 시 updatecontrol=false 필수
this.ds.updatecontrol = false;
this.ds.setRowType(i, Dataset.ROWTYPE_NORMAL);
this.ds.updatecontrol = true;
```

### transaction() Promise/async-await 패턴

```javascript
// 전체 시그니처: transaction(svcId, url, inDs, outDs, args, callbackFn, bAsync)
// bAsync 기본 true. 콜백명을 null로 주면 Promise 반환

// Promise 패턴
var req = this.transaction(svcId, url, null, "dsResult:dsResult", null, null, true);
req.then(function(result) {
    var ErrorCode = result[0], ErrorMsg = result[1];
}).catch(function(err) { trace(err[1]); });

// async/await 패턴
this.fn_load = async function() {
    try {
        var result = await this.transaction(svcId, url, null, "dsResult:dsResult", null);
        var ErrorCode = result[0], ErrorMsg = result[1];
    } catch(err) { trace(err[1]); }
};

// URL에 로컬 리소스 Namespace 사용 가능
this.transaction(svcId, "FileSample::sample.xml", null, "dsResult:dsResult", null, "fn_callback");
```

### DataObject — REST/JSON 통신

nexacro v24에서 제공하는 REST API 직접 통신 방식 (`transaction` 대안).

```javascript
// POST 요청
var header = { "Content-Type": "application/json; charset=UTF-8" };
this.DataObject00.request("CREATE", "POST", url, {
    "httpheader": header,
    "postdata": JSON.stringify(body)
});

// 이벤트: onsuccess → onload, 오류 시 onerror
this.DataObject00_onsuccess = function(obj, e) {
    if (e.statuscode > 200) {
        e.preventDefault();
        this.TextArea00.value = obj.getResponse();
    }
};

// Dataset 바인딩: binddataobject + dataobjectpath(JSONPath "$.data.items")
// twoway 바인딩 지원 — Dataset 변경 시 DataObject에 자동 반영
```

### 스크립트 유효범위(scope) — `this` 사용 근거

nexacro 스크립트는 표준 JS와 스코프가 다름. `this` 없이 쓴 변수는 글로벌 멤버가 됨.

```javascript
alert("msg");                              // JS 표준 alert
this.alert("msg");                         // Form.alert()
nexacro.getApplication().alert("msg");     // Application.alert()

// transaction/close 등 Form 메서드는 반드시 this. 로 호출
this.transaction(svcId, url, ...);

// 전역값은 global 변수 대신 appVariables 권장
nexacro.getApplication().addVariable("USER_ID", "hong");
nexacro.getApplication().getVariable("USER_ID");
```

**명명 제약 (화면이 뜨지 않는 원인):**
- 언더바(`_`)로 시작하는 변수/함수명 금지 — 라이브러리 내부 충돌
- `createComponent` 등 라이브러리 예약 함수명 금지
- 컨테이너 멤버명과 같은 컴포넌트 id 금지 (예: Button id를 `text`로, Dataset 컬럼을 `length`로 지정 불가)

### V24 동작 변경점 (v21 → v24 마이그레이션 시 주의)

| 구분 | 변경 전 | 변경 후 |
|------|---------|---------|
| 부등호 연산자 | `<>` | `!=` |
| switch-case 타입 비교 | 느슨한 비교 | 엄격 비교 (`case "2"` ≠ `case 2`) |
| regex replace | 전체 치환 | `/g` 없으면 첫 번째만 치환 |
| 소수점 반올림 | `Math.floor(v, digit)` | `nexacro.floor(v, digit)` |
| 이미지 객체 | `new Image()` | `new nexacro.Image()` |
| CSS 클래스 | `.class` | `.cssclass` |

### Frame Tree 참조 경로

```javascript
this.parent;                           // form → 부모 childframe
this.getOwnerFrame();                  // form → 소속 childframe
this.div0.form.btn0;                   // Div 내부 컴포넌트
this.div1.form.ds2.parent.parent.name; // "form"

// Div 서브 폼에서 부모 폼 컴포넌트 접근
this.parent.parent.edtSearch;          // Div → form → 컴포넌트

// id 중복: 동일 레벨에서만 금지. btn0 와 div0.form.btn0 는 공존 허용
```

### 생명주기 이벤트 정확한 순서

```
environment.onload
→ application.onloadingappvariables
→ mainframe.onactivate
→ childframe.onactivate
→ application.onload
→ form.oninit
→ form.onload
→ form.onactivate
→ application.onloadforms
```

### Grid Cell expr 스크립트

Grid 셀 내부에서 `expr:` 표현식 사용 시 `this`는 Cell 컨텍스트이며 Form이 아님.

```xml
<Cell text="expr:column00"/>                       <!-- 바인딩 Dataset 컬럼 -->
<Cell text="expr:comp.currentcell"/>               <!-- comp = Grid 자신 -->
<Cell text="expr:dataset.parent.fn_format(row)"/>  <!-- Form 함수 호출 -->
```

### 앱 캐시 (CacheLevel)

| 값 | 동작 |
|----|------|
| `none` | 캐시 미사용 — 매번 서버에서 수신 |
| `dynamic` | 서버 변경 시에만 재다운로드 (기본 권장) |
| `session` | 실행 시 1회 캐시, 종료까지 유지 |
| `static` | 재실행해도 로컬 캐시만 사용 |

```javascript
// 특정 서비스의 캐시 레벨 동적 변경
nexacro.getEnvironment().services["base"].cachelevel = "none";
```

### Dataset JSON 포맷 `_rowtype_` (서버 통신 디버깅)

서버에 전송되는 JSON 데이터의 행 상태값:

| 값 | 의미 |
|----|------|
| `n` | normal (변경 없음) |
| `i` | inserted (추가) |
| `u` | updated (수정) |
| `d` | deleted (삭제) |
| `o` | original — 바로 앞 `u` 행이 있을 때만 존재 (수정 원본값) |

### nexacrodeploy 콘솔 도구 (빌드 자동화)

```bash
# 필수 4개 옵션
nexacrodeploy.exe -P [xprj경로] -O [출력경로] -B [nexacrolib경로] -GENERATERULE [generate룰경로]

# Generate + Deploy + 압축 + 난독화
nexacrodeploy.exe -P "C:\Test.xprj" -O "E:\Gen" -B "C:\nexacrolib" \
    -GENERATERULE "C:\generate" -D "E:\Deploy" -COMPRESS -SHRINK
```

| 옵션 | 설명 |
|------|------|
| `-SERVICE "Base,FrameBase"` | 서비스 선택 (콤마 뒤 공백 금지) |
| `-REGENERATE` | 변경 무시, 전체 재변환 |
| `-COMPRESS` | 공백·주석 제거 |
| `-SHRINK` | JS 난독화 (`eval` 함수 제외) |
| `-MERGE` / `-MERGEXCSS` | JS/XCSS 병합 (HTTP 요청 수 감소) |
| `-COMPILE` | NRE 전용 암호화 |

> Generate Rule 경로: `[SDK]/{24.x}/generate` 폴더. 구 `-CSSRULE`는 폐지됨.

### NRE 원격 디버깅 (Chrome inspect)

```bash
# 1. Environment: enableinspector=true 설정
# 2. NRE 실행 시 원격 디버깅 포트 지정
nexacro.exe -K "KEY" -S "http://localhost:8080/start.json" -RPP 127.0.0.1:9223 -brk "true"
# 3. Chrome → chrome://inspect → 포트 추가(9223) → inspect 클릭
```

### NRE 로그 설정 (nexacro_config.xml)

```xml
<nexacro-config os="windows">
  <application file-logging="true" loglevel="debug" tracemode="new" traceduration="-1"/>
  <log filepath="%USERAPP%\Log\nre.log" filesize="408960" backupfilecount="5"/>
</nexacro-config>
```
- `loglevel`: `fatal|error|warn|info|debug` (trace()는 debug 레벨)
- Windows/macOS NRE 전용 (웹 브라우저 환경 미지원)

### Nexacro Studio 주요 단축키

| 기능 | 단축키 |
|------|--------|
| 새 Form 만들기 | `Ctrl+N` |
| Dataset Editor | `Ctrl+D` |
| 화면 실행(Launch) | `Ctrl+F5` |
| Quick View | `Ctrl+F6` |
| 파일 내 검색 | `Ctrl+Shift+F` |
| Properties | `Alt+Enter` |
| ID 복사(부모 포함) | `Ctrl+Shift+C` |
| 인텔리센스 | `Ctrl+Space` |
| 중단점 토글 | `F9` |
| Step Into/Over/Out | `F11` / `F10` / `Shift+F11` |
| 디버그 시작/중지 | `F5` / `Shift+F5` |
| 커서까지 실행 | `Ctrl+F10` |

### ChildFrame / 팝업 고급 패턴

```javascript
// 모달 ChildFrame 동적 생성
var cf = new ChildFrame();
cf.init("childframe00", 0, 0, 300, 300, null, null);
cf.openalign = "center middle";
cf.resizable = true;
cf.overlaycolor = "rgba(0,0,0,0.3)";
cf.showModal(this.getOwnerFrame());

// nexacro.open — 새 브라우저/NRE 창에 속성 전달
nexacro.open("POPUP", "Sample::frame.xfdl",
    nexacro.getApplication().getActiveFrame(),
    { p_userId: "hong", p_mode: "view" }
);
// 수신측: var userId = this.parent.p_userId;

// 엔터키 네비게이션 (다음 컴포넌트로 포커스 이동)
this.Form_onkeydown = function(obj, e) {
    if (e.keycode == 13) {
        obj.getNextComponent(this.getFocus(), true).setFocus();
    }
};
// 특정 버튼에서 엔터 전파 차단
this.btnSubmit_onkeydown = function(obj, e) { return true; };
```

### xapi 서버 개발 보완 (V24 매뉴얼 분석)

#### Jakarta EE 지원 (중요)

| Tomcat 버전 | 패키지 |
|------------|--------|
| Tomcat 9 이하 | `javax.servlet.*` |
| Tomcat 10 이상 | `jakarta.servlet.*` |

> 환경에 맞는 X-API 빌드(jar)를 사용해야 함. 패키지 불일치 시 ClassNotFoundException 발생.

#### java.lang.IllegalStateException 대처 (빈발 이슈)

SSV/Binary 전송 시 발생 (XML/CSV는 미발생). JSP 대신 **Servlet** 사용이 근본 해결책.  
Tomcat/WebSphere에서 발생, WebLogic/JEUS에서는 자동 무시됨.

#### HTTP GET 파라미터 수신

```java
req.setProperty("http.getparameter.register", "true");
req.setProperty("http.getparameter.asvariable", "true");  // true=Variable, false=DataSet
```

#### ZLIB 압축 응답

```java
HttpPlatformResponse res = new HttpPlatformResponse(response, PlatformType.CONTENT_TYPE_BINARY);
res.addProtocolType(PlatformType.PROTOCOL_TYPE_ZLIB);
res.setData(resData);
res.sendData();
```

#### nexacro-xeni Excel 내보내기/가져오기 (web.xml 등록 필수)

```xml
<!-- web.xml -->
<servlet>
  <servlet-name>XExportImport</servlet-name>
  <servlet-class>com.nexacro.java.xeni.services.GridExportImportServlet</servlet-class>
</servlet>
<servlet-mapping>
  <servlet-name>XExportImport</servlet-name>
  <url-pattern>/XExportImport</url-pattern>
</servlet-mapping>
```
클라이언트: `ExcelExportObject`/`ExcelImportObject`의 `exporturl`/`importurl`을 `/XExportImport`로 설정.

> **null 문자(0x00) 주의**: NRE는 0x00을 문자열 종료로 인식하므로, X-API 응답 데이터에 0x00이 포함되면 잘림 현상 발생.

### 모듈(.xmodule) 개발 — Action형

Composite Component형 외에 **Action형** 모듈도 존재 (nexacro v24 실측 확인).

**Action형 모듈 내부 구조 (xmodule은 ZIP):**
```
SimpleActionTest.xmodule (ZIP)
├── SimpleActionTest.json              ← 매니페스트
└── SimpleActionTest/
    ├── TestQueryAction.js             ← 동작 로직
    └── _metainfo_/{KOR,ENG,JPN}/      ← TypeDefinition (*.info, MetaInfo XML)
```

**매니페스트 JSON 핵심 키:**
```json
{
  "name": "SimpleActionTest",
  "moduletype": "action",
  "version": "1.0.0",
  "minnexacroversion": "24.0.0",
  "scripts": ["SimpleActionTest/TestQueryAction.js"]
}
```

**Action형 모듈 .js 패턴:**
```javascript
(function(nexacro) {
    "use strict";
    if (nexacro.TestAlertAction) return;   // 중복 로드 가드

    var TestAlertAction = function(id, parent) {
        nexacro.Action.call(this, id, parent);
    };
    var _p = nexacro._createPrototype(nexacro.Action, TestAlertAction);
    TestAlertAction.prototype = _p;
    _p._type_name = "TestAlertAction";

    _p.set_message = function(v) { this.message = v; };   // setter: set_<속성명>
    _p.run = function() { alert(this.message); };           // Action 진입점
    _p.destroy = function() {
        nexacro.Action.prototype.destroy.call(this);
        this.message = null;
    };

    nexacro.TestAlertAction = TestAlertAction;
})(nexacro);
```

**TypeDefinition (MetaInfo XML — `_metainfo_/<LANG>/*.info`):**
```xml
<MetaInfo version="2.0">
  <Object id="TestAlertAction">
    <ObjectInfo inheritance="nexacro.Action" classname="nexacro.TestAlertAction"
                group="Action" requirement="Edge,Chrome,Windows NRE"/>
    <PropertyInfo>
      <Property name="message" group="Action" edittype="String" description="표시할 메시지"/>
    </PropertyInfo>
    <MethodInfo/> <EventHandlerInfo/>
  </Object>
</MetaInfo>
```

**연관 파일 형식:**
- `.xmodel` — transaction 입출력 스키마 정의 (`iotype="input|output"`)
- `.xpackage` — 프로젝트 일괄 가져오기 ZIP (`File > Import Package`)

### 주의사항

- Dataset 컬럼명은 반드시 **대문자** 사용 (`USER_ID` ○, `user_id` ✕)
- `this` 스코프: 이벤트 핸들러(`this.btn_onclick = function(...)`) 내부에서는 `this` = Form. 일반 함수(`function fn_xxx()`)에서는 `this`가 Form이 아니므로 호출 시 `oForm` 파라미터로 전달받아 사용
- `nexacro.getForm("FormId")` **사용 금지** — 이벤트 핸들러에서는 `this`를, 일반 함수에서는 `oForm` 파라미터를 사용할 것
- Grid-Dataset 연결은 반드시 **`binddataset`** 속성 사용 (`innerdataset`은 Grid 내부 전용으로 외부 Dataset 바인딩에 사용하면 데이터가 표시되지 않음)
- Grid 정렬 후 행 인덱스가 변경되므로 Dataset 직접 접근으로 값 추적
- 대량 데이터 루프 전 `updatecontrol = false` 설정 필수 (성능)
- 팝업 콜백은 함수 참조가 아닌 **함수명 문자열**로 전달
- 지원 브라우저: Chrome, Edge (최신 버전)
- 서버 응답 콘텐츠 타입: `text/xml; charset=UTF-8` (PlatformData 포맷 사용 시)

## nexacroN/nexacroK 심화 참고자료 (매뉴얼 전수 분석)

> 아래는 `nexacroN 메뉴얼/` 폴더의 공식 매뉴얼 PDF를 마크다운 변환 후 전수 분석하여 추출한 실전 정보이다. 화면 개발, 서버 개발, 배포, 문제 해결 시 참고할 것. 원본은 각 `nexacroN 메뉴얼/*.md` 파일 참조.

### 컴포넌트별 심화 API

#### Calendar
- `type`: `normal`/`monthonly`/`spin`. `dateformat`: `LONGDATE`/`SHORTDATE` 또는 `yyyy`,`MM`,`dd`,`ddd` 마스크 조합
- `getDayOfWeek()`(0=일~6=토) vs `getDay()`(날짜값 반환, 표준 Date와 다름 — 혼동 주의)
- `innerdataset` + `backgroundcolumn`/`textcolorcolumn`/`bordercolumn`/`datecolumn`으로 공휴일 스타일 지정
- 년/월 변경 감지는 `onlbuttonup`에서 `e.fromreferenceobject.id`로 판별, 실제 `value` 반영은 `ondayclick`에서만 발생
- 자동보정: 빈값→"01", "00"/"0"→-1보정, 범위초과 시 다음달/년으로 이월
- `useautocalibration`(24.0.0.700+), `restoreonblur`(24.0.0.800+, monthonly 타입 포커스 이동시 년/월 유지여부)
- 커스텀 달력 구현: `nexacro.Date` + `date.setFullYear(y,m,1)`/`getDay()`/`addDate(1)` 재귀로 월별 날짜 2차원 배열 생성(Grid+Combo 조합)

#### Combo
- `type`: `dropdown`/`search`/`filter`/`filterlike`, 대소문자 무시는 `caseisearch`/`caseifilter`/`caseifilterlike`
- `ondropdown`에서 `return false`로 기본 목록 차단 → Grid 등 커스텀 UI로 대체(멀티/체크박스 콤보 구현 패턴)
- `isDropdown()`/`dropdown()` — 목록 표시 상태 확인/토글
- **스크립트로 index만 변경 시 `onitemchanged` 미발생** — 강제 발생 필요:
```javascript
var evt = new nexacro.ItemChangeEventInfo(this.Combo00, "onitemchanged", ...);
this.Combo00.canitemchange.fireEvent(this.Combo00, evt, true);
```
- `buttonsize` — dropbutton 크기/숨김("0")

#### Edit
- `length` 속성(모든 문자 1자로 계산), `autoskip`+`maxlength`+`taborder` 조합으로 자동 포커스 이동(전화번호 입력 등)
- `updateToDataset()` — 바인딩된 Dataset 값 즉시 반영(기본은 Enter/포커스 이동 시에만 반영됨)
- 자동완성: `Dataset.filter("DATA.toString().search('입력값') >= 0")` + ListBox 조합으로 구현
- 한글만 입력 제한: `oninput`에서 `obj.value = obj.value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣]/g, "")`
- PopupDiv로 값 선택 입력: `trackPopupByComponent(기준컴포넌트, x, y)` + 내부 Grid `oncellclick`에서 값 선택 후 `closePopup()`

#### Button / CheckBox / CheckBoxSet
- Button: `e.button`은 키보드(Enter/Space) 클릭 시 `'none'` 반환(마우스 클릭 구분용). `defaultbutton`(Enter로 클릭), `escapebutton`(Esc로 클릭), `hotkey`(조합키)
- `getSelectStatus()`/`setSelectStatus(bool)`/`toggleSelectStatus()` — 토글 버튼 상태 관리, XCSS `[userstatus=selected]` 선택자로 스타일 지정
- CheckBox: `truevalue`/`falsevalue`로 임의 문자열 지정 가능, `isChecked()`로 실제 체크 상태 확인
- Form 레벨 `onbindingvaluechanged` — Dataset 변경으로 바인딩된 여러 컴포넌트가 모두 갱신된 후 발생(최종값 확인용)
- CheckBoxSet `readonlycolumn`으로 innerdataset 값에 따라 개별 항목 선택가능 여부 동적 제어

#### DateField / DateRangePicker / TextField / MultiLineTextField (Material Design 계열, v24 신규)
- 기본 TypeDefinition에 없음 → `TypeDefinition > Objects`에서 `MobileComp.json` 펼쳐 수동 추가 필요(24.0.0.200+ 신규 프로젝트는 기본 포함)
- TextField: `inputtype="email"` 등, `invalidtext`(유효성 실패 메시지), `usetrailingbutton`(xcss `[userstatus=valid/invalid]`), `labelposition`(overlap/outside/inside), `labelfloatingfixed`
- MultiLineTextField: `usecharcount`, `maxlength`, `getLength()`
- 24.0.0.200부터 `usehelpertext`/`usecharcount` 기본값이 true→false로 변경됨 — 헬퍼텍스트가 갑자기 안 보이면 이 변경이 원인일 수 있음
- DateRangePicker: `mindate`/`maxdate`, `type:"single"`, `displaymonthcount`(1~3)
- DateField `ondropdown`에서 `e.preventDefault()` + `trackPopupByComponent`로 커스텀 팝업 대체 가능

#### FileDialog / FileUpTransfer
- FileDialog: `open(strTitle, FileDialog.LOAD/MULTILOAD)`, `accept` 확장자/MIME 필터, `onclose`의 `e.virtualfiles` 배열로 선택 파일 확인
- FileUpTransfer(신규 프로젝트는 FileUpload보다 권장, 기본 UI 없이 커스텀 UI 가능): `ondragenter/leave/drop`의 `e.datatype=="file"`+`e.filelist`, `addFile()`+`upload(url)`, `onprogress`/`onsuccess`/`onerror`

#### GoogleMap / Graphics
- GoogleMap: `apikey` 필수(미설정 시 워터마크), `load(bUseGPS, lat, lng, mode, zoom)`, `GoogleMapMarker`/`GoogleMapCircle`을 `addItem`/`removeItem`
- Graphics(기본 미설치, `Graphics.json` TypeDefinition 등록 필요): `GraphicsLine/Rect/Ellipse/Text/Image/Paths/Group`, `addChild(id, 객체)` 후 반드시 `redraw()` 호출해야 반영됨

#### ImageViewer
- `image`: URL 직접 지정 또는 `imagerc::파일명`. `stretch`: `fit`/`fixaspectratio`/`none`
- `imagewidth`/`imageheight` — 로드 실패 시 0 반환 → `onload`에서 대체이미지 처리 가능
- `fittocontents="both"` 설정 시 원본 크기로 자동 조정. ImageViewer 자체는 스크롤바 없음 → Div로 감싸서 처리
- `system.saveToImageBase64String` — 화면 캡처를 Base64로(NRE 전용)

#### ListBox / ListView
- ListBox: `multiselect`, `getSelectedCount()`/`getSelectedItems()`/`getCount()`(필터반영)/`setSelect(index,bool)`, `getInnerDataset()`
- ListView(Grid와 다른 자유 레이아웃): Body/Detail 밴드 구조, `bandexpandtype`(expand/accordion/popup), `bandindentsize`, `formatid`로 반응형 레이아웃 전환, `getBandExpandStatus`/`showDetailBand`/`hideDetailBand`로 아코디언 구현

#### MaskEdit / Menu / PopupMenu
- MaskEdit: `type`(number 기본/string), `format` 마스크(`@`=문자,`#`=숫자, `{ }`로 감싼 부분은 화면에 숨김처리 — 주민번호 뒷자리 마스킹 등)
- Menu/PopupMenu: `innerdataset` 컬럼(`captioncolumn`/`levelcolumn`/`checkboxcolumn`/`enablecolumn`/`idcolumn`/`userdatacolumn`/`hotkeycolumn`), `autohotkey`+`hotkeycolumn` 설정 시 메뉴를 펼치지 않아도 단축키로 이벤트 발생, `captioncolumn`값 `"-"`는 구분선, `trackPopupByComponent(comp,x,y,[align])`로 위치 지정(기본 `"right bottom"`)

#### MultiCombo / Panel
- MultiCombo: `edittype`(multicombo/multitag/count), `readonlycolumn`(선택불가지만 전체개수엔 포함), Grid 헤더 필터 UI 구현 시 `displaytype="multicombocontrol"`+`onheadvaluechanged` 조합
- Panel: **컨테이너가 아님**(논리적 그룹) — 내부 컴포넌트는 `this.Button00`으로 직접 접근(Div처럼 `.form.` 경유 불필요). Div는 `type` 속성을 동적으로 변경 불가하므로, 동적 메가메뉴처럼 레이아웃을 스크립트로 생성할 때는 Panel 사용

#### Sketch / Spin / Static / TextArea / VideoPlayer
- Sketch(기본 미설치, `nexacro.Sketch` 수동 추가 필요): `setBrushColor`/`setBrushSize`, `editmode`(stroke 기본/text/erase/none)
- Spin: `type`(normal/noneditable/spinonly), `displaycomma`(1000 이상 값 천단위 콤마)
- Static: `expr` 속성(`"comp.parent.함수명()"` 형식, 지정 시 `text` 무시됨 — 해제는 `expr=null`, **과용 시 성능 영향**), `usedecorate`+데코레이트 태그(`<u v='true'><i v='true'>text</i></u>`), `wordwrap`(none/char/english), PositionBase(`this.Static00.left = "Button00:10px"`)
- VideoPlayer: `play()`/`pause()`/`stop()`, `currenttime`(ms, 읽기/쓰기), `duration`, `mute`, `oncurrenttimechanged`, `onplaystatuschanged`(e.newstate: stop/pause/play/buffer/ended)

#### WebBrowser (넥사크로 ↔ 웹페이지 상호작용 핵심 API)
- `getProperty("document"/"window")`, `setProperty(name,value)`, `callMethod(name,...args)` — DOM/JS 객체를 Plugin 오브젝트로 반환
- **중요**: 반환받은 Plugin 객체는 사용 후 반드시 `destroy()` 호출 — 해제 안 하면 메모리 누수 발생
- `onusernotify` — 웹페이지에서 `window.NEXACROWEBBROWSER.on_fire_onusernotify(window.NEXACROWEBBROWSER, userdata)` 호출 시 발생(웹→넥사크로 단방향 통신, `e.userdata`로 값 수신). Windows NRE에서 최대 512자(한글/일본어 256자) 제한
- MS Office Online Viewer 연동: `url = "https://view.officeapps.live.com/op/embed.aspx?src=" + encodeURI(문서URL)`
- Android NRE(v24)에서 X-Frame-Options `DENY`/`SAMEORIGIN` 설정된 페이지는 로딩 불가(같은 도메인만 허용, v21과 다름)

#### Div / PopupDiv / Tab
- Div: `url` 동적 로드(`.xfdl` 확장자 필수 지정), 스플리터 구현(`ondrag`에서 `return true`로 상위 전파 → 상위 `ondragmove`에서 좌표 반영), `onvscroll`의 `e.pos`로 스크롤 위치 감지
- PopupDiv: 포커스 잃으면 자동 소멸, 폼 영역 벗어난 부분은 잘림(진짜 팝업창과 다름), 중첩 2~3단계까지 권장(깊어지면 초기화 성능 저하), `trackPopup(x,y,w,h)`(화면 좌상단 기준) vs `trackPopupByComponent(comp,x,y,w,h,callback)`(지정 컴포넌트 기준)
- Tab: `preload`(true=전체 로딩[초기 느림,전환 빠름] / false=지연 로딩[초기 빠름,전환 지연]), `multiline`, `tabposition`(top/left/right/bottom), 탭별 `enable=false`로 개별 비활성화

#### Animation / AnimationTimeline
```javascript
var aniObj = new nexacro.Animation("ani00", this);   // 스크립트로만 생성(show() 불필요)
this.addChild("ani00", aniObj);
this.ani00.addTarget("item00", targetComp, "left:100, top:50");
this.ani00.easing = "easeInOutElastic";
this.ani00.duration = 300;
this.ani00.play();   // pause()/stop(), loop, direction="alternate"
```
- 여러 애니메이션을 순차 연결할 경우 `oncomplete` 대신 `AnimationTimeline` 사용 권장(`addTarget(id, animationObj)`, `play()`는 Timeline에서 호출)
- **애니메이션 동작 중에는 속성 변경이 반영 안 됨** — `stop()` 후에만 반영

### Grid 심화 API

**선택/검색**
```javascript
this.grd.selectMultiRow.apply(this.grd, [start, end]);   // 연속 Row 다중선택(누적)
this.grd.selectArea(startCol, startRow, endCol, endRow);
this.grd.clearSelect();
var rows = this.grd.getSelectedDatasetRows();
```

**성능**
- **대량 데이터 로딩 시 `dataset.enableevent=false` → 반복 setColumn/addRow → `enableevent=true`** (1000건 이상 시 필수, `updatecontrol`과는 별개의 성능 팁)
- `fastvscrolltype`(Smart Scroll: first/center/last 등) — 대용량 스크롤 성능
- `cellexprupdatecondition = "none"` — 불필요한 전체 갱신 방지

**편집/표시**
- `maskeditformat`("###-{####}") — `{ }` 부분 마스킹 표시
- `decoratetext` displaytype + 데코레이트 태그로 URL 밑줄 표시 + `system.execBrowser(url)`로 새탭 이동
- `getEditingValue()`/`getEditingText()`(편집중 값, oninput용) vs `getEditValue()`/`setEditValue()`(확정값)
- `getCellPropertyValue(row,cell,prop)` — expr/바인딩의 실제 반영값(`getCellProperty`는 설정 표현식 자체 반환)

**병합/그룹/트리**
- `mergeCell(startCol,endCol,startRow,endRow)`/`splitCell(...)` — 스크립트 동적 병합(같은 밴드만 가능)
- `suppress` — 인접 동일값 셀 시각적 병합(progressbar/button 등엔 미적용, 사전 `keystring` 정렬 필수)
- `keystring` 그룹레벨 차이: `"G:+C1,+C2"`(2단계 소계) vs `"G:+C1+C2"`(1단계 소계) — 결과가 다름
- 트리: `treeinitstatus`("expand,all"/"collapse,all"), `isTreeLeafRow`/`getTreeParentRow`/`getTreeChildRow`/`setTreeStatus`, `getRowLevel(row)==0`이면 그룹(소계) 행

**기타**
```javascript
this.grd.blinkCell(row, "칼럼목록", 총시간ms, 횟수);   // Row 깜빡임 효과
this.grd.getSum('price*amount', start, end);            // 계산식 지정 가능한 합계
this.grd.moveRow(from, to);                              // 드래그 정렬(ondrag에서 e.userdata=e.row 저장 후 ondrop에서 호출)
this.grd.scrollBy(x, y);                                  // 두 Grid 스크롤 동기화(onvscroll에서 상대 Grid에 호출)
```
- 클립보드: `system.setClipboard("CF_TEXT", str)`(NRE), 그 외 브라우저는 숨겨진 `<textarea>` DOM으로 우회(`system.navigatorname`으로 분기)

### Dataset / DataObject 심화

- `getColumnInfo(idx).type = "..."` — **런타임 컬럼 타입 변경** 가능
- `getRowType()` 반환 정수값: `ROWTYPE_INSERT=2`, `ROWTYPE_UPDATE=4`, `ROWTYPE_DELETE=8`
- AppVariables로 전역 Dataset 등록: `nexacro.getApplication().addVariable("gds_data", new Dataset)` → 이후 `nexacro.getApplication().gds_data`로 전역 접근(Form 자식으로 만든 Dataset은 로컬 스코프)
- `filter()` 대소문자 무시 검색: 양쪽 `.toUpperCase()` 처리 후 `indexOf` 비교하는 조건식 사용
- `getCaseSum`/`getCaseAvg`/`getCaseCount(조건식, 컬럼)` — 컬럼이 String 타입이면 조건식 내에서 `parseInt(Column0)` 등 형변환 필요

**DataObject 심화 (REST/JSON)**
- `request(serviceid, method, url, {httpheader, postdata})` — `load()`는 GET 전용이지만 POST/PUT/PATCH/DELETE 등 임의 메소드+헤더+바디 지정 가능
- 이벤트 순서: `onsuccess`(먼저 발생) → `data` 속성 반영 → `onload`. `e.preventDefault()`로 onload 스킵하고 응답 텍스트 바로 사용 가능
- `ondatachanged`(양방향) — `Dataset.applyChange()` 실행 시 발생, `e.infoarray`(uid/type/data)로 서버 PUT/DELETE 매핑
- `dataobjectbindmode="twoway"` — Dataset 값 변경이 DataObject에 실시간 반영, `onvaluechanged`(e.dataobjectpath/index/key/value)로 즉시 서버 반영 가능
- **대용량 데이터 수신 시 브라우저 환경에 따라 응답이 불완전 수신될 수 있음**(공식 경고)

**nexacro.Decimal** (Number 안전정수 범위(2^53-1) 초과 값 처리 전용, 금융/통계 등)
- Dataset 컬럼 `type="BIGDECIMAL"`이면 자동으로 nexacro.Decimal 처리(INT/FLOAT는 큰 수에서 부정확)
- 연산은 **호출한 객체 자체에 결과 반영**: `a.addDecimal(b)` → a가 결과값(`subDecimal`/`mulDecimal`/`divDecimal` 동일)
- 값 생성/조회는 반드시 문자열로: `nexacro.Decimal("1234567890123456789")` (숫자 리터럴은 정밀도 손실), 출력은 `.toString()` 권장
- v24.0.0.500부터 표현 자릿수 24자리→**31자리** 확장(정수부 최대 24 + 소수부 최대 15)

**nexacro.DomParser / nexacroAPI 정적 메소드**
- `new nexacro.DomParser().parseFromString(xmlString)` — XML 문자열을 표준 DOM으로 파싱(외부 XML API 연동에 활용)
- `nexacro.setTimeout(context, fn, ms)`(1회성 타이머), `nexacro.round(value, digit)`, `nexacro.trim(str, char)`(제거할 문자 지정 가능), `nexacro.replaceAll(str, from, to)`(v24 regex replace가 `/g` 없으면 첫 매치만 치환하는 이슈의 대안)

**ExcelExportObject / ExcelImportObject** (nexacro-xeni 클라이언트 오브젝트, `saveXLS`와 별개 — 서버측 Apache POI 기반 처리 필요)
```javascript
var exp = new ExcelExportObject("exp00", this);
exp.exportfilename = "result.xlsx";
exp.exporttype = nexacro.ExportTypes.EXCEL2007;
exp.exporturl = "/XExportImport";
exp.addExportItem(nexacro.ExportItemTypes.GRID, this.grdMain, "Sheet1!A1");
exp.addEventHandler("onsuccess", fn_onsuccess, this);
exp.exportData();
```
- 여러 Grid를 시트별로 내보내려면 `addExportItem`의 `strRange`를 `"시트명!셀"`로 다르게 지정, `clearExportItems(...)`로 초기화
- ExcelImportObject: `importtype`(EXCEL/EXCEL97/EXCEL2007/HANCELL2014), `importurl` → `importData(url, "Sheet1!A1:F6", "Dataset00")`
- 지원 포맷: xls/xlsx(export+import), csv(import만)

### 모듈(.xmodule) 개발 심화

- Composite Component 외 지원 오브젝트: **Visible Object**(신규 컴포넌트), **Invisible Object**, **EventInfo Object**, **Device Adaptor**, **Protocol Adaptor**
- **추가한 이벤트는 에뮬레이터(QuickView)에서 테스트 불가** — 모듈 배포 후 앱에서만 확인 가능(속성/메소드는 에뮬레이터 테스트 가능)
- `on_create_contents`를 오버라이드해 속성 setter를 재호출해야 실행 시점에 값이 반영됨:
```javascript
nexacro.MyModule.prototype.on_create_contents = function () {
    nexacro._CompositeComponent.prototype.on_create_contents.call(this);
    this.myProp = this.myProp;   // 강제 재적용
};
```
- 내부 컴포넌트 이벤트에서 상위(컴포지트) 이벤트를 트리거: `this.parent.on_fire_<이벤트명>(...)`

**TypeDefinition Property 메타인포 주요 필드**

| 필드 | 설명 |
|---|---|
| `Group` | `Accessibility, Action, Appearance, Binding, ... Normal, Position, Style` 등 카테고리 |
| `Edit Type` | 속성창 편집 UI(`Boolean, ColumnID, DatasetID, Enum, String, URL, ThemeID` 등) |
| `ReadOnly` / `InitOnly` / `Hidden` | 읽기전용 / 초기설정전용(예: initvalueid) / 속성창 미노출(스크립트 접근은 가능) |
| `Control` | 속성 자체가 오브젝트인지 여부(true면 자동 readonly=true, hidden=false — 예: `form`) |
| `Expression` | `expr:` 표현식 허용 여부(true면 속성창에 `[set expression]` 버튼) |
| `Bind` | 바인딩된 Dataset Column 연결 기능 사용 여부 |
| `Refresh Properties` | 값 변경 시 영향받는 다른 속성 지정(`RefreshInfo`, 실제 로직은 `set_[value]`에서 구현) |

- `RefreshInfo` 예 — Combo `index` 변경 시 `text→value→index` 순서 갱신 지정
- `DisplayInfo` 예 — 특정 값일 때 다른 속성을 readonly 처리(Layout `type`에 따라 spacing/stepindex 등 분기)

**Content Editor** (Grid/ListView류의 콘텐츠 설정 UI 커스터마이즈)
- 메타인포 `contents=true` + Contents Format(`xml`/`json`)에 따라 Contents Type(`objectitem`/`contents`/`formats`) 결정
- 핵심은 `_setContents(v)` 함수 — `nexacro.DomParser`로 XML 파싱 후 자식 노드 `id`로 내부 컴포넌트를 찾아 `obj["set_"+attr_name]`을 동적 호출해 반영
- NRE(`on_created_contents`)와 WRE(`on_attach_contents_handle`) **둘 다 등록 필요**(NRE 훅은 Studio 로딩 시에도 중복 실행되므로 `system.navigatorname != "nexacro DesignMode"`로 방지)

**Protocol Adapter 개발**
- `initialize`/`decrypt`(수신 데이터 가공)/`encrypt`(송신 데이터 가공) 구현, transaction URL 스킴으로 사용:
```javascript
this.transaction("srv00", "JSONRecvAdp://127.0.0.1:4098/test.json", "", "Dataset00=dsJson", "", "fnCallback", true, 2);
```
- SSV 포맷 상수: Record Separator=`String.fromCharCode(30)`, Unit Separator=`String.fromCharCode(31)`
- 재정의 가능: `getUsingProtocol`, `getCommunicationHeaders`(쿠키 추가), `getHTTPHeader`+`version()`(">1.1" 이상 설정 필요)
- 외부 암호화 라이브러리(crypto-js 등) 포함 시 User Folder로 Import 후, 배포 JSON에 `scripts`/`userfolder` **수동 추가 필요(매 배포마다 재작업, 저장 안 됨)**

**도움말/배포**
- 도움말은 CHM 형식만 지원(언어별 KOR/ENG/JPN 폴더), 아이콘은 ico(16px 기본, 32px 고해상도)
- Deploy 시 `scriptsfilter`로 OS별 스크립트 선택 배포 가능(`target: "NRE"/"iOS_NRE"/"WRE"`)

### X-PUSH 실시간 메시징 개발

- 기본 오브젝트 미등록 → `TypeDefinition > Objects`에서 `Push.json`의 `nexacro.XPush` 추가 후 **프로젝트 재로딩 필요**
- `iplist`: TCP(NRE) 포트 10081, HTTP(웹브라우저) 포트 10080 — 둘 다 지원하려면 `"http://localhost:10080, localhost:10081"`
```javascript
this.XPush00.connect("user00", "password");
this.XPush00_onsuccess = function(obj, e) {
    if (e.action == nexacro.XPushAction.AUTH)
        this.XPush00.subscribe("OPDT", "ALL", this, this.Dataset00, "append", "fn_PushCallback");
};
this.fn_PushCallback = function(Row, ChangeColumn, AllColumn, Type, ActionType) { trace(Row, Type); };
```
- Dataset 컬럼 속성은 메시지 레이아웃 XML(`layouturl`)의 `field id`와 일치해야 함
- **신뢰성 메시징**(수신 보장): `registerTopic("NOTI","ALL")`(최초 1회) → `requestMessage("NOTI","ALL")`(미수신분 수신) → 콜백에서 `sendResponse(MessageId)`(수신응답) → `unregisterTopic(...)`(등록취소)

### 위젯 앱 개발 (Windows Desktop Widget)

```javascript
nexacro.open("NewWidget", "FrameBase::WidgetMain1.xfdl", this.getOwnerFrame(), "",
    "showontaskbar=false showtitlebar=false showstatusbar=false topmost=true layered=true border='0px none'",
    0, 0);
```
- `layered=true` — 배경 윈도우 투명 처리(원하는 모양의 배경 이미지 표현 가능). 투명 영역 클릭 시 포커스가 뒤 창으로 넘어가 드래그 불가(불투명 영역만 드래그 가능)
- **NRE 실행에서만 동작** — 일반 웹브라우저에서는 위젯 기능 불가
- 트레이 아이콘: `[Add > Tray]`로 App에 추가, `Tray0_onrbuttonup`에서 PopupMenu `trackPopup()`으로 우클릭 메뉴, `showBalloonTip("information", "Info", "msg")`로 풍선 알림

### WinAppDriver를 통한 Windows NRE 단위 테스트

- UIAutomation 인터페이스 기반, Selenium/Appium 호환 UI 자동화 테스트 가능(Windows 10+ 필요)
- 설치: 개발자 모드 활성화 → `WindowsApplicationDriver.msi` 설치 → 관리자 권한 실행(`C:\Program Files (x86)\Windows Application Driver\`)
- 배포: `[Deploy > Packing]`에서 Update Type "Local" 지정 후 Packing → Build App → 설치
```csharp
appCapabilities.SetCapability("app", NexacroAppId);
appCapabilities.SetCapability("appArguments", NexacroAppAg); // 예: -k 'UnitTest' -s '...\start.json'
appCapabilities.SetCapability("platformName", "Windows");
session = new WindowsDriver<WindowsElement>(new Uri(WindowsApplicationDriverUrl), appCapabilities, time);
```
- **AccessibilityId 규칙**: `[MainFrame id].[ChildFrame id].form.[Component id]` (예: `mainframe.ChildFrame00.form.Button00`, Div 내부는 `...form.Div00.form.CheckBox00`)
- 펼친 후에만 존재하는 요소(Combo 드롭다운 아이템 등)는 Windows SDK의 **Inspect 도구**로 `AutomationId` 확인 필요(펼치기 전 접근 시 테스트 실패)
- 텍스트값 우선순위: `displaytext > text > titletext > value`. Click은 요소 중앙좌표 발생 — MaskEdit처럼 캐럿이 앞으로 안 가는 경우 `Ctrl+A`로 전체선택 후 입력
- `Displayed`는 `visible` 속성과 다름 — `visible=false`면 Element 자체가 생성 안 됨(테스트하려면 로드 시 `visible=true` 유지 후 onload에서 전환)

### Nexacro Studio 실전 기능

#### 소스 관리 연동 (SVN/Git)
- `Tools > Options > Source Control`에서 SVN(1.6.0+)/Git(2.13.0+) 클라이언트 등록. Git은 `Push after commit`, `Pull before push`, 프로젝트 열때 Pull/닫을때 Push 옵션 지원
- 충돌 파일은 Merge Tool 경로 등록 후 `Edit Conflicted` 메뉴로 외부 병합도구(WinMergeU, kdiff3 등) 실행

#### Options 주요 설정
- `Project > General`: File Parsing 옵션(`None`/`All`/`Services`) — 대형 프로젝트에서 `All` 선택 시 로딩 저하, `None`이면 필요할 때만 `Parsing Files`로 수동 분석
- `Project > Generate`: Generate Path를 Deploy Path와 동일/하위 경로로 설정하면 오동작 가능. RTL 지원 시 테마 XCSS 활용 권장(Application XCSS는 파일 크기 증가로 성능 저하 가능)
- `Project > Deploy > Compress`: 3단계(① 공백/주석 제거 ② 변수명 난독화 ③ eval 무시 강제 난독화[비권장]), 제외 파일은 `.ignorecompress`
- `Environment > Script`: `ECMAScript 5` / `ECMAScript 2015(ES6)` 선택 — 실행환경과 안 맞으면 런타임 오류. "ES5" 설정에서도 `const`/`Promise` 등 일부 ES6 문법은 검증 누락으로 정상 Generate될 수 있음(주의)
- Macros(`%(StudioDir)`, `%(ProjectDir)`, `%(GenerateDir)` 등)를 Options 경로나 `nexacrodeploy.exe` 인자에 사용 가능(단 `-P` 값에는 매크로 불가)

#### 디버거 상세
- **Studio 디버깅은 NRE 실행 시에만 동작** — 웹브라우저 실행 시엔 브라우저 자체 개발자도구 필요
- 조건부 중단점: `Set Conditional Breakpoint`(조건식+무시횟수 설정), 중단점 정보는 Studio 내부 관리(타 PC 미공유)
- **Call Stack 함정**: 익명함수(`function(a,b){}`)는 Call Stack에 함수명이 안 뜨고 인수만 표시 → `var fn = function(a,b){}` 형태 권장
- Assist Tip(변수 마우스오버 시 값 팝업), Inline Assist Variable(중단점까지 전체 변수값을 코드 옆에 인라인 표시)

#### 코드 스니펫 / Add-on / 메타데이터
- `Assist > Code Snippet`에서 Shortcut 문구 등록, 예약어: `$end$`, `$selected$`, `$clipboard$`, `$DATE$` 등
- Add-on 개발: `nexacrostudio.request(requesttype.xxx)`로 Studio 내 프로젝트 정보 조회. **Add-on 창에서만 동작** — NRE/WRE 직접 실행 시 `ReferenceError: nexacrostudio is not defined`(정상 동작). `View > Add on` 창에서 `start.json` 등록 필요
- 메타데이터: `TypeDefinition > Services`에 `metadata` 타입 서비스 등록 시 Project Explorer에서 원격 데이터 조회 후 컴포넌트 `id`/`text`에 즉시 반영 가능(`Options > Project > Advanced > Metadata`에서 활성화 필요)
- LiteDB 쿼리 편집기: `LiteDBConnection`/`LiteDBStatement` 오브젝트 더블클릭 시 로컬 DB 파일 구조/데이터를 Studio 내에서 직접 조회·쿼리 작성 가능(`:PARAM_NAME` 바인드 변수 지원)

#### 부트스트랩 템플릿 커스터마이즈 (`Generate > Bootstrap Customize`)
- 관리 대상 5종: `index.html`(웹배포), `launch.html`, `quickview.html`, `popup.html`, `run.html`(모바일 배포)
- 저장 시 `bootstrap.xml` 생성 + `.xprj`에 `<BootstrapCustomize url="bootstrap.xml"/>` 추가 — **템플릿 공유 시 두 파일 모두 전달 필요**
- 필수 키워드(`#{FRAMEWORK_LIBRARY}` 등) 삭제해도 저장은 되지만 실행 시 오류 위험

#### 마이그레이션 도구 (v14→N 전환)
- 자동 변환 완벽 보장 안 됨 — Migration Log(Error 필수해결/Warning 확인권장/Information 참고)로 확인, DiffView로 원본/결과 비교(결과 쪽만 직접 수정 가능)
- 로그는 출력 경로의 `migrate` 디렉터리 생성 — 오류 해결 단계에 필요하므로 임의 삭제 금지

#### StringResource 다국어
- 프로젝트당 1개만 생성 가능, 생성 시 `Environment.usestringresource` 자동 true
- `TEXT([key])` / `TEXT([key], [alter value])` 함수로 컴포넌트 속성에 바로 다국어 바인딩(키 없으면 alter value 또는 키값 표시)
- 스크립트 조회: `nexacro.getStringResourceValue("key")`. 원격 JSON 포맷: `{ "locale코드": { "key": "value" } }`
- 언어 적용 우선순위: `Environment.locale` → OS 로캘 → 영어(en) 기본

#### Nexacro Studio 시작하기 (신규 개발자용)
- 설치 파일 `NexacroN_SetupStudio.exe`(32bit)/`_x64.exe`, 라이선스 없이 **60일 체험판** 자동 동작
- 신규 프로젝트: `[New]` → Project Name → Screen(기본값 유지) → Frame(기본값 유지) → `[Finish]`
- 새 Form: `[File > New > Form (.xfdl)]`, Location은 반드시 **`Base` 폴더**로 지정(`FrameBase`는 메인프레임 전용 — 잘못 지정하는 실수가 흔함)
- 실행: Launch(앱 전체 실행) vs **QuickView**(돋보기 아이콘, 편집 중인 Form만 단독 실행 — 반복 개발 시 주로 사용)
- 컴포넌트/속성 도움말: `F1`, 속성명으로 검색은 도움말 `Index` 탭에 키워드 입력
- **기본 비활성 컴포넌트**(WebBrowser, VideoPlayer, Sketch, GoogleMap 등 약 30여개)는 `TypeDefinition > Objects`에서 `+`로 수동 추가해야 사용 가능(코드 크기 절감을 위해 기본 비활성 — "컴포넌트가 안 보인다"는 문의의 흔한 원인)
- XJS 공통스크립트 작성 규칙: 함수 앞 반드시 `this.` 필요(안 붙이면 전역 처리됨), `include "Base::libCommon.xjs";`(세미콜론 필수, 재귀 include 가능), **XJS 파일은 반드시 `Base` 디렉터리에 위치**(다른 경로 사용 시 `TypeDefinition > Services`에서 User Service로 등록 필요)

### nexacrodeploy 콘솔 도구 — 추가 옵션

| 옵션 | 설명 |
|------|------|
| `-FILE "'경로1','경로2'"` | 개별 파일/테마 지정(`theme::default` 형식, 콤마 구분, 공백 금지) |
| `-BOOTSTRAP [OS...]` | 부트스트랩 파일만 생성 |
| `-MODULE` | 모듈 파일만 생성 |
| `-BROWSER "NRE,Chrome"` | 특정 브라우저만 대상으로 xcss/xtheme 생성 |
| `-UNARCHIVE [OS...]` | zip 대신 Run.html 그대로 생성(현재 iOS만 지원) |
| `-JSVERSION "ECMAScript 5\|ECMAScript 2015"` | 스크립트 검증 규칙 지정(지정 시 강제 Regenerate) |
| `-D [경로]` | Deploy 결과 저장 경로(`-O` 경로와 달라야 함) |
| `-IGNORECOMPRESS [.ignorecompress 경로]` | 압축 제외 파일 목록(`-COMPRESS`와 함께 사용 필수) |
| `-IGNOREEVAL` | eval 포함 함수도 강제 난독화(`-SHRINK`와 함께 사용 필수, 비권장) |
| `-L [로그경로]` | 진행 로그를 파일로 저장 |

> `-REGENERATE`는 "수정 여부 무관하게 전부 재생성"을 의미. 별도 배포 가능한 **Nexacro Deploy JAVA**(jar)는 JDK 1.8.0_131+ 및 `JAVA_HOME` 필요, `bin/start.bat`(Windows)/`start.sh`(Linux)로 실행.

### 배포 실무 심화

#### Alias 경로 (서버/클라이언트 경로 매핑)
```
%USERAPP%              - %LOCALAPPDATA%LOW\TOBESOFT\Nexacro N\24 (Windows)
%WEBDEPLOY PROJECT%    - Server Context root
%WEBDEPLOY FRAMEWORK%  - %WEBDEPLOY PROJECT%\nexacrolib\framework
%WEBDEPLOY COMPONENT%  - %WEBDEPLOY PROJECT%\nexacrolib\component
%WEBDEPLOY RESOURCE%   - %WEBDEPLOY PROJECT%\nexacrolib\resources
%WEBDEPLOY THEME%      - %WEBDEPLOY PROJECT%\_resource_\_theme_
```

#### Update Type 3종 비교 (Packing 단계)
| 방식 | 특징 |
|------|------|
| Update (Local+Server) | 최초 로컬 저장, 콘텐츠 변경 시 버전을 반드시 올려야 재배포됨(동일 버전 재배포는 무시됨 — 배포 누락 주의) |
| Server | 매 실행 시 서버 접속, 별도 버전관리 없이 파일 교체만으로 최신 콘텐츠 적용 |
| Local | 아카이브 포함 설치파일 배포, 네트워크 불필요하나 업데이트 시 설치파일 재배포+재설치 필요 |

#### nexacro.exe 주요 실행 옵션
```
-K 앱 구분 키값   -S 부트스트랩 경로   -C 컴포넌트 설치경로   -THR 통신쓰레드수(최소3,최대10,기본3)
-V "변수명:타입=값"(콤마구분, ev=Environment Variables/ec=Environment Cookies/av=Application Variables 기본)
-NC 로컬 config 파일 경로   -RPP/-brk 원격디버깅 포트/중단여부   -OO 동일key 중복실행 허용여부
```

#### 32/64비트 분기 배포
```javascript
var userAgent = navigator.userAgent;
if(userAgent.indexOf("WOW64") != -1 || userAgent.indexOf("Win64") != -1)
    SetupRuntimeName = "NexacroN_SetupRuntime_x64.exe";
else
    SetupRuntimeName = "NexacroN_SetupRuntime_x32.exe";
```

#### NRE 로그/디버깅 보완
- config 파일 설정이 Environment(스튜디오) 설정보다 **우선 적용**됨
- **filepath 보안 제약**: 허용된 Alias 경로가 아니거나, 위험 확장자(`bat/exe/cmd/vbs/js/ps1/dll/hta`)로 로그 파일명 지정 시 강제로 기본 경로/`.log` 확장자로 변경됨
- `-RPP`에 포트만 지정하면 자동으로 `localhost`(`-RPP 9223`). `chrome://inspect`에서 앱이 20초 이상 안 보이면 `[RPP주소]/json/list`(예: `http://127.0.0.1:9223/json/list`) 접속으로 정상 응답 여부 진단

#### Cordova 플러그인 적용
- Android: Export한 플러그인 파일을 프로젝트 경로에 복사 후 `plugin_config.xml`에 `<plugin name=... class=... onload="true"/>` 등록
- iOS: Export 파일을 Xcode 프로젝트에 추가 후, import 구문 경로 앞에 **`nexacro/` 반드시 추가** (`#import <nexacro/Cordova/CDVPlugin.h>`)

### 런처 서비스 (Launcher Service) — 완전히 새로운 주제

브라우저의 ActiveX/플러그인(NPAPI) 지원 중단에 대응해, **로컬(127.0.0.1) 상주 Windows 서비스**로 웹페이지에서 NRE 등 데스크탑 클라이언트 런타임을 실행시키는 투비소프트 기술. 넥사크로 N/17/14, 엑스플랫폼, 마이플랫폼 공통 지원.

#### 설치/설정
```bash
TPLSvc_Setup.exe /VERYSILENT      # 무인 설치 (반드시 관리자 권한으로 실행)
TPLSvc_Setup.exe /SILENT          # 진행상태 표시하며 설치
TPLSvc_Setup.exe –r false         # 서비스 등록만 해제(파일은 유지)
TPLSvc_Setup.exe –r true –p 8080  # 포트 지정 후 재등록
```
- 기본 설치 경로: `C:\Program Files (x86)\TPLSvc\TPLSvc.exe`
- 기본 포트 범위: HTTP 7895~7935(`-p`), HTTPS 7936~7966(`-httpsp`), WS 7970~7981(`-wsp`), WSS 7982~7992(`-wssp`)

#### 통신 프로토콜 (JSON, 순서 고정)
```javascript
// 1) create → 2) setproperty → 3) method/getproperty/event → 4) destroy
var objNexacro = { platform: 'nexacro', action: 'create' };
// ...
objNexacro.action = 'setproperty';
objNexacro.value = { "key": "LauncherService", "bjson": "http://127.0.0.1:8080/start.json", "enginesetupkey": "..." };
// ...
objNexacro.action = 'method';
objNexacro.value = { "launch": null };
```
- 요청 URL 형식: `http://127.0.0.1:7895/launcher/nexacro/[TIMESTAMP]` (127.0.0.1과 `launcher` 예약어는 고정)
- 통신 방식: HTTP GET/POST 또는 **WebSocket**(`ws://127.0.0.1:7970/launcher/nexacro/...` — 크롬/엣지가 HTTP 로컬 네트워크 접근을 차단하거나 HTTPS를 쓸 수 없는 환경의 보완책)
- 필수 속성: `key`(서비스 Key, start.json 내 유일값), `bjson`(start.json 경로), `enginesetupkey`(ProductKey)
- 주요 메서드: `launch`, `launchasadmin`(관리자 권한 실행), `makeshortcut`/`isexistshortcut`/`deleteshortcut`, `getengineversion`, `downloadresource`(SetupResource.zip 다운로드, 디지털 서명 유지 배포 시 필요)
- 에러 코드: 102(다운로드 실패), 103(config 읽기 실패), 104(config 쓰기 실패)

#### 자주 발생하는 문제
- 크롬 88+ & 런처 1.1.0.24 미만 조합 → HTTPS 통신 불가(런처 서비스 업데이트 필요)
- 윈도우7에서 HTTPS 통신 실패 → TLS 1.2가 기본 비활성화 상태(레지스트리 수동 설정 필요)
- 크롬에서 로컬호스트 인증서 에러 → `chrome://flags/#allow-insecure-localhost`를 "Enabled"로 변경 후 재시작
- **다중 로그인(fast user switching) 상태에서 정보 전달 안 됨** — 런처가 어느 계정에 명령을 전달할지 판단 못함, 반드시 로그아웃 후 재로그인 필요
- 가상환경(Citrix/VMware/원격데스크톱)에서 사용자 정보 확인 문제 → `TPLSvcAgent`(1.1.0.29+, `multisession:true` 설정) 사용

#### 보안 (버전별 점진 강화된 인젝션 방지 필터링)
- `key`/`bjson` 값에 세미콜론(`;`), `.Run`, 콤마, 탭, 개행, 상대경로(`../`,`..\`) 자동 제거
- `splashimage`/`loadingimage`에 실행 가능 확장자(exe/bat/vbs/js/dll/hta 등) 지정 차단
- `makeshortcut`/`deleteshortcut` 파라미터에 `WScript.CreateObject`, `WScript.Shell`, `CreateShortcut` 문자열 제거(1.1.0.45+, 스크립트 실행 우회 공격 방지)
- **과거 보안 이슈가 있었고 이후 지속적으로 필터링이 강화되어 온 이력** → 항상 최신 런처 서비스 버전 사용 권장

### X-API 서버 개발 심화

#### jar 파일 종류 (버전 관리 주의)
| jar | 용도 |
|-----|------|
| `nexacro-xapi-java-1.x.x.jar` / `_jakarta_1.x.x.jar` | 기본(1.X.X 계열), Jakarta EE(Tomcat10+)용 |
| `nexacro-xapi-java-main-2.x.x.jar` | 2.X.X 이상 필수 jar |
| `nexacro-xapi-java-compatible-2.X.X.jar` | 1.2.X 이전 버전 호환용 (**CWE-73/80/470 취약점 노출 가능**) |
| `nexacro-xapi-java-debug-2.X.X.jar` | streamlog 기능 사용 시 필요 |

> **버전 업그레이드 시 이전 버전 jar를 반드시 삭제**(잔존 시 잘못된 버전이 적용될 위험). 버전 확인: `java -jar nexacro-xapi-java-1.0.0.jar` 실행 후 매니페스트의 `Implementation-Version` 확인. 라이선스 파일(`NexacroN_server_license.xml`)은 jar와 동일 디렉토리에 배치.

#### 라이선스 만료 이벤트 처리 (X-API 1.2.4/2.0.4 이후)
- 시작일 -7일부터 사용 가능, 만료일 -30일부터 경고(1시간 간격 로그+`warn()` 이벤트), 만료일 +1일부터 오류(요청 시 exception, 응답 없음)
```java
public class UserLicenseExpirationHandler implements LicenseExpirationHandler {
    public void expired() { /* 만료 알림 처리 */ }
    public void warn(int remainDay) { /* 만료 임박 알림 처리 */ }
}
```
```properties
# x-api.properties
platform.license.expiration.defaulthandler=license.UserLicenseExpirationHandler
```
- JDK 1.8+ & X-API 2.0.4+ 는 Java SPI 방식도 지원(`META-INF/services/com.nexacro.java.xapi.license.LicenseExpirationHandlerProvider`)

#### 내부 로깅 (Apache Commons Logging + Log4j)
```properties
log4j.logger.com.nexacro.java.xapi.data=DEBUG, xapi
log4j.appender.xapi=org.apache.log4j.FileAppender
log4j.appender.xapi.File=${catalina.home}/logs/xapi.log
```
(`commons-logging-x.x.x.jar`, `log4j-x.x.x.jar`를 `$CATALINA_HOME/common/lib`에, `log4j.properties`는 `common/classes`에 배치 후 재구동)

#### StreamLog (수신 데이터 디버깅)
```java
req.setStreamLogEnabled(true);
req.setStreamLogDir("/home/log");
req.receiveData();      // 예외 발생 시 자동 저장
req.storeStreamLog();   // 필요 시 강제 저장
```
> **StreamLog 활성화 시 메모리 사용량 증가 — 상시 사용 금지, 디버깅 시에만 한시적으로 사용**. `localhost`/`127.0.0.1` URL은 라이선스 파일 없이 X-API 서비스가 동작(개발 초기 테스트에 유용).

#### saveType (전송 데이터 범위 제어)
`SAVE_TYPE_NONE`/`ALL`/`NORMAL`(기본값)/`UPDATED`/`DELETED`/`CHANGED` — 우선순위: **DataSet 자체 saveType > PlatformData의 saveType > 기본값(NORMAL)**

#### 파일 업로드/다운로드
- 업로드: `DataTypeChanger` 인터페이스로 특정 컬럼을 `DataTypes.FILE`로 지정하면 수신 시 자동으로 임시파일 저장(DataSet엔 임시파일 경로가 담김 — 완료 후 반드시 목적 위치로 이동 필요)
- 다운로드: 컬럼을 `DataTypes.FILE`(경로, 송신 시 자동 BLOB 변환) 또는 `DataTypes.BLOB`(byte 배열 직접 설정)로 구성
- X-API는 파일 전송 전용 API가 아니므로 XML 형식으로 파일 송수신 시 메모리 사용량 급증 — 별도 파일 전송 솔루션 사용 권장

#### nexacro-xeni (Excel Export/Import 서버 모듈) — web.xml 상세
```xml
<context-param><param-name>export-path</param-name><param-value>/export</param-value></context-param>
<context-param><param-name>monitor-enabled</param-name><param-value>true</param-value></context-param>
<context-param><param-name>monitor-cycle-time</param-name><param-value>30</param-value></context-param>
<context-param><param-name>file-storage-time</param-name><param-value>10</param-value></context-param>
```
- JDK 1.8+, POI 라이브러리는 1.3.1 미만 버전은 POI 4.1.2, 1.3.1 이후는 POI 5.2.2 사용. **1.4.1 이후부터 Jakarta EE용(`_jakarta_` 포함 파일명) 배포본 별도 제공**
- **war 파일을 압축 해제 후 필요한 파일만 복사하면 라이브러리 버전 불일치 문제 발생 가능 — war 파일 그대로 배치 권장**
- 클라이언트에서 파일 대화상자가 안 열리거나 내용이 깨져 보이면 → **web.xml MIME 타입 매핑 누락이 원인일 수 있음**(WAS 재시작 필요)

### App Builder (모바일 앱 빌드 서버) — 완전히 새로운 섹션

- `appbuilder.war`로 Tomcat 등에 배치, **JDK 17 이상** 필수(2024/05/28부로 JDK 11→17 상향), 최초 관리 콘솔 로그인은 `admin`/`admin`
- **Windows에서는 Android 앱만 빌드 가능** — iOS/macOS 앱 빌드는 macOS 환경 필요
- 한글 깨짐 대응: `catalina.bat`에 `-Dfile.encoding=UTF8` 추가(서비스 방식은 `Tomcat9w.exe` → `Java > Java Options`에 추가)
- H2 내장 DB 사용 — Windows에서 **관리자 권한 없이 최초 실행 시 오류 가능**(관리자 권한으로 배치파일 실행 필요)
- Deploy Server(리소스 업로드) 연동은 **SFTP 프로토콜만 지원**
- 앱 서명: Android(Keystore, Alias 6자 이상), iOS(Certificate+Provisioning Profile), macOS(Certificate만)
- In-house Distribution(자체 iOS 배포)은 **HTTPS + 공인 도메인 인증서 필수**(없으면 .ipa 직접 다운로드 후 Xcode/iTunes로 설치해야 함)
- **개발에 사용한 넥사크로 버전과 App Builder에 등록된 라이브러리 버전이 다르면 빌드된 앱 실행 시 오류 발생 가능** — 항상 버전 일치 확인

### eGovFrame(전자정부 프레임워크) 연동 가이드 — 완전히 새로운 섹션

- 전자정부 프레임워크 Template Project(Enterprise Business) + Nexacro N 연동 샘플 존재(`egov_nexacroN.zip`, MySQL/Tomcat/JDK 포함 실습 자료 별도 제공)
- 기존 Service/DAO/SQL은 그대로 사용하고 **Controller만 신규 작성**하여 연동(공지사항 화면을 Nexacro N 화면으로 교체하는 예제)
- 수정이 필요한 기존 파일: `pom.xml`(Jackson 의존성 추가), `EgovNoticeList.jsp`(`<c:choose>`로 공지사항일 때 iframe으로 넥사크로 화면 전환), `EgovBBSManageController.java`(`selectBoardArticles` 메소드), `EgovBoard_SQL_mysql.xml`(`insertBoardArticle`)
- Nexacro Studio 작업 시 `eGovNexa` 실행 후 프로젝트 Generate Path를 `src/main/webapp/nexa_ui`로 지정하여 Generate

### 지원 플랫폼 / 브라우저 / v24 버전별 변경사항

#### 지원 중단/제약 (실무 영향 큼)
- **IE 10, 11 지원 완전 중단**(24.0.0.100~) — IE 필요 환경은 SDK 21 계속 사용해야 함
- **Android NRE가 Native App → WebView 기반 Hybrid App으로 전면 변경**(v21→v24, 앱 크기 1/4·초기 로딩속도 2배 개선)
  - Native 전용 기능(안드로이드 네이티브 인터페이스, 다중 NexacroActivity, NRE 원격 디버깅) 지원 중단 → WebView API/Selenium WebDriver로 대체
  - Cross Domain 환경에서 WebBrowser `callMethod`/`getProperty`: Update Type "Server"는 v24에서 미지원(Local/Update일 때만 지원)
  - `X-Frame-Options: DENY/SAMEORIGIN` 웹페이지는 iOS와 동일하게 로딩 불가(같은 도메인만 허용, v21은 제약 없었음)
- Windows NRE: HTTP/2 + TLS 1.3 지원 추가(24.0.0.700)
- **넥사크로플랫폼17→N 마이그레이션**: X-API 패키지명이 `com.nexacro17.xapi.*` → `com.nexacro.java.xapi.*`로 변경(서버 코드 import 수정 필요), N 전용 서버 라이선스 파일 필요
- 기본 테마 변경: `default.xtheme`(17) → `blue.xtheme`/`gray.xtheme`(N, 기존 테마 계속 사용 가능)
- **BigDecimal 소수점 오차 주의**: STRING 타입 컬럼에 소수점 값이 있으면 정렬 순서에 따라 부동소수점 오차 발생 가능 → BIGDECIMAL 타입 사용 또는 `toFixed()` 권장
- CSP(`Content-Security-Policy`) 적용 환경: 넥사크로 라이브러리가 내부적으로 eval/인라인 스크립트를 사용하므로 `unsafe-inline`/`unsafe-eval` 명시적 허용 필요, `X-Frame-Options: DENY` 설정 시 WebBrowser 등 IFRAME 기반 기능 동작 안 함

#### v24 버전별 주요 신규 기능 (호환성 체크에 활용)
| 버전 | 주요 내용 |
|------|-----------|
| 24.0.0.200 | Grid `onimageerror`, XAgent 컴포넌트 추가 |
| 24.0.0.400 | 모바일 xmodule 3종(AppInfo/QRBarcode/QRCodeGenerator), Studio에서 async/await 허용 |
| 24.0.0.700 | `setTimeout` 메서드 추가, **Windows NRE HTTP/2+TLS1.3**, Dataset `_setContents`가 XML→JSON화(대용량 성능 개선, **Tool&SDK 24.0.0.700 + ReGenerate 필요**) |
| 24.0.0.800 | **SpinField** 컴포넌트 신규 |
| 24.0.0.900 | **SelectField** 컴포넌트 신규, **절차적 코딩용 Promise 지원**(`nexacro.open`/`transaction`/`showModal`/`trackPopup` 등), Studio "Change Component"(Ctrl+Alt+T) |
| 24.0.0.1000 | Studio **Layout Editor** 신규, `getNetworkStatus`+`onnetworkstatuschange`, **BigDecimal 24자리→31자리 확장**, Android 16(SDK36) Edge-to-Edge 대응 |

> 기능 사용 전 프로젝트의 SDK/Tool 버전이 해당 버전 이상인지 반드시 확인할 것. 전체 변경이력은 `nexacroN 메뉴얼/product_information_nexacro_n_v24_ko.md` 참조.

### 스크립트 언어 심화 (엔진 내부 동작)

- **Grid expr 지시자**: `expr:` 표현식 내부에서 `this`는 **Cell 오브젝트**(Form이 아님). Form 함수 호출은 반드시 `comp.parent.func()`(comp=Grid 자신) 또는 `dataset.parent.func()`로만 가능 — `this.func()` 사용 시 오류
- `getDisplayText()` — `text`와 `expr`이 동시에 설정된 경우 실제 화면에 표시되는 계산된 텍스트를 반환
- `lookup`/`*Lookup` 계열(`this.lookup("id")`, `addEventHandlerLookup`/`setEventHandlerLookup`/`removeEventHandlerLookup`) — 문자열 기반 검색이라 **성능에 영향**, 반드시 필요한 경우만 사용
- 이벤트 핸들러의 `obj:nexacro.Button` 타입 표기는 표준 JS 문법이 아닌 **Studio 전용 인텔리센스 표기**이며 빌드 시 제거됨(이벤트 핸들러 함수 매개변수 외에는 지원 안 됨)
- System 동적 속성(`curx`/`cury`/`screenwidth`/`screenheight`)은 속성이 아닌 **전용 메소드**로 조회: `nexacro.System.getCursorX()` 등
- `nexacro.floor`/`nexacro.ceil`/`nexacro.round(v, digit)` — 2-인자 버전 Math 메소드 대체 (`floor`만 기존에 확인됨, `ceil`/`round`도 동일 계열)
- 예약어 충돌로 이름이 변경된 메소드: `Component.class` → `Component.cssclass`, `ExcelExportObject.export()` → `exportData()`, `VirtualFile.delete()` → `remove()`
- id 명명 제약 추가 사례: 컨테이너 멤버명과 충돌하는 컴포넌트 id 금지(Form의 `text` 속성과 충돌하는 Button id `text`는 생성 자체가 안 됨), Dataset 컬럼 id로 배열 예약 속성(`length`) 사용 불가
- 외부 모듈에서 브라우저 `window` 객체 직접 사용 시 `system.navigatorname != "nexacro DesignMode"` 분기로 Studio 로딩 시 에러 방지 필요

### 프로젝트 파일 구조 세부

- **XPRJ 최상위 구조**: `<Project><EnvironmentDefinition/><TypeDefinition/><AppVariables/><AppInfos>` — App Info가 1개뿐이면 삭제 불가
- **TypeDefinition 5대 구성**: Modules(js/json 모듈), Components(배포 대상 오브젝트), Services(서비스 그룹별 `cachelevel` 개별 설정 가능 — `<Service prefixid="Base" type="form" cachelevel="session" url="./Base/"/>`), Protocols, Update(배포 옵션)
- **initValue 리소스**: `.xiv` 확장자(XML), `GlobalPropInitvalueDefinition` 루트로 컴포넌트 타입별 기본 속성값 저장(Environment `initvaluefileid` + 컴포넌트 `initvalueid`로 연결)
- **UserFont**: `.xfont` 확장자, `@font-face` CSS 문법으로 폰트 정의(woff/ttf/eot 다중 소스 지정 가능)
- **XJS include 체인**: 공통 라이브러리 파일(`comLib.xjs`) 하나에서 `include "lib::comConstants.xjs";` 등 여러 파일을 재귀적으로 include하여 관리하는 패턴이 일반적
- **XCSS 빌드 변환**: 표준 CSS 속성 + 넥사크로 확장 속성(`-nexa-text-align` 등)을 함께 작성하면 빌드 시 브라우저별 실제 CSS(`.Button .nexacontentsbox { text-align: left; }`)로 자동 분리 생성됨. **스타일 파일은 Application 단위로만 지정 가능(Form 단위 지정 불가)**

### 앱 구동 시나리오 (부트스트랩 ~ Form 로딩 전체 단계)

**부트스트랩 7단계**: get bootstrap info → update engine → update resource(data) → load framework files → load component modules → load Application (`start.json`/`start_android.json`/`start_ios.json` 기준으로 진행)

**Application 로딩 8단계**: Environment 로딩 → Screen 선택 → Screen 환경 로딩 → Environment 설정 처리 → `Environment.onload` → 테마 로딩 → Initvalue 로딩 → Application 로딩(`*.xadl.js`) → Form 로딩(`*.xfdl.js`)
> **`Environment.onload` 시점에는 아직 AppVariables가 로딩되지 않아 접근 시 `undefined` 발생** — 전역 변수 초기화 로직은 `Application.onload` 이후에 배치할 것

**Form 로딩 15단계**: Form 로딩 → 실행 → 서브파일(include 스크립트) 다운로드/실행 → Form 초기화 → Style 속성 설정 → Form 속성 설정 → 오브젝트/컴포넌트/BindItem 생성(Z-Order 순) → 엔진 내부 스크립트 → 이벤트핸들러 등록 → `createComponent` 호출 → `Form.oninit` → `Form.on_created` → `Object.on_created` → 이미지 로딩/transaction 처리 → `Form.onload`
> 기존에 문서화된 "생명주기 이벤트 정확한 순서"(environment.onload → ... → form.onload)의 `form.oninit`~`form.onload` 구간을 세분화한 것 — 컴포넌트가 아직 생성되지 않은 시점에 접근하는 버그 디버깅 시 이 단계를 참고

### Frame Tree 심화 보강

- Form 하위 요소 3범주: `this.objects[]`(Invisible Object), `this.components[]`(화면 컴포넌트), `this.binds[]`(BindItem) — 통합 접근은 `this.all[]`. **정렬 순서는 Object → Component → Bind 순, 각 범주 내부는 소스 배치 순서**
- 컨테이너 컴포넌트(Div/PopupDiv/Tab)는 `url`로 Form이 연결되지 않아도 자체적으로 invisible object/bind를 가질 수 있음. Form이 연결되면 1:1 구조가 되며, 내부에서 `parent.parent.name`은 항상 고정 문자열 `"form"`을 반환(컨테이너 자신의 id가 아님 — 혼동 주의)
- Form 내부의 component/bind/invisible object는 `getOwnerFrame()`/`getOwnerForm()` 메소드를 갖지 않음(Frame 계층 개념이 없음 — Form 자신만 Frame 관련 메소드 보유)

### Dataset 통신 포맷 심화 (XML/SSV/JSON)

- **필수 예약 Parameter 3종**(모든 포맷 공통): `ErrorCode`(0 미만이면 시스템/업무 오류로 처리), `ErrorMsg`(미지정 시 ErrorCode==0이면 "SUCCESS" 아니면 "FAILED" 자동 설정), `cachetype`(Session/Dynamic/Static/None, 기본값 Session)
- **ColumnInfo 나열 순서 규칙**: XML에서 `ConstColumn`은 반드시 `Column`보다 먼저 나열되어야 함(순서를 안 지키면 처리 오류)
- **빈 문자열 vs Null 구분**(XML): `<Col id="x"/>` = 빈 문자열, Col 태그 자체가 없음 = Null
- **데이터 타입 크기 제약**: STRING 최대 2GB, BIGDECIMAL 정수부 최대 24자리·소수부 최대 15자리(24.0.0.500+는 31자리), DATE(YYYYMMDD)/DATETIME(YYYYMMDDHHmmssuuu)/TIME(HHmmssuuu)
- **SSV(Simple Separated Values) 포맷** — 경량 텍스트 스트림 포맷(구분자 RS=`0x1E`, US=`0x1F` 기반)
  - 레이아웃: `Stream Header → Variables(옵션) → Datasets(옵션)`
  - RowType 코드: `N`(정상)/`I`(추가)/`U`(수정)/`D`(삭제)/`O`(원본, XML의 insert/update/delete·JSON의 `_rowtype_`에 대응하는 SSV 고유 표기)
  - 컬럼 값이 undefined면 ETX(`0x03`) 문자로 표현, 스트림 끝은 `(RS)` 단독 라인(Null Record)으로 표시
  - `transaction()` 호출 시 데이터 타입 인자로 SSV=`2` 지정 가능(Protocol Adapter 연동 시 활용)
- **JSON Format**: `Parameters`는 `{id, value}` 배열, `ConstColumn`/`Column` 배열 구조
  - `_RowType_` 생략 시 기본값 `"N"`, `_RowType_: "O"`는 반드시 직전 Row가 `"U"`일 때만 유효
  - **Parameters/ConstColumn에서 `type` 생략 시 value가 정수/실수면 자동으로 INT/FLOAT 추론(그 외는 STRING)** — 이 자동 타입 추론은 JSON 포맷 고유 규칙(XML/SSV에는 없음)

---

# 개발 워크플로우

## 배포 명령어 (tools/)

```bash
# 빌드 + 배포
tools/run_Build&deploy.bat

# 배포만
tools/run_Deploy.bat

# JSON 빌드 + 배포
tools/run_JSON_Build&deploy.bat

# nexacroK 실행
tools/run_TEXT_nexacroK.bat

# Tomcat 제어
tools/start_tomcat.bat
tools/stop_tomcat.bat

# 유효성 검사
tools/Validate.bat
```

## Git

```bash
tools/git_push.bat   # 프로젝트 전용 git push 스크립트
```

---

# 테스트

- 테스트 스킬: `SKILLS/dev-test-automation` 참조
- TypeScript/JS: Jest (단위), Playwright (E2E)
- Python: pytest (단위/통합)
- Kotlin: JUnit 5 + MockK
- 커버리지 기준: 라인 80% 이상 권장
- AAA 패턴(Arrange / Act / Assert) 준수

---

# 모델 사용 규칙 (opusplan 자동 전환)

현재 모델은 `opusplan`으로 설정되어 있으며 아래 규칙에 따라 자동으로 전환된다.

| 상황 | 모델 | 방법 |
|------|------|------|
| 전체 계획 수립 / 아키텍처 설계 / 복잡한 분석 | **Opus** (고성능) | `/plan` 명령으로 플랜 모드 진입 시 자동 전환 |
| 코딩 / 버그 수정 / 테스트 작성 | **Sonnet** (기본) | 일반 대화 모드에서 자동 사용 |
| 환경 설정 / 샘플 제작 / 일반 질문 | **Sonnet** (기본) | 일반 대화 모드에서 자동 사용 |

> **사용 방법**: 설계·계획 작업 시작 전 `/plan`을 입력하면 Opus로 자동 전환된다.
> 플랜 승인 후에는 자동으로 Sonnet으로 복귀한다.

---

# Claude 행동 지침

## 코드 수정 시

- 요청된 범위만 수정한다. 주변 코드 리팩토링 금지.
- 파일을 먼저 읽고 기존 패턴을 파악한 후 수정한다.
- 새 파일 생성보다 기존 파일 수정을 우선한다.

## 보안

- SQL Injection, XSS, Command Injection 등 OWASP Top 10 취약점 주의
- `.env` 파일에 시크릿 하드코딩 금지
- 사용자 입력값은 반드시 검증 후 사용

## 불확실할 때

- 추측으로 진행하지 않고 사용자에게 확인 요청
- 파괴적 작업(파일 삭제, force push 등) 전 반드시 확인

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
