@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\bin\azure" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\bin\azure" %*
)