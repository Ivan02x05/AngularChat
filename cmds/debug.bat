cd %~dp0
cd ..

set DEBUG_PGM=bin\server\web\app.js
set DEBUG_URL="http://127.0.0.1:8081/?port=5858"
set BROWSER="C:\Program Files\Google\Chrome\Application\chrome.exe"
set NODE_CLUSTER=0

start node --debug-brk %DEBUG_PGM%
start node-inspector -p 8081

%BROWSER% %DEBUG_URL%
