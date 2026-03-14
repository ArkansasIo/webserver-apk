@ECHO OFF
SETLOCAL

SET DIRNAME=%~dp0
IF "%DIRNAME%"=="" SET DIRNAME=.
SET APP_HOME=%DIRNAME%

SET WRAPPER_JAR=%APP_HOME%\gradle\wrapper\gradle-wrapper.jar

IF EXIST "%WRAPPER_JAR%" (
  SET JAVA_EXE=java.exe
  %JAVA_EXE% -classpath "%WRAPPER_JAR%" org.gradle.wrapper.GradleWrapperMain %*
  EXIT /B %ERRORLEVEL%
)

WHERE gradle >NUL 2>NUL
IF %ERRORLEVEL%==0 (
  ECHO gradle-wrapper.jar not found, using system Gradle.
  gradle %*
  EXIT /B %ERRORLEVEL%
)

ECHO ERROR: gradle-wrapper.jar not found and no system Gradle on PATH.
ECHO Either run: gradle -p android-app wrapper
ECHO Or install Gradle and retry.
EXIT /B 1
