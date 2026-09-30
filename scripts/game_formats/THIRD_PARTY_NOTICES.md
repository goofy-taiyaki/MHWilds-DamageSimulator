# Third-party notices

`src/mhwa/pak_index.py` and `src/mhwa/pak_extract.py` implement the PAK v4 metadata layout, index cipher and
ASCII path-hash conventions and payload attribute masks described by `eigeen/ree-pak-rs`, commit
`25562e6a6f9a52a43b80d54be91e4feb7ac7668b`.

Source: https://github.com/eigeen/ree-pak-rs/tree/25562e6a6f9a52a43b80d54be91e4feb7ac7668b

## ree-pak-rs

MIT License

Copyright (c) 2024 Eigeen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Reference file list

The separately downloaded `MHWs_STM_Release.list` from `Ekey/REE.PAK.Tool` is
local research input under `data/raw/`, excluded from Git. No Ekey executable
or source code is incorporated. Source revision, URL and SHA-256 are recorded
with the research results. Redistribution terms were not established.

## USER / RSZ format and typed field references

`src/mhwa/msg_container.py` also uses the MSG v23 format references in the
fixed REE-Lib `OtherFiles/MsgFile.cs` and REasy `file_handlers/msg/msg_handler.py`
and `msg_viewer.py` revisions listed below. The same MIT notices apply.

`src/mhwa/user_container.py` uses the USER/RSZ metadata contracts described by
alphazolam/RE_RSZ at commit `871a1d5c4c7b81c60c966d73ee63f4c4413ab56e`.
Source: https://github.com/alphazolam/RE_RSZ/tree/871a1d5c4c7b81c60c966d73ee63f4c4413ab56e

`src/mhwa/rsz_fields.py` uses field alignment, array, reference and value encoding
contracts checked against kagenocookie/RE-Engine-Lib at commit
`bf0e5e5222700716516797613a54b9b61fedfc35`.
Source: https://github.com/kagenocookie/RE-Engine-Lib/tree/bf0e5e5222700716516797613a54b9b61fedfc35

The separately downloaded type database from seifhassine/REasy, commit
`2d1324dcae003d04878ab01ad33f80566eeef201`, is local research input under
`data/raw/`, excluded from Git. REasy credits praydog for the RSZ dumps and
REFramework. No REasy executable is incorporated. The official REFramework binary
is staged separately for optional runtime probe installation; it is not installed.
Source: https://github.com/seifhassine/REasy/tree/2d1324dcae003d04878ab01ad33f80566eeef201

The following MIT terms apply to these respective referenced projects:

MIT License

Copyright (c) 2021 alphazolam

Copyright (c) 2025 shadowcookie

Copyright (c) 2025 Battlezone

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Runtime probe references and staged REFramework

`probes/mhwa_readonly.lua` uses the documented read-only SDK/API contracts of
praydog/REFramework at commit `d1461375aee4ec3f313170f8eaad12064eb542d9` and the
save-object acquisition / GUI update scheduling reference in
paean-of-guidance/mhws-save-import-export at commit
`5ed449660e867d4561ed37e41d2cff2a4519be72`. The upstream import feature and general
serializer are not included. The optional local handoff contains the unchanged
official REFramework `dinput8.dll`, its source revision and its separate MIT license.

Sources:
https://github.com/praydog/REFramework/tree/d1461375aee4ec3f313170f8eaad12064eb542d9
https://github.com/paean-of-guidance/mhws-save-import-export/tree/5ed449660e867d4561ed37e41d2cff2a4519be72

The following MIT terms apply to these respective projects:

MIT License

Copyright (c) 2019 praydog

Copyright (c) 2025 paean-of-guidance

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Lua test runtime

Lupa 2.8 is a development-only dependency used to run the probe against a
synthetic SDK in Lua 5.4. It is not a game plugin and is not included in the
runtime handoff. Its MIT-style license and the bundled Lua licenses are retained
in the installed dependency distribution.
Source: https://pypi.org/project/lupa/2.8/
