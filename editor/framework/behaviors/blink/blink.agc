// AppGameKit — Blink behaviour
// Included by the compiled project when this behaviour is active.

// Called once per object that has Blink attached.
// Parameters are injected by the framework at compile time.
//   _objectId  : AGK sprite/object ID
//   _interval  : blink interval in milliseconds

global float blinkTimer
global int   blinkVisible

Function Blink_Init(_objectId As Integer, _interval As Float)
    blinkTimer   = 0.0
    blinkVisible = 1
    SetSpriteVisible(_objectId, 1)
EndFunction

Function Blink_Update(_objectId As Integer, _interval As Float)
    blinkTimer = blinkTimer + GetFrameTime() * 1000.0
    If blinkTimer >= _interval
        blinkTimer   = 0.0
        blinkVisible = 1 - blinkVisible
        SetSpriteVisible(_objectId, blinkVisible)
    EndIf
EndFunction
