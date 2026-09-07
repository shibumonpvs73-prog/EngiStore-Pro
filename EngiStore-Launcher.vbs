Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get Current App Directory
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

' 1. Start node server.js completely SILENTLY in the background (0 = SW_HIDE, zero console window!)
WshShell.Run "cmd.exe /c node server.js", 0, False

' 2. Wait 2 seconds for server to initialize
WScript.Sleep 2000

' 3. Open EngiStore Pro directly in standalone Desktop App Window
Dim appUrl, edge1, edge2, chrome1, chrome2
appUrl = "http://localhost:3000"

edge1 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Microsoft\Edge\Application\msedge.exe"
edge2 = WshShell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Microsoft\Edge\Application\msedge.exe"
chrome1 = WshShell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Google\Chrome\Application\chrome.exe"
chrome2 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Google\Chrome\Application\chrome.exe"

If fso.FileExists(edge1) Then
    WshShell.Run """" & edge1 & """ --app=" & appUrl & " --window-size=1400,900", 1, False
ElseIf fso.FileExists(edge2) Then
    WshShell.Run """" & edge2 & """ --app=" & appUrl & " --window-size=1400,900", 1, False
ElseIf fso.FileExists(chrome1) Then
    WshShell.Run """" & chrome1 & """ --app=" & appUrl & " --window-size=1400,900", 1, False
ElseIf fso.FileExists(chrome2) Then
    WshShell.Run """" & chrome2 & """ --app=" & appUrl & " --window-size=1400,900", 1, False
Else
    WshShell.Run appUrl, 1, False
End If

