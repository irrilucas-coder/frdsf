@echo off
chcp 65001 >nul
title Estudio Kie + Chat Claude
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Falta instalar o Node.js. Baixe em https://nodejs.org e depois abra este arquivo de novo.
  echo.
  pause
  exit /b
)
if not exist node_modules\@anthropic-ai\sdk (
  echo  Primeira vez: instalando o chat, aguarde...
  call npm install
)
echo.
echo  Estudio aberto no navegador. Para desligar, feche esta janela.
echo.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:3000/chat"
node server.js
pause
