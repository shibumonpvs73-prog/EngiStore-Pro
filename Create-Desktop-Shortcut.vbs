Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get Current App Directory
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
desktopPath = WshShell.SpecialFolders("Desktop")
shortcutPath = desktopPath & "\EngiStore Pro.lnk"

' Create Shortcut
Set oShortcut = WshShell.CreateShortcut(shortcutPath)
oShortcut.TargetPath = "wscript.exe"
oShortcut.Arguments = """" & scriptDir & "\EngiStore-Launcher.vbs"""
oShortcut.WorkingDirectory = scriptDir
oShortcut.WindowStyle = 7
oShortcut.Description = "EngiStore Pro - Engineering Purchase & Store System"

' Set Custom App Icon
iconFile = scriptDir & "\icon.ico"
If fso.FileExists(iconFile) Then
    oShortcut.IconLocation = iconFile & ", 0"
End If

oShortcut.Save

WScript.Echo "Desktop shortcut 'EngiStore Pro' with App Icon created successfully!"
