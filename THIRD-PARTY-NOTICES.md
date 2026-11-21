# Third-party notices

Praxis IDE is released under the MIT license (see `LICENSE`). It includes or
loads the third-party software listed below. Each component remains under its
own license and copyright; the license texts are reproduced at the end of this
file.

## Bundled in this repository (`lib/`)

| Component | Version | Files | License | Copyright |
|---|---|---|---|---|
| Fancytree | 2.22.4 | `lib/jquery.fancytree-all.min.js`, `lib/fancytree_dist/` (skins) | MIT | Copyright (c) 2008-2020 Martin Wendt |
| Fancytree contextMenu extension | – | `lib/jquery.fancytree.contextMenu.js` | MIT | Copyright (c) 2008-2018 Martin Wendt |
| jQuery contextMenu | 2.2.3 | `lib/jquery.contextMenu.min.js` | MIT (dual-licensed MIT/GPL-3.0; used under MIT) | Copyright (c) 2011-2016 SWIS BV and contributors |
| jQuery UI Layout (jquery.layout) | 1.3.0 RC30.62 | `lib/jquery.layout.js` | MIT (dual-licensed MIT/GPL; used under MIT) | Copyright (c) 2012 Fabrizio Balliano, Kevin Dalman |
| jQuery `$.browser` shim | – | `lib/jquery.browser.js` | MIT | Copyright OpenJS Foundation and other contributors (derived from jQuery Migrate) |
| SlickGrid | 3.0.0 | `lib/Slickgrid/` | MIT | Copyright (c) 2009-2016 Michael Leibman and Ben McIntyre |
| jquery.event.drag | 2.3.0 | `lib/Slickgrid/jquery.event.drag-2.3.0.js` | MIT | Copyright (c) 2010 Three Dub Media |
| Jspreadsheet CE (jexcel) | 4.10.1 | `lib/jspreadsheet/` | MIT | Copyright (c) Paul Hodel / Jspreadsheet Ltd |
| Fabric.js | 4.5.0 | `lib/fabric.min.js` | MIT | Copyright (c) 2008-2015 Printio (Juriy Zaytsev, Maxim Chernyak) |
| CodeMirror | 5.x | `lib/codemirror/` (core and addons) | MIT | Copyright (C) 2017 by Marijn Haverbeke and others |
| Prolog mode and "tau" theme for CodeMirror | – | `lib/codemirror/mode/prolog/prolog.js`, `lib/codemirror/theme/tau.css` | BSD-3-Clause | Copyright (c) 2017-2020 José Antonio Riaza Valverde (from the Tau Prolog project) |
| Simple JavaScript Inheritance | – | `lib/Class.exec.js` | MIT | John Resig |

## Loaded at runtime from a CDN (not redistributed)

| Component | Version | Source | License | Copyright |
|---|---|---|---|---|
| jQuery | 1.12.4 | code.jquery.com | MIT | Copyright jQuery Foundation and other contributors |
| jQuery UI (JS and base theme CSS) | 1.12.1 | code.jquery.com | MIT | Copyright jQuery Foundation and other contributors |
| jQuery contextMenu CSS | 2.2.3 | cdnjs.cloudflare.com | MIT | Copyright (c) 2010-2016 SWIS BV |
| jSuites | v4 | jsuites.net | MIT | Copyright (c) Jspreadsheet |
| trealla-js | 0.30.0 | esm.sh | MIT | Copyright (c) 2022 Gregory Roseberry |
| Trealla Prolog (inside trealla-js) | – | esm.sh | MIT | Copyright (c) 2020 Andrew George Davison |

---

## MIT License

The following text applies to every component above marked "MIT", with the
copyright line given for that component in the tables above.

```
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
```

## BSD 3-Clause License

Applies to the CodeMirror Prolog mode and "tau" theme taken from the Tau Prolog
project.

```
Copyright (c) 2017-2020, José Antonio Riaza Valverde
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```
