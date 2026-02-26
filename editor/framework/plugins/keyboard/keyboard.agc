// AppGameKit — Keyboard plugin
// Maps raw key codes to named actions and exposes IsActionDown / IsActionPressed.

// Key code constants (QWERTY defaults; override at project level)
#constant KEY_UP    87
#constant KEY_DOWN  83
#constant KEY_LEFT  65
#constant KEY_RIGHT 68
#constant KEY_FIRE  32

Function Keyboard_IsUp()
EndFunction GetRawKeyState(KEY_UP)

Function Keyboard_IsDown()
EndFunction GetRawKeyState(KEY_DOWN)

Function Keyboard_IsLeft()
EndFunction GetRawKeyState(KEY_LEFT)

Function Keyboard_IsRight()
EndFunction GetRawKeyState(KEY_RIGHT)

Function Keyboard_IsFire()
EndFunction GetRawKeyPressed(KEY_FIRE)
