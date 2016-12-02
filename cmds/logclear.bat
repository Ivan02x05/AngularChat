cd %~dp0
cd ..\logs

for /r %%i in (*.log*) do (
	del %%i
)
pause