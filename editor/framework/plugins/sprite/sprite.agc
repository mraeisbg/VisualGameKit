// AppGameKit — Sprite plugin
// Provides a thin wrapper around AGK's built-in sprite functions.

Function Sprite_Create(_imageFile As String, _x As Float, _y As Float)
    Local img As Integer
    Local spr As Integer
    img = LoadImage(_imageFile)
    spr = CreateSprite(img)
    SetSpritePosition(spr, _x, _y)
EndFunction spr

Function Sprite_SetTransform(_spr As Integer, _x As Float, _y As Float, _scaleX As Float, _scaleY As Float, _angle As Float)
    SetSpritePosition(_spr, _x, _y)
    SetSpriteScale(_spr, _scaleX, _scaleY)
    SetSpriteAngle(_spr, _angle)
EndFunction

Function Sprite_SetDepth(_spr As Integer, _depth As Integer)
    SetSpriteDepth(_spr, _depth)
EndFunction

Function Sprite_Destroy(_spr As Integer)
    DeleteSprite(_spr)
EndFunction
